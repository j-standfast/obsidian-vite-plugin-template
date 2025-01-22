import type { Keysig, ObsidianModifierInternal } from "./keys";
import type { CommandId } from "./commands";
export type { HotkeyMeta } from "@/DataManager/keybindings";

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
}