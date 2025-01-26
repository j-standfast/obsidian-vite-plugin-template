import type {
	Keysig,
	ObsidianModifierInternal,
} from "../_DataManager/types/key";
import type { CommandId } from "./command";
import { KeymapInfo as ObsidianKeymapInfo } from "obsidian";
export type { HotkeyMeta } from "@/_DataManager/keybindings";

export interface KeymapInfoRequiredKey extends ObsidianKeymapInfo {
	key: string;
}

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
