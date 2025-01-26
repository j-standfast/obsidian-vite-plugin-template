import type {
	ChromeCode,
	ChromeModifierCodeLower,
	ObsidianHotkey,
} from "./key";

export type Keysig = string;

export type TailorKeysig = string;

// keycodes, chords, sequences

export type ChordKeyModifiers = Map<ChromeModifierCodeLower, true>;
export type ValidChord = {
	modifiers: ChordKeyModifiers;
	base: ChromeCode;
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

export interface KeybindingStale {
	id: string; // TODO kick this out no - because can be more than one
	key: Chord[];
}

export type SerializedHotkeysStale = Record<string, ObsidianHotkey[]>;

export interface SerializedSettings {
	keybindings: SerializedKeybinding[];
	obsidianHotkeys: SerializedHotkeysStale;
}
export interface EqualityChecks {
	default: boolean | undefined;
	custom: boolean | undefined;
}
interface HotkeysAlternates {
	default: ObsidianHotkey[] | undefined;
	custom: ObsidianHotkey[] | undefined;
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
	defaultHotkeys: ObsidianHotkey[];
	customHotkeys: ObsidianHotkey[];
}


