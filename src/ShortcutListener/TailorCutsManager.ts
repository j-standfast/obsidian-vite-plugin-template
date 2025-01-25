import type { App } from "obsidian";
import type { TailorCutsPlugin } from "@/types";

export class TailorCutsManager {
	app: App;
	plugin: TailorCutsPlugin;

	constructor(app: App, plugin: TailorCutsPlugin) {
		this.app = app;
		this.plugin = plugin;
	}
}
