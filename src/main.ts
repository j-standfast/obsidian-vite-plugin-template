import type { App, PluginManifest, WorkspaceLeaf } from "obsidian";
import { Plugin } from "obsidian";

import { DebugUtils } from "@/DebugUtil";
// import { KeybindingManager } from "@/KeybindingManager";
import "@/styles.css";
import type { TailoredCutsSettings } from "@/types";

export default class TailoredCutsPlugin extends Plugin {
	settings: TailoredCutsSettings;
	// keybindingManager: KeybindingManager;
	util: DebugUtils;

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);
		this.settings = {
			// hotkeys: [],
			keybindings: [],
			obsidianHotkeys: {},
		};
		// this.keybindingManager = new KeybindingManager(app, this);
		this.util = new DebugUtils(this.app, this);
	}

	get dir(): string {
		if (!this.manifest.dir)
			throw new Error("TailoredCutsPlugin / dir not found");
		return this.manifest.dir;
	}

	getPluginConfigFilePath(fileName: string): string {
		return this.dir + "/" + fileName;
	}

	async onload() {
		this.util.onload();

		this.app.workspace.onLayoutReady(() => {
			try {
				// this.keybindingManager.load();
			} catch (err) {
				console.error("TailoredCutsPlugin / onload", err);
				throw new Error(`TailoredCutsPlugin / onload: ${err}`);
			}
		});
	}

	onunload() {
		// this.shortcutListener.unload();
		this.util.unload();
		// this.app.workspace.detachLeavesOfType(DASHBOARD_VIEW_TYPE);
	}

	// async loadSettings() {
	// 	const unparsed = await this.loadData();
	// 	const settingsParse = serializedSettingsSchema.safeParse(unparsed);
	// 	if (!settingsParse.success) {
	// 		console.log("Error parsing settings", settingsParse.error);
	// 		throw new Error("Error parsing settings");
	// 	} else {
	// 		const { keybindings, obsidianHotkeys } = settingsParse.data;
	// 		this.settings = {
	// 			// keybindings: deserializeKeybindings(keybindings),
	// 			keybindings: [],
	// 			obsidianHotkeys: obsidianHotkeys as SerializedHotkeysStale, // TODO
	// 		};
	// 	}
	// }

	// async saveSettings() {
	// 	const obsidianHotkeys = this.settings.obsidianHotkeys;
	// 	// const keybindings = serializeKeybindings(this.settings.keybindings);
	// 	const saveData = { keybindings: [], obsidianHotkeys };
	// 	const parsed = serializedSettingsSchema.safeParse(saveData);
	// 	if (parsed.success) {
	// 		await this.saveData(parsed.data);
	// 	} else {
	// 		console.log("Error parsing settings", parsed.error);
	// 		throw new Error("Error parsing settings");
	// 	}
	// }

	// 	async addTailoredCutsView() {
	// 		const isViewOpen = this.app.workspace.getLeavesOfType(DASHBOARD_VIEW_TYPE);
	// 		if (isViewOpen.length > 0) return;
	// 		this.app.workspace.getLeaf().setViewState({
	// 			type: DASHBOARD_VIEW_TYPE,
	// 		});
	// 	}
	// }
}
