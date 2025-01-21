import { Chord, TailorCutsSettings } from "../types/types";
import {
	Command,
	Modifier,
	Hotkey,
	App,
	KeymapInfo,
	PluginManifest,
} from "obsidian";

import {
	OBSIDIAN_KEY_TO_CHROME_CODE,
	OBSIDIAN_MODIFIER_KEYS_MAP,
} from "../constants/defaults";
import {
	Keybinding,
	ModifierKey,
	CodeCamel,
	ChordKeyModifiers,
} from "../types/types";
// @ts-ignore
import type { CommandsCommandsRecord } from "obsidian-typings";

const hotkeyToChord = (hotkey: Hotkey): Chord => {
	const modifiers: ChordKeyModifiers = new Map();
	for (const modifier of hotkey.modifiers) {
		const modifierKey =
			OBSIDIAN_MODIFIER_KEYS_MAP[
				modifier.toLowerCase() as Lowercase<Modifier>
			];
		if (!modifierKey) {
			throw new Error(
				`new new new |importShortcuts / hotkeyToChord / modifierKey not found: ${modifier}`
			);
		}
		modifiers.set(modifierKey, true);
	}
	const base =
		OBSIDIAN_KEY_TO_CHROME_CODE[
			hotkey.key.toLowerCase() as keyof typeof OBSIDIAN_KEY_TO_CHROME_CODE
		];
	if (!base) {
		throw new Error(
			`importShortcuts / hotkeyToChord / base not found: ${hotkey.key}`
		);
	}
	return {
		modifiers,
		base: base,
		type: "valid",
	};
};

const keymapToHotkey = (keymap: KeymapInfo): Hotkey => {
	return {
		modifiers: keymap.modifiers
			? (keymap.modifiers.split(",") as Modifier[])
			: [],
		key: keymap.key as string,
	};
};

type ShortcutsRecord = {
	id: string;
	shortcuts: Keybinding[];
};

const singleChordHotkeysToShortcuts = (
	id: string,
	hotkeys: Hotkey[] | undefined
): ShortcutsRecord | undefined => {
	if (!hotkeys) return undefined;
	let keybindings: Keybinding[] = [];
	for (const v of hotkeys) {
		try {
			keybindings.push({
				id,
				key: [hotkeyToChord(v)],
			});
		} catch (error) {
			return undefined;
		}
	}
	return { id, shortcuts: keybindings };
};
const isHotkey = (hotkey: unknown): hotkey is Hotkey => {
	if (typeof hotkey !== "object" || hotkey === null) return false;
	if (!("modifiers" in hotkey) || !("key" in hotkey)) return false;
	if (!Array.isArray(hotkey.modifiers)) return false;
	if (
		!hotkey.modifiers.every((m) =>
			["Shift", "Ctrl", "Alt", "Meta", "Mod"].includes(m)
		)
	)
		return false;
	if (typeof hotkey.key !== "string") return false;
	return true;
};

const isHotkeyArray = (hotkeys: unknown): hotkeys is Hotkey[] => {
	return Array.isArray(hotkeys) && hotkeys.every(isHotkey);
};

const maybeHotkeyArrayToShortcuts = (
	id: string,
	hotkeys: unknown | undefined
): ShortcutsRecord | undefined => {
	if (!hotkeys) return undefined;
	if (!isHotkeyArray(hotkeys)) {
		console.log(
			"maybeHotkeyArrayToShortcuts / hotkeys is not an array of hotkeys:",
			{ id, hotkeys }
		);
		return undefined;
	}
	return singleChordHotkeysToShortcuts(id, hotkeys);
};

