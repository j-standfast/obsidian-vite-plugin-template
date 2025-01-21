import type {
	Hotkey as ObsidianHotkey,
	KeymapInfo as ObsidianKeymapInfo,
	Modifier as ObsidianModifier,
} from "obsidian";

import {
	CHROME_MODIFIER_CODES_PASCAL,
	CHROME_MODIFIER_CODES_LOWER,
	CHROME_CODES_PASCAL,
	CHROME_CODES_LOWER,
} from "@/constants/keys/keys-chrome";

export type ChromeModifierCodeLower =
	(typeof CHROME_MODIFIER_CODES_LOWER)[number];
export type ChromeModifierCodePascal =
	(typeof CHROME_MODIFIER_CODES_PASCAL)[number];
export type ChromeCodePascal = (typeof CHROME_CODES_PASCAL)[number];
export type ChromeCodeLower = (typeof CHROME_CODES_LOWER)[number];

export type { ObsidianModifier, ObsidianHotkey, ObsidianKeymapInfo };
