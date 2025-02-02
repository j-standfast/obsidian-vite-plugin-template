import type { App, PluginManifest } from "obsidian";
import { Plugin } from "obsidian";

import { DebugThingy } from "@/DebugThingy";
import "@/styles.css";
import type { MyPluginSettings } from "@/types";
import { makeClassLevelLogger, makeClassLogger, type LevelLogger, type Logger } from "@/util/makeClassLogger";

export class MyPlugin extends Plugin {
  _LOG_LEVEL: number = 0;
  _log: Logger = makeClassLogger("MyPlugin", () => 0 <= this._LOG_LEVEL);
  _logLev: LevelLogger = makeClassLevelLogger("MyPlugin", () => this._LOG_LEVEL);
  settings: MyPluginSettings;
	thingy: DebugThingy;

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);
		this.settings = {};
		this.thingy = new DebugThingy(this.app, this);
	}

	get dir(): string {
		if (!this.manifest.dir) throw new Error("MyPlugin / dir not found");
		return this.manifest.dir;
	}

	getPluginConfigFilePath(fileName: string): string {
		return this.dir + "/" + fileName;
	}

	async onload() {
		this.thingy.onload();
		this.app.workspace.onLayoutReady(() => {
			try {
				this._log("onload");
			} catch (err) {
				console.error("MyPlugin / onload", err);
				throw new Error(`MyPlugin / onload: ${err}`);
			}
		});
	}

	onunload() {
		this.thingy.unload();
	}

	async loadSettings() {
		const data = (await this.loadData()) as MyPluginSettings;
		this.settings = data;
	}

	async saveSettings() {
		const saveData = this.settings;
		await this.saveData(saveData);
	}
}

export default MyPlugin;