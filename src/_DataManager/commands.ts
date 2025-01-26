import { App, Command, Hotkey, KeymapInfo } from "obsidian";

import type {
	CommandData,
	CommandHotkeyData,
	CommandId,
	CommunityPluginData,
	InternalPluginData,
	KeybindingDatum,
	KeybindingDatumWithoutConflicts,
	Keysig,
	PluginData,
	PluginId,
} from "@/types";

// -----------------------------------------------------------------------------
const getInternalPluginCommandsById = (app: App) => {
	const disabledInternalPluginCommandIds: CommandId[] = [];
	const internalPluginCommandsById: Record<CommandId, Command> = {};
	const internalPluginByCommandId: Record<CommandId, PluginId> = {};
	Object.entries(app.internalPlugins.plugins).forEach(
		([pluginId, plugin]) => {
			plugin.commands.forEach((cmd) => {
				if (plugin.enabled === false)
					disabledInternalPluginCommandIds.push(cmd.id);
				internalPluginCommandsById[cmd.id] = cmd;
				internalPluginByCommandId[cmd.id] = pluginId;
			});
		}
	);
	return {
		internalPluginCommandsById,
		disabledInternalPluginCommandIds,
		internalPluginByCommandId,
	};
};

const getListedCommandsById = (app: App) => {
	return app.commands.listCommands().reduce((acc, cmd) => {
		acc[cmd.id] = cmd;
		return acc;
	}, {} as Record<CommandId, Command>);
};

const getFindCommandById = (app: App, ids: CommandId[]) => {
	return ids.reduce((acc, id) => {
		const cmd = app.commands.findCommand(id);
		if (!cmd) return acc;
		acc[id] = cmd;
		return acc;
	}, {} as Record<CommandId, Command>);
};

const getCommandContext = (s: string): string[] | undefined => {
	const lastColonIndex = s.lastIndexOf(":");
	return lastColonIndex === -1
		? undefined
		: s.slice(0, lastColonIndex).split(":");
};

export const getCommandData = (app: App): CommandData[] => {
	const {
		internalPluginCommandsById,
		disabledInternalPluginCommandIds,
		internalPluginByCommandId,
	} = getInternalPluginCommandsById(app);
	const uniqueIds = [
		...new Set([
			...disabledInternalPluginCommandIds,
			...Object.keys(app.commands.commands),
		]),
	];
	const communityPluginIds = new Set(Object.keys(app.plugins.manifests));
	const communityPluginEnabledIds = new Set(Object.keys(app.plugins.plugins));

	const listedCommandsById = app.commands
		.listCommands()
		.reduce(
			(acc, cmd) => acc.set(cmd.id, cmd),
			new Map<CommandId, Command>()
		);

	const getCommandPluginId = (
		maybeInternalPluginid: PluginId,
		idContext: string[] | undefined
	) => {
		const communityPluginId = idContext?.find((ctx) =>
			communityPluginIds.has(ctx)
		);
		if (communityPluginId) {
			const pluginId = idContext?.find((ctx) =>
				communityPluginIds.has(ctx)
			);
			const pluginEnabled = pluginId
				? communityPluginEnabledIds.has(pluginId)
				: false;
			return {
				pluginId,
				pluginType: "community" as const,
				pluginEnabled,
			};
		} else if (maybeInternalPluginid in internalPluginByCommandId) {
			return {
				pluginId: internalPluginByCommandId[maybeInternalPluginid],
				pluginType: "core" as const,
				pluginEnabled: disabledInternalPluginCommandIds.includes(
					maybeInternalPluginid
				)
					? false
					: true,
			};
		} else {
			return {
				pluginId: undefined,
				pluginType: undefined,
				pluginEnabled: undefined,
			};
		}
	};

	const res: CommandData[] = [];
	for (const id of uniqueIds) {
		const cmd = app.commands.commands[id] ?? internalPluginCommandsById[id];
		const idContext = getCommandContext(id);
		const nameContext = getCommandContext(cmd.name);

		const appCommand = app.commands.commands[id];
		const otherCommands = {
			appEditorCommand: app.commands.editorCommands[id],
			internalPluginCommand: internalPluginCommandsById[id],
			listedCommand: listedCommandsById.get(id),
			foundCommand: app.commands.findCommand(id),
		};
		const isIn = {
			appCommand: !!appCommand,
			...Object.entries(otherCommands).reduce((acc, [key, cmd]) => {
				acc[key as keyof typeof otherCommands] = !!cmd;
				return acc;
			}, {} as Record<keyof typeof otherCommands, boolean>),
		};
		const appCommandEqualityChecks = Object.entries(otherCommands).reduce(
			(acc, [key, cmd]) => {
				acc[key as keyof typeof otherCommands] =
					!appCommand || !cmd ? undefined : appCommand === cmd;
				return acc;
			},
			{} as Record<keyof typeof otherCommands, boolean | undefined>
		);
		const callbacks = {
			callback: !!cmd.callback,
			checkCallback: !!cmd.checkCallback,
			editorCallback: !!cmd.editorCallback,
			editorCheckCallback: !!cmd.editorCheckCallback,
		};

		res.push({
			...cmd,
			...getCommandPluginId(id, idContext),
			idContext,
			nameContext,
			isIn,
			appCommandEqualityChecks,
			callbacks,
		});
	}
	return res;
};

