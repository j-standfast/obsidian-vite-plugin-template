import type { Command, Hotkey, KeymapInfo, PluginManifest } from "obsidian";

import {
	CODES_CHROME_CAMEL,
	MODIFIER_CODES_CHROME_CAMEL,
	MODIFIER_KEYS,
} from "@/constants/constants";
import { isCodeCamel } from "@/utils/serialize";

// utility / test types
export type Expect<T extends true> = T;
export type CoExtends<T, U> = [T] extends [U]
	? [U] extends [T]
		? true
		: false
	: false;

// keycodes, chords, sequences
export type ModifierCodeCamel = (typeof MODIFIER_CODES_CHROME_CAMEL)[number];
export type ModifierKey = (typeof MODIFIER_KEYS)[number];
export type CodeCamel = (typeof CODES_CHROME_CAMEL)[number];
export type ChordKeyModifiers = Map<ModifierKey, true>;
export type ValidChord = {
	modifiers: ChordKeyModifiers;
	base: CodeCamel;
	type: "valid";
};
export type InvalidChord = {
	modifiers: ChordKeyModifiers;
	base: undefined;
	type: "invalid base" | "modifier event" | "keyup event";
};
export type Chord = ValidChord | InvalidChord;

export interface SerializedKeybinding {
	id: string;
	key: string;
}

// shared
export interface Keybinding {
	id: string; // TODO kick this out no - because can be more than one
	key: Chord[];
}

export type SerializedHotkeys = Record<string, Hotkey[]>;

export interface SerializedSettings {
	keybindings: SerializedKeybinding[];
	obsidianHotkeys: SerializedHotkeys;
}

export interface TailorCutsSettings {
	keybindings: Keybinding[];
	obsidianHotkeys: SerializedHotkeys;
}

export interface CommandData extends Command {
	id: string;
	name: string;
	pluginId?: PluginId;
	pluginType?: "core" | "community";
	pluginEnabled?: boolean;
	idContext: string[] | undefined; // computed
	nameContext: string[] | undefined; // computed

	// computed
	// context
	// context/plugin match
	// isInternal
	// isCommunity
	// hasCallback: boolean;
	// hasCheckCallback: boolean;
	// hasEditorCallback: boolean;
	// hasEditorCheckCallback: boolean;

	isIn: {
		appCommand: boolean;
		appEditorCommand: boolean;
		internalPluginCommand: boolean;
		foundCommand: boolean;
		listedCommand: boolean;
	};
	appCommandEqualityChecks: {
		appEditorCommand: boolean | undefined;
		internalPluginCommand: boolean | undefined;
		foundCommand: boolean | undefined;
		listedCommand: boolean | undefined;
	};
}

export interface EqualityChecks {
	default: boolean | undefined;
	custom: boolean | undefined;
}
interface HotkeysAlternates {
	default: Hotkey[] | undefined;
	custom: Hotkey[] | undefined;
}
export interface CommandHotkeyData {
	id: string;
	getFn: HotkeysAlternates;
	obj: HotkeysAlternates;
	command: HotkeysAlternates & { custom: undefined };
	equalityChecks: {
		fnObj: EqualityChecks;
		fnObjStrict: EqualityChecks;
		fnCommand: EqualityChecks;
	};
}

export interface CommandPluginData {
	id: string;
	isInPlugin: boolean; // only for internal plugins
	isPluginEnabled: boolean | undefined;
	pluginCommandEquality: boolean | undefined;
}

export interface FutureCommandMetaData {
	id: string;
	tags: string[];
	context: string; // user picks, we check vs command checks; see scope in workspace and app? also recent commandds and keys
	planes: string[];
	hasConflicts: boolean;
	conflicts: unknown[];
	vsCodeAnalogs: string[];
	vimAnalogs: string[];
	emacsAnalogs: string[];
}

/**
 * future tests:
 * conforms to VSCode requirements
 * keyboard shit worked out
 *
 */

export interface PluginMeta {}

export type CommandId = string;
export type PluginId = string;
export type Keysig = string;

export interface InternalPluginData {
	type: "core";
	id: string;

	// properties from app.internalPlugins.plugins
	topLevelEnabledStatus: boolean | undefined; //
	// isInManifests: undefined; // no manifests in app.internalPlugins.manifests / for consistency with CommunityPluginMeta
	// not present app.internalPlugins

	// isInLookup
	isInLookup: boolean; // true if present in app.internalPlugins.plugins (Record<PluginId, Plugin>)
	// TODO isEnabled: boolean; // true if isInLookup & isEnabledInLookup

