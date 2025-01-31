import type { App, HotkeyManager } from "obsidian";
import type {
	HotkeyManagerCustomKeysRecord,
	HotkeyManagerDefaultKeysRecord,
} from "obsidian";
import type {
	HotkeyMeta,
	HotkeyMetaRelations,
	HotkeyMetaBase,
	HotkeyTableDatum,
} from "./types";

import type {
	Keysig,
	ObsidianHotkey,
	ObsidianKeymapInfo,
	CommandId,
} from "@/types";
import {
	hotkeyToKeymapInfo,
	keymapInfoToKeysig,
	hotkeyToKeysig,
	keymapInfoEquals,
} from "@/_STALE/keybindings/conversion";
import { capitalize } from "@/_DataManager/string-util";
import {
	getHotkeyCounts,
	getUniqueModifiers,
} from "@/_STALE/keybindings/test-precursors";

interface ParseHotkeyTableDatumContext {
	commandId: string;
	idx: number;
	defaultKeys: HotkeyManagerDefaultKeysRecord;
	customKeys: HotkeyManagerCustomKeysRecord;
	bakedCommandIdsByKeysig: Map<Keysig, CommandId[]>;
	hotkeyManager: HotkeyManager;
	bakedCommandIds: Set<CommandId>;
	allCommandIdsByKeysig: AllCommandIdsByKeysig;
	commandsCommandIds: Set<CommandId>;
	expectedBakedCommandIdsByKeysig: Map<Keysig, CommandId[]>;
}

const parseHotkeyTableDatum = (
	hotkey: ObsidianHotkey,
	isCustom: boolean,
	{
		commandId,
		hotkeyManager,
		idx,
		defaultKeys,
		customKeys,
		allCommandIdsByKeysig,
		bakedCommandIdsByKeysig,
		commandsCommandIds,
		expectedBakedCommandIdsByKeysig,
		bakedCommandIds,
	}: ParseHotkeyTableDatumContext
): HotkeyTableDatum => {
	const kmi = hotkeyToKeymapInfo(hotkey);
	const keysig = keymapInfoToKeysig(kmi);
	let bakedCommandIdsForKeysig = bakedCommandIdsByKeysig.get(keysig);
	if (!bakedCommandIdsForKeysig) {
		console.log("bakedCommandIdsForKeysig is undefined");
		console.log("keysig", keysig);
		console.log("bakedCommandIdsByKeysig", bakedCommandIdsByKeysig);
		bakedCommandIdsForKeysig = [];
	}

	const bakedIdIdx = hotkeyManager.bakedIds.findIndex(
		(id, i) =>
			id === commandId &&
			keymapInfoEquals(kmi, hotkeyManager.bakedHotkeys[i])
	);
	const isBakedInOneSense = bakedIdIdx !== -1;
	if (!isBakedInOneSense)
		console.log("bakedIdIdx -1", {
			commandId,
			bakedIds: hotkeyManager.bakedIds,
			bakedHotkeys: hotkeyManager.bakedHotkeys,
			kmi,
			keysig,
		});

	const isEffectiveHotkey =
		commandsCommandIds.has(commandId) && isCustom
			? idx === 0
			: idx === 0 && customKeys[commandId] === undefined;

	const isOverriding =
		isCustom && isEffectiveHotkey && commandId in defaultKeys;
	const isOverridden = !isCustom && !isEffectiveHotkey;

	const isBaked = isBakedInOneSense && !isOverridden;
	const probablyShouldBeBaked = !isOverridden;

	const hotkeysOverriding = isOverriding ? defaultKeys[commandId] : undefined;
	const keysigsOverriding = hotkeysOverriding
		? hotkeysOverriding.map((hotkey) => hotkeyToKeysig(hotkey)).join(", ")
		: "-";

	const hotkeysOverriddenBy = isOverridden
		? customKeys[commandId]
		: undefined;
	const keysigsOverriddenBy = hotkeysOverriddenBy
		? hotkeysOverriddenBy.length === 0
			? "none"
			: hotkeysOverriddenBy
					.map((hotkey) => hotkeyToKeysig(hotkey))
					.join(", ")
		: "-";

	const possibleConflictsMap = isCustom
		? allCommandIdsByKeysig.custom
		: allCommandIdsByKeysig.default;
	const possibleConflicts = possibleConflictsMap.get(keysig) ?? [];
	if (
		!possibleConflicts.includes(commandId) &&
		commandsCommandIds.has(commandId)
	) {
		console.log("weird!");
		console.log("possibleConflicts", possibleConflicts);
		console.log("commandId", commandId);
	}
	const conflictingCommandIds = possibleConflicts.filter(
		(id) => id !== commandId && commandsCommandIds.has(id)
	);

	return {
		commandId: commandId,
		obsidianModifiers: hotkey.modifiers?.toSorted().join(", ") ?? "",
		obsidianKey: capitalize(hotkey.key),
		bakedCommandIdsForKeysig,
		isBaked,
		isEffectiveHotkey,
		isOverriding,
		isOverridden,
		keysigsOverriding,
		keysigsOverriddenBy,
		conflictingCommandIds,
		probablyShouldBeBaked,
		keysig,
		isDefaultHotkey: !isCustom,
	};
};