// export const getAllCommands = (app: App) => {
// 	const customSym = Object.getOwnPropertySymbols(
// 		app.hotkeyManager
// 	)[0] as unknown as keyof typeof app.hotkeyManager;

const getInternalPluginIds = (app: App) => {
	return [
		...new Set([
			...Object.keys(app.internalPlugins.plugins),
			...Object.keys(app.internalPlugins.config),
		]),
	].toSorted();
};

const getInternalPluginData = (app: App) => {
	const ids = getInternalPluginIds(app);
	const res: Record<string, InternalPluginData> = {};
	for (const id of ids) {
		const topLevelEnabledStatus =
			id in app.internalPlugins.config
				? app.internalPlugins.config[
						id as keyof typeof app.internalPlugins.config
				  ]
				: undefined;
		const plugin =
			id in app.internalPlugins.plugins
				? app.internalPlugins.plugins[
						id as keyof typeof app.internalPlugins.plugins
				  ]
				: undefined;
		const instance = plugin?.instance;

		res[id] = {
			id,
			type: "core" as const,
			topLevelEnabledStatus,
			// isInManifests: undefined,
			isInLookup: !!plugin,
			isEnabledInLookup: plugin?.enabled,
			isLoaded: plugin?._loaded,
			commandIds: plugin?.commands.map((cmd) => cmd.id),
			lastSave: plugin?.lastSave,
			nChildren: plugin?._children.length,
			nEvents: plugin?._events.length,
			hasInstance: !!instance,
			defaultOn:
				instance && "defaultOn" in instance
					? instance.defaultOn
					: false,
			name: instance?.name,
			description: instance?.description,
			// author: 'Obsidian' as const,
			// authorUrl: undefined,
			// fundingUrl: undefined,
			// isDesktopOnly: undefined,
			// dir: undefined,
			// isUserDisabled: undefined,
			// minAppVersion: undefined,
			// version: undefined,
		};
	}
	return res;
};

const getCommunityPluginIds = (app: App) => {
	return [
		...new Set([
			...Object.keys(app.plugins.manifests),
			...Object.keys(app.plugins.plugins),
		]),
	].toSorted();
};

export const getCommunityPluginData = (app: App) => {
	const ids = getCommunityPluginIds(app);
	const res: Record<string, CommunityPluginData> = {};
	for (const id of ids) {
		const plugin =
			id in app.plugins.plugins ? app.plugins.plugins[id] : undefined;
		const topLevelManifest =
			id in app.plugins.manifests ? app.plugins.manifests[id] : undefined;
		const pluginManifest = plugin?.manifest;
		if (
			topLevelManifest &&
			pluginManifest &&
			topLevelManifest !== pluginManifest
		) {
			throw new Error(`Plugin ${id} manifest mismatch`);
		}
		const manifest = topLevelManifest ?? pluginManifest;
		if (!manifest)
			throw new Error(`Plugin ${id} not found in manifests or plugins`);

		res[id] = {
			type: "community" as const,
			id,
			topLevelEnabledStatus: app.plugins.enabledPlugins.has(id),
			isInManifests: !!manifest,
			isInLookup: !!plugin,
			isEnabledInLookup: undefined,
			isLoaded: plugin?._loaded,
			isUserDisabled: plugin?._userDisabled,
			lastDataModifiedTime: plugin
				? plugin._lastDataModifiedTime
					? plugin._lastDataModifiedTime
					: null
				: undefined,
			nChildren: plugin?._children.length,
			nEvents: plugin?._events.length,
			// hasInstance: undefined,
			// defaultOn: undefined,
			name: manifest.name,
			description: manifest.description,
			author: manifest.author,
			authorUrl: manifest.authorUrl,
			fundingUrl: manifest.fundingUrl,
			isDesktopOnly: manifest.isDesktopOnly,
			dir: manifest.dir,
			minAppVersion: manifest.minAppVersion,
			version: manifest.version,
		};
	}
	return res;
};

