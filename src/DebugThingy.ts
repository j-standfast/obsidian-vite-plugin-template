import * as z from "zod";
import type { App } from "obsidian";
import { Keymap, normalizePath, Scope } from "obsidian";

import {
	makeClassLevelLogger,
	makeClassLogger,
	type Logger,
	type LevelLogger,
} from "@/util/makeClassLogger";
import type { MyPlugin } from "@/types";

export class DebugThingy {
	_log: Logger = makeClassLogger("DebugUtils", () => 0 <= this._LOG_LEVEL);
	_logLev: LevelLogger = makeClassLevelLogger(
		"DebugUtils",
		() => this._LOG_LEVEL
	);
	_LOG_LEVEL: number = 1;
	app: App;
	plugin: MyPlugin;
	normalizePath: (path: string) => string;

	constructor(app: App, plugin: MyPlugin) {
		this.app = app;
		this.plugin = plugin;
		this.normalizePath = normalizePath;
		this._log = this._log.bind(this);
		// @ts-ignore
    globalThis._dbt = {
      z,
      keymap: Keymap,
      scope: Scope,
    }
	}

	onload() {
		this.plugin.addCommand({
			id: "debug-thingy-log",
			name: "Debug Thingy Log",
			callback: async () => {
        console.log("debug-thingy-log");
			},
		});
	}

	unload() {
		this.plugin.removeCommand("debug-thingy-log");
	}
}