interface ParseHotkeysByCommandIdContext {
	defaultKeys: HotkeyManagerDefaultKeysRecord;
	customKeys: HotkeyManagerCustomKeysRecord;
	bakedCommandIdsByKeysig: Map<Keysig, CommandId[]>;
	bakedCommandIds: Set<CommandId>;
	allCommandIdsByKeysig: AllCommandIdsByKeysig;
	hotkeyManager: HotkeyManager;
	commandsCommandIds: Set<CommandId>;
	expectedBakedCommandIdsByKeysig: Map<Keysig, CommandId[]>;
}

const parseHotkeysByCommandId = (
	hotkeysByCommandId: Record<CommandId, ObsidianHotkey[]>,
	isCustom: boolean,
	{
		defaultKeys,
		customKeys,
		bakedCommandIdsByKeysig,
		bakedCommandIds,
		allCommandIdsByKeysig,
		hotkeyManager,
		commandsCommandIds,
		expectedBakedCommandIdsByKeysig,
	}: ParseHotkeysByCommandIdContext
): HotkeyTableDatum[] => {
	return Object.entries(hotkeysByCommandId).flatMap(([commandId, hotkeys]) =>
		hotkeys.map((hotkey, i) =>
			parseHotkeyTableDatum(hotkey, isCustom, {
				commandId,
				idx: i,
				bakedCommandIdsByKeysig,
				bakedCommandIds,
				allCommandIdsByKeysig,
				hotkeyManager,
				defaultKeys,
				customKeys,
				commandsCommandIds,
				expectedBakedCommandIdsByKeysig,
			})
		)
	);
};

const getBakedKeysigs = (hotkeyManager: HotkeyManager) => {
	return hotkeyManager.bakedHotkeys.map((kmi) => keymapInfoToKeysig(kmi));
};

const getBakedCommandIdsByKeysig = (
	hotkeyManager: HotkeyManager
): Map<Keysig, CommandId[]> => {
	const res = new Map<Keysig, CommandId[]>();
	const bakedKeysigs = getBakedKeysigs(hotkeyManager);
	for (let i = 0; i < bakedKeysigs.length; i++) {
		const keysig = bakedKeysigs[i];
		const commandId = hotkeyManager.bakedIds[i];
		if (!keysig || !commandId) {
			throw new Error("Invalid baked hotkeys");
		}

		const commandIds = res.get(keysig) ?? [];
		commandIds.push(commandId);
		res.set(keysig, commandIds);
	}
	return res;
};