export const getPluginData = (app: App): Record<PluginId, PluginData> => {
	const internalPluginData = getInternalPluginData(app);
	const communityPluginData = getCommunityPluginData(app);
	if (
		Object.keys(internalPluginData).some((id) => id in communityPluginData)
	) {
		throw new Error(
			`Plugin id found in both internal and community plugins`
		);
	}

	return {
		...internalPluginData,
		...communityPluginData,
	};
};

const hotkeysEquality = (
	a: Hotkey[] | undefined,
	b: Hotkey[] | undefined,
	strict: boolean = false
): boolean | undefined => {
	if (!a && !b) return undefined;
	if (!a || !b) return strict ? false : undefined;
	return a.length === b.length && a.every((hk, i) => hk === b[i]);
};

export const getCommandHotkeyData = (app: App, commandData: CommandData[]) => {
	const res: Record<CommandId, CommandHotkeyData> = {};

	for (const cmd of commandData) {
		const getFn = {
			default: app.hotkeyManager.getDefaultHotkeys(cmd.id),
			custom: app.hotkeyManager.getHotkeys(cmd.id),
		};

		const obj = {
			default: app.hotkeyManager.defaultKeys[cmd.id],
			custom: app.hotkeyManager.customKeys[cmd.id],
		};

		const command = {
			default: cmd.hotkeys,
			custom: undefined,
		};

		res[cmd.id] = {
			id: cmd.id,
			getFn,
			obj,
			command,
			equalityChecks: {
				fnObj: {
					default: hotkeysEquality(getFn.default, obj.default),
					custom: hotkeysEquality(getFn.custom, obj.custom),
				},
				fnObjStrict: {
					default: hotkeysEquality(getFn.default, obj.default, true),
					custom: hotkeysEquality(getFn.custom, obj.custom, true),
				},
				fnCommand: {
					default: hotkeysEquality(command.default, getFn.default),
					custom: undefined,
				},
			},
		};
	}
	return res;
};

const ALLOWED_KEYBINDING_MODIFIERS = [
	"mod", // TODO this is in Obsidian, not VSCode which we try to conform to
	"ctrl",
	"shift",
	"alt",
	"meta",
];

const KEYBINDING_MODIFIER_HOTKEY_TO_KEYMAP_INFO = new Map<string, string>([
	["Mod", "Ctrl"],
]);

const KEYBINDING_MODIFIER_HOTKEY_TO_KEYSIG = new Map<string, string>([
	["Mod", "Ctrl"],
]);

const ALLOWED_KEYBINDING_NONMODIFIER_KEYS = [
	// Function keys
	"f1",
	"f2",
	"f3",
	"f4",
	"f5",
	"f6",
	"f7",
	"f8",
	"f9",
	"f10",
	"f11",
	"f12",
	"f13",
	"f14",
	"f15",
	"f16",
	"f17",
	"f18",
	"f19",
	// Letters
	"a",
	"b",
	"c",
	"d",
	"e",
	"f",
	"g",
	"h",
	"i",
	"j",
	"k",
	"l",
	"m",
	"n",
	"o",
	"p",
	"q",
	"r",
	"s",
	"t",
	"u",
	"v",
	"w",
	"x",
	"y",
	"z",
	// Numbers
	"0",
	"1",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	// Special characters
	"`",
	"-",
	"=",
	"[",
	"]",
	"\\",
	";",
	"'",
	",",
	".",
	"/",
	// Navigation
	"left",
	"up",
	"right",
	"down",
	"pageup",
	"pagedown",
	"end",
	"home",
	// System keys
	"tab",
	"enter",
	"escape",
	"space",
	"backspace",
	"delete",
	"pausebreak",
	"capslock",
	"insert",
	// Numpad
	"numpad0",
	"numpad1",
	"numpad2",
	"numpad3",
	"numpad4",
	"numpad5",
	"numpad6",
	"numpad7",
	"numpad8",
	"numpad9",
	"numpad_multiply",
	"numpad_add",
	"numpad_separator",
	"numpad_subtract",
	"numpad_decimal",
	"numpad_divide",
];

