import { App, Hotkey, HotkeyManager, KeymapInfo, Plugin, PluginManifest, WorkspaceLeaf } from "obsidian";
import { ShortcutListener } from "src/ShortcutListener";

// import { DEFAULT_SETTINGS } from "./src/constants";
import { auditCommands, importShortcuts } from "src/audit.ts/importShortcuts";
import {
	VIEW_TYPE_BC_COMMANDS,
	VIEW_TYPE_BC_DASHBOARD,
	VIEW_TYPE_BC_PLUGINS,
} from "src/constants/plugin";
import { BCDataManager } from "src/data/BCDataManager";
import { deserializeKeybindings, serializeKeybindings } from "src/serialize";
import { BCDashboardView } from "src/views/BCDashboardView";
import { BCPluginsView } from "src/views/BCPluginsView";
import { serializedSettingsSchema } from "./schemas";
import "./styles.css";
import type { BSKSettings, CommandId, SerializedHotkeys, TodoNavigator } from "./types";
import { CommandsView } from "src/views/CommandsView";
import { getCommandData, getCommandHotkeyData, getPluginData, getKeybindings } from "src/data/get-command-data";

type CustomHotkeySymbol = keyof HotkeyManager;
const kmiString = (kmi) => 'KeymapInfo: ' + kmi.modifiers + ' + ' + kmi.key;
const hkString = (hk) => 'Hotkey: ' + hk.modifiers.join(',') + ' + ' + hk.key;
const dummyHotkey = { modifiers: ['Alt', 'Mod', 'Shift'], key: 'Y' };

class BCUtils {
    sym: CustomHotkeySymbol;
    app: App;
    TEST_COMMAND_ID = 'barraclough-tailor-cuts:test';    
    TEST_COMMAND_ID2 = 'barraclough-tailor-cuts:test2';

    constructor(app: App) {
        this.sym = Object.getOwnPropertySymbols(app.hotkeyManager)[0] as unknown as CustomHotkeySymbol;
        this.app = app;
    }
    getCommandData() {
        return getCommandData(this.app);        
    }
    getCommandHotkeyData() {
        const commandData = this.getCommandData();
        return getCommandHotkeyData(this.app, commandData);
    }
    getPluginData() {
        return getPluginData(this.app);
    }
    getKeybindings() {
        return getKeybindings(this.app);
    }
    testShow(id: string) {
        const hotkey: Hotkey | undefined = (this.app.hotkeyManager.getHotkeys(id) ?? [undefined])[0];
        const idx = this.app.hotkeyManager.bakedIds.indexOf(id);
        const baked: KeymapInfo | undefined = idx !== -1 ? this.app.hotkeyManager.bakedHotkeys[idx] : undefined;
        console.log({
            id,
            getHotkeys: hotkey ? hkString(hotkey) : 'NONE',
            baked: `(${idx}) ${baked ? kmiString(baked) : 'NONE'}`,
         });
    }
    testBindFlipMod(id: string) {
        const ks = this.app.hotkeyManager.getHotkeys(id) ?? [];
        if (ks.length === 0) {
            console.log(`testBindFlipMod (${id}) | \tno hotkeys`);
            return;
        }

        const k = ks[0];
        const oldMods: string[] = k.modifiers ?? [];
        const newMods = oldMods.includes('Shift') ? ['Alt', 'Meta', 'Mod'] : ['Alt', 'Meta', 'Mod', 'Shift'];
        console.log(`testBindFlipMod (${id}) | \toldMods: ${oldMods.join(',')} \t newMods: ${newMods.join(',')}`);
        
        this.app.hotkeyManager.setHotkeys(id, [{
            modifiers: newMods,
            key: k.key,
        }]);
    }
    testBind(id: string) {
        this.app.hotkeyManager.setHotkeys(id, [dummyHotkey]);
        this.app.hotkeyManager.bake();
        this.testShow(id);
    }
    async testCreateBindConflict(flip: boolean = false) {
        const id1 = flip ? this.TEST_COMMAND_ID2 : this.TEST_COMMAND_ID;
        const id2 = flip ? this.TEST_COMMAND_ID : this.TEST_COMMAND_ID2;
        console.log(`testCreateBindConflict (${id1}, ${id2}, flip=${flip})`);

        this.app.hotkeyManager.removeHotkeys(id1);
        this.app.hotkeyManager.removeHotkeys(id2);
        this.app.hotkeyManager.bake();
        
        console.log('\ncleared');
        this.testShow(id1);
        this.testShow(id2);

        console.log('\nset id1');
        this.testBind(id1);
        console.log('\nset id2');
        this.testBind(id2);
        
        console.log('\nand review post conflict: (flip=' + flip + ')');
        this.testShow(id1);
        this.testShow(id2);

        this.app.hotkeyManager.bake();
        await this.app.hotkeyManager.save();
    }
    async listenKeyboard(app: App, window: Window) {
        const kmiMatch = (a: KeymapInfo, b: KeymapInfo) => {
            return (a.modifiers?.toLowerCase() ?? null) === (b.modifiers?.toLowerCase() ?? null) && (a.key?.toLowerCase() ?? null) === (b.key?.toLowerCase() ?? null);
        }
        const keymap = await (navigator as unknown as TodoNavigator).keyboard.getLayoutMap();

        const handleKeyboardEvent = (e: KeyboardEvent) => {
            if (['ShiftLeft', 'ShiftRight', 'CtrlLeft', 'CtrlRight', 'MetaLeft', 'MetaRight', 'AltLeft', 'AltRight'].includes(e.code)) {
                return;
            }
            const mods = [
                e.altKey ? 'Alt' : null,
                e.ctrlKey ? 'Ctrl' : null,
                e.metaKey ? 'Meta' : null,
                e.shiftKey ? 'Shift' : null,
            ].filter((v) => v !== null);
            const key = keymap.get(e.code) ?? `Unknown: ${e.key}`;

            const kmiMods = mods.join(',');
            const scancodeMods = mods.join('+');
            const keysig = [...mods, key].map((m) => m.toLowerCase()).join('+');
            const scancodeSig = [scancodeMods, `[${e.code}]`].join('+');
            const kmi = { modifiers: kmiMods, key };
    
            const commandId = app.hotkeyManager.bakedHotkeys.findIndex((hk) => kmiMatch(hk, kmi));
            console.log(`${e.type.padEnd(10, " ")}: \t\t code=${e.code} \t key=${e.key} \t kmiMods=${kmiMods} \t keysig=${keysig} \t commandId=${commandId} \t scancode=${scancodeSig} \t`);
        };

        const down = window.addEventListener('keydown', handleKeyboardEvent);
        const up = window.addEventListener('keyup', handleKeyboardEvent);
        return { down, up };
    }
}