	// properties from app.internalPlugins.plugins[pluginId]
	commandIds: string[] | undefined; // array of commandIds, mapped from app.internalPlugins.plugins[pluginId].commands
	hasInstance: boolean | undefined; // true if isInLookup & plugin.instance is defined
	isEnabledInLookup: boolean | undefined; // true if isInLookup & isEnabledInLookup
	isLoaded: boolean | undefined; // true if isInLookup & isLoaded
	// isUserDisabled: undefined;
	lastSave: number | null | undefined; // enabled: number/timestamp (.lastSave), or null where Obsidian has 0; disabled: undefined
	nChildren: number | undefined; // enabled: number (._children.length); disabled: undefined
	nEvents: number | undefined; // enabled: number (._events.length); disabled: undefined

	// hasInstance
	// instance ~ manifest for community
	defaultOn: boolean | undefined; // boolean if hasInstance; note that this is optional in Obsidian object; we reserve undefined no instance
	description: string | undefined; // plugin.instance.description if present
	name: string | undefined; // plugin.instance.name if present
	// authorUrl: undefined;
	// dir: undefined;
	// fundingUrl: undefined;
	// isDesktopOnly: undefined;
	// minAppVersion: undefined;
	// version: undefined; // plugin.instance.version if present
}

// isEnabled: boolean; // for community plugins, this <-> isInLookup  // TODO
export interface CommunityPluginData extends PluginManifest {
	type: "community";
	id: string;

	// properties from app.plugins
	topLevelEnabledStatus: boolean;
	isInManifests: boolean; // present in app.plugins.manifests (Record<PluginId, PluginManifest>)

	// if present in app.plugins.plugins (Record<PluginId, Plugin>)
	isInLookup: boolean; // for community plugins, this <-> isEnabled

	// properties from app.plugins.plugins[pluginId]
	// in all cases, undefined <-> disabled
	// commandIds: undefined; // array of commandIds, mapped from app.plugins.plugins[pluginId].commands
	// hasInstance: undefined;
	isEnabledInLookup: undefined; // true if isInLookup & isEnabledInLookup
	isLoaded: boolean | undefined; // enabled: boolean (._loaded); disabled: undefined
	isUserDisabled: boolean | undefined; // enabled: boolean (._userDisabled); disabled: undefined
	lastDataModifiedTime: number | null | undefined; // enabled: number/timestamp (._lastDataModifiedTime), or null where Obsidian has 0; disabled: undefined
	nChildren: number | undefined; // enabled: number (._children.length); disabled: undefined
	nEvents: number | undefined; // enabled: number (._events.length); disabled: undefined
	// hasInstance: undefined;

	// properties from PluginManifest (for explicitness)
	// defaultOn: undefined;
	description: string;
	author: string;
	authorUrl: string | undefined;
	dir: string | undefined;
	fundingUrl: string | undefined;
	isDesktopOnly: boolean | undefined;
	minAppVersion: string;
	name: string;
	version: string;
}

export type PluginData = InternalPluginData | CommunityPluginData;
type OptionalPluginData = {
	[P in
		| keyof InternalPluginData
		| keyof CommunityPluginData as P extends keyof PluginData
		? never
		: P]?: P extends keyof InternalPluginData
		? InternalPluginData[P] | undefined
		: P extends keyof CommunityPluginData
		? CommunityPluginData[P] | undefined
		: never;
};
export type LoosePluginData = Omit<PluginData & OptionalPluginData, never>;

export interface KeybindingMeta {
	commandId: string;
	commandName: string;
	keysig: string;
	isDefault: boolean;
	isListed: boolean;
	defaultHotkeys: Hotkey[];
	customHotkeys: Hotkey[];
}

// export interface Command {
//     id: string;
//     name: string;
//     icon?: IconName;
//     mobileOnly?: boolean;
//     repeatable?: boolean;
//     callback?: () => any;
//     checkCallback?: (checking: boolean) => boolean | void;
//     editorCallback?: (editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => any;
//     editorCheckCallback?: (checking: boolean, editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => boolean | void;
//     hotkeys?: Hotkey[];
// }

export type PluginKeybindings = Map<Keysig, CommandId[]>;
// export type PluginScancodebindings = Map<Scancodesig, CommandId>;

export interface KeybindingDatumWithoutConflicts {
	keysig: Keysig;
	commandId: CommandId;
	hotkey: Hotkey;
	keymapInfo: KeymapInfo;
	bakedHotkeyIdx: number;
	bakedHotkeyId: string | undefined;
	isDefault: boolean;
}

export interface KeybindingDatum extends KeybindingDatumWithoutConflicts {
	conflictsWith: Keysig[];
}
