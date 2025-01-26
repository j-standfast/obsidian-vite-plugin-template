import * as z from "zod";
import {
	VSC_NONMOD_KEYS,
	OBS_NONMOD_KEYS,
	VscWindowsModifier,
	ObsModifierInternal,
	VSC_WINDOWS_MODIFIERS,
	VscNonmodKey,
	ObsNonmodKey,
	OBS_INTERNAL_MODIFIERS,
	VSC_WINDOWS_TO_OBS_MODIFIERS_KEYMAP,
	VscToObsNonmodKey,
	VSC_TO_OBS_NONMOD_KEYMAP,
	obsNonmodToUnlowercaseKeymap,
	obsToVscNonmodKeymap,
	OBS_JSON_MODIFIERS,
	ObsJsonModifier,
	OBS_JSON_TO_OBS_INTERNAL_MODIFIERS_KEYMAP,
} from "@/constants/keys/keys-vscode";
import { KeymapInfo } from "obsidian";
import {
	KeybindingJsonItem,
	KeymapInfoRequiredKey,
	ShortcutKeybinding,
} from "@/types/keybinding";
import { Expect } from "@/types/util";
import { CoExtends } from "@/types/util";
import { ObsidianHotkey } from "@/_DataManager/types/key";

// type OrderedPermutation<T extends string[], Prev extends string = ''> = T extends [
// 	infer U extends string,
// 	...infer V extends string[]
// ]
//   ? `${V[number]}` : never;

// type Test = OrderedPermutation<['a', 'b', 'c']>;

const isVscWindowsModifier = (key: string): key is VscWindowsModifier => {
	return (VSC_WINDOWS_MODIFIERS as readonly string[]).includes(
		key as VscWindowsModifier
	);
};

const isVscNonModifierKey = (val: string): val is VscNonmodKey => {
	return (VSC_NONMOD_KEYS as readonly string[]).includes(val);
};

const isObsidianKey = (key: string): key is ObsNonmodKey => {
	return (OBS_NONMOD_KEYS as readonly string[]).includes(key as ObsNonmodKey);
};

const isObsidianWindowsModifier = (key: string): key is ObsModifierInternal => {
	return (OBS_INTERNAL_MODIFIERS as readonly string[]).includes(
		key as ObsModifierInternal
	);
};

const vscWindowsToObsModifier = <T extends VscWindowsModifier>(
	key: T
): ObsModifierInternal => {
	const res = VSC_WINDOWS_TO_OBS_MODIFIERS_KEYMAP[key];
	if (!res) {
		throw new Error(
			`Key ${key} not found in VSC_TO_OBS_WINDOWS_MODIFIERS_KEYMAP`
		);
	}
	return res;
};

const vscToObsNonmodKey = <T extends VscNonmodKey>(
	key: T
): VscToObsNonmodKey<T> => {
	const res = VSC_TO_OBS_NONMOD_KEYMAP[key];
	if (!res) {
		throw new Error(`Key ${key} not found in VSC_TO_OBS_NONMOD_KEYMAP`);
	}
	return res;
};

const keybindingJsonSchema = z.object({
	command: z.string(),
	when: z.string().optional(),
	key: z.string(),
});

const keybindingsJsonSchema = z.object({
	default: z.array(keybindingJsonSchema).optional(),
	negative: z.array(keybindingJsonSchema).optional(),
	custom: z.array(keybindingJsonSchema).optional(),
});

const vscWindowsKeymapInfoSchema = z.object({
	modifiers: z.array(z.custom<VscWindowsModifier>(isVscWindowsModifier)),
	key: z.custom<VscNonmodKey>(isVscNonModifierKey),
});

const parseVscKeymapInfo = (
	val: string
): { modifiers: VscWindowsModifier[]; key: VscNonmodKey } => {
	if (!val)
		throw new Error(
			"Unexpected empty keybinding key (should be non-empty from zod parse)"
		);
	const parts = val.split("+");
	let modifiers: string[] = [];
	let key: string;

	if (parts.length === 1) {
		key = parts[0];
	} else {
		modifiers = parts.slice(0, -1);
		key = parts[parts.length - 1];
	}

	return vscWindowsKeymapInfoSchema.parse({
		modifiers,
		key,
	});
};

const parseObsidianKeymapInfo = (
	val: ReturnType<typeof parseVscKeymapInfo>
): KeymapInfoRequiredKey => {
	const { modifiers, key } = val;
	const obsModifiers = z
		.array(z.custom<ObsModifierInternal>(vscWindowsToObsModifier))
		.parse(modifiers)
		.toSorted((a, b) => a.localeCompare(b))
		.join(",");
	return {
		modifiers: obsModifiers ? obsModifiers : null,
		key: z.custom<ObsNonmodKey>(vscToObsNonmodKey).parse(key),
	};
};