const getExpectedBakedCommandIdsByKeysig = (
	hotkeyManager: HotkeyManager,
	commandsCommandIds: Set<CommandId>
): Map<Keysig, CommandId[]> => {
	const res = new Map<Keysig, CommandId[]>();
	for (const id of commandsCommandIds) {
		const hotkeys =
			hotkeyManager.customKeys[id] ?? hotkeyManager.defaultKeys[id] ?? [];
		for (const hotkey of hotkeys) {
			const keysig = hotkeyToKeysig(hotkey);
			const commandIds = res.get(keysig) ?? [];
			commandIds.push(id);
			res.set(keysig, commandIds);
		}
	}
	return res;
};

interface AllCommandIdsByKeysig {
	default: Map<Keysig, CommandId[]>;
	custom: Map<Keysig, CommandId[]>;
}

const getAllCommandIdsByKeysig = (hotkeyManager: HotkeyManager) => {
	const res: AllCommandIdsByKeysig = {
		default: new Map<Keysig, CommandId[]>(),
		custom: new Map<Keysig, CommandId[]>(),
	};
	for (const [commandId, hotkeys] of Object.entries(
		hotkeyManager.customKeys
	)) {
		for (const hotkey of hotkeys) {
			const keysig = hotkeyToKeysig(hotkey);
			const commandIds = res.custom.get(keysig) ?? [];
			commandIds.push(commandId);
			res.custom.set(keysig, commandIds);
		}
	}
	for (const [commandId, hotkeys] of Object.entries(
		hotkeyManager.defaultKeys
	)) {
		for (const hotkey of hotkeys) {
			const keysig = hotkeyToKeysig(hotkey);
			const commandIds = res.default.get(keysig) ?? [];
			commandIds.push(commandId);
			res.default.set(keysig, commandIds);
		}
	}
	return res;
};

const getHotkeyMetaId = (
	commandId: CommandId,
	isCustom: boolean,
	hotkeyIdx: number
) => {
	const isCustomStr = isCustom ? "custom" : "default";
	return `${commandId}__${isCustomStr}__${hotkeyIdx}`;
};

const getHotkeyMetaBaseByIdForSource = (
	hotkeysByCommandId: Record<CommandId, ObsidianHotkey[]>,
	{
		isCustom,
		customHotkeysByCommandId,
		defaultHotkeysByCommandId,
		customHotkeyCommandIds,
		commandCommandIds,
		bakedIds,
		bakedKeymapInfos,
	}: {
		isCustom: boolean;
		customHotkeyCommandIds: Set<CommandId>;
		commandCommandIds: Set<CommandId>;
		customHotkeysByCommandId: Record<CommandId, ObsidianHotkey[]>;
		defaultHotkeysByCommandId: Record<CommandId, ObsidianHotkey[]>;
		bakedIds: CommandId[];
		bakedKeymapInfos: ObsidianKeymapInfo[];
	}
): Map<string, HotkeyMetaBase> => {
	const res = new Map<string, HotkeyMetaBase>();
	const complementHotkeysByCommandId = isCustom
		? defaultHotkeysByCommandId
		: customHotkeysByCommandId;

	Object.entries(hotkeysByCommandId).forEach(
		([commandId, hotkeys], recordIdx) => {
			const isBaked = isCustom
				? true
				: !customHotkeyCommandIds.has(commandId);
			const keysigs = hotkeys.map((h) => hotkeyToKeysig(h));
			const hotkeyMetaIds = hotkeys.map((_, i) =>
				getHotkeyMetaId(commandId, isCustom, i)
			);
			const complementHotkeys: ObsidianHotkey[] | undefined =
				complementHotkeysByCommandId[commandId];
			const complementHotkeyMetaIds = complementHotkeys?.map((_, i) =>
				getHotkeyMetaId(commandId, !isCustom, i)
			);

			hotkeys.forEach((hotkey, hotkeyIdx) => {
				const keysig = keysigs[hotkeyIdx];
				const hotkeyMetaId = getHotkeyMetaId(
					commandId,
					isCustom,
					hotkeyIdx
				);

				const bakedIdx = isBaked
					? bakedIds
							.map((id, i) => ({ id, i }))
							.filter(({ id }) => id === commandId)?.[hotkeyIdx]
							?.i
					: undefined;
				if (isBaked && bakedIdx === undefined) {
					console.warn(
						"bakedIdx not found for hotkeyIdx " + hotkeyMetaId
					);
				} else if (!isBaked && bakedIdx !== undefined) {
					console.warn(
						"bakedIdx found for non-baked hotkeyMetaId " +
							hotkeyMetaId
					);
				}
				const bakedKeymapInfo =
					bakedIdx !== undefined
						? bakedKeymapInfos[bakedIdx]
						: undefined;
				const bakedKeysig = bakedKeymapInfo
					? keymapInfoToKeysig(bakedKeymapInfo)
					: undefined;

				if (isBaked && !bakedKeymapInfo)
					throw new Error(
						"bakedKeymapInfo not found for hotkeyIdx " + hotkeyIdx
					);
				if (isBaked && !bakedKeysig)
					throw new Error(
						"bakedKeysig not found for hotkeyIdx " + hotkeyIdx
					);

				const duplicateHotkeyMetaIds = hotkeyMetaIds.filter(
					(_, i) => i !== hotkeyIdx && keysigs[i] === keysig
				);

				res.set(hotkeyMetaId, {
					hotkeyMetaId,
					hotkey,
					isCustom,
					commandId,
					hotkeyIdx,
					recordIdx,
					keysig,
					isEnabled: commandCommandIds.has(commandId),
					isBaked,
					complementHotkeyMetaIds,
					duplicateHotkeyMetaIds,
					bakedIdx,
					bakedKeysig,
				});
			});
		}
	);
	return res;
};

