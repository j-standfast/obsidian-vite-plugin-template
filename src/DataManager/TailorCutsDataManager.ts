import type { App, Plugin } from "obsidian";

import { getCommandData } from "@/DataManager/commands";
import { getKeybindingMetaData } from "@/DataManager/keybindings-STALE";
import { getPluginMetaData } from "@/DataManager/plugin";
import { PluginsWatcher } from "@/DataManager/PluginsWatcher";
import type { TailorCutsPlugin } from "@/main";
import type { CommandData, KeybindingMeta, PluginMeta } from "@/types";
import { CommandsWatcher } from "./CommandsWatcher";
import { KeybindingsWatcher2 } from "./KeybindingsWatcher2";
import { HotkeyTableDatum } from "@/types/keybindings";
import { getHotkeyTableData } from "./keybindings";

export class TailorCutsDataManager {
	app: App;
	plugin: TailorCutsPlugin;
	#pluginData: PluginMeta[];
	#commandData: CommandData[];
	#keybindingData: HotkeyTableDatum[]; 
	#keybindingWatcher: KeybindingsWatcher2 | null;
	#keybindingWatcherSubscribers: ((data: HotkeyTableDatum[]) => void)[] = [];
	#pluginsWatcher: PluginsWatcher | null;
	#pluginsWatcherSubscribers: ((data: PluginMeta[]) => void)[] = [];
	#commandsWatcher: CommandsWatcher | null;
	#commandsWatcherSubscribers: ((data: CommandData[]) => void)[] = [];
	#logHeader = "TailorCutsDataManager";

	constructor(app: App, plugin: TailorCutsPlugin) {
		this.app = app;
		this.plugin = plugin;
		this.#commandData = [];
		this.#pluginData = [];
		this.#keybindingData = [];
		this.#pluginsWatcher = null;
		this.#commandsWatcher = null;
		this.#keybindingWatcher = null;
		this._load = this._load.bind(this);
		this._load();
		// this.onDataLoaded = this.onDataLoaded.bind(this);
	}
	/**
	 * Refresh the data from the Obsidian API
	 */

	async _load() {
		this.plugin.addCommand.bind({
			id: "refresh-commands",
			name: "Refresh commands",
			callback: () => this.onChangeCommands(),
		});
		this.#pluginsWatcher = new PluginsWatcher(this.app, this.plugin);
		if (!this.#pluginsWatcher) {
			throw new Error("Failed to create enabledPluginsWatcher");
		}
		this.#commandsWatcher = new CommandsWatcher(this.app, this.plugin);
		if (!this.#commandsWatcher) {
			throw new Error("Failed to create commandsWatcher");
		}
		this.#keybindingWatcher = new KeybindingsWatcher2(this.app, this.plugin);
		if (!this.#keybindingWatcher) {
			throw new Error("Failed to create keybindingWatcher");
		}

		this.#pluginsWatcher.subscribe(() => this.onChangePlugins());
		this.#commandsWatcher.subscribe(() => this.onChangeCommands());
		this.#keybindingWatcher.subscribeKeybindings(() =>
			this.onChangeKeybindings()
		);
	}

	async _refreshCommandData() {
		// console.log(`${this.#_logHeader} / _refreshCommandData`, { this: this });
		this.#commandData = getCommandData(this.plugin.app);
	}

	async _refreshPluginData() {
		// console.log(`${this.#_logHeader} / _refreshPluginData`, { this: this });
		this.#pluginData = getPluginMetaData(
			this.plugin.app,
			this.#commandData
		);
	}

	async _refreshKeybindingData() {
		// console.log('refreshKeybindingData');
    this.#keybindingData = getHotkeyTableData(this.app.hotkeyManager);
    console.log(`${this.#logHeader} / _refreshKeybindingData`, {
      this: this,
      keybindingData: this.#keybindingData,
    });
	}

	get isLoaded() {
		if (
			!this.#pluginsWatcher ||
			!this.#commandsWatcher ||
			!this.#keybindingWatcher
		) {
			console.log(`${this.#logHeader} / get isLoaded, false`, {
				this: this,
				pluginsWatcher: this.#pluginsWatcher,
				commandsWatcher: this.#commandsWatcher,
				keybindingWatcher: this.#keybindingWatcher,
			});
			return false;
		}
		return this.#pluginsWatcher.isLoaded && this.#commandsWatcher.isLoaded;
	}

	subscribePluginChange(callback: (data: PluginMeta[]) => void) {
		console.log(`${this.#logHeader} / subscribePluginChange`);
    this.#pluginsWatcherSubscribers.push(callback);
    if (this.isLoaded) callback(this.#pluginData);
		return () => this.unsubscribePluginChange(callback);
	}

	unsubscribePluginChange(callback: (data: PluginMeta[]) => void) {
		this.#pluginsWatcherSubscribers =
      this.#pluginsWatcherSubscribers.filter((c) => {
        if (c === callback) {
          console.log(`${this.#logHeader} / unsubscribePluginChange`);
          return false;
        }
        return true;
      });
	}

	async onChangePlugins() {
		await this._refreshPluginData();
		this.#pluginsWatcherSubscribers.forEach((callback) =>
			callback(this.#pluginData)
		);
	}

	subscribeKeybindingChange(callback: (data: HotkeyTableDatum[]) => void) {
		this.#keybindingWatcherSubscribers.push(callback);
		return () => this.unsubscribeKeybindingChange(callback);
	}

	unsubscribeKeybindingChange(callback: (data: HotkeyTableDatum[]) => void) {
		this.#keybindingWatcherSubscribers =
		this.#keybindingWatcherSubscribers.filter((c) => c !== callback);
	}

	async onChangeKeybindings() {
		await this._refreshKeybindingData();
		console.log(`${this.#logHeader} / onChangeKeybindings`, {
			this: this,
		});
		this.#keybindingWatcherSubscribers.forEach((callback) => {
			callback(this.#keybindingData);
		});
	}

	subscribeCommandChange(callback: (data: CommandData[]) => void) {
		this.#commandsWatcherSubscribers.push(callback);
		return () => this.unsubscribeCommandChange(callback);
	}

	unsubscribeCommandChange(callback: (data: CommandData[]) => void) {
		this.#commandsWatcherSubscribers =
			this.#commandsWatcherSubscribers.filter((c) => c !== callback);
	}

	async onChangeCommands() {
		await this._refreshCommandData();
		console.log(`${this.#logHeader} / onChangeCommands`, {
			this: this,
		});
		this.#commandsWatcherSubscribers.forEach((callback) => {
			callback(this.#commandData);
		});
	}
}
