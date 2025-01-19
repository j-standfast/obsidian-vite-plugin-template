import { App } from "obsidian";
import { KeybindingMeta, PluginMeta, CommandMeta } from "src/types";

export const getKeybindingMetaData = (
	app: App,
	pluginData: PluginMeta[],
	commandData: CommandMeta[]
): KeybindingMeta[] => {
	const keybindingData: KeybindingMeta[] = [];
	for (const command of commandData) {
		const defaultHotkeys = app.hotkeyManager.getDefaultHotkeys(command.id);
        const customHotkeys = app.hotkeyManager.getHotkeys(command.id);
        const hotkeys = customHotkeys ?? defaultHotkeys ?? undefined;
        const isDefault = customHotkeys === undefined;
        
        if (!hotkeys) continue;
        // TODO: many things - one is to store the replaced hotkeys
        for (const hotkey of hotkeys) {
            const keysig = hotkey.modifiers.join('+') + '+' + hotkey.key;
            keybindingData.push({
                commandId: command.id,
                commandName: command.name,
                isListed: command.isListed,
                keysig: keysig,
                isDefault: isDefault,
                defaultHotkeys: defaultHotkeys ?? [],
                customHotkeys: customHotkeys ?? [],
            });
        }
	}
	// const keybindings = app.hotkeyManager.
	return keybindingData;
};
