import {
	App,
	Command,
	Plugin,
	PluginSettingTab,
	SearchComponent,
	setIcon,
	Setting,
	Menu,
	ButtonComponent,
	MenuItem,
    PluginManifest,
} from "obsidian";

import { KeyChord } from "src/KeyChord";
import { ShortcutListener } from "src/new/shortcutListener";
import { HotkeyManager } from "./src/HotkeyManager";
import { ChordListener } from "./src/ChordListener";
import type { SequenceHotkey } from "./src/types";
import { Settings } from "./src/new/newTypes";
import { DEFAULT_SETTINGS } from "./src/new/newConstants";
import { SequenceHotkeysSettingTab } from "./src/SettingTab/SettingTab";
import { keySequenceEqual } from "./src/util";
import {
	serializeSequenceHotkeys,
	deserializeSequenceHotkeys,
} from "./src/serialize";
import { settingsSerializedSchema } from "./src/new/newSchemas";
import {
	deserializeKeybindings,
	serializeKeybindings,
} from "src/new/serialize";
import { importShortcuts } from "src/new/importShortcuts";

export default class SequenceHotkeysPlugin extends Plugin {
	settings: Settings;
	saveListener: ((s: Settings) => void) | undefined;
	hotkeyManager: HotkeyManager;
	chordListener: ChordListener;
    shortcutListener: ShortcutListener;

    constructor(app: App, manifest: PluginManifest) {
        super(app, manifest);
        this.settings = {
            hotkeys: [],
            keybindings: [],
            original: {},
        };
        this.hotkeyManager = new HotkeyManager((id: string) =>
			(this.app as any).commands.executeCommandById(id)
		);
        this.chordListener = new ChordListener((chord: KeyChord) => {
			// console.log("onChord (from onload)");
			if (!!(this.app as any).setting.activeTab) {
				return false;
			}
			return this.hotkeyManager.handleChordPress(chord);
        });
    }

	async onload() {
		this.hotkeyManager = new HotkeyManager((id: string) =>
			(this.app as any).commands.executeCommandById(id)
		);
		await this.loadSettings();
		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SequenceHotkeysSettingTab(this.app, this));

		this.chordListener = new ChordListener((chord: KeyChord) => {
			// console.log("onChord (from onload)");
			if (!!(this.app as any).setting.activeTab) {
				return false;
			}
			return this.hotkeyManager.handleChordPress(chord);
        });
        this.shortcutListener = new ShortcutListener(this.app, this.settings.keybindings);
        importShortcuts(this.app);
	}

	onunload() {
		this.chordListener.destruct();
	}

	_settingsUpdated = () => {
		this.saveSettings();

		this.hotkeyManager.reset();
		this.settings.hotkeys.map((h) =>
			this.hotkeyManager.addHotkey(h.command, h.chords)
		);
		this.saveListener?.(this.settings);
	};

	async loadSettings() {
		const unparsedLoaded = await this.loadData();
		const unparsed = {
			...DEFAULT_SETTINGS,
			...unparsedLoaded,
		};
        const settingsSerialized = settingsSerializedSchema.safeParse(unparsed);
        console.log('loadSettings', {
            unparsedLoaded,
            DEFAULT_SETTINGS,
            settingsSerialized,
        });
		if (!settingsSerialized.success) {
			console.log("Error parsing settings", settingsSerialized.error);
			throw new Error("Error parsing settings");
		} else {
			const { hotkeys, keybindings } = settingsSerialized.data;
			this.settings = {
				hotkeys: deserializeSequenceHotkeys(hotkeys),
				keybindings: deserializeKeybindings(keybindings),
			};
			this._settingsUpdated();
		}
	}

	async saveSettings() {
		const hotkeys = serializeSequenceHotkeys(this.settings.hotkeys);
		const keybindings = serializeKeybindings(this.settings.keybindings);
		await this.saveData({ hotkeys, keybindings });
	}

	setSaveListener = (fn: (s: Settings) => void) => {
		this.saveListener = fn;
	};

	addHotkey = (commandId: string, chord: KeyChord[] | undefined) => {
		if (chord?.length) {
			this.settings.hotkeys = [
				...this.settings.hotkeys,
				{
					command: commandId,
					chords: chord,
				},
			];
		}
		this._settingsUpdated();
	};

	deleteHotkey = (commandId: string, chord: KeyChord[]) => {
		this.settings.hotkeys = this.settings.hotkeys.filter(
			(h: SequenceHotkey) =>
				h.command != commandId || !keySequenceEqual(h.chords, chord)
		);
		this._settingsUpdated();
	};
}

export type { SequenceHotkeysPlugin };
