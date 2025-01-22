import { App, Plugin, PluginManifest, WorkspaceLeaf } from "obsidian";

// import { ShortcutListener } from "@/ShortcutListener/ShortcutListener";
import { TAILOR_CUTS_VIEW_TYPE } from "@/constants/plugin";
import { TailorCutsDataManager } from "@/DataManager/TailorCutsDataManager";
import { serializedSettingsSchema } from "@/schemas";
import "@/styles.css";
import type { CommandId, SerializedHotkeys, TailorCutsSettings } from "@/types";
import { DebugUtils } from "@/utils/DebugUtils/DebugUtils";
// import {
// 	deserializeKeybindings,
// 	serializeKeybindings,
// } from "@/utils/serialize";
import { TailorView } from "./views/TailorView";

export default class TailorCutsPlugin extends Plugin {
	settings: TailorCutsSettings;
	// shortcutListener: ShortcutListener;
	dataManager: TailorCutsDataManager;
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
		this.dataManager = new TailorCutsDataManager(app, this);
		this.util = new DebugUtils(this.app, this);
	}

	async onload() {
		await this.loadSettings();
		// this.addSettingTab(new SequenceHotkeysSettingTab(this.app, this));
		// this.shortcutListener.onLoad(this.settings.keybindings);
		this.addCommand({
			id: "show-dashboard",
			name: "Show dashboard",
			callback: () => this.addTailorCutsView(),
		});
		this.util.onload();

		this.registerView(
			TAILOR_CUTS_VIEW_TYPE,
			(leaf: WorkspaceLeaf) => new TailorView(leaf, this)
		);
		this.app.workspace.onLayoutReady(() => {
			try {
			} catch (err) {
				console.error("Error watching plugins", err);
				throw new Error("Error watching plugins");
			}
		});
	}

	onunload() {
		// this.shortcutListener.unload();
		this.util.unload();
		this.app.workspace.detachLeavesOfType(TAILOR_CUTS_VIEW_TYPE);
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
				obsidianHotkeys: obsidianHotkeys as SerializedHotkeys, // TODO
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

	async addTailorCutsView() {
		const isViewOpen = this.app.workspace.getLeavesOfType(
			TAILOR_CUTS_VIEW_TYPE
		);
		if (isViewOpen.length > 0) return;
		this.app.workspace.getLeaf().setViewState({
			type: TAILOR_CUTS_VIEW_TYPE,
		});
	}
}

export type { TailorCutsPlugin as TailorCutsPluginType };
