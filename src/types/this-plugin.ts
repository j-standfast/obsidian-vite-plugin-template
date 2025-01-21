import type { CommandData } from "./commands";
import type { HotkeyTableDatum } from "./keybindings";
import type { PluginMeta } from "./plugins";
import type { TailorCutsPluginType } from "@/main";

export interface TailorCutsSettings {
	keybindings: Keybinding[];
	obsidianHotkeys: SerializedHotkeys;
}

export interface TailorCutsData {
	plugins: PluginMeta[];
	commands: CommandData[];
	keybindings: HotkeyTableDatum[];
}

export type { TailorCutsPluginType };
