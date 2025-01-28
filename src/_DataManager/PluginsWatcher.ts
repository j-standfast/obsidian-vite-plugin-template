import type { App, Plugin } from "obsidian";
import { WatchedProxy } from "@/_DataManager/WatchedProxy";
import type { TailoredCutsPlugin } from "@/types";
import type { WatchedProxyEvent } from "@/_DataManager/WatchedProxy";

type Plugins = App["plugins"];

export class PluginsWatcher {
	app: App;
	plugin: TailoredCutsPlugin;
	enabledPluginsWatcher: WatchedProxy<Record<string, Plugin>> | null;
	communityPluginsWatcher: WatchedProxy<Plugins> | null;
	subscribers: ((plugins: Record<string, Plugin>) => void)[] = [];
	isLoaded: boolean = false;
	#_logHeader = "PluginsWatcher";

	constructor(app: App, plugin: TailoredCutsPlugin) {
		this.app = app;
		this.plugin = plugin;
		this.enabledPluginsWatcher = null;
		this.communityPluginsWatcher = null;
		this.isLoaded = false;

		this.subscribe = this.subscribe.bind(this);
		this.unsubscribe = this.unsubscribe.bind(this);
		this.onChange = this.onChange.bind(this);
		this.unload = this.unload.bind(this);

		this._load = this._load.bind(this);
		this._load();
	}

	async _load() {
		this.isLoaded = false;
		new Promise((resolve: (value: null) => void) => {
			this.app.workspace.onLayoutReady(async () => {
				await this._loadWatchers();
				this.isLoaded = true;
				resolve(null);
			});
		});
	}

	async _loadWatchers() {
		// this.enabledPluginsWatcher = new WatchedProxy(this.app.plugins.plugins, 'app.plugins.plugins', 2);
		// this.enabledPluginsWatcher.onChange((e) => {
		//     console.log("enabledPluginsWatcher", { e });
		//     this.onChange(this.app.plugins.plugins);
		// })
		// this.app.plugins.plugins = this.enabledPluginsWatcher.proxy;

		this.communityPluginsWatcher = new WatchedProxy(
			this.app.plugins,
			"app.plugins",
			["app", "app.plugins.app"],
			3
		);
		this.communityPluginsWatcher.onChange(
			(e: WatchedProxyEvent<Plugins>) => {
				const header =
					"communityPluginsWatcher (WatchedProxy) onChange callback";
				let msg = "Community plugins changed";
				let onChange = false;
				if (e.detail.prop === "_userDisabled") {
					msg +=
						"\n_userDisabled prop set; delete expected; not pushed";
				} else {
					onChange = true;
				}
				console.log(`${this.#_logHeader} / ${header}:\n${msg}`, { e });
				if (onChange) this.onChange(this.app.plugins.plugins);
			}
		);
		this.app.plugins = this.communityPluginsWatcher.proxy;
		this.onChange(this.app.plugins.plugins);
	}

	async unload() {
		this.isLoaded = false;
		this.communityPluginsWatcher?.unload();
		// this.enabledPluginsWatcher?.unload();
	}

	subscribe(callback: (plugins: Record<string, Plugin>) => void) {
		this.subscribers.push(callback);
		const msg =
			"Subscribed to app.plugins.plugins changes via WatchedProxy";
		console.log(`${this.#_logHeader} / subscribe: ${msg}`, {
			subscribers: this.subscribers,
		});
		if (this.isLoaded) {
			callback(this.app.plugins.plugins);
		}
	}

	unsubscribe(callback: (plugins: Record<string, Plugin>) => void) {
		this.subscribers = this.subscribers.filter((c) => c !== callback);
	}

	onChange(plugins: Record<string, Plugin>) {
		this.subscribers.forEach((callback) => callback(plugins));
	}
}
