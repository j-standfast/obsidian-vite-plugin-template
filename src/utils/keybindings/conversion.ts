import type { ObsidianHotkey, ObsidianKeymapInfo, ObsidianModifierInternal } from "@/types";
import { obsidianInternalModifierToWindows } from "./key-maps-obsidian";
import { capitalize } from "../string";

export const hotkeyToKeymapInfo = (
	hotkey: ObsidianHotkey
): ObsidianKeymapInfo => {
	const mods = hotkey.modifiers
		.map(obsidianInternalModifierToWindows)
		.toSorted((a, b) => a.localeCompare(b));
	return {
		modifiers: mods.join(","),
		key: hotkey.key,
	};
};

export const keymapInfoToKeysig = (kmi: ObsidianKeymapInfo): string => {
	const mods = kmi.modifiers
		? kmi.modifiers.split(",").toSorted((a, b) => a.localeCompare(b))
		: [];
	return [...mods, kmi.key ?? ""]
		.filter(Boolean)
		.join("+");
};

export const hotkeyToKeysig = (hotkey: ObsidianHotkey): string =>
	keymapInfoToKeysig(hotkeyToKeymapInfo(hotkey));

export const keymapInfoEquals = (
	a: ObsidianKeymapInfo,
	b: ObsidianKeymapInfo
) => {
	return (
		a.modifiers === b.modifiers &&
		a.key?.toLowerCase() === b.key?.toLowerCase()
	);
};