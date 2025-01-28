import type { App, PluginManifest, WorkspaceLeaf } from "obsidian";
import { Plugin } from "obsidian";

import { DataManager } from "@/_DataManager/DataManager";
import type { SerializedHotkeysStale } from "@/_DataManager/types/keybinding";
import { serializedSettingsSchema } from "@/_STALE/schemas-STALE";

import { DebugUtils } from "@/DebugUtil";
// import { KeybindingManager } from "@/KeybindingManager";
import "@/styles.css";
import type { TailoredCutsSettings } from "@/types";
import { DashboardView, DASHBOARD_VIEW_TYPE } from "@/views/DashboardView";

export default class TailoredCutsPlugin extends Plugin {
	settings: TailoredCutsSettings;
	// dataManager: DataManager;
	// keybindingManager: KeybindingManager;
	util: DebugUtils;

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);
		this.settings = {
			// hotkeys: [],
			keybindings: [],
			obsidianHotkeys: {},
		};
		// this.shortcutListener = new ShortcutListener(
		// 	app,
		// 	this.settings.keybindings
		// );
		// this.dataManager = new DataManager(app, this);
		// this.keybindingManager = new KeybindingManager(app, this);
		this.util = new DebugUtils(this.app, this);
	}

	async onload() {
		await this.loadSettings();
		// this.addSettingTab(new SequenceHotkeysSettingTab(this.app, this));
		// this.shortcutListener.onLoad(this.settings.keybindings);
		this.addCommand({
			id: "show-dashboard",
			name: "Show dashboard",
			callback: () => this.addTailoredCutsView(),
		});
		this.util.onload();

		this.registerView(
			DASHBOARD_VIEW_TYPE,
			(leaf: WorkspaceLeaf) => new DashboardView(leaf, this)
		);
		this.app.workspace.onLayoutReady(() => {
			try {
				// this.keybindingManager.load();
			} catch (err) {
				console.error("Error watching plugins", err);
				throw new Error("Error watching plugins");
			}
		});
	}

	onunload() {
		// this.shortcutListener.unload();
		this.util.unload();
		this.app.workspace.detachLeavesOfType(DASHBOARD_VIEW_TYPE);
	}

	async loadSettings() {
		const unparsed = await this.loadData();
		const settingsParse = serializedSettingsSchema.safeParse(unparsed);
		if (!settingsParse.success) {
			console.log("Error parsing settings", settingsParse.error);
			throw new Error("Error parsing settings");
		} else {
			const { keybindings, obsidianHotkeys } = settingsParse.data;
			this.settings = {
				// keybindings: deserializeKeybindings(keybindings),
				keybindings: [],
				obsidianHotkeys: obsidianHotkeys as SerializedHotkeysStale, // TODO
			};
		}
	}

	async saveSettings() {
		const obsidianHotkeys = this.settings.obsidianHotkeys;
		// const keybindings = serializeKeybindings(this.settings.keybindings);
		const saveData = { keybindings: [], obsidianHotkeys };
		const parsed = serializedSettingsSchema.safeParse(saveData);
		if (parsed.success) {
			await this.saveData(parsed.data);
		} else {
			console.log("Error parsing settings", parsed.error);
			throw new Error("Error parsing settings");
		}
	}

	async addTailoredCutsView() {
		const isViewOpen = this.app.workspace.getLeavesOfType(DASHBOARD_VIEW_TYPE);
		if (isViewOpen.length > 0) return;
		this.app.workspace.getLeaf().setViewState({
			type: DASHBOARD_VIEW_TYPE,
		});
	}
}

export type { TailoredCutsPlugin };
