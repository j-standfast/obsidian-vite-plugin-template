import type { Command } from "obsidian";
import { PluginId } from "./plugins";

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