const ALLOWED_KEYBINDING_NONMODIFIER_CODES = [
	// Function keys
	"[F1]",
	"[F2]",
	"[F3]",
	"[F4]",
	"[F5]",
	"[F6]",
	"[F7]",
	"[F8]",
	"[F9]",
	"[F10]",
	"[F11]",
	"[F12]",
	"[F13]",
	"[F14]",
	"[F15]",
	"[F16]",
	"[F17]",
	"[F18]",
	"[F19]",
	// Letters
	"[KeyA]",
	"[KeyB]",
	"[KeyC]",
	"[KeyD]",
	"[KeyE]",
	"[KeyF]",
	"[KeyG]",
	"[KeyH]",
	"[KeyI]",
	"[KeyJ]",
	"[KeyK]",
	"[KeyL]",
	"[KeyM]",
	"[KeyN]",
	"[KeyO]",
	"[KeyP]",
	"[KeyQ]",
	"[KeyR]",
	"[KeyS]",
	"[KeyT]",
	"[KeyU]",
	"[KeyV]",
	"[KeyW]",
	"[KeyX]",
	"[KeyY]",
	"[KeyZ]",
	// Numbers
	"[Digit0]",
	"[Digit1]",
	"[Digit2]",
	"[Digit3]",
	"[Digit4]",
	"[Digit5]",
	"[Digit6]",
	"[Digit7]",
	"[Digit8]",
	"[Digit9]",
	// Special characters
	"[Backquote]",
	"[Minus]",
	"[Equal]",
	"[BracketLeft]",
	"[BracketRight]",
	"[Backslash]",
	"[Semicolon]",
	"[Quote]",
	"[Comma]",
	"[Period]",
	"[Slash]",
	// Navigation
	"[ArrowLeft]",
	"[ArrowUp]",
	"[ArrowRight]",
	"[ArrowDown]",
	"[PageUp]",
	"[PageDown]",
	"[End]",
	"[Home]",
	// System keys
	"[Tab]",
	"[Enter]",
	"[Escape]",
	"[Space]",
	"[Backspace]",
	"[Delete]",
	"[Pause]",
	"[CapsLock]",
	"[Insert]",
	// Numpad
	"[Numpad0]",
	"[Numpad1]",
	"[Numpad2]",
	"[Numpad3]",
	"[Numpad4]",
	"[Numpad5]",
	"[Numpad6]",
	"[Numpad7]",
	"[Numpad8]",
	"[Numpad9]",
	"[NumpadMultiply]",
	"[NumpadAdd]",
	"[NumpadComma]",
	"[NumpadSubtract]",
	"[NumpadDecimal]",
	"[NumpadDivide]",
];

const hotkeyToKeysig = (hk: Hotkey) => {
	const mods = hk.modifiers.map(
		(m) => KEYBINDING_MODIFIER_HOTKEY_TO_KEYSIG.get(m) ?? m
	);
	mods.sort((a, b) => a.localeCompare(b));
	const key = hk.key;
	return (
		"keysig:" +
		[mods.map((m) => m.toLowerCase()).join(",")].join(",") +
		":" +
		key.toLowerCase()
	);
};

const keysigToHotkey = (keysig: Keysig) => {
	const [mods, key] = keysig.split(":").slice(1);
	return {
		modifiers: mods
			.split(",")
			.map((m) => m[0].toUpperCase() + m.slice(1))
			.toSorted(),
		key: key?.toUpperCase() ?? "",
	};
};


