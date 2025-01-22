import type { App } from "obsidian";

import type { CommandData, HotkeyMeta, HotkeyTableDatum, PluginMeta, TailorCutsData, TailorCutsPluginType } from "@/types";
import { getCommandData } from "./commands";
import { CommandsWatcher } from "./CommandsWatcher";
import { getHotkeyTableData } from "./keybindings";
import { KeybindingsWatcher } from "./KeybindingsWatcher";
import { getPluginMetaData } from "./plugins";
import { PluginsWatcher } from "./PluginsWatcher";



interface TailorCutsDataSubscriber {
	callback: (data: TailorCutsData) => void;
	interestedIn: { [P in keyof TailorCutsData]?: true };
	name: string;
}

export class TailorCutsDataManager {
	app: App;
	plugin: TailorCutsPluginType;
	isLoaded: boolean;
	#pluginData: PluginMeta[];
	#commandData: CommandData[];
	#keybindingData: { hotkeyTableData: HotkeyTableDatum[], hotkeyMetaById: Map<string, HotkeyMeta> };
	#keybindingWatcher: KeybindingsWatcher | null;
	#pluginsWatcher: PluginsWatcher | null;
	#commandsWatcher: CommandsWatcher | null;
	#subscribers: TailorCutsDataSubscriber[] = [];
	#logHeader = "TailorCutsDataManager";

	constructor(app: App, plugin: TailorCutsPluginType) {
		this.app = app;
		this.plugin = plugin;
		this.isLoaded = false;
		this.#subscribers = [];
		this.#commandData = [];
		this.#pluginData = [];
		this.#keybindingData = { hotkeyTableData: [], hotkeyMetaById: new Map() };
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
			callback: () => this.onChange(),
		});
		this.#pluginsWatcher = new PluginsWatcher(this.app, this.plugin);
		if (!this.#pluginsWatcher) {
			throw new Error("Failed to create enabledPluginsWatcher");
		}
		this.#commandsWatcher = new CommandsWatcher(this.app, this.plugin);
		if (!this.#commandsWatcher) {
			throw new Error("Failed to create commandsWatcher");
		}
		this.#keybindingWatcher = new KeybindingsWatcher(this.app, this.plugin);
		if (!this.#keybindingWatcher) {
			throw new Error("Failed to create keybindingWatcher");
		}
		this.#pluginsWatcher.subscribe(() => this.onChange());
		this.#commandsWatcher.subscribe(() => this.onChange());
		this.#keybindingWatcher.subscribe(() => this.onChange());
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
		this.#keybindingData = getHotkeyTableData(this.app);
		console.log(`${this.#logHeader} / _refreshKeybindingData`, {
			this: this,
			keybindingData: this.#keybindingData,
		});
	}

	async _refreshData() {
		await this._refreshCommandData();
		await this._refreshPluginData();
		await this._refreshKeybindingData();
	}

	get _data() {
		return {
			plugins: this.#pluginData,
			commands: this.#commandData,
			keybindings: this.#keybindingData,
		};
	}

  subscribe(subscriber: TailorCutsDataSubscriber) {
		console.log(`${this.#logHeader} / subscribe`, {
			subscriber,
			time: Intl.DateTimeFormat("en-US", {
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
				fractionalSecondDigits: 3,
			}).format(new Date()),
			this: this,
		});
    this.#subscribers.push(subscriber);
    subscriber.callback(this._data);
		return () => this.unsubscribe(subscriber);
	}

	unsubscribe(subscriber: TailorCutsDataSubscriber) {
		console.log(`${this.#logHeader} / unsubscribe`, {
			subscriber,
			time: Intl.DateTimeFormat("en-US", {
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
				fractionalSecondDigits: 3,
			}).format(new Date()),
			this: this,
		});
		this.#subscribers = this.#subscribers.filter(
			(c) => c.callback !== subscriber.callback
		);
	}

	async onChange() {
		console.log(`${this.#logHeader} / onChange`, {
			this: this,
    });
    await this._refreshData();
    this.#subscribers.forEach((subscriber) => {
			console.log(`${this.#logHeader} / onChange / subscriber`, {
				subscriber,
				time: Intl.DateTimeFormat("en-US", {  
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
					fractionalSecondDigits: 3,
				}).format(new Date()),
			});
			subscriber.callback(this._data);
		});
	}
}
