import type { HotkeyManager } from "obsidian";

import type { ObsidianKeymapInfo, ObsidianHotkey, CommandId } from "@/types";

const uniqueKeymapInfoModifiers = (keymapInfos: ObsidianKeymapInfo[]) => {
	const mods = Array.from(
		new Set(keymapInfos.flatMap((kmi) => kmi.modifiers?.split(",") ?? []))
	).filter(Boolean);
	return mods.toSorted();
};

const uniqueHotkeyModifiers = (
	hotkeysByCommandId: Record<CommandId, ObsidianHotkey[]>
) => {
	const mods = Object.values(hotkeysByCommandId).flatMap((hks) =>
		hks.flatMap((hk) => hk.modifiers)
	);
	return [...new Set(mods)].toSorted();
};

export const getUniqueModifiers = (hotkeyManager: HotkeyManager) => {
	if (!hotkeyManager.baked) hotkeyManager.bake();
	return {
		bakedKeymapInfo: uniqueKeymapInfoModifiers(hotkeyManager.bakedHotkeys),
		defaultHotkeys: uniqueHotkeyModifiers(hotkeyManager.defaultKeys),
		customHotkeys: uniqueHotkeyModifiers(hotkeyManager.customKeys),
	};
};

const countHotkeys = (hotkeysByCommandId: Record<CommandId, ObsidianHotkey[]>) => {
	return Object.values(hotkeysByCommandId).reduce((acc, hks) => acc + hks.length, 0);
};

export const getHotkeyCounts = (hotkeyManager: HotkeyManager) => {
	return {
		bakedHotkeys: hotkeyManager.bakedHotkeys.length,
		defaultHotkeys: countHotkeys(hotkeyManager.defaultKeys),
		customHotkeys: countHotkeys(hotkeyManager.customKeys),
	};
};
