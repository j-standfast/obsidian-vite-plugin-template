import type { Hotkey, KeymapInfo, PluginManifest } from "obsidian";
import type { CommandData, CommandId } from "./command";
import type { Keysig } from "./keybinding";

export type PluginId = string;

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
	commandData: CommandData;
}

export interface PluginMeta {}