// const getKeybindingDatumWithoutConflicts = (
// 	commandId: CommandId,
// 	hotkey: Hotkey,
// 	isDefault: boolean
// ) => {
// 	const keysig = hotkeyToKeysig(hotkey);
// 	const keymapInfo = hotkeyToKeymapInfo(hotkey);
// 	const bakedHotkeyIdx = app.hotkeyManager.bakedHotkeys.findIndex((hk) =>
// 		keymapInfoEquals(hk, keymapInfo)
// 	);
// 	return {
// 		keysig,
// 		commandId,
// 		hotkey,
// 		keymapInfo,
// 		bakedHotkeyIdx,
// 		bakedHotkeyId:
// 			bakedHotkeyIdx !== -1
// 				? app.hotkeyManager.bakedIds[bakedHotkeyIdx]
// 				: undefined,
// 		isDefault,
// 	};
// };



const keymapInfoToString = (v: KeymapInfo) => {
	return v.modifiers + " + " + v.key;
};

// export const getKeybindings = (app: App): KeybindingDatum[] => {
// 	app.hotkeyManager.bake();
// 	const commandData = getCommandData(app).filter(
// 		(cmd) => !(cmd.pluginId && !cmd.pluginEnabled)
// 	);
// 	const commandHotkeyData = getCommandHotkeyData(app, commandData);
// 	const tmp = new Map<Keysig, KeybindingDatumWithoutConflicts[]>();
// 	for (const cmd of Object.values(commandHotkeyData)) {
// 		const isCustom = !!cmd.getFn.custom;
// 		for (const hk of cmd.getFn.custom ?? cmd.getFn.default ?? []) {
// 			const d = getKeybindingDatumWithoutConflicts(cmd.id, hk, !isCustom);
// 			tmp.set(d.keysig, [...(tmp.get(d.keysig) ?? []), d]);
// 		}
// 	}
// 	const keybindingsData = new Map<Keysig, KeybindingDatum[]>();
// 	for (const [keysig, data] of tmp) {
// 		keybindingsData.set(
// 			keysig,
// 			data.map((d) => ({
// 				...d,
// 				conflictsWith: data
// 					.filter((d2) => d2.keysig !== d.keysig)
// 					.map((d) => d.keysig),
// 				matchesBaked: app.hotkeyManager.bakedHotkeys.some((hk) =>
// 					keymapInfoEquals(hk, d.keymapInfo)
// 				),
// 			}))
// 		);
// 	}

// 	const matchedHotkeyIdxs = Array.from(keybindingsData.values())
// 		.flat()
// 		.filter((d) => d.bakedHotkeyIdx !== -1)
// 		.map((d) => d.bakedHotkeyIdx);
// 	const missingHotkeyIdxs = Array(app.hotkeyManager.bakedHotkeys.length)
// 		.fill(0)
// 		.map((_, i) => i)
// 		.filter(
// 			(idx) =>
// 				!matchedHotkeyIdxs.includes(idx) &&
// 				app.commands.findCommand(app.hotkeyManager.bakedIds[idx])
// 		);
// 	const extraHotkeys = Array.from(keybindingsData.values())
// 		.flat()
// 		.filter((d) => d.bakedHotkeyIdx === -1)
// 		.map((d) => keymapInfoToString(d.keymapInfo) + " -> " + d.commandId);
// 	const missingHotkeys = missingHotkeyIdxs.map(
// 		(idx) =>
// 			keymapInfoToString(app.hotkeyManager.bakedHotkeys[idx]) +
// 			" -> " +
// 			app.hotkeyManager.bakedIds[idx]
// 	);
// 	const matchedHotkeys = matchedHotkeyIdxs.map(
// 		(idx) =>
// 			keymapInfoToString(app.hotkeyManager.bakedHotkeys[idx]) +
// 			" -> " +
// 			app.hotkeyManager.bakedIds[idx]
// 	);

// 	return {
// 		commandData,
// 		commandHotkeyData,
// 		nCommands: Object.keys(commandHotkeyData).length,
// 		keybindingsData,
// 		extraHotkeys,
// 		missingHotkeys,
// 		matchedHotkeys,
// 		bakedHotkeys: app.hotkeyManager.bakedHotkeys,
// 		bakedIds: app.hotkeyManager.bakedIds,
// 	};
// };
