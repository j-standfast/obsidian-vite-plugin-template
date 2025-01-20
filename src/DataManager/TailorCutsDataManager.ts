import type { App, Plugin } from "obsidian";

import { getCommandMetaData } from "@/DataManager/commands";
import { getKeybindingMetaData } from "@/DataManager/keybindings";
import { getPluginMetaData } from "@/DataManager/plugin";
import { PluginsWatcher } from "@/DataManager/PluginsWatcher";
import type { TailorCutsPlugin } from "@/main";
import type {
	CommandData,
	KeybindingMeta,
	PluginMeta,
} from "@/types";

export class TailorCutsDataManager {
	app: App;
	plugin: TailorCutsPlugin;
	#_pluginData: PluginMeta[];
	#_commandData: CommandData[];
	#_keybindingData: KeybindingMeta[];
	#_isLoaded: boolean = false;
	#_pluginsWatcher: PluginsWatcher | null;
	#_pluginsWatcherSubscribers: ((data: PluginMeta[]) => void)[] = [];
	#_isLoadedPromise: Promise<void> | null = null;

	constructor(app: App, plugin: TailorCutsPlugin) {
		this.app = app;
		this.plugin = plugin;
		this.#_commandData = [];
		this.#_pluginData = [];
		this.#_keybindingData = [];
		this.#_isLoaded = false;
		this.#_pluginsWatcher = null;
		this.#_isLoadedPromise = new Promise((resolve) => {
			this.app.workspace.onLayoutReady(async () => {
				await this.load();
				this.#_isLoaded = true;
				resolve();
			});
		});
		this.onDataLoaded = this.onDataLoaded.bind(this);
	}
	/**
	 * Refresh the data from the Obsidian API
	 */

	async load() {
		this.#_pluginsWatcher = new PluginsWatcher(this.plugin.app, this.plugin);
		if (!this.#_pluginsWatcher) {
			throw new Error("Failed to create enabledPluginsWatcher");
		}
		// await this._pluginsWatcher.load();
		// this.onChangePluginData();
        this.#_pluginsWatcher.subscribe(() => this.onChangePluginData());
	}

	async _refreshCommandData() {
		// console.log('refreshCommandData');
		this.#_commandData = getCommandMetaData(this.plugin.app);
	}

	async _refreshPluginData() {
		// console.log('refreshPluginData');
		this.#_pluginData = getPluginMetaData(this.plugin.app, this.#_commandData);
	}

	async _refreshKeybindingData() {
		// console.log('refreshKeybindingData');
		this.#_keybindingData = getKeybindingMetaData(
			this.plugin.app,
			this.#_pluginData,
			this.#_commandData
		);
	}

	async refresh() {
		try {
			await this._refreshCommandData();
			await this._refreshPluginData();
			await this._refreshKeybindingData();
		} catch (e) {
			console.error(e);
		}
	}

	/**
	 * Getters
	 */
	get isLoaded() {
		return this.#_isLoaded;
	}

	get commandData() {
		return this.#_commandData;
	}

	// get pluginData() {
	//     return this.pluginData;
	// }

	get keybindingData() {
		return this.#_keybindingData;
	}

	getAllData() {
		if (!this.isLoaded) {
			throw new Error("Data is not loaded");
		}
		console.log("getAllData", {
			commandData: this.#_commandData,
			pluginData: this.#_pluginData,
			keybindingData: this.#_keybindingData,
		});
		return {
			commandData: this.#_commandData,
			pluginData: this.#_pluginData,
			keybindingData: this.#_keybindingData,
		};
	}

	async onDataLoaded<T>(
		callback: (dataManager: TailorCutsDataManager) => T,
		refresh: boolean = false
	) {
		await this.#_isLoadedPromise;
		if (refresh) {
			await this.refresh();
		}
		return callback(this);
	}

	subscribePluginChange(callback: (data: PluginMeta[]) => void) {
		this.#_pluginsWatcherSubscribers.push(callback);
		return () => this.unsubscribePluginChange(callback);
	}

	async onChangePluginData() {
		await this._refreshPluginData();
		this.#_pluginsWatcherSubscribers.forEach((callback) =>
			callback(this.#_pluginData)
		);
	}

	unsubscribePluginChange(callback: (data: PluginMeta[]) => void) {
		this.#_pluginsWatcherSubscribers =
			this.#_pluginsWatcherSubscribers.filter((c) => c !== callback);
	}
}