export default class BCShortcutsPlugin extends Plugin {
	settings: BSKSettings;
	shortcutListener: ShortcutListener;
	dataManager: BCDataManager;
	util: BCUtils;

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);
		this.settings = {
			// hotkeys: [],
			keybindings: [],
			obsidianHotkeys: {},
		};
		this.shortcutListener = new ShortcutListener(
			app,
			this.settings.keybindings
		);
		this.dataManager = new BCDataManager(app, this);
		this.util = new BCUtils(this.app);
	}

	async onload() {
		await this.loadSettings();
		// this.addSettingTab(new SequenceHotkeysSettingTab(this.app, this));
		this.shortcutListener.onLoad(this.settings.keybindings);
		this.addCommand({
			id: "bc-audit-commands",
			name: "Audit commands and hotkeys",
			callback: () => auditCommands(this.app, this.settings),
		});
		this.addCommand({
			id: "import-shortcuts",
			name: "Import shortcuts",
			callback: () => importShortcuts(this.app),
		});
		this.addCommand({
			id: "show-dashboard-view",
			name: "Open dashboard view",
			callback: () => this.addDashboardView(),
		});
		this.addCommand({
			id: "show-plugins-view",
			name: "Open plugins view",
			callback: () => this.addPluginsView(),
		});
		this.addCommand({
			id: "show-commands-view",
			name: "Open commands (plugins for now) view",
			callback: () => this.addCommandsView(),
		});
		this.addCommand({
			id: "test",
			name: "test",
			callback: () => { console.log('EXECUTED tailor-cuts: test'); },
		});
		this.addCommand({
			id: "test2",
			name: "test2",
            callback: () => { console.log('EXECUTED tailor-cuts: test2'); },
            checkCallback: () => {
                console.log('CHECKED tailor-cuts: test2'); 
                return false;
            },
		});
		this.registerView(
			VIEW_TYPE_BC_DASHBOARD,
			(leaf: WorkspaceLeaf) => new BCDashboardView(leaf, this)
		);
		this.registerView(
			VIEW_TYPE_BC_PLUGINS,
			(leaf: WorkspaceLeaf) => new BCPluginsView(leaf, this)
		);
		this.registerView(
			VIEW_TYPE_BC_COMMANDS,
			(leaf: WorkspaceLeaf) => new CommandsView(leaf, this)
		);
		this.app.workspace.onLayoutReady(() => {
			try {
				// const watchedPlugins = new WatchedProxy(
				// 	this.app.plugins.plugins,
				// 	'',
				// 	2
				// );
				// this.app.plugins.plugins = watchedPlugins.proxy;
				// watchedPlugins.subscribe((e) => {
				// 	const { path, prop, prev, curr, type } = e.detail;
				// 	console.log(
				// 		`WatchedProxy path=${path} | prop=${String(
				// 			prop
				// 		)} | type=${type}:`,
				// 		{
				// 			prev,
				//             curr,
				//             e
				// 		}
				// 	);
				// });
			} catch (err) {
				console.error("Error watching plugins", err);
				throw new Error("Error watching plugins");
			}

			// this.app.plugins.plugins['fake'] = 'fake';
			// delete this.app.plugins.plugins['fake'];
		});
	}

	logEvent(msg: string) {
		console.log(`logEvent: ${msg}`);
	}

	onunload() {
		this.shortcutListener.unload();
	}

	async loadSettings() {
		const unparsed = await this.loadData();
		const settingsParse = serializedSettingsSchema.safeParse(unparsed);
		// console.log("loadSettings", { settingsParse });
		if (!settingsParse.success) {
			console.log("Error parsing settings", settingsParse.error);
			throw new Error("Error parsing settings");
		} else {
			const { keybindings, obsidianHotkeys } = settingsParse.data;
			this.settings = {
				keybindings: deserializeKeybindings(keybindings),
				obsidianHotkeys: obsidianHotkeys as SerializedHotkeys, // TODO
			};
		}
	}

	async saveSettings() {
		const keybindings = serializeKeybindings(this.settings.keybindings);
		const obsidianHotkeys = this.settings.obsidianHotkeys;
		const saveData = { keybindings, obsidianHotkeys };
		const parsed = serializedSettingsSchema.safeParse(saveData);
		if (parsed.success) {
			await this.saveData(parsed.data);
		} else {
			console.log("Error parsing settings", parsed.error);
			throw new Error("Error parsing settings");
		}
	}

	async addDashboardView() {
		const isDashboardOpen = this.app.workspace.getLeavesOfType(
			VIEW_TYPE_BC_DASHBOARD
		);
		if (isDashboardOpen.length > 0) return;
		this.app.workspace
			.getLeaf()
			.setViewState({ type: VIEW_TYPE_BC_DASHBOARD });
	}

	async addPluginsView() {
		const isViewOpen =
			this.app.workspace.getLeavesOfType(VIEW_TYPE_BC_PLUGINS);
		if (isViewOpen.length > 0) return;
		this.app.workspace
			.getLeaf()
			.setViewState({ type: VIEW_TYPE_BC_PLUGINS });
	}

	async addCommandsView() {
		const isViewOpen = this.app.workspace.getLeavesOfType(
			VIEW_TYPE_BC_COMMANDS
		);
		if (isViewOpen.length > 0) return;
		this.app.workspace
			.getLeaf()
			.setViewState({ type: VIEW_TYPE_BC_COMMANDS });
	}
}

