import type { Keysig, ObsidianModifierInternal } from "./keys";
import type { CommandId } from "./commands";
import { KeymapInfo as ObsidianKeymapInfo } from "obsidian";
export type { HotkeyMeta } from "@/_DataManager/keybindings";

export interface KeymapInfoRequiredKey extends ObsidianKeymapInfo {
	key: string;
}

export type HotkeyTableDatum = {
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
};

export type ShortcutKeybindingOld = {
	key: string;
	commandId: CommandId;
	when?: string | undefined;
};

export type ShortcutKeybinding = {
	keymapInfo: KeymapInfoRequiredKey[];
	key: string;
	commandId: CommandId;
	isDefault: boolean;
	isNegative: boolean;
	when?: string | undefined;
};

export interface KeybindingJsonItem {
	command: CommandId;
	key: string;
	when?: string;
}