function importShortcuts(app: App) {
	if (!app.hotkeyManager.baked) app.hotkeyManager.bake();
	const defaultShortcuts: (ShortcutsRecord | undefined)[] = [];
	const customShortcuts: (ShortcutsRecord | undefined)[] = [];
	const activeShortcuts: (ShortcutsRecord | undefined)[] = [];
	for (const c of Object.values(app.commands.commands)) {
		const def = maybeHotkeyArrayToShortcuts(
			c.id,
			app.hotkeyManager.getDefaultHotkeys(c.id)
		);
		const cust = maybeHotkeyArrayToShortcuts(
			c.id,
			app.hotkeyManager.getHotkeys(c.id)
		);
		if (def) defaultShortcuts.push(def);
		if (cust) customShortcuts.push(cust);
		if (def || cust) activeShortcuts.push(def || cust);
	}
	console.log("importShortcuts / defaultShortcuts", {
		defaultShortcuts,
		customShortcuts,
		activeShortcuts,
	});
}
// const commandsWithHotkeys = Object.keys(commands).filter(
// 	(commandId) => commands[commandId].hotkeys
// );

interface KeymapInfoRecord {
	[commandId: string]: KeymapInfo[];
}

const getCommandsHotkeysFromManager = (
	app: App,
	cmds: Command[]
): {
	managerGottenKeymapInfo: KeymapInfoRecord;
	managerGottenDefaultKeymapInfo: KeymapInfoRecord;
} => {
	let managerGottenKeymapInfo: KeymapInfoRecord = {};
	let managerGottenDefaultKeymapInfo: KeymapInfoRecord = {};
	for (const c of cmds) {
		try {
			const hotkeys = app.hotkeyManager.getHotkeys(c.id);
			if (hotkeys !== undefined) {
				managerGottenKeymapInfo[c.id] = hotkeys;
			}

			const defaultHotkeys = app.hotkeyManager.getDefaultHotkeys(c.id);
			if (defaultHotkeys !== undefined) {
				managerGottenDefaultKeymapInfo[c.id] = defaultHotkeys;
			}
		} catch (error) {
			console.log("auditCommands / error:", { error });
		}
	}
	return { managerGottenKeymapInfo, managerGottenDefaultKeymapInfo };
};

const getCustomKeymapInfoFromManager = (app: App): KeymapInfoRecord => {
	const customSym = Object.getOwnPropertySymbols(
		app.hotkeyManager
	)[0] as unknown as keyof typeof app.hotkeyManager;
	return app.hotkeyManager[customSym] as {
		[commandId: string]: KeymapInfo[];
	};
};

const getBakedKeymapInfoFromManager = (app: App): KeymapInfoRecord => {
	const bakedHotkeys = app.hotkeyManager.bakedIds.reduce((acc, id, i) => {
		if (acc[id] === undefined) acc[id] = [];
		acc[id].push(app.hotkeyManager.bakedHotkeys[i]);
		return acc;
	}, {} as KeymapInfoRecord);
	return bakedHotkeys;
};

const getCmdProps = (c: Command | undefined, prefix: string) => {
	if (!c)
		return {
			[`${prefix}`]: false,
			[`${prefix}Hotkeys`]: undefined,
			[`${prefix}Name`]: undefined,
			[`${prefix}HasCallback`]: undefined,
			[`${prefix}HasCheck`]: undefined,
			[`${prefix}HasEditorCheck`]: undefined,
			[`${prefix}HasEditorCallback`]: undefined,
		};
	return {
		[`${prefix}`]: true,
		[`${prefix}Hotkeys`]: c.hotkeys,
		[`${prefix}Name`]: c.name,
		[`${prefix}HasCallback`]: !!c.callback,
		[`${prefix}HasCheck`]: !!c.checkCallback,
		[`${prefix}HasEditorCheck`]: !!c.editorCheckCallback,
		[`${prefix}HasEditorCallback`]: !!c.editorCallback,
	};
};

const getKeymapProps = (id: string, kmir: KeymapInfoRecord, prefix: string) => {
	return id in kmir
		? {
				[`${prefix}`]: true,
				[`${prefix}Hotkeys`]: kmir[id],
		  }
		: {
				[`${prefix}`]: false,
				[`${prefix}Hotkeys`]: undefined,
		  };
};

