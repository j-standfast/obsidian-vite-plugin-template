import type { Command, Hotkey, KeymapInfo, PluginManifest } from "obsidian";

export interface CommandPluginData {
	id: string;
	isInPlugin: boolean; // only for internal plugins
	isPluginEnabled: boolean | undefined;
	pluginCommandEquality: boolean | undefined;
}

export interface FutureCommandMetaData {
	id: string;
	tags: string[];
	context: string; // user picks, we check vs command checks; see scope in workspace and app? also recent commandds and keys
	planes: string[];
	hasConflicts: boolean;
	conflicts: unknown[];
	vsCodeAnalogs: string[];
	vimAnalogs: string[];
	emacsAnalogs: string[];
}