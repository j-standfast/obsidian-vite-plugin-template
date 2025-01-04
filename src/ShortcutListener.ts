import { App } from "obsidian";
import { MODIFIER_CODES_CHROME_CAMEL } from "./constants";
import { Chord, Keybinding } from "./types";
import {
	isModifierCodeCamel,
	keyEventToChord,
	serializeChord,
	serializeChords,
} from "./serialize";

class TrieNode<T> extends Map<string, TrieNode<T>> {
	value: T | undefined;
	constructor(value?: T | undefined) {
		super();
		this.value = value;
	}
}

class Trie<T> {
	root: TrieNode<T>;

	constructor() {
		this.root = new TrieNode<T>();
	}

	insert(keys: string[], value: T) {
		// console.log("Trie |insert", { this: this, keys, value });
		let node = this.root;
		for (const key of keys) {
			const child = node.get(key) ?? new TrieNode<T>();
			if (!node.has(key)) node.set(key, child);
			node = child;
		}
		node.value = value;
	}
}

export class ShortcutListener {
	app: App;
	trie: Trie<string>;
	node: TrieNode<string> | undefined;
	sequence: {
		chord: Chord;
		chordName: string;
		node: TrieNode<string> | undefined;
	}[];

	constructor(app: App, keybindings: Keybinding[]) {
		this.trie = new Trie<string>();
		this.node = undefined;
		this.sequence = [];
		this.app = app;

		this.insertKeybinding = this.insertKeybinding.bind(this);
		this.insertKeybindings = this.insertKeybindings.bind(this);
		this.handleKey = this.handleKey.bind(this);
		this.sequenceMessage = this.sequenceMessage.bind(this);
		this.cancelSequence = this.cancelSequence.bind(this);
		this.executeCommand = this.executeCommand.bind(this);
		this.waitForNextChord = this.waitForNextChord.bind(this);
		this.reset = this.reset.bind(this);
		this.onLoad = this.onLoad.bind(this);
		this.unload = this.unload.bind(this);
	}

	onLoad(keybindings: Keybinding[]) {
		document.addEventListener("keydown", this.handleKey, {
			capture: true,
		});
		document.addEventListener("keyup", this.handleKey, { capture: true });
		this.insertKeybindings(keybindings);
	}

	insertKeybinding(keybinding: Keybinding) {
		const keys = serializeChords(keybinding.key);
		// console.log("insertKeybinding", { this: this, keys, keybinding });
		this.trie.insert(keys, keybinding.id);
	}

	insertKeybindings(keybindings: Keybinding[]) {
		// console.log("insertKeybindings", { this: this, keybindings });
		for (const keybinding of keybindings) {
			this.insertKeybinding(keybinding);
		}
	}

	handleKey(event: KeyboardEvent) {
		const chord = keyEventToChord(event);
		if (chord.type === "modifier event") return;
		if (chord.type === "keyup event") return;

		const chordName = serializeChord(chord);
		const isFirstChord = this.sequence.length === 0;
		const prevNode = isFirstChord ? this.trie.root : this.node;

		// console.log({ event, chord, chordName, isFirstChord, prevNode });
		if (!prevNode) throw new Error("Active sequence but no previous node");
		const node = prevNode.get(chordName);
		if (!node && !this.node) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();
		this.sequence.push({ chord, chordName, node });

		let action: "none" | "cancel" | "execute" | "wait" = "wait";

		if (chord.type !== "valid" || !node) {
			action = "cancel";
			this.cancelSequence();
		} else if (node.value) {
			action = "execute";
			this.executeCommand();
		} else {
			action = "wait";
			this.waitForNextChord();
		}
		// console.log({ action, this: this, chord, chordName, node, prevNode });
	}

	sequenceMessage() {
		const msg = this.sequence.map(({ chordName }) => chordName).join(", ");
		return `(${msg})`;
	}

	cancelSequence() {
		const msg = this.sequenceMessage();
		// console.log(`${msg} was pressed, cancelling sequence`);
		this.reset();
	}

	executeCommand() {
		const msg = this.sequenceMessage();
		const commandId = this.sequence[this.sequence.length - 1].node?.value;
		// console.log(`${msg} was pressed, executing command ${commandId}`);
		if (!commandId) throw new Error("No command id found");
		this.app.commands.executeCommandById(commandId);
		this.reset();

		// (this.app as any).commands.executeCommandById(id)
	}

	waitForNextChord() {
		this.node = this.sequence[this.sequence.length - 1].node;
		const msg = this.sequenceMessage();
		// console.log(`${msg} was pressed, waiting for next chord...`);
	}

	reset() {
		this.sequence = [];
		this.node = undefined;
	}

	unload() {
		document.removeEventListener("keydown", this.handleKey, {
			capture: true,
		});
		document.removeEventListener("keyup", this.handleKey, {
			capture: true,
		});
	}
}