const getHotkeyMetaBaseById = (
	hotkeyManager: HotkeyManager,
	commandCommandIds: Set<CommandId>
): Map<string, HotkeyMetaBase> => {
	const context = {
		commandCommandIds,
		customHotkeyCommandIds: new Set(Object.keys(hotkeyManager.customKeys)),
		customHotkeysByCommandId: hotkeyManager.customKeys,
		defaultHotkeysByCommandId: hotkeyManager.defaultKeys,
		bakedIds: hotkeyManager.bakedIds,
		bakedKeymapInfos: hotkeyManager.bakedHotkeys,
	};
	const hotkeyMapCustom = getHotkeyMetaBaseByIdForSource(
		hotkeyManager.customKeys,
		{ ...context, isCustom: true }
	);
	const hotkeyMapDefault = getHotkeyMetaBaseByIdForSource(
		hotkeyManager.defaultKeys,
		{ ...context, isCustom: false }
	);
	const hotkeyMap = new Map([...hotkeyMapCustom, ...hotkeyMapDefault]);
	return hotkeyMap;
};

const getHotkeyMetaBaseByIdCounts = (
	hotkeyMap: Map<string, HotkeyMetaBase>
) => {
	const values = Array.from(hotkeyMap.values());
	return {
		baked: values.filter((h) => h.isBaked).length,
		enabled: values.filter((h) => h.isEnabled).length,
		custom: values.filter((h) => h.isCustom).length,
		default: values.filter((h) => !h.isCustom).length,
	};
};

const getHotkeyMetaIdsByKeysig = (
	hotkeyMetaById: Map<string, HotkeyMetaBase>
) => {
	const res = new Map<Keysig, string[]>();
	for (const [hotkeyId, hotkeyMeta] of hotkeyMetaById.entries()) {
		const keysig = hotkeyMeta.keysig;
		const hotkeyMetaIds = res.get(keysig) ?? [];
		hotkeyMetaIds.push(hotkeyId);
		res.set(keysig, hotkeyMetaIds);
	}
	return res;
};

interface HotkeyRelations {
	keysig: Keysig;
	conflicts: string[] | undefined;
	preConflicts: string[] | undefined;
	remaps: string[] | undefined;
	preRemaps: string[] | undefined;
}

