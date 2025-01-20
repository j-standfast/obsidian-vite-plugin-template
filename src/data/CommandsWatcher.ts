import type { App, Command } from "obsidian";
import { WatchedProxy } from "@/utils/WatchedProxy";
import type { TailorCutsPlugin } from "@/main";

type AppCommands = App["commands"];
type EditorCommandsLookup = AppCommands["editorCommands"];
type CommandsLookup = AppCommands["commands"];

export class CommandsWatcher {
	app: App;
	plugin: TailorCutsPlugin;
	appCommandsWatcher: WatchedProxy<AppCommands> | null;
	commandsLookupWatcher: WatchedProxy<CommandsLookup> | null;
	editorCommandsLookupWatcher: WatchedProxy<EditorCommandsLookup> | null;
	commandsSubscribers: ((commands: Command[]) => void)[] = [];
	editorCommandsSubscribers: ((commands: Command[]) => void)[] = [];
	appCommandsSubscribers: ((commands: AppCommands) => void)[] = [];
	commandsCommands: Command[] = [];
	editorCommands: Command[] = [];
	commands: Command[] = [];
	private _isLoadedPromise: Promise<void> | null = null;

	constructor(app: App, plugin: TailorCutsPlugin) {
		this.app = app;
		this.plugin = plugin;
		this.appCommandsWatcher = null;
		this.commandsLookupWatcher = null;
		this.editorCommandsLookupWatcher = null;
		this._isLoadedPromise = new Promise((resolve) => {
			this.app.workspace.onLayoutReady(async () => {
				await this._load();
				resolve();
			});
		});

		this.subscribeCommands = this.subscribeCommands.bind(this);
		this.unsubscribeCommands = this.unsubscribeCommands.bind(this);
		this.onChangeCommands = this.onChangeCommands.bind(this);
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

		// this.commandsWatcher = new WatchedProxy(this.app.commands, 'app.commands', 3);
		this.commandsLookupWatcher = new WatchedProxy(
			this.app.commands.commands,
			"app.commands.commands",
			3
		);
		// this.editorCommandsWatcher = new WatchedProxy(this.app.commands.editorCommands, 'app.commands.editorCommands', 3);

		this.commandsLookupWatcher.onChange((e) => {
			console.log("app.commands.commands changed", { e });
			this.onChangeCommands(Object.values(this.app.commands.commands));
		});
		this.app.commands.commands = this.commandsLookupWatcher.proxy;
	}

	async load() {
		await this._isLoadedPromise;
	}

	async unload() {
		this.appCommandsWatcher?.unload();
		this.commandsLookupWatcher?.unload();
		this.editorCommandsLookupWatcher?.unload();
	}

	async subscribeCommands(callback: (commands: Command[]) => void) {
		await this._isLoadedPromise;
		this.commandsSubscribers.push(callback);
	}

	unsubscribeCommands(callback: (commands: Command[]) => void) {
		this.commandsSubscribers = this.commandsSubscribers.filter(
			(c) => c !== callback
		);
	}

	onChangeCommands(commands: Command[]) {
		this.commandsSubscribers.forEach((callback) => callback(commands));
	}
}
