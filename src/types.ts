import type { Hotkey } from "obsidian";
import {
	MODIFIER_CODES_CHROME_CAMEL,
	CODES_CHROME_CAMEL,
	MODIFIER_KEYS,
} from "./constants";

// utility / test types
export type Expect<T extends true> = T;
export type CoExtends<T, U> = [T] extends [U]
	? [U] extends [T]
		? true
		: false
	: false;

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

// shared
export interface Keybinding {
	id: string;  // TODO kick this out no - because can be more than one
	key: Chord[];
}

export type SerializedHotkeys = Record<string, Hotkey[]>;

export interface SerializedSettings {
	keybindings: SerializedKeybinding[];
	obsidianHotkeys: SerializedHotkeys;
}

export interface Settings {
	keybindings: Keybinding[];
	obsidianHotkeys: SerializedHotkeys;
}

// export interface Command {
//     id: string;
//     name: string;
//     icon?: IconName;
//     mobileOnly?: boolean;
//     repeatable?: boolean;
//     callback?: () => any;
//     checkCallback?: (checking: boolean) => boolean | void;
//     editorCallback?: (editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => any;
//     editorCheckCallback?: (checking: boolean, editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => boolean | void;
//     hotkeys?: Hotkey[];
// }
