import type { App } from "obsidian";
import { CommandMeta, PluginMeta } from "src/types";

// TODO: struggling to import this from obsidian-typings
type InternalPluginNameType = keyof typeof app.internalPlugins.config;

export const getInternalPluginMetaData = (
    app: App,
    commandData: CommandMeta[]
): PluginMeta[] => {
    return Object.values(app.internalPlugins.plugins).map((plugin) => {
        // console.log({plugin});
        const id = plugin.instance.id;
        const isEnabled = app.internalPlugins.config[id as InternalPluginNameType];
        const version = app.title.split(' ').at(-1)?.slice(1) ?? ''; 
        return {
            id: plugin.instance.id,
            name: plugin.instance.name,
            description: plugin.instance.description,
            isEnabled: isEnabled, 
            isInternal: true,
            isInstantiated: undefined,  // TODO: unsure about this
            isLoaded: plugin._loaded,
            isUserDisabled: undefined,  // TODO: unsure about this
            lastDataModifiedTime: typeof plugin.lastSave === 'number' ? new Date(plugin.lastSave) : plugin.lastSave,
            author: 'Obsidian',
            version: version,
            minAppVersion: version,
        }
	});
};
export const getCommunityPluginMetaData = (
	app: App,
	commandData: CommandMeta[]
): PluginMeta[] => {
	// app.plugins.plugins is ~Record<PluginId, Plugin> - all plugins that are/were enabled this session
	// app.plugins.manifests is ~Record<PluginId, PluginManifest> - all installed plugins
	// app.plugins.enabledPlugins is Set<PluginId> - all plugins that are currently enabled
    const manifestIds = Object.values(app.plugins.manifests).map((m) => m.id);
    // console.log('getCommunityPluginMetaData', {
    //     manifestIds,
    // });
    const pluginData = manifestIds.map((manifestId) => {
        const manifest = app.plugins.manifests[manifestId];
        const instance = app.plugins.plugins[manifest.id];
        let isEnabled: boolean | undefined;
        try {
            isEnabled = app.plugins.enabledPlugins.has(manifest.id);
        } catch (e) {
            console.error(e);
        }
		return {
			...manifest,
            isEnabled: isEnabled,
			isInternal: false,
            isInstantiated: manifest.id in app.plugins.plugins, 
            isLoaded: instance ? instance._loaded : undefined, 
			isUserDisabled: instance ? instance._userDisabled : false,
			lastDataModifiedTime: instance ?
				typeof instance._lastDataModifiedTime === 'number' ? new Date(instance._lastDataModifiedTime) : null
				: undefined,
		};
	});
	return pluginData;
};

export const getPluginMetaData = (
	app: App,
	commandData: CommandMeta[]
): PluginMeta[] => {
	return [
		...getInternalPluginMetaData(app, commandData),
		...getCommunityPluginMetaData(app, commandData),
	];
};
