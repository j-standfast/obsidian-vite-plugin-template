import type { App, Plugin } from "obsidian";
import { WatchedProxy } from "@/utils/WatchedProxy";
import type { TailorCutsPlugin } from "@/main";
import type { WatchedProxyEvent } from "@/utils/WatchedProxy";

type Plugins = App["plugins"];

export class PluginsWatcher {
	app: App;
	plugin: TailorCutsPlugin;
	enabledPluginsWatcher: WatchedProxy<Record<string, Plugin>> | null;
	communityPluginsWatcher: WatchedProxy<Plugins> | null;
	subscribers: ((plugins: Record<string, Plugin>) => void)[] = [];
	#_isLoaded: Promise<void> | null = null;
	#_logHeader = "PluginsWatcher";

	constructor(app: App, plugin: TailorCutsPlugin) {
		this.app = app;
		this.plugin = plugin;
		this.enabledPluginsWatcher = null;
		this.communityPluginsWatcher = null;

		this.subscribe = this.subscribe.bind(this);
		this.unsubscribe = this.unsubscribe.bind(this);
		this.onChange = this.onChange.bind(this);
		this.unload = this.unload.bind(this);
		this._load = this._load.bind(this);

		this._load();
	}

	async _load() {
		this.#_isLoaded = new Promise((resolve) => {
			this.app.workspace.onLayoutReady(async () => {
				await this._loadWatchers();
				resolve();
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
			3
		);
		this.communityPluginsWatcher.onChange(
			(e: WatchedProxyEvent<Plugins>) => {
                const header =
                    "communityPluginsWatcher (WatchedProxy) onChange callback";
                let msg = "Community plugins changed";
                let onChange = false;
                if (e.detail.prop === "_userDisabled") {
                    msg += "\n_userDisabled prop set; delete expected; not pushed";
                } else {
                    onChange = true;
                }
                console.log(`${this.#_logHeader} / ${header}:\n${msg}`, {e});
				if (onChange) this.onChange(this.app.plugins.plugins);
			}
		);
        this.app.plugins = this.communityPluginsWatcher.proxy;
        this.onChange(this.app.plugins.plugins);
	}

	async unload() {
		this.communityPluginsWatcher?.unload();
		// this.enabledPluginsWatcher?.unload();
	}

	async reload() {
		await this.unload();
		await this._load();
	}

	subscribe(callback: (plugins: Record<string, Plugin>) => void) {
		this.subscribers.push(callback);
		const msg = "Subscribed to plugins change";
		console.log(`${this.#_logHeader} / subscribe: ${msg}`, {
			subscribers: this.subscribers,
        });
        if (this.#_isLoaded) {
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
