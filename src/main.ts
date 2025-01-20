import { App, Plugin, PluginManifest, WorkspaceLeaf } from "obsidian";

import { ShortcutListener } from "@/ShortcutListener/ShortcutListener";
import {
	VIEW_TYPE_BARRACLOUGH_TAILOR_CUTS_COMMANDS,
	VIEW_TYPE_BARRACLOUGH_TAILOR_CUTS_PLUGINS,
} from "@/constants/plugin";
import { TailorCutsDataManager } from "@/DataManager/TailorCutsDataManager";
import { serializedSettingsSchema } from "@/schemas";
import "@/styles.css";
import type { CommandId, SerializedHotkeys, TailorCutsSettings } from "@/types";
import { DebugUtils } from "@/utils/DebugUtils/DebugUtils";
import {
	deserializeKeybindings,
	serializeKeybindings,
} from "@/utils/serialize";
import { CommandsView } from "@/views/commands/CommandsView";
import { PluginsView } from "@/views/plugins/PluginsView";

export default class TailorCutsPlugin extends Plugin {
	settings: TailorCutsSettings;
	shortcutListener: ShortcutListener;
	dataManager: TailorCutsDataManager;
	util: DebugUtils;

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);
		this.settings = {
			// hotkeys: [],
			keybindings: [],
			obsidianHotkeys: {},
		};
		this.shortcutListener = new ShortcutListener(
			app,
			this.settings.keybindings
		);
		this.dataManager = new TailorCutsDataManager(app, this);
		this.util = new DebugUtils(this.app, this);
	}

	async onload() {
		await this.loadSettings();
		// this.addSettingTab(new SequenceHotkeysSettingTab(this.app, this));
		this.shortcutListener.onLoad(this.settings.keybindings);
		this.addCommand({
			id: "show-plugins-dashboard",
			name: "Show plugins dashboard",
			callback: () => this.addPluginsView(),
		});
		this.addCommand({
			id: "show-commands-dashboard",
			name: "Show commands dashboard",
			callback: () => this.addCommandsView(),
		});
		this.util.onload();

		this.registerView(
			VIEW_TYPE_BARRACLOUGH_TAILOR_CUTS_PLUGINS,
			(leaf: WorkspaceLeaf) => new PluginsView(leaf, this)
		);
		this.registerView(
			VIEW_TYPE_BARRACLOUGH_TAILOR_CUTS_COMMANDS,
			(leaf: WorkspaceLeaf) => new CommandsView(leaf, this)
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
		this.shortcutListener.unload();
		this.util.unload();
		this.app.workspace.detachLeavesOfType(
			VIEW_TYPE_BARRACLOUGH_TAILOR_CUTS_PLUGINS
		);
		this.app.workspace.detachLeavesOfType(
			VIEW_TYPE_BARRACLOUGH_TAILOR_CUTS_COMMANDS
		);
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
				keybindings: deserializeKeybindings(keybindings),
				obsidianHotkeys: obsidianHotkeys as SerializedHotkeys, // TODO
			};
		}
	}

	async saveSettings() {
		const keybindings = serializeKeybindings(this.settings.keybindings);
		const obsidianHotkeys = this.settings.obsidianHotkeys;
		const saveData = { keybindings, obsidianHotkeys };
		const parsed = serializedSettingsSchema.safeParse(saveData);
		if (parsed.success) {
			await this.saveData(parsed.data);
		} else {
			console.log("Error parsing settings", parsed.error);
			throw new Error("Error parsing settings");
		}
	}

	async addPluginsView() {
		const isViewOpen = this.app.workspace.getLeavesOfType(
			VIEW_TYPE_BARRACLOUGH_TAILOR_CUTS_PLUGINS
		);
		if (isViewOpen.length > 0) return;
		this.app.workspace
			.getLeaf()
			.setViewState({ type: VIEW_TYPE_BARRACLOUGH_TAILOR_CUTS_PLUGINS });
	}

	async addCommandsView() {
		const isViewOpen = this.app.workspace.getLeavesOfType(
			VIEW_TYPE_BARRACLOUGH_TAILOR_CUTS_COMMANDS
		);
		if (isViewOpen.length > 0) return;
		this.app.workspace
			.getLeaf()
			.setViewState({ type: VIEW_TYPE_BARRACLOUGH_TAILOR_CUTS_COMMANDS });
	}
}

export type { TailorCutsPlugin };
