import {
	Scope,
	type App,
	type KeymapContext,
	type KeymapEventHandler,
	type Modifier,
} from "obsidian";

import type {
	CommandId,
	KeymapContextWithCode,
	TailoredCutsPlugin,
} from "@/types";
import { debounce } from "@/util/debounce";
import { KeybindingMatcher } from "./KeybindingMatcher";
import { KBScope } from "./KeybindingScope/KeybindingScope";
import {
	parseKeybindingsFromHotkeysJson,
	parseKeybindingsFromHotkeysRecord,
	parseKeybindingsJson,
} from "./schema";

export interface TailorKey extends KeymapContext {
	code: string;
}

interface KeymapEventHandlerWithFunc extends KeymapEventHandler {
	func: (event: KeyboardEvent, ctx: KeymapContext) => boolean | undefined;
}

export interface TailorMatchKey {
	modifiers: string;
	matchKey: string;
	keyType: "code" | "key" | "vkey";
}

export interface TailorKeybinding {
	commandId: string;
	tailorKey: TailorMatchKey; // eh both is redundant
	when?: string;
}

export class KeybindingManager {
	app: App;

	plugin: TailoredCutsPlugin;
	keymapEventHandler: KeymapEventHandlerWithFunc;
	scope: Scope;
	shortcutMatcher: KeybindingMatcher;
	_VERBOSE = true;
	_LOG_KEYS = false;
	_logPrefix = "KeybindingManager";

	constructor(app: App, plugin: TailoredCutsPlugin) {
		this.app = app;
		this.plugin = plugin;
		this.scope = new Scope(this.app.scope);
		this.shortcutMatcher = new KeybindingMatcher([]);

		// TODO: scope/listener cleanup
		this.onObsidianConfigChange = debounce(this.load.bind(this), 50);
		this.onTailoredCutsConfigChange = debounce(this.load.bind(this), 50);
		this.keymapEventHandler = this.scope.register(
			null,
			null,
			this.onKeymapEvent.bind(this)
		) as KeymapEventHandlerWithFunc; // TODO merge declaration
		this.app.keymap.pushScope(this.scope);
		// this.app.scope.keys = [
		//   this.keymapEventHandler as any,  // TODO merge declaration
		//   ...this.app.scope.keys.filter(key => key !== this.keymapEventHandler),
		// ]
	}

	_log(...args: Parameters<typeof console.log>) {
		if (this._VERBOSE) {
			if (args.length > 0 && typeof args[0] === "string") {
				console.log(
					`${this._logPrefix} / ${args[0]}`,
					...args.slice(1)
				);
			} else {
				console.log(`${this._logPrefix} / `, ...args);
			}
		}
	}

	_logKey(...args: Parameters<typeof this._log>) {
		if (this._LOG_KEYS) {
			this._log(...args);
		}
	}

	async loadObsidianHotkeys(): Promise<any> {
		let obsidianHotkeys =
			(await this.app.vault.readConfigJson("hotkeys")) ?? {};
		const keybindingsJson =
			parseKeybindingsFromHotkeysJson(obsidianHotkeys);
		const keybindingsDefault = parseKeybindingsFromHotkeysRecord(
			this.app.hotkeyManager.defaultKeys,
			true
		);
		const keybindingsCustom = parseKeybindingsFromHotkeysRecord(
			this.app.hotkeyManager.customKeys,
			false
		);
		this._log("loadObsidianHotkeys / success", {
			obsidianHotkeys,
			keybindingsJson,
			keybindingsDefault,
			keybindingsCustom,
		});
	}

	getPluginDir(pluginId: string): string {
		const plugin = this.app.plugins.plugins[pluginId];
		if (!plugin) throw new Error(`Plugin ${pluginId} not found`);
		const pluginDir = plugin.manifest.dir;
		if (!pluginDir) throw new Error(`Plugin ${pluginId} dir not found`);
		return pluginDir;
	}

	getPluginFilePath(pluginId: string, relativePath: string): string {
		return [this.getPluginDir(pluginId), relativePath].join("/");
	}

	async loadKeybindings(): Promise<any> {
		const pluginId = this.plugin.manifest.id;
		const path = this.getPluginFilePath(
			pluginId,
			"keybindings/keybindings.json"
		);
		let data = await this.app.vault.readJson(path);
		try {
			const keybindings = parseKeybindingsJson(data);
			this.shortcutMatcher.setKeybindings(keybindings);
			const msg = `loadTailoredCuts / loaded ${keybindings.length} keybindings`;
			this._log(msg, { path, data, keybindings });
		} catch (error) {
			this._log("loadTailoredCuts / error", { error, data });
		}
	}

	async load() {
		await this.loadKeybindings();
		await this.loadObsidianHotkeys();
	}

	bake() {
		// this._log(`bake (placeholder)`);
	}

	onKeymapEvent(
		event: KeyboardEvent,
		keymapContext: KeymapContextWithCode
	): boolean | undefined {
		this.bake();
		const match = this.shortcutMatcher.match(keymapContext);
		if (match.status === "execute") {
			this._log("onKeymapEvent / execute", { ...arguments, match });
			const res = this.execute(match.commandId);
			return res === true ? false : undefined;
		} else if (match.status === "chord") {
			this._log("onKeymapEvent / chord", { ...arguments, match });
			return false;
		} else {
			this._logKey("onKeymapEvent / none", { ...arguments, match });
			return undefined;
		}
	}

	execute(commandId: CommandId): boolean {
		const command = this.app.commands.findCommand(commandId);
		this._log("execute / command", {
			commandId,
			command,
		});
		if (command) {
			this.app.commands.executeCommand(command);
			return true;
		}
		return false;
	}

	// TODO: handle when
	whenMatch(value: string | undefined): boolean {
		this._log("whenMatch (maybe undefined)", {
			value,
		});
		if (value === undefined) return true;
		this._log("whenMatch (not undefined)", { value });
		return true;
	}

	onObsidianConfigChange() {
		this._log("onObsidianConfigChange");
	}

	onTailoredCutsConfigChange() {
		this._log("onTailoredCutsConfigChange");
	}
}
