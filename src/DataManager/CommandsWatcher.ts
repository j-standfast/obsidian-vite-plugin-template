import type { App, Command } from "obsidian";
import type {
	Commands,
	CommandsCommandsRecord,
	CommandsEditorCommandsRecord,
} from "obsidian-typings";
import { WatchedProxy, WatchedProxyEvent } from "@/utils/WatchedProxy";
import type { TailorCutsPlugin } from "@/types";

type CommandsAndEditorCommands = {
	commands: CommandsCommandsRecord;
	editorCommands: CommandsEditorCommandsRecord;
};

export class CommandsWatcher {
	app: App;
	plugin: TailorCutsPlugin;
	appCommandsWatcher: WatchedProxy<Commands> | null;
	appCommandsSubscribers: ((commands: Commands) => void)[] = [];
	commandsWatcher: WatchedProxy<CommandsCommandsRecord> | null;
	editorCommandsWatcher: WatchedProxy<CommandsEditorCommandsRecord> | null;
	subscribers: ((
		commandsAndEditorCommands: CommandsAndEditorCommands
	) => void)[] = [];
	isLoaded: boolean = false;
	#_logHeader = "CommandsWatcher";

	constructor(app: App, plugin: TailorCutsPlugin) {
		this.app = app;
		this.plugin = plugin;
		this.appCommandsWatcher = null;
		this.commandsWatcher = null;
		this.editorCommandsWatcher = null;
		this.subscribers = [];
		this.isLoaded = false;

		this.subscribe = this.subscribe.bind(this);
		this.unsubscribe = this.unsubscribe.bind(this);
		this.onChangeCommands = this.onChangeCommands.bind(this);
		this.onChangeAppCommands = this.onChangeAppCommands.bind(this);
		this.unload = this.unload.bind(this);

		this._load = this._load.bind(this);
		this._load();
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
		// this.appCommandsWatcher = new WatchedProxy(
		//     this.app.commands,
		//     "app.commands",
		//     ["app.commands.app"],
		//     3
		// );

		// this.appCommandsWatcher.onChange((e: WatchedProxyEvent<Commands>) => {
		//     const header = "commandsWatcher onChange callback";
		//     let msg = "app.commands changed";
		//     let onChange = false;
		//     if (false) {
		//         msg += "\nUNREACHABLE";
		//         throw new Error(`${this.#_logHeader} / ${header}:\n${msg}`);
		//     } else {
		//         onChange = true;
		//     }
		//     if (onChange) {
		//         this.onChangeAppCommands(this.app.commands);
		//     }
		// });
		//
		// this.app.commands = this.appCommandsWatcher.proxy;
		// this.onChangeAppCommands(this.app.commands);

		this.commandsWatcher = new WatchedProxy(
			this.app.commands.commands,
			"app.commands.commands",
			[],
			3
		);
		this.commandsWatcher.onChange(
			(e: WatchedProxyEvent<CommandsCommandsRecord>) => {
				const header = "commandsWatcher onChange callback";
				let msg = "app.commands.commands changed";
				let onChange = false;
				if (false) {
					msg += "\nUNREACHABLE";
					throw new Error(`${this.#_logHeader} / ${header}:\n${msg}`);
				} else {
					onChange = true;
				}
				console.log(`${this.#_logHeader} / ${header}:\n${msg}`, { e });
				if (onChange) {
					this.onChangeCommands({
						commands: this.app.commands.commands,
						editorCommands: this.app.commands.editorCommands,
					});
				}
			}
		);

		this.editorCommandsWatcher = new WatchedProxy(
			this.app.commands.editorCommands,
			"app.commands.editorCommands",
			[],
			3
		);
		this.editorCommandsWatcher.onChange(
			(e: WatchedProxyEvent<CommandsEditorCommandsRecord>) => {
				const header = "editorCommandsWatcher onChange callback";
				let msg = "app.commands.editorCommands changed";
				let onChange = false;
				if (false) {
					msg += "\nUNREACHABLE";
					throw new Error(`${this.#_logHeader} / ${header}:\n${msg}`);
				} else {
					onChange = true;
				}
				if (onChange) {
					this.onChangeCommands({
						commands: this.app.commands.commands,
						editorCommands: this.app.commands.editorCommands,
					});
				}
			}
		);

		this.app.commands.commands = this.commandsWatcher.proxy;
		this.app.commands.editorCommands = this.editorCommandsWatcher.proxy;
		this.onChangeCommands({
			commands: this.app.commands.commands,
			editorCommands: this.app.commands.editorCommands,
		});
	}

	async unload() {
		this.isLoaded = false;
		this.appCommandsWatcher?.unload();
		this.commandsWatcher?.unload();
		this.editorCommandsWatcher?.unload();
	}

	subscribe(
		callback: (commandsAndEditorCommands: CommandsAndEditorCommands) => void
	) {
		this.subscribers.push(callback);
		const msg =
			"Subscribed to app.commands.commands and app.commands.editorCommands changes via WatchedProxy";
		console.log(`${this.#_logHeader} / subscribe: ${msg}`, {
			subscribers: this.subscribers,
		});
		if (this.isLoaded) {
			callback({
				commands: this.app.commands.commands,
				editorCommands: this.app.commands.editorCommands,
			});
		}
	}

	unsubscribe(
		callback: (commandsAndEditorCommands: CommandsAndEditorCommands) => void
	) {
		this.subscribers = this.subscribers.filter((c) => c !== callback);
	}

	subscribeAppCommands(callback: (commands: Commands) => void) {
		this.appCommandsSubscribers.push(callback);
	}

	unsubscribeAppCommands(callback: (commands: Commands) => void) {
		this.appCommandsSubscribers = this.appCommandsSubscribers.filter(
			(c) => c !== callback
		);
	}

	onChangeCommands(commandsAndEditorCommands: CommandsAndEditorCommands) {
		this.subscribers.forEach((callback) =>
			callback(commandsAndEditorCommands)
		);
	}

	onChangeAppCommands(commands: Commands) {
		this.subscribers.forEach((callback) => callback(commands));
	}
}
