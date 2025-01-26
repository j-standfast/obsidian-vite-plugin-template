import type { App, KeymapContext, Modifier } from "obsidian";
import type { TailorCutsPlugin } from "@/types";
import type { TailorKey, TailorMatchKey } from "../KeybindingManager";
import { Trie } from "../Trie";

type PlatformId = "Windows" | "macOS" | "Linux" | "Unknown OS";

// TODO
const platformId: PlatformId = "Windows";

export class TailorCutsKeymap {
	app: App;
	plugin: TailorCutsPlugin;
	modifiers: string;

	constructor(app: App, plugin: TailorCutsPlugin) {
		this.app = app;
		this.plugin = plugin;
		this.modifiers = "";
	}

	updateModifiers(event: KeyboardEvent): void {
		this.modifiers = this.getModifiers(event);
	}

	getModifiers(event: KeyboardEvent): string {
		const modifiers: Modifier[] = [];
		if (event.ctrlKey) modifiers.push("Ctrl");
		if (event.metaKey) modifiers.push("Meta");
		if (event.altKey) modifiers.push("Alt");
		if (event.shiftKey) modifiers.push("Shift");
		return this.compileModifiers(modifiers);
	}

	compileModifiers(modifiers: Modifier[]): string {
		return modifiers
			.map((modifier) => {
				return modifier === "Mod"
					? platformId === "macOS"
						? "Meta"
						: "Ctrl"
					: modifier;
			})
			.sort()
			.join(",");
	}

	static decompileModifiers(modifiers: string): Modifier[] {
		return modifiers
			.split(",")
			.map((modifier) => {
				return (platformId === "macOS" && modifier === "Meta") ||
					(platformId !== "macOS" && modifier === "Ctrl")
					? "Mod"
					: (modifier as Modifier);
			})
			.filter(Boolean);
	}

	serializeMatchKey(matchKey: TailorMatchKey): string {
		return matchKey.keyType === "code"
			? `[${matchKey.matchKey}]`
			: matchKey.matchKey;
	}

	deserializeMatchKey(matchKey: string): {
		matchKey: string;
		keyType: "code" | "key";
	} {
		return matchKey.startsWith("[") && matchKey.endsWith("]")
			? {
					matchKey: matchKey.slice(1, -1),
					keyType: "code",
			  }
			: {
					matchKey,
					keyType: "key",
			  };
	}

	// TODO: typing? error handling? vkey?
	serializeTailorMatchKey(matchKey: TailorMatchKey): string {
		return `${matchKey.modifiers} ${this.serializeMatchKey(matchKey)}`;
	}

	// TODO: typing? error handling? vkey?
	deserializeTailorMatchKey(key: string): TailorMatchKey {
		const [modifiers, matchKey] = key.split(" ");
		if (matchKey.startsWith("[") && matchKey.endsWith("]")) {
			return {
				modifiers,
				matchKey: matchKey.slice(1, -1),
				keyType: "code",
			};
		} else {
			return {
				modifiers,
				matchKey,
				keyType: "key",
			};
		}
	}

	isMatch(serializedMatchKey: string, keyboardKey: TailorKey): boolean {
		const matchKey = this.deserializeTailorMatchKey(serializedMatchKey);

		const modifiersMatch =
			matchKey.modifiers === null ||
			matchKey.modifiers === keyboardKey.modifiers;
		const noHandlerKey = !matchKey.matchKey;
		const vkeyMatch = matchKey.matchKey
			? matchKey.matchKey === keyboardKey.vkey
			: false;
		const plainKeyMatch =
			matchKey.matchKey && keyboardKey.key
				? matchKey.matchKey.toLowerCase() ===
				  keyboardKey.key.toLowerCase()
				: false;
		const keyMatch = noHandlerKey || vkeyMatch || plainKeyMatch;
		return modifiersMatch && keyMatch;
	}
}
