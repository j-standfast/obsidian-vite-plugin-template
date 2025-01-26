import type {
	Hotkey as ObsidianHotkey,
	KeymapInfo as ObsidianKeymapInfo,
	KeymapContext as ObsidianKeymapContext,
	Modifier as ObsidianModifierInternal,
} from "obsidian";
import type { CommandId } from "./commands";
import {
	CHROME_MODIFIER_CODES,
	CHROME_CODES,
	OBSIDIAN_MODIFIERS_INTERNAL,
} from "@/constants/keys";

import type { KeybindingScope } from "@/KeybindingScope";
import type { Expect } from "./util";

export type { ObsidianModifierInternal, ObsidianHotkey, ObsidianKeymapInfo };
export type ChromeModifierCode = (typeof CHROME_MODIFIER_CODES)[number];
export type ChromeCode = (typeof CHROME_CODES)[number];

export type ObsidianModifierInternalWindows = Exclude<
	ObsidianModifierInternal,
	"Mod"
>;
export type ObsidianModifierDisplayWindows =
	| Exclude<ObsidianModifierInternalWindows, "Meta">
	| "Win";

export type Keysig = string;

type ObsidianModifierInternalCheck =
	(typeof OBSIDIAN_MODIFIERS_INTERNAL)[number];
type obsidianModifierTests = [
	Expect<
		ObsidianModifierInternal extends ObsidianModifierInternalCheck
			? true
			: false
	>,
	Expect<
		ObsidianModifierInternalCheck extends ObsidianModifierInternal
			? true
			: false
	>
]; // TODO systematize this

export interface KeymapContextWithCode extends ObsidianKeymapContext {
	code: string;
}

export type KeymapEventWithCodeListener = (
	evt: KeyboardEvent,
	ctx: KeymapContextWithCode
) => false | any;

export interface KeymapEventWithCodeHandler {
	scope: KeybindingScope;
	modifiers: ObsidianModifierInternalWindows | null;
	key: ObsidianKeymapInfo | null;
	func: KeymapEventWithCodeListener;
}

export type KeyMatchResult =
	| {
			status: "execute";
			commandId: CommandId;
	  }
	| {
			status: "chord";
	  }
	| {
			status: "none";
	  };
