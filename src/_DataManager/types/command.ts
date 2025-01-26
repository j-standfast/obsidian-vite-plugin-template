import type { Command } from "obsidian";
import type { PluginId } from './plugin';

export type CommandId = string;

export interface CommandData extends Command {
	id: string;
	name: string;
	pluginId?: PluginId;
	pluginType?: "core" | "community";
	pluginEnabled?: boolean;
	idContext: string[] | undefined; // computed
	nameContext: string[] | undefined; // computed

	// computed
	// context
	// context/plugin match
	// isInternal
    // isCommunity
    callbacks: {
        callback: boolean;
        checkCallback: boolean;
        editorCallback: boolean;
        editorCheckCallback: boolean;
    };
	isIn: {
		appCommand: boolean;
		appEditorCommand: boolean;
		internalPluginCommand: boolean;
		foundCommand: boolean;
		listedCommand: boolean;
	};
	appCommandEqualityChecks: {
		appEditorCommand: boolean | undefined;
		internalPluginCommand: boolean | undefined;
		foundCommand: boolean | undefined;
		listedCommand: boolean | undefined;
	};
};

interface FutureCommandMetaData {
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

interface CommandPluginData {
	id: string;
	isInPlugin: boolean; // only for internal plugins
	isPluginEnabled: boolean | undefined;
	pluginCommandEquality: boolean | undefined;
}