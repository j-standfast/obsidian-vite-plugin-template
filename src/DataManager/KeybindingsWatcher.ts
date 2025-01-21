import type { App, HotkeyManager } from "obsidian";
import type { CustomKeysSymbol, HotkeyManagerCustomKeysRecord } from "@/tailor-cuts-obsidian";
import { WatchedProxy, WatchedProxyEvent } from "@/utils/WatchedProxy";
import type { TailorCutsPlugin } from "@/main";

export class KeybindingsWatcher {
	app: App;
	plugin: TailorCutsPlugin;
	customHotkeysWatcher: WatchedProxy<HotkeyManagerCustomKeysRecord> | null;
	customHotkeysSubscribers: ((
		customHotkeys: HotkeyManagerCustomKeysRecord
	) => void)[];
	isLoaded: boolean;
	_obsidianInternalCustomKeysSymbol: CustomKeysSymbol | null;
	#_logHeader = "KeybindingsWatcher";

	constructor(app: App, plugin: TailorCutsPlugin) {
		this.app = app;
		this.plugin = plugin;
		this.customHotkeysWatcher = null;
		this.customHotkeysSubscribers = [];
		this.isLoaded = false;
		this._obsidianInternalCustomKeysSymbol = null;

		this.onChangeCustomHotkeys = this.onChangeCustomHotkeys.bind(this);
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
    const customKeys = this._getObsidianInternalCustomKeys();
		this.customHotkeysWatcher = new WatchedProxy(
			customKeys,
			"app.hotkeyManager.customKeys",
			[],
			3
		);
		this.customHotkeysWatcher.onChange(
			(e: WatchedProxyEvent<HotkeyManagerCustomKeysRecord>) => {
				const header = "customHotkeysWatcher onChange callback";
				let msg = "app.hotkeyManager.customKeys changed";
				let onChange = false;
				if (false) {
					msg += "\nUNREACHABLE";
					throw new Error(`${this.#_logHeader} / ${header}:\n${msg}`);
				} else {
					onChange = true;
				}
				console.log(`${this.#_logHeader} / ${header}:\n${msg}`, { e });
				if (onChange) {
					this.onChangeCustomHotkeys(
						this.app.hotkeyManager.customKeys
					);
				}
			}
		);

		this._setObsidianInternalCustomKeys(
			this.customHotkeysWatcher.proxy
		);
		this.onChangeCustomHotkeys(
			this._getObsidianInternalCustomKeys()
		);
	}

	async unload() {
		this.isLoaded = false;
		this.customHotkeysWatcher?.unload();
	}

	subscribeKeybindings(
		callback: (hotkeyManager: HotkeyManagerCustomKeysRecord) => void
	) {
		this.customHotkeysSubscribers.push(callback);
		const msg =
			"Subscribed to app.hotkeyManager.customKeys changes via WatchedProxy";
		console.log(`${this.#_logHeader} / subscribe: ${msg}`, {
			subscribers: this.customHotkeysSubscribers,
		});
		if (this.isLoaded) {
			callback(this.app.hotkeyManager.customKeys);
		}
	}

	onChangeCustomHotkeys(customHotkeys: HotkeyManagerCustomKeysRecord) {
		this.customHotkeysSubscribers.forEach((callback) =>
			callback(customHotkeys)
		);
	}

	unsubscribeCustomHotkeys(
		callback: (hotkeyManager: HotkeyManagerCustomKeysRecord) => void
	) {
		this.customHotkeysSubscribers = this.customHotkeysSubscribers.filter(
			(c) => c !== callback
		);
	}
}
