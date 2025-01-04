import { App, Plugin, PluginManifest } from "obsidian";

import { ShortcutListener } from "src/ShortcutListener";

// import { DEFAULT_SETTINGS } from "./src/constants";
import { serializedSettingsSchema } from "./src/schemas";
import { deserializeKeybindings, serializeKeybindings } from "src/serialize";
import { importShortcuts, waitAndAudit } from "src/audit.ts/importShortcuts";
import type { Settings } from "./src/types";
import { auditCommands } from "src/audit.ts/importShortcuts";

export default class BCShortcutsPlugin extends Plugin {
	settings: Settings;
	shortcutListener: ShortcutListener;

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
	}

	async onload() {
		await this.loadSettings();
		// this.addSettingTab(new SequenceHotkeysSettingTab(this.app, this));
		this.shortcutListener.onLoad(this.settings.keybindings);
		this.addCommand({
			id: "bc-audit-commands",
			name: "Audit commands and hotkeys",
			callback: () => auditCommands(this.app, this.settings),
		});
		this.addCommand({
			id: "bc-import-shortcuts",
			name: "Import shortcuts",
			callback: () => importShortcuts(this.app),
		});
	}

	onunload() {
		this.shortcutListener.unload();
	}

	async loadSettings() {
		const unparsed = await this.loadData();
		const settingsParse = serializedSettingsSchema.safeParse(unparsed);
		console.log("loadSettings", { settingsParse });
		if (!settingsParse.success) {
			console.log("Error parsing settings", settingsParse.error);
			throw new Error("Error parsing settings");
		} else {
			const { keybindings, obsidianHotkeys } = settingsParse.data;
			this.settings = {
				keybindings: deserializeKeybindings(keybindings),
				obsidianHotkeys,
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
}

export type { BCShortcutsPlugin as SequenceHotkeysPlugin };