const getHotkeyRelationsByKeysig = (
	hotkeyMetaIdsByKeysig: Map<Keysig, string[]>,
	hotkeyMetaBaseById: Map<string, HotkeyMetaBase>
): Map<Keysig, HotkeyRelations> => {
	const res = new Map<Keysig, HotkeyRelations>();
	for (const [keysig, hotkeyMetaIds] of hotkeyMetaIdsByKeysig.entries()) {
		const metas = hotkeyMetaIds.map((id) => {
			const meta = hotkeyMetaBaseById.get(id);
			if (!meta) throw new Error("meta not found for id " + id);
			return meta;
		});

		const ids = metas.map((m) => m.hotkeyMetaId);
		const maybeConflictIds = metas
			.filter((m) => m.isBaked)
			.map((m) => m.hotkeyMetaId);
		const conflictIds = metas
			.filter((m) => m.isBaked && m.isEnabled)
			.map((m) => m.hotkeyMetaId);
		const maybeRemaps =
			metas.some((m) => m.isBaked) && metas.some((m) => !m.isBaked)
				? metas.map((m) => m.hotkeyMetaId)
				: undefined;
		const remaps =
			metas.some((m) => m.isBaked || m.isEnabled) &&
			metas.some((m) => !m.isBaked && m.isEnabled)
				? metas.map((m) => m.hotkeyMetaId)
				: undefined;

		const value: HotkeyRelations = {
			keysig,
			conflicts: conflictIds.length > 1 ? conflictIds : undefined,
			preConflicts:
				maybeConflictIds.length > 1 ? maybeConflictIds : undefined,
			remaps: remaps ? ids : undefined,
			preRemaps: maybeRemaps ? ids : undefined,
		};
		res.set(keysig, value);
	}
	return res;
};

// const getRemappedDefaultHotkeyMetaIdsByKeysig = (
//   hotkeyMetaIdsByKeysig: Map<Keysig, string[]>,
//   hotkeyMetaBaseById: Map<string, HotkeyMetaBase>
// ) => {
//   const res = new Map<Keysig, string[]>();
//   for (const [keysig, hotkeyMetaIds] of hotkeyMetaIdsByKeysig.entries()) {
//     const baseMetas = hotkeyMetaIds.map((id) => {
//       const meta = hotkeyMetaBaseById.get(id);
//       if (!meta) throw new Error("meta not found for id " + id);
//       return meta;
//     });
//     if (baseMetas.some((m) => m.);
//   }
// }

const getHotkeyMetaById = (
	hotkeyMetaBaseById: Map<string, HotkeyMetaBase>,
	hotkeyMetaIdsByKeysig: Map<Keysig, string[]>,
	hotkeyRelationsByKeysig: Map<Keysig, HotkeyRelations>
): Map<string, HotkeyMeta> => {
	const res = new Map<string, HotkeyMeta>();
	for (const [hotkeyMetaId, hotkeyMeta] of hotkeyMetaBaseById.entries()) {
		const keysig = hotkeyMeta.keysig;
		const relations = hotkeyRelationsByKeysig.get(keysig);
		if (!relations)
			throw new Error("relations not found for keysig " + keysig);

		const conflicts = relations.conflicts
			? relations.conflicts.filter((id) => id !== hotkeyMetaId)
			: [];
		const preConflicts = relations.preConflicts
			? relations.preConflicts.filter((id) => id !== hotkeyMetaId)
			: [];

		const preShadows = hotkeyMeta.complementHotkeyMetaIds
			? hotkeyMeta.complementHotkeyMetaIds
					.map((id) => {
						const m = hotkeyMetaBaseById.get(id);
						if (!m) throw new Error("meta not found for id " + id);
						return m;
					})
					.filter((m) => m.keysig === hotkeyMeta.keysig)
			: [];
		const preShadowIds = preShadows.map((m) => m.hotkeyMetaId);
		const shadows = preShadows.filter(
			(m) => m.isEnabled && hotkeyMeta.isEnabled
		);
		const shadowIds = shadows.map((m) => m.hotkeyMetaId);

		const preRemaps = relations.preRemaps
			? relations.preRemaps
					.map((id) => {
						const m = hotkeyMetaBaseById.get(id);
						if (!m) throw new Error("meta not found for id " + id);
						return m;
					})
					.filter(
						(m) =>
							m.hotkeyMetaId !== hotkeyMetaId &&
							m.isCustom !== hotkeyMeta.isCustom &&
							!preShadowIds.includes(m.hotkeyMetaId)
					)
			: [];
		const remaps = relations.remaps
			? relations.remaps
					.map((id) => {
						const m = hotkeyMetaBaseById.get(id);
						if (!m) throw new Error("meta not found for id " + id);
						return m;
					})
					.filter(
						(m) =>
							m.hotkeyMetaId !== hotkeyMetaId &&
							m.isCustom !== hotkeyMeta.isCustom &&
							!shadowIds.includes(m.hotkeyMetaId)
					)
			: [];

		const value: HotkeyMeta = {
			...hotkeyMeta,
			conflictingHotkeyMetaIds: conflicts,
			preConflictingHotkeyMetaIds: preConflicts,
			remappedHotkeyMetaIds: remaps.map((m) => m.hotkeyMetaId),
			preRemappedHotkeyMetaIds: preRemaps.map((m) => m.hotkeyMetaId),
			shadowHotkeyMetaIds: shadowIds,
			preShadowHotkeyMetaIds: preShadowIds,
		};
		res.set(hotkeyMetaId, value);
	}
	return res;
};

