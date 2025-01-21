import type { Command, Hotkey, KeymapInfo, PluginManifest } from "obsidian";

import {
	CODES_CHROME_CAMEL,
	MODIFIER_CODES_CHROME_CAMEL,
	MODIFIER_KEYS,
} from "@/constants/constants";

export type Keysig = string;

// keycodes, chords, sequences
export type ModifierCodeCamel = (typeof MODIFIER_CODES_CHROME_CAMEL)[number];
export type ModifierKey = (typeof MODIFIER_KEYS)[number];
export type CodeCamel = (typeof CODES_CHROME_CAMEL)[number];
export type ChordKeyModifiers = Map<ModifierKey, true>;
export type ValidChord = {
	modifiers: ChordKeyModifiers;
	base: CodeCamel;
	type: "valid";
};
export type InvalidChord = {
	modifiers: ChordKeyModifiers;
	base: undefined;
	type: "invalid base" | "modifier event" | "keyup event";
};
export type Chord = ValidChord | InvalidChord;

export interface SerializedKeybinding {
	id: string;
	key: string;
}

export interface Keybinding {
	id: string; // TODO kick this out no - because can be more than one
	key: Chord[];
}

export type SerializedHotkeys = Record<string, Hotkey[]>;

export interface SerializedSettings {
	keybindings: SerializedKeybinding[];
	obsidianHotkeys: SerializedHotkeys;
}
export interface EqualityChecks {
	default: boolean | undefined;
	custom: boolean | undefined;
}
interface HotkeysAlternates {
	default: Hotkey[] | undefined;
	custom: Hotkey[] | undefined;
}

export interface CommandHotkeyData {
	id: string;
	getFn: HotkeysAlternates;
	obj: HotkeysAlternates;
	command: HotkeysAlternates & { custom: undefined };
	equalityChecks: {
		fnObj: EqualityChecks;
		fnObjStrict: EqualityChecks;
		fnCommand: EqualityChecks;
	};
}


export interface KeybindingMeta {
	commandId: string;
	commandName: string;
	keysig: string;
	isDefault: boolean;
	isListed: boolean;
    defaultHotkeys: Hotkey[];
    customHotkeys: Hotkey[];
}