import { DASHBOARD_KINDS } from "@/constants/plugin";

import type { CommandData } from "./commands";
import type { HotkeyMeta, HotkeyTableDatum } from "./keybindings";
import type { PluginMeta } from "./plugins";

export type { TailorCutsPlugin } from "@/main";

export interface TailorCutsSettings {
	keybindings: Keybinding[];
	obsidianHotkeys: SerializedHotkeys;
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