export const serializeKeymapInfo = (val: KeymapInfoRequiredKey): string => {
	let { modifiers, key } = val;
	key =
		obsNonmodToUnlowercaseKeymap[
			key as ObsNonmodKey | Lowercase<ObsNonmodKey>
		];
	if (key === undefined)
		throw new Error(`Key ${key} not found in obsNonmodToUnlowercaseKeymap`);
	return modifiers && modifiers.length > 0 ? modifiers + "+" + key : key;
};

const serializeKeymapInfoForJSON = (val: KeymapInfoRequiredKey): string => {
	let { modifiers, key } = val;
	key =
		obsNonmodToUnlowercaseKeymap[
			key as ObsNonmodKey | Lowercase<ObsNonmodKey>
		];
	if (key === undefined)
		throw new Error(`Key ${key} not found in obsNonmodToUnlowercaseKeymap`);
	key = obsToVscNonmodKeymap[key as ObsNonmodKey];
	if (key === undefined)
		throw new Error(`Key ${key} not found in obsToVscNonmodKeymap`);
	return modifiers && modifiers.length > 0 ? modifiers + "+" + key : key;
};

export const serializeKeymapInfoSequence = (
	val: KeymapInfoRequiredKey[]
): string => {
	return val.map(serializeKeymapInfo).join(" ");
};

const serializeKeymapInfoSequenceForJSON = (
	val: KeymapInfoRequiredKey[]
): string => {
	return val.map(serializeKeymapInfoForJSON).join(" ");
};

const parseKeybindingJsonKey = (key: string): KeymapInfoRequiredKey[] => {
	if (!key)
		throw new Error(
			"Unexpected empty keybinding key (should be non-empty from zod parse)"
		);
	const keys = key.split(" ");
	return keys.map(parseVscKeymapInfo).map(parseObsidianKeymapInfo);
};

const parseKeybindingJsonItem = (
	datum: KeybindingJsonItem,
	isDefault: boolean,
	isNegative: boolean
): ShortcutKeybinding => {
	const keymapInfo = parseKeybindingJsonKey(datum.key);
	return {
		commandId: datum.command,
		when: datum.when,
		keymapInfo,
		key: serializeKeymapInfoSequence(keymapInfo),
		isDefault,
		isNegative,
	};
};

export const parseKeybindingsJson = (data: unknown) => {
	const parsed = keybindingsJsonSchema.safeParse(data);
	if (parsed.error) {
		console.error("parseKeybindingsJson / error", {
			data,
			error: parsed.error,
		});
		throw new Error("parseKeybindingsJson / error");
	}
	const {
		default: defaultKeybindings = [],
		custom: customKeybindings = [],
		negative: negativeKeybindings = [],
	} = parsed.data;

	const res: ShortcutKeybinding[] = [];
	defaultKeybindings.forEach((datum: KeybindingJsonItem) => {
		try {
			res.push(parseKeybindingJsonItem(datum, true, false));
		} catch (error) {
			console.error(error);
		}
	});
	Object.values(negativeKeybindings).forEach((datum) => {
		try {
			res.push(parseKeybindingJsonItem(datum, false, true));
		} catch (error) {
			console.error(error);
		}
	});
	Object.values(customKeybindings).forEach((datum) => {
		try {
			res.push(parseKeybindingJsonItem(datum, false, false));
		} catch (error) {
			console.error(error);
		}
	});
	return res;
};

const isObsJsonModifier = (val: string): val is ObsJsonModifier => {
	return (OBS_JSON_MODIFIERS as readonly string[]).includes(val);
};

const hotkeyOneHotkeySchema = z.object({
	key: z
		.string()
		.transform<ObsNonmodKey>(
			(val) =>
				obsNonmodToUnlowercaseKeymap[
					val as ObsNonmodKey | Lowercase<ObsNonmodKey>
				]
		),
	modifiers: z.array(
		z.string().transform<ObsModifierInternal>((val) => {
			if (!isObsJsonModifier(val)) {
				throw new Error(`Invalid modifier ${val}`);
			}
			return OBS_JSON_TO_OBS_INTERNAL_MODIFIERS_KEYMAP[val];
		})
	),
});

const hotkeyJsonFileSchema = z.record(
	z.string(),
	z.array(hotkeyOneHotkeySchema)
);
type HotkeyJsonFile = z.infer<typeof hotkeyJsonFileSchema>;

export const parseKeybindingsFromHotkeysJson = (
	data: unknown
): ShortcutKeybinding[] => {
	const parsed = hotkeyJsonFileSchema.safeParse(data);
	if (parsed.error) {
		console.log("parseKeybindingsFromHotkeysJson / error", {
			data,
			error: parsed.error,
		});
		throw new Error("parseKeybindingsFromHotkeys / error");
	}
	parsed.data;
	const res: ShortcutKeybinding[] = Object.entries(parsed.data).flatMap(
		([commandId, hotkeys]) => {
			const keymapInfos = hotkeys.map((hotkey) => ({
				key: hotkey.key,
				modifiers: hotkey.modifiers.join(","),
			}));
			return keymapInfos.map((kmi) => ({
				commandId,
				keymapInfo: [kmi],
				key: serializeKeymapInfo(kmi),
				when: undefined,
				isDefault: false,
				isNegative: false,
			}));
		}
	);
	return res;
};

