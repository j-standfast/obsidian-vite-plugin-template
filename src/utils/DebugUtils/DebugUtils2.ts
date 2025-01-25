import type { App } from "obsidian";
import { normalizePath, Notice } from "obsidian";

import type { TailorCutsPlugin } from "@/types";

type VSCodeKeybinding = {
	key: string;
	command: string;
	when: string;
};

export class DebugUtils {
	app: App;
	plugin: TailorCutsPlugin;
	normalizePath: (path: string) => string;

	constructor(app: App, plugin: TailorCutsPlugin) {
		this.app = app;
		this.plugin = plugin;
		this.normalizePath = normalizePath;
		// normalizePath = this.app.plugins.plugins['barraclough-tailor-cuts'].util.normalizePath;
	}

	getVaultAbsolutePath(): string {
		/**
		 * Base OS path for the vault (e.g. /home/user/vault, or C:\Users\user\documents\vault)
		 */
		return this.plugin.app.vault.adapter.basePath;
		// getBasePath() works on desktop, but TS doesn't know that adapter is
		// instance of FileSystemAdapter (which extends DataAdapter); in any case,
		// returns the same path
	}

	getVaultRelativePath(): string {
		// getRoot() returns a TFolder
		// TFolder extends TAbstractFile
		// TAbstractFilee has a path property; said path is relative to the vault root
		// thus this just returns '/' I would think, in general
		// TODO? is that correct?
		return this.plugin.app.vault.getRoot().path;
	}

	getVaultConfigPath(): string {
		// configDir is the path to the vault config directory, relative to the vault root
		// will usually be '.obsidian'
		return this.plugin.app.vault.configDir;
	}

	getPluginPath(): string {
		const path = this.plugin.manifest.dir;
		//
		// will usually be '.obsidian/plugins/<plugin-id>'
		// unclear when this would ever be null/undefined, but that's how it's typed
		// someone asked on discord; no one answered
		// https://discordapp.com/channels/686053708261228577/840286264964022302/1034062147413610559
		if (!path)
			throw new Error(
				"getPluginPath() error: plugin.manifest.dir is not set"
			);
		return path;
	}

	getObsidianCustomHotkeysPath(): string {
		return [this.plugin.app.vault.configDir, "hotkeys.json"].join("/");
	}

	async loadObsidianCustomHotkeys(): Promise<void> {
		const path = this.getObsidianCustomHotkeysPath();
		if (!this.app.vault.adapter.exists(path)) {
			throw new Error(
				`loadObsidianCustomHotkeys() error: path does not exist: ${path}`
			);
		}
		try {
			const raw = await this.app.vault.adapter.read(path);
			const hotkeys = JSON.parse(raw);
			console.log("loadObsidianCustomHotkeys: success", { hotkeys });
		} catch (error) {
			throw new Error(`loadObsidianCustomHotkeys() error: ${error}`);
		}
	}

	async getPluginFilePath(filePath: string): Promise<string> {
		if (!filePath) {
			throw new Error("getPluginFilePath() error: filePath required");
		}
		if (filePath.split(".").length === 1) {
			throw new Error(
				"getPluginFilePath() error: filePath must be a file name with an extension"
			);
		}
		const lastDotIndex = filePath.lastIndexOf(".");
		const name = filePath.substring(0, lastDotIndex);
		const ext = filePath.substring(lastDotIndex + 1);
		if (ext.toLowerCase() !== "json") {
			throw new Error(
				"getPluginFilePath() error: file must have a .json extension"
			);
		}
		const vaultPath = this.plugin.app.vault.getRoot().path;
		if (!vaultPath) {
			throw new Error("getPluginFilePath() error: vaultPath is not set");
		}
		const pluginPath = this.plugin.manifest.dir;
		if (!pluginPath) {
			throw new Error("getPluginFilePath() error: pluginPath is not set");
		}
		const path = [vaultPath, pluginPath, filePath].join("/");
		console.log("getPluginFilePath: success", {
			vaultPath,
			pluginPath,
			name,
			ext,
			path,
		});
		return path;
	}

	async readJSON(path: string): Promise<VSCodeKeybinding[]> {
		try {
			const raw = await this.plugin.app.vault.adapter.read(path);
			const res = JSON.parse(raw) as VSCodeKeybinding[];
			console.log("readJSON: success", { res });
			return res;
		} catch (error) {
			throw new Error("readFile() error: " + error);
		}
	}

	async writeJSON(path: string, data: VSCodeKeybinding[]): Promise<void> {
		try {
			const raw = JSON.stringify(data);
			await this.plugin.app.vault.adapter.write(path, raw);
			console.log("writeJSON: success");
		} catch (error) {
			throw new Error("writeJSON() error: " + error);
		}
	}

	testModifyCommands(cmds: VSCodeKeybinding[]): VSCodeKeybinding[] {
		let res: VSCodeKeybinding[];
		if (cmds.length <= 2) {
			res = [
				...cmds,
				{
					key: "ctrl+shift+e",
					command: "fakety-test-command",
					when: "fake && alsoFake",
				},
			];
		} else {
			res = cmds.slice(0, 2);
		}
		return res;
	}

	onload() {
		this.plugin.addCommand({
			id: "test-read-from-disk",
			name: "Test read from disk",
			callback: async () => {
				console.log("invoked tailor-cuts: test-read-from-disk");
				await this.loadObsidianCustomHotkeys();
				// 	const path = await this.getPluginFilePath("extra-data.json");
				// 	const cmds = await this.readJSON(path);
				// 	const modifiedCmds = this.testModifyCommands(cmds);
				// 	await this.writeJSON(path, modifiedCmds);
				// 	const res = await this.readJSON(path);
				// 	console.log("test-read-from-disk: success", {
				// 		cmds,
				// 		modifiedCmds,
				// 		res,
				// 	});
			},
		});
		this.plugin.addCommand({
			id: "test-conflict-check-callback-false",
			name: "Test conflict with checkCallback false",
			checkCallback: (checking: boolean) => {
				if (checking) {
					console.log(
						"test-conflict-check-callback-false / checking: returning false"
					);
					return false;
				} else {
					console.log(
						"test-conflict-check-callback-false / executing"
					);
					new Notice("Executed test-conflict-check-callback-false");
					return false;
				}
			},
		});
		this.plugin.addCommand({
			id: "test-conflict-check-callback-true",
			name: "Test conflict with checkCallback true",
			checkCallback: (checking: boolean) => {
				if (checking) {
					console.log(
						"test-conflict-check-callback-true / checking: returning true"
					);
					return true;
				} else {
					console.log(
						"test-conflict-check-callback-true / executing"
					);
					new Notice("Executed test-conflict-check-callback-true");
					return true;
				}
			},
		});
		this.plugin.addCommand({
			id: "log-scope",
			name: "Log scope",
			checkCallback: (checking: boolean) => {
				if (checking) {
					return true;
				} else {
					console.log("log-scope / scope", {
						scope: this.plugin.app.scope,
						keymap: this.plugin.app.keymap,
						keymapScopeModifiers: this.plugin.app.keymap.modifiers,
					});
					return true;
				}
			},
		});
	}

	unload() {
		this.plugin.removeCommand("test-read-from-disk");
	}
}
