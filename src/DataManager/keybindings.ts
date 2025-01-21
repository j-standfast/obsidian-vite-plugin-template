import type { HotkeyManager } from "obsidian";
import type {
	HotkeyManagerCustomKeysRecord,
	HotkeyManagerDefaultKeysRecord,
} from "@/tailor-cuts-obsidian";
import type {
	HotkeyTableDatum,
	ObsidianHotkey,
	ObsidianKeymapInfo,
} from "@/types";

const parseHotkeyTableDatum = (
	id: string,
	hotkey: ObsidianHotkey,
	isDefault: boolean
): HotkeyTableDatum => {
	return {
		commandId: id,
		obsidianModifiers: hotkey.modifiers?.join(", ") ?? "",
		obsidianKey: hotkey.key,
		isDefault,
	};
};

const parseHotkeyRecord = (
	record: Record<string, ObsidianHotkey[]>,
	isDefault: boolean
): HotkeyTableDatum[] => {
	return Object.entries(record).flatMap(([id, hotkeys]) =>
		hotkeys.map((hotkey) => parseHotkeyTableDatum(id, hotkey, isDefault))
	);
};

export function getHotkeyTableData(
	hotkeyManager: HotkeyManager
): HotkeyTableDatum[] {
	return [
		...parseHotkeyRecord(hotkeyManager.customKeys, false),
		...parseHotkeyRecord(hotkeyManager.defaultKeys, true),
	];
}
