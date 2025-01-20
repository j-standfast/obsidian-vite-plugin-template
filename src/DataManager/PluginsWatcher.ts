import type { App, Plugin } from "obsidian";
import { WatchedProxy } from "@/utils/WatchedProxy";
import type { TailorCutsPlugin } from "@/main";

type Plugins = App["plugins"];

export class PluginsWatcher {
	app: App;
	plugin: TailorCutsPlugin;
	// enabledPluginsWatcher: WatchedProxy<Record<string, Plugin>> | null;
	pluginsWatcher: WatchedProxy<Plugins> | null;
	subscribers: ((plugins: Record<string, Plugin>) => void)[] = [];
	private _isLoadedPromise: Promise<void> | null = null;

	constructor(app: App, plugin: TailorCutsPlugin) {
		this.app = app;
        this.plugin = plugin;
		// this.enabledPluginsWatcher = null;
		this.pluginsWatcher = null;
		this._isLoadedPromise = new Promise((resolve) => {
			this.app.workspace.onLayoutReady(async () => {
				await this._load();
				resolve();
			});
		});

		this.subscribe = this.subscribe.bind(this);
		this.unsubscribe = this.unsubscribe.bind(this);
		this.onChange = this.onChange.bind(this);
		this.unload = this.unload.bind(this);
		this._load = this._load.bind(this);
	}

	async _load() {
		// this.enabledPluginsWatcher = new WatchedProxy(this.app.plugins.plugins, 'app.plugins.plugins', 2);
		// this.enabledPluginsWatcher.onChange((e) => {
		//     console.log("enabledPluginsWatcher", { e });
		//     this.onChange(this.app.plugins.plugins);
		// })
		// this.app.plugins.plugins = this.enabledPluginsWatcher.proxy;

		this.pluginsWatcher = new WatchedProxy(
			this.app.plugins,
			"app.plugins",
			3
		);
		this.pluginsWatcher.onChange((e) => {
			console.log("app.plugins changed", { e });
			this.onChange(this.app.plugins.plugins);
		});
		this.app.plugins = this.pluginsWatcher.proxy;
	}

	async load() {
		await this._isLoadedPromise;
	}

	async unload() {
		this.pluginsWatcher?.unload();
		// this.enabledPluginsWatcher?.unload();
	}

	async subscribe(callback: () => void) {
		await this._isLoadedPromise;
		this.subscribers.push(callback);
	}

	unsubscribe(callback: (plugins: Record<string, Plugin>) => void) {
		this.subscribers = this.subscribers.filter((c) => c !== callback);
	}

	onChange(plugins: Record<string, Plugin>) {
		this.subscribers.forEach((callback) => callback(plugins));
	}
}
