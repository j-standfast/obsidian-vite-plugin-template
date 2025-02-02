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
	_log: Logger = makeClassLogger("DebugThingy", () => 0 <= this._LOG_LEVEL);
	_logLev: LevelLogger = makeClassLevelLogger(
		"DebugThingy",
		() => this._LOG_LEVEL
	);
	_LOG_LEVEL: number = 1;
	app: App;
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		this.app = app;
		this.plugin = plugin;
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
			id: "log-from-debug-thingy",
			name: "log from debug thingy",
			callback: async () => {
        console.log("debug-thingy-log called");
			},
		});
	}

	unload() {
		this.plugin.removeCommand("log-from-debug-thingy");
	}

}