function auditCommands(app: App, settings: TailorCutsSettings) {
	// app.commands
	const commandsRecord = app.commands.commands;
	const cmds = Object.values(commandsRecord);
	const edCmds = Object.values(app.commands.editorCommands);
	const listCmds = app.commands.listCommands();

	try {
		auditCommandIdCheck(commandsRecord);
	} catch (error) {
		console.log("auditCommands / commandId check: failed", { error });
	}

	// app.hotkeyManager
	const { managerGottenKeymapInfo, managerGottenDefaultKeymapInfo } =
		getCommandsHotkeysFromManager(app, cmds);
	const bakedKeymapInfo = getBakedKeymapInfoFromManager(app);
	const customKeymapInfo = getCustomKeymapInfoFromManager(app);
	const defaultKeymapInfo = app.hotkeyManager.defaultKeys; // { [commandId: string]: hotkey[] }

	// hotkeys.json (copied over)
	const settingsSerializedHotkeys = settings.obsidianHotkeys; // { [commandId: string]: hotkey[] }

	// plugins
	const pluginManifestsById = app.plugins.manifests;
	const enabledPluginIds = [...app.plugins.enabledPlugins];
	const nestedPluginManifestsById = Object.values(app.plugins.plugins).reduce(
		(acc, p) => {
			acc[p.manifest.id] = p.manifest;
			return acc;
		},
		{} as { [id: string]: PluginManifest }
	);
	const allPluginIds = [
		...new Set([
			...Object.keys(pluginManifestsById),
			...Object.keys(nestedPluginManifestsById),
			...enabledPluginIds,
		]),
	];

	const pluginAudit = [];
	for (const id of allPluginIds) {
		const isEnabled = enabledPluginIds.includes(id);
		const isOuter = id in pluginManifestsById;
		const isNested = id in nestedPluginManifestsById;
		const manifest = isOuter
			? pluginManifestsById[id]
			: nestedPluginManifestsById[id];
		if (!manifest)
			throw new Error(`auditCommands / plugin manifest not found: ${id}`);
		pluginAudit.push({
			id,
			name: manifest.name,
			isEnabled,
			isNested,
			isOuter,
			manifest,
		});
	}
	const allPluginNames = pluginAudit.map((p) => p.name);

	const pluginEntities = {
		pluginManifestsById,
		enabledPluginIds,
		nestedPluginManifestsById,
		allPluginIds,
		nPlugins: allPluginIds.length,
		allPluginNames,
	};

	const pluginAuditSummary = {
		nPlugins: allPluginIds.length,
		nEnabled: enabledPluginIds.length,
		nOuter: pluginAudit.filter((p) => p.isOuter).length,
		nNested: pluginAudit.filter((p) => p.isNested).length,
		outerVsNested: {
			nOuterXORNested: pluginAudit.filter((p) => p.isOuter !== p.isNested)
				.length,
			nOuterANDNested: pluginAudit.filter((p) => p.isOuter && p.isNested)
				.length,
			nOuterORNested: pluginAudit.filter((p) => p.isOuter || p.isNested)
				.length,
			nOuterNOTNested: pluginAudit.filter((p) => p.isOuter && !p.isNested)
				.length,
			nNestedNOTOuter: pluginAudit.filter((p) => !p.isOuter && p.isNested)
				.length,
		},
		outerVsEnabled: {
			nOuterXOREnabled: pluginAudit.filter(
				(p) => p.isOuter !== p.isEnabled
			).length,
			nOuterANDEnabled: pluginAudit.filter(
				(p) => p.isOuter && p.isEnabled
			).length,
			nOuterOREnabled: pluginAudit.filter((p) => p.isOuter || p.isEnabled)
				.length,
			nOuterNOTEnabled: pluginAudit.filter(
				(p) => p.isOuter && !p.isEnabled
			).length,
			nEnabledNOTOuter: pluginAudit.filter(
				(p) => !p.isOuter && p.isEnabled
			).length,
		},
		nestedVsEnabled: {
			nNestedXOREnabled: pluginAudit.filter(
				(p) => p.isNested !== p.isEnabled
			).length,
			nNestedANDEnabled: pluginAudit.filter(
				(p) => p.isNested && p.isEnabled
			).length,
			nNestedOREnabled: pluginAudit.filter(
				(p) => p.isNested || p.isEnabled
			).length,
			nNestedNOTEnabled: pluginAudit.filter(
				(p) => p.isNested && !p.isEnabled
			).length,
			nEnabledNOTNested: pluginAudit.filter(
				(p) => !p.isNested && p.isEnabled
			).length,
		},
	};

	const cmdAudit = [];
	for (const c of cmds) {
		const idContext =
			c.id.split(":").length > 1 ? c.id.split(":")[0] : undefined;
		const nameContext =
			c.name && c.name.split(":").length > 1
				? c.name.split(":")[0]
				: undefined;
		const anyContext = idContext || nameContext;
		const contextType = idContext ? "id" : anyContext ? "name" : "none";
		const isPluginContext = idContext && allPluginIds.includes(idContext);
		const isPluginContextName =
			nameContext && allPluginNames.includes(nameContext);
		const pluginId = isPluginContext
			? idContext
			: isPluginContextName
			? nameContext
			: undefined;
		const pluginName = isPluginContextName
			? nameContext
			: isPluginContext
			? allPluginIds.find((n) => n.startsWith(idContext))
			: undefined;
		const most = {
			id: c.id,
			idContext,
			name: c.name,
			nameContext,
			contextType,
			pluginId,
			pluginName,
			...getCmdProps(c, "cmd"),
			...getCmdProps(
				edCmds.find((ec) => ec.id === c.id),
				"edCmd"
			),
			...getKeymapProps(c.id, bakedKeymapInfo, "mgrBaked"),
			...getKeymapProps(c.id, customKeymapInfo, "mgrCustom"),
			...getKeymapProps(c.id, managerGottenKeymapInfo, "mgrCustomGet"),
			...getKeymapProps(
				c.id,
				managerGottenDefaultKeymapInfo,
				"mgrDefaultGet"
			),
			...getKeymapProps(c.id, defaultKeymapInfo, "mgrDefault"),
			...getKeymapProps(
				c.id,
				settingsSerializedHotkeys as unknown as KeymapInfoRecord,
				"settingCustom"
			),
		};

		const res = {
			...most,
			isMismatchedCustom: most.mgrCustom != most.mgrCustomGet,
			isMismatchedDefault: most.mgrDefault != most.mgrDefaultGet,
			isOverriddenAndUnbaked: most.mgrCustom && most.mgrDefault,
			isBakedCheck: most.baked === (most.mgrCustom !== most.mgrDefault),
		};
		cmdAudit.push(res);
	}

	const cmdAuditEntities = {
		editorCommands: edCmds,
		commandList: listCmds,
		managerGottenKeymapInfo,
		managerGottenDefaultKeymapInfo,
		commands: commandsRecord,
		bakedKeymapInfo,
		customKeymapInfo,
		defaultKeymapInfo,
		settingsSerializedHotkeys,
	};

	const cmdAuditSummary = {
		nCmds: cmds.length,
		nNamed: cmds.filter((c) => c.name).length,
		nUnnamed: cmds.filter((c) => !c.name).length,
		plugin: {
			nPluginContexts: cmdAudit.filter((c) => c.pluginId).length,
			nPluginContextsName: cmdAudit.filter((c) => c.pluginName).length,
			nPluginContextsId: cmdAudit.filter((c) => c.pluginId).length,
			nPluginContextsNameId: cmdAudit.filter(
				(c) => c.pluginName && c.pluginId
			).length,
		},
		context: {
			nContexts: [
				...new Set(
					cmdAudit
						.map((c) => c.idContext || c.nameContext)
						.filter(Boolean)
				),
			].length,
			nIdContexts: [
				...new Set(cmdAudit.map((c) => c.idContext).filter(Boolean)),
			].length,
			nNameContexts: [
				...new Set(cmdAudit.map((c) => c.nameContext).filter(Boolean)),
			].length,
			nNoneContexts: [
				...new Set(
					cmdAudit
						.map((c) => !c.idContext && !c.nameContext)
						.filter(Boolean)
				),
			].length,
			nNameContextsCheckType: [
				...new Set(
					cmdAudit
						.map((c) => c.contextType === "name")
						.filter(Boolean)
				),
			].length,
			nIdContextsCheckType: [
				...new Set(
					cmdAudit.map((c) => c.contextType === "id").filter(Boolean)
				),
			].length,
			nNoneContextsCheckType: [
				...new Set(
					cmdAudit
						.map((c) => c.contextType === "none")
						.filter(Boolean)
				),
			].length,
		},
		cmds: {
			nCmds: cmdAudit.filter((c) => c.cmd).length,
			nEdCmds: cmdAudit.filter((c) => c.edCmd).length,
			nCmdANDEdCmd: cmdAudit.filter((c) => c.edCmd && c.cmd).length,
			nCmdXOREdCmd: cmdAudit.filter((c) => c.edCmd ^ c.cmd).length,
			nCmdOREdCmd: cmdAudit.filter((c) => c.edCmd || c.cmd).length,
			nCmdNOTEdCmd: cmdAudit.filter((c) => !c.edCmd && c.cmd).length,
			nEdCmdNOTCmd: cmdAudit.filter((c) => c.edCmd && !c.cmd).length,
		},
		mgrGot: {
			nGotBase: cmdAudit.filter((c) => c.mgrCustomGet).length,
			nGotDef: cmdAudit.filter((c) => c.mgrDefaultGet).length,
			nGotBaseNOTDef: cmdAudit.filter(
				(c) => c.mgrCustomGet && !c.mgrDefaultGet
			).length,
			nGotDefNOTBase: cmdAudit.filter(
				(c) => !c.mgrCustomGet && c.mgrDefaultGet
			).length,
			nGotDefANDBase: cmdAudit.filter(
				(c) => c.mgrCustomGet && c.mgrDefaultGet
			).length,
			nGotDefXORBase: cmdAudit.filter(
				(c) => c.mgrCustomGet ^ c.mgrDefaultGet
			).length,
			nGotDefORBase: cmdAudit.filter(
				(c) => c.mgrCustomGet || c.mgrDefaultGet
			).length,
		},
		settingsEntity: {
			nCmds: Object.keys(settingsSerializedHotkeys).length,
			nEmpty: Object.keys(settingsSerializedHotkeys).filter(
				(id) => settingsSerializedHotkeys[id].length === 0
			).length,
			nSingle: Object.keys(settingsSerializedHotkeys).filter(
				(id) => settingsSerializedHotkeys[id].length === 1
			).length,
			nMulti: Object.keys(settingsSerializedHotkeys).filter(
				(id) => settingsSerializedHotkeys[id].length > 1
			).length,
		},
		nBaked: cmdAudit.filter((c) => c.mgrBaked).length,
		nCustom: cmdAudit.filter((c) => c.mgrCustom).length,
		nDefault: cmdAudit.filter((c) => c.mgrDefault).length,
		nSettings: cmdAudit.filter((c) => c.settingCustom).length,
	};

	const defaultButNotGottenDefault = cmdAudit.filter(
		(c) => c.mgrDefault && !c.mgrDefaultGet
	);
	const missingSettingsHotkeys = Object.keys(
		settingsSerializedHotkeys
	).filter((id) => !cmdAudit.find((c) => c.id === id && c.settingCustom));

	console.log("auditCommands / pluginAudit", pluginAudit);
	console.log("auditCommands / pluginEntities", pluginEntities);
	console.log("auditCommands / pluginAuditSummary", pluginAuditSummary);
	console.log("auditCommands / auditEntities", cmdAuditEntities);
	console.log("auditCommands / cmdAudit", cmdAudit);
	console.log("auditCommands / auditSummary", cmdAuditSummary);

	console.log(
		"auditCommands / defaultButNotGottenDefault",
		defaultButNotGottenDefault
	);
	console.log(
		"auditCommands / missingSettingsHotkeys",
		missingSettingsHotkeys
	);

	try {
		const pluginIdContexts = [
			...new Set(cmdAudit.map((c) => c.pluginId).filter(Boolean)),
		];
		pluginIdContexts.sort();
		const pluginNameContexts = [
			...new Set(cmdAudit.map((c) => c.pluginName).filter(Boolean)),
		];
		pluginNameContexts.sort();
		const pluginIdNameContexts = [
			...new Set(
				cmdAudit
					.map((c) =>
						c.pluginId && c.pluginName
							? `${c.pluginId} | ${c.pluginName}`
							: false
					)
					.filter(Boolean)
			),
		];
		pluginIdNameContexts.sort();

		const nonPluginIdContexts = [
			...new Set(
				cmdAudit
					.map((c) =>
						!c.pluginId && !c.pluginName ? c.idContext : false
					)
					.filter(Boolean)
			),
		];
		nonPluginIdContexts.sort();
		const nonPluginNameContexts = [
			...new Set(
				cmdAudit
					.map((c) =>
						!c.pluginId && !c.pluginName ? c.nameContext : false
					)
					.filter(Boolean)
			),
		];
		nonPluginNameContexts.sort();
		const nonPluginIdNameContexts = [
			...new Set(
				cmdAudit
					.map((c) =>
						!c.pluginId && !c.pluginName
							? `${c.idContext} | ${c.nameContext}`
							: false
					)
					.filter(Boolean)
			),
		];
		nonPluginIdNameContexts.sort();
		const idContexts = [
			...new Set(cmdAudit.map((c) => c.idContext).filter(Boolean)),
		];
		idContexts.sort();
		const nameContexts = [
			...new Set(cmdAudit.map((c) => c.nameContext).filter(Boolean)),
		];
		nameContexts.sort();
		const idNameContexts = [
			...new Set(
				cmdAudit
					.map((c) =>
						c.contextType !== "none"
							? `${c.idContext || "none"} | ${
									c.nameContext || "none"
							  }`
							: false
					)
					.filter(Boolean)
			),
		];
		idNameContexts.sort();
		const noContext = cmdAudit
			.filter((c) => !c.idContext && !c.nameContext)
			.map((c) => `${c.id} | ${c.name}`);
		const idNameContextsSummary = {
			noContext,
			plugin: {
				pluginIdContexts,
				pluginNameContexts,
				pluginIdNameContexts,
			},
			nonPlugin: {
				nonPluginIdContexts,
				nonPluginNameContexts,
				nonPluginIdNameContexts,
			},
			all: {
				idContexts,
				nameContexts,
				idNameContexts,
			},
		};

		console.log(
			"auditCommands / idNameContextsSummary",
			idNameContextsSummary
		);
	} catch (error) {
		console.log("auditCommands / idNameContextsSummary error", { error });
		throw new Error(
			`auditCommands / idNameContextsSummary error: ${error}`
		);
	}

	// // commands
	// const cc = [];
	// for (const c of Object.values(commands)) {
	// 	const cProps = getCmdProps(c, "c");
	// 	const edProps = getCmdProps(edCmds[c.id], "ed");

	// 	const bakedIdx = bakedIds.indexOf(c.id);
	// 	const bakedProps =
	// 		bakedIdx !== -1
	// 			? {
	// 					baked: true,
	// 					bakedHotkeys: bakedHotkeys[bakedIdx],
	// 			  }
	// 			: {
	// 					baked: false,
	// 					bakedHotkeys: undefined,
	// 			  };

	// 	const customCmd =
	// 		c.id in customHotkeys ? customHotkeys[c.id] : undefined;
	// 	const customProps = customCmd
	// 		? {
	// 				custom: true,
	// 				customHotkeys: customCmd.hotkeys,
	// 		  }
	// 		: {
	// 				custom: false,
	// 				customHotkeys: undefined,
	// 		  };

	// 	const getted = managerGottenKeymapInfo.find((hk) => hk.command === c.id);
	// 	const gettedProps =
	// 		getted !== undefined
	// 			? {
	// 					getted: true,
	// 					managerGottenKeymapInfo: getted.hotkeys,
	// 			  }
	// 			: {
	// 					getted: false,
	// 					managerGottenKeymapInfo: undefined,
	// 			  };

	// 	const gettedDefault = managerGottenDefaultKeymapInfo.find(
	// 		(hk) => hk.command === c.id
	// 	);
	// 	const gettedDefaultProps =
	// 		gettedDefault !== undefined
	// 			? {
	// 					gettedDefault: true,
	// 					managerGottenDefaultKeymapInfo: gettedDefault.hotkeys,
	// 			  }
	// 			: {
	// 					gettedDefault: false,
	// 					managerGottenDefaultKeymapInfo: undefined,
	// 			  };

	// 	const defaultHotkeys = defaultKeys[c.id];
	// 	const defaultProps =
	// 		defaultHotkeys !== undefined
	// 			? {
	// 					default: true,
	// 					defaultHotkeys,
	// 			  }
	// 			: {
	// 					default: false,
	// 					defaultHotkeys: undefined,
	// 			  };

	// 	const settingsHotkeys = settings.obsidianHotkeys[c.id];
	// 	const settingsProps =
	// 		settingsHotkeys !== undefined
	// 			? {
	// 					settings: true,
	// 					settingsHotkeys,
	// 			  }
	// 			: {
	// 					settings: false,
	// 					settingsHotkeys: undefined,
	// 			  };

	// 	cc.push({
	// 		...cProps,
	// 		...edProps,
	// 		...bakedProps,
	// 		...customProps,
	// 		...gettedProps,
	// 		...gettedDefaultProps,
	// 		...defaultProps,
	// 		...settingsProps,
	// 	});
	// }

	// const commandIds = new Set(Object.keys(commands));
	// const missingSettingsHotkeys = Object.keys(settings.obsidianHotkeys).filter(
	// 	(commandId) => !(commandId in commands)
	// );
	// const missingCustomHotkeys = Object.keys(customHotkeys).filter(
	// 	(commandId) => !(commandId in commands)
	// );
	// const missingDefaultHotkeys = Object.keys(defaultKeys).filter(
	// 	(commandId) => !(commandId in commands)
	// );
	// const missingmanagerGottenKeymapInfo = Object.keys(managerGottenKeymapInfo).filter(
	// 	(commandId) => !(commandId in commands)
	// );
	// const missingmanagerGottenDefaultKeymapInfo = Object.keys(
	// 	managerGottenDefaultKeymapInfo
	// ).filter((commandId) => !commandIds.has(commandId));
	// const missingBakedIds = bakedIds.filter(
	// 	(commandId) => !commandIds.has(commandId)
	// );
	// const missingListedHotkeys = commandList.filter(
	// 	({ id }) => !commandIds.has(id)
	// );
	// const missingEditorCommands = Object.keys(edCmds).filter(
	// 	(commandId) => !(commandId in commands)
	// );
}

function auditCommandIdCheck(commandsRecord: CommandsCommandsRecord) {
	console.log("checking commandId vs id");
	let commandIdCheck = true;
	for (const c of Object.keys(commandsRecord)) {
		if (commandsRecord[c].id !== c) {
			console.log("auditCommands / commandId mismatch:", {
				commandId: c,
				command: commandsRecord[c],
			});
			commandIdCheck = false;
		}
	}

	if (!commandIdCheck) {
		throw new Error("auditCommands / commandId check: failed");
	}
	console.log("auditCommands / commandId check: success");
}