export function getHotkeyTableData(app: App): {
	hotkeyTableData: HotkeyTableDatum[];
	hotkeyMeta: HotkeyMeta[];
} {
	const hotkeyManager = app.hotkeyManager;
	if (!hotkeyManager.baked) hotkeyManager.bake();
	const commandsCommandIds = new Set(Object.keys(app.commands.commands));

	// console.log("unique modifiers", getUniqueModifiers(hotkeyManager));
	const hotkeyCounts = getHotkeyCounts(hotkeyManager);
	const hotkeyMetaBaseById = getHotkeyMetaBaseById(
		hotkeyManager,
		commandsCommandIds
	);
	const hotkeyMetaIdsByKeysig = getHotkeyMetaIdsByKeysig(hotkeyMetaBaseById);
	const hotkeyRelationsByKeysig = getHotkeyRelationsByKeysig(
		hotkeyMetaIdsByKeysig,
		hotkeyMetaBaseById
	);
	const hotkeyMetaById = getHotkeyMetaById(
		hotkeyMetaBaseById,
		hotkeyMetaIdsByKeysig,
		hotkeyRelationsByKeysig
	);

	const hotkeyMapCounts = getHotkeyMetaBaseByIdCounts(hotkeyMetaBaseById);
	console.log("hotkeys: map and counts", {
		hotkeyCounts,
		hotkeyMap: hotkeyMetaBaseById,
		hotkeyMapCounts,
		hotkeyMetaById,
	});

	const bakedCommandIdsByKeysig = getBakedCommandIdsByKeysig(hotkeyManager);

	const expectedBakedCommandIdsByKeysig = getExpectedBakedCommandIdsByKeysig(
		hotkeyManager,
		commandsCommandIds
	);
	const allCommandIdsByKeysig = getAllCommandIdsByKeysig(hotkeyManager);
	const bakedCommandIds = new Set(hotkeyManager.bakedIds);
	const context = {
		bakedCommandIdsByKeysig,
		bakedCommandIds,
		allCommandIdsByKeysig,
		defaultKeys: hotkeyManager.defaultKeys,
		customKeys: hotkeyManager.customKeys,
		commandsCommandIds,
		expectedBakedCommandIdsByKeysig,
		hotkeyManager,
	};
	const res = [
		...parseHotkeysByCommandId(hotkeyManager.customKeys, true, context),
		...parseHotkeysByCommandId(hotkeyManager.defaultKeys, false, context),
	];

	// const resBakedIds = res.filter((d) => d.isBaked).map((d) => d.commandId);

	// return res;
	return {
		hotkeyTableData: res,
		hotkeyMeta: Array.from(hotkeyMetaById.values()),
	};
}