export type { BCShortcutsPlugin };

// events happen
// this.tryRegisterEvent(this.app.internalPlugins.plugins.sync.instance, 'sync','status-change') https://forum.obsidian.md/t/feature-request-sync-service-api-events-delayed-plugin-loading/26004/3
// this.tryRegisterEvent(this.app.vault, 'vault', 'config-changed');   // for obsidian settings, not plugin settings (incl. enable/disable)
// this.tryRegisterEvent(this.app.vault, 'vault', 'raw');

// nothing
// this.tryRegisterEvent(this.app.workspace, 'workspace', 'layout-ready')
// this.tryRegisterEvent(this.app.workspace, 'workspace', 'layoutReady')
// this.tryRegisterEvent(this.app.workspace, 'workspace', 'ready')
// this.tryRegisterEvent(this.app.vault, 'vault', 'load');
// this.tryRegisterEvent(this.app.vault, 'vault', 'ready');
// this.tryRegisterEvent(this.app, 'app', 'ready');
// this.tryRegisterEvent(this.app, 'app', 'config-changed');
// this.tryRegisterEvent(this.app, 'app', 'raw');
// this.tryRegisterEvent(this.app, 'app', 'load');

// try {
//     this.registerEvent(this.app.hotkeyManager.onRaw((e: unknown) => {
//         this.logEvent(`hotkeyManager: onRaw: ${String(e)}`);
//     }));
// } catch (error) {
//     console.log('Error registering event', {entityName: 'hotkeyManager', event: 'onRaw', error});
// }

// tryRegisterEvent(entity: any, entityName: string, event: string) {
// 	try {
// 		this.registerEvent(
// 			entity.on(event, (e: unknown) => {
// 				console.log("event", { entityName, event, e });
// 				this.logEvent(`${entityName}: ${event}`);
// 			})
// 		);
// 	} catch (error) {
// 		console.log("Error registering event", {
// 			entityName,
// 			event,
// 			error,
// 		});
// 	}
// }

// onExternalSettingsChange() {
//     // reload in-memory settings
//     this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());

//     // If you have views or other on-screen displays, refresh them...
// }

// I guess you can call the onload method to refresh whole view, like app.workspace.getLeavesOfType("pdf")[0].view.onload() OR app.workspace.getLeavesOfType("pdf")[0].rebuildView() (this is an internal api)

// @ts-ignore
// const mockGlobalApp: DeepMockProxy<App> = mockDeep<App>({
//     metadataCache: {
//         getLinkSuggestions: () => {
//             return [generateTFileMock()];
//         },
//     }
// });

// // Then use that variable in your test this way

// beforeAll(() => {
//     mockReset(mockGlobalApp);
//     global.app = mockGlobalApp;
// });
