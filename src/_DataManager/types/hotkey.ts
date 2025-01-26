import type { CommandId } from "@/types";
import { Keysig } from "./keybinding";

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