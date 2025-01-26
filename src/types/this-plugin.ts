import { DASHBOARD_KINDS } from "@/constants/plugin";

import type { CommandData } from "./command";
import type { HotkeyMeta, HotkeyTableDatum } from "./keybinding";
import type { PluginMeta } from "./plugin";
import type {
	KeybindingStale,
	SerializedHotkeysStale,
} from "../_DataManager/types/keybinding";

export type { TailorCutsPlugin } from "@/main";

export interface TailorCutsSettings {
	keybindings: KeybindingStale[];
	obsidianHotkeys: SerializedHotkeysStale;
}

export interface TailorCutsData {
	plugins: PluginMeta[];
	commands: CommandData[];
	keybindings: {
		hotkeyTableData: HotkeyTableDatum[];
		hotkeyMeta: HotkeyMeta[];
	};
}

export type DashboardKind = (typeof DASHBOARD_KINDS)[number];
