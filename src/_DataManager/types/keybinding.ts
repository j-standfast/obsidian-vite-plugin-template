import type {
	ChromeCode,
	ChromeModifierCodeLower,
	ObsidianHotkey,
} from "./key";

import type { CommandId } from "./command";

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


type HotkeyTableDatumA = {
  // keysig: string;
  commandId: CommandId;
  bakedCommandIdsForKeysig: CommandId[];
  obsidianModifiers: string;
  obsidianKey: string;
  isDefaultHotkey: boolean;
  isEffectiveHotkey: boolean;
  isOverriding: boolean;
  keysigsOverriding: string;
  isOverridden: boolean;
  keysigsOverriddenBy: string;
  conflictingCommandIds: CommandId[];
  probablyShouldBeBaked: boolean;
  isBaked: boolean;
  keysig: Keysig;
}

type HotkeyTableDatumB = {
  // keysig: string;
  commandId: string;
  obsidianModifiers: string;
  obsidianKey: string;
  isDefault: boolean;
}

export type HotkeyTableDatum = HotkeyTableDatumA;

export interface HotkeyMetaBase {
	hotkeyMetaId: string;
	hotkey: ObsidianHotkey;
	isCustom: boolean;
	commandId: CommandId;
	hotkeyIdx: number;
	recordIdx: number;
	keysig: Keysig;
	isEnabled: boolean;
	isBaked: boolean;
	duplicateHotkeyMetaIds: string[];
	complementHotkeyMetaIds: string[] | undefined;
	bakedIdx: number | undefined;
	bakedKeysig: Keysig | undefined;
}

export interface HotkeyMetaRelations {
	conflictingHotkeyMetaIds: string[] | undefined;
	preConflictingHotkeyMetaIds: string[] | undefined;
	remappedHotkeyMetaIds: string[] | undefined;
	preRemappedHotkeyMetaIds: string[] | undefined;
	shadowHotkeyMetaIds: string[] | undefined;
	preShadowHotkeyMetaIds: string[] | undefined;
}

export interface HotkeyMeta extends HotkeyMetaBase, HotkeyMetaRelations {}

