import { CommandId } from "@/types/commands";
import { Trie, TrieMatcher } from "@/Trie";
import type {
	ShortcutKeybinding,
	KeymapContextWithCode,
	KeyMatchResult,
} from "@/types";
import { serializeKeymapInfo } from "./schemas";

export class KeybindingMatcher {
	trie: Trie<ShortcutKeybinding>;
	trieMatcher: TrieMatcher<ShortcutKeybinding>;
	keybindings: ShortcutKeybinding[];

	constructor(keybindings: ShortcutKeybinding[]) {
		this.keybindings = keybindings;
		this.trie = new Trie<ShortcutKeybinding>();
		for (const keybinding of keybindings) {
			this.trie.insert(keybinding.key, keybinding);
		}
		this.trieMatcher = new TrieMatcher<ShortcutKeybinding>(this.trie);
	}

	setKeybindings(keybindings: ShortcutKeybinding[]) {
		this.keybindings = keybindings;
		this.trie = new Trie<ShortcutKeybinding>();
		for (const keybinding of keybindings) {
			this.trie.insert(keybinding.key, keybinding);
		}
		this.trieMatcher = new TrieMatcher<ShortcutKeybinding>(this.trie);
	}

	// TODO: handle escape
	match(key: KeymapContextWithCode): KeyMatchResult {
		if (key.key === null) throw new Error("Key is null");
		const serializedKey = serializeKeymapInfo({
			key: key.key,
			modifiers: key.modifiers,
		});
		const match = this.trieMatcher.next(serializedKey); // TODO can't be null actually
		if (!match.success) {
			console.log("no match", {
				key: key.key,
				modifiers: key.modifiers,
				serializedKey,
				trieMatcher: this.trieMatcher,
				trie: this.trie,
			});
			this.trieMatcher.reset();
			return { status: "none" };
		}

		const bindings = match.node.data;
		for (const binding of bindings) {
			console.log("return early", {
				binding,
				key: key.key,
				modifiers: key.modifiers,
				serializedKey,
				trieMatcher: this.trieMatcher,
				trie: this.trie,
			});
			this.trieMatcher.reset();
			return { status: "execute", commandId: binding.commandId };
		}
		console.log("return chord", {
			key: key.key,
			modifiers: key.modifiers,
			serializedKey,
			trieMatcher: this.trieMatcher,
			trie: this.trie,
		});
		return { status: "chord" };
	}
}