export const parseKeybindingsFromHotkeysRecord = (
	data: Record<string, ObsidianHotkey[]>,
	isDefault: boolean
): ShortcutKeybinding[] => {
	const parsed = hotkeyJsonFileSchema.safeParse(data);
	if (parsed.error) {
		console.log("parseKeybindingsFromHotkeysRecord / error", {
			data,
			error: parsed.error,
		});
		throw new Error("parseKeybindingsFromHotkeys / error");
	}
	parsed.data;
	const res: ShortcutKeybinding[] = Object.entries(parsed.data).flatMap(
		([commandId, hotkeys]) => {
			const keymapInfos = hotkeys.map((hotkey) => ({
				key: hotkey.key,
				modifiers: hotkey.modifiers.join(","),
			}));
			return keymapInfos.map((kmi) => ({
				commandId,
				keymapInfo: [kmi],
				key: serializeKeymapInfo(kmi),
				when: undefined,
				isDefault,
				isNegative: false,
			}));
		}
	);
	return res;
};

export const obsidianKeymapInfoToKeybinding = (
	commandId: string,
	obsKmi: { key: string; modifiers: string },
	isDefault: boolean
): ShortcutKeybinding => {
	obsKmi;
	return {
		when: undefined,
		commandId,
		keymapInfo: [obsKmi],
		key: serializeKeymapInfo(obsKmi),
		isDefault,
		isNegative: false,
	};
};

export const hotkeyKeybindingMatchesKeybinding = (
	obsKb: ShortcutKeybinding,
	kb: ShortcutKeybinding
): boolean => {
	return obsKb.commandId === kb.commandId && obsKb.key === kb.key;
};

export const serializeKeybindingForJSON = (
	kb: ShortcutKeybinding
): KeybindingJsonItem => {
	return {
		command: kb.commandId,
		key: serializeKeymapInfoSequenceForJSON(kb.keymapInfo),
		...(kb.when ? { when: kb.when } : {}),
	};
};

// const tailorJSONKeybindingKeySchema = z
// 	.string()
// 	.transform<KeymapInfoRequiredKey>((val, ctx) => {
// 		const parts = val.split("+");

// 		let modifiers: string[] = [];
// 		let key: string;
// 		if (parts.length === 1) {
// 			key = parts[0];
// 		} else {
// 			modifiers = parts.slice(0, -1);
// 			key = parts[parts.length - 1];
// 		}

// 		const modifiersParsed =
// 			tailorJSONKeybindingModifiersSchema.safeParse(modifiers);
// 		if (!modifiersParsed.success) {
// 			ctx.addIssue({
// 				code: z.ZodIssueCode.custom,
// 				message: "Invalid modifiers",
// 				path: ["modifiers"],
// 			});
// 			return z.NEVER;
// 		}

// 		const keyParsed = tailorJSONKeybindingNonModifierSchema.safeParse(key);
// 		if (!keyParsed.success) {
// 			ctx.addIssue({
// 				code: z.ZodIssueCode.custom,
// 				message: "Invalid key",
// 				path: ["key"],
// 			});
// 			return z.NEVER;
// 		}

// 		const compiledModifiers = modifiersParsed.data.join(",");
// 		const compiledKey = keyParsed.data;
// 		return {
// 			modifiers: compiledModifiers,
// 			key: compiledKey,
// 		};
// 	});

// const tailorJSONKeybindingModifiersSchema = z.array(
// 	tailorJSONKeybindingModifierSchema
// );
// const tailorJSONKeybindingNonModifierSchema =
//   z.custom<VscNonmodKey>(isVscNonModifierKey).transform<ObsNonmodKey>((val, ctx) => {
//     try {
//       const res = vscToObsNonmodKey(val);
//       return res;
//     } catch (error) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: "Invalid key",
//         path: ["key"],
//       });
//       return z.NEVER;
//     }
//   });

// const tailorJSONKeybindingModifierSchema = z
// 	.custom<VscWindowsModifier>(isVscWindowsModifier)
// 	.transform<ObsModifier>((val, ctx) => {
// 		try {
// 			const res = vscWindowsToObsModifier(val);
// 			return res;
// 		} catch (error) {
// 			ctx.addIssue({
// 				code: z.ZodIssueCode.custom,
// 				message: "Invalid modifier",
// 				path: ["modifiers"],
// 			});
// 			return z.NEVER;
// 		}
// 	});
