import type { App, HotkeyManager } from "obsidian";
import type {
	CustomKeysSymbol,
	HotkeyManagerCustomKeysRecord,
} from "@/tailored-cuts-obsidian"; // TODO - how?
import { WatchedProxy, WatchedProxyEvent } from "@/_DataManager/WatchedProxy";
import type { TailoredCutsPlugin } from "@/types";

export class KeybindingsWatcher {
	app: App;
	plugin: TailoredCutsPlugin;
	hotkeyManagerWatcher: WatchedProxy<HotkeyManager> | null;
	hotkeyManagerSubscribers: ((hotkeyManager: HotkeyManager) => void)[];
	isLoaded: boolean;
	_obsidianInternalCustomKeysSymbol: CustomKeysSymbol | null;
	#_logHeader = "KeybindingsWatcher";

	constructor(app: App, plugin: TailoredCutsPlugin) {
		this.app = app;
		this.plugin = plugin;
		this.hotkeyManagerWatcher = null;
		this.hotkeyManagerSubscribers = [];
		this.isLoaded = false;
		this._obsidianInternalCustomKeysSymbol = null;

		this.onChange = this.onChange.bind(this);
		this.unload = this.unload.bind(this);

		this._load = this._load.bind(this);
		this._load();
	}

	_getObsidianInternalCustomKeysSymbol() {
		if (!this._obsidianInternalCustomKeysSymbol) {
			this._obsidianInternalCustomKeysSymbol =
				Object.getOwnPropertySymbols(
					this.app.hotkeyManager
				)[0] as CustomKeysSymbol;
		}
		if (!this._obsidianInternalCustomKeysSymbol) {
			throw new Error(
				`${
					this.#_logHeader
				} / get obsidianInternalCustomKeysSymbol: _obsidianInternalCustomKeysSymbol not found`
			);
		}
		return this._obsidianInternalCustomKeysSymbol;
	}

	_getObsidianInternalCustomKeys() {
		const sym = this._getObsidianInternalCustomKeysSymbol();
		return this.app.hotkeyManager[sym as CustomKeysSymbol];
	}

	_setObsidianInternalCustomKeys(customKeys: HotkeyManagerCustomKeysRecord) {
		const sym = this._getObsidianInternalCustomKeysSymbol();
		this.app.hotkeyManager[sym as CustomKeysSymbol] = customKeys;
	}

	async _load() {
		this.isLoaded = false;
		await new Promise((resolve: (value: null) => void) => {
			this.app.workspace.onLayoutReady(async () => {
				await this._loadWatchers();
				this.isLoaded = true;
				resolve(null);
			});
		});
		this.isLoaded = true;
	}

	async _loadWatchers() {
		this.hotkeyManagerWatcher = WatchedProxy.create(
			this.app.hotkeyManager,
			{
				basePath: "app.hotkeyManager",
				excludedPaths: ["app.hotkeyManager.app"],
				maxDepth: 3,
				verbose: false,
			}
		);

		this.hotkeyManagerWatcher.onChange(
			(e: WatchedProxyEvent<HotkeyManager>) => {
				const header = "hotkeyManagerWatcher onChange callback";
				let msg = "app.hotkeyManager changed";
				let onChange = false;
				if (false) {
					msg += "\nUNREACHABLE";
					throw new Error(`${this.#_logHeader} / ${header}:\n${msg}`);
				} else {
					onChange = true;
				}
				console.log(`${this.#_logHeader} / ${header}:\n${msg}`, { e });
				if (onChange) {
					this.onChange(this.app.hotkeyManager);
				}
			}
		);

		this.app.hotkeyManager = this.hotkeyManagerWatcher.proxy;
		let tmp: any;
		tmp = this.app.hotkeyManager.customKeys;
		tmp = this.app.hotkeyManager.defaultKeys;
		tmp = this.app.hotkeyManager.bakedIds;
		tmp = this.app.hotkeyManager.bakedHotkeys;
		this.onChange(this.app.hotkeyManager);
	}

	async unload() {
		this.isLoaded = false;
		this.hotkeyManagerWatcher?.unload();
	}

	subscribe(callback: (hotkeyManager: HotkeyManager) => void) {
		this.hotkeyManagerSubscribers.push(callback);
		const msg = "Subscribed to app.hotkeyManager changes via WatchedProxy";
		console.log(`${this.#_logHeader} / subscribe: ${msg}`, {
			subscribers: this.hotkeyManagerSubscribers,
		});
		if (this.isLoaded) {
			callback(this.app.hotkeyManager);
		}
	}

	onChange(hotkeyManager: HotkeyManager) {
		this.hotkeyManagerSubscribers.forEach((callback) =>
			callback(hotkeyManager)
		);
	}

	unsubscribe(callback: (hotkeyManager: HotkeyManager) => void) {
		this.hotkeyManagerSubscribers = this.hotkeyManagerSubscribers.filter(
			(c) => c !== callback
		);
	}
}
