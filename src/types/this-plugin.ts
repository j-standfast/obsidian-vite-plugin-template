import type { CommandData } from "@/_DataManager/types/command";
import type {
	HotkeyMeta,
	HotkeyTableDatum,
} from "@/_DataManager/types/keybinding";
import type { PluginMeta } from "@/_DataManager/types/plugin";
import type {
	KeybindingStale,
	SerializedHotkeysStale,
} from "@/_DataManager/types/keybinding";

export type { TailoredCutsPlugin } from "@/main";
export type { DashboardType as DashboardKind } from "@/views/Dashboard";

export interface TailoredCutsSettings {
	keybindings: KeybindingStale[];
	obsidianHotkeys: SerializedHotkeysStale;
}

export interface TailoredCutsData {
	plugins: PluginMeta[];
	commands: CommandData[];
	keybindings: {
		hotkeyTableData: HotkeyTableDatum[];
		hotkeyMeta: HotkeyMeta[];
	};
}
