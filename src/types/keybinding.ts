import type { CommandId } from "./command";
import {
	KeymapInfo as ObsidianKeymapInfo,
	KeymapContext as ObsidianKeymapContext,
} from "obsidian";
import type { KBScope } from "@/KeybindingScope/KeybindingScope";

export interface KeymapInfoRequiredKey extends ObsidianKeymapInfo {
	key: string;
}

export interface KeymapContextWithCode extends ObsidianKeymapContext {
	code: string;
}
export type KeymapEventWithCodeListener = (
	evt: KeyboardEvent,
	ctx: KeymapContextWithCode
) => false | any;

export interface KeymapEventWithCodeHandler {
	scope: KBScope;
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

export type ShortcutKeybindingOld = {
	key: string;
	commandId: CommandId;
	when?: string | undefined;
};

export type ShortcutKeybinding = {
	keymapInfo: KeymapInfoRequiredKey[];
	key: string;
	commandId: CommandId;
	isDefault: boolean;
	isNegative: boolean;
	when?: string | undefined;
};

export interface KeybindingJsonItem {
	command: CommandId;
	key: string;
	when?: string;
}
