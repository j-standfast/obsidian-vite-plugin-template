import { Chord, Settings } from "./newTypes";
import { Command, Modifier, Hotkey, App, KeymapInfo } from "obsidian";
import {
	OBSIDIAN_KEY_TO_CHROME_CODE,
	OBSIDIAN_MODIFIER_KEYS_MAP,
} from "./newConstants";
import {
	Keybinding,
	ModifierKey,
	CodeCamel,
	ChordKeyModifiers,
} from "./newTypes";

const hotkeyToChord = (hotkey: Hotkey): Chord => {
	const modifiers: ChordKeyModifiers = new Map();
	for (const modifier of hotkey.modifiers) {
		const modifierKey =
			OBSIDIAN_MODIFIER_KEYS_MAP[
				modifier.toLowerCase() as Lowercase<Modifier>
			];
		if (!modifierKey) {
			throw new Error(
				`importShortcuts / hotkeyToChord / modifierKey not found: ${modifier}`
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

function importShortcutsFromCommands(app: App) {
	console.log(
		"importShortcutsFromCommands / app.hotkeyManager.bakedIds:",
		app.hotkeyManager.bakedIds
	);
	const missingHotkeys = [];
	const keybindings: Keybinding[] = [];
	for (let i = 0; i < app.hotkeyManager.bakedIds.length; i++) {
		try {
			const commandId = app.hotkeyManager.bakedIds[i];
			const hotkey = app.hotkeyManager.bakedHotkeys[i];
			const command = app.commands.commands[commandId];
			if (!command || !command.hotkeys) {
				missingHotkeys.push(command);
			}
			try {
				const chord = hotkeyToChord(keymapToHotkey(hotkey));
				console.log("importShortcuts / success:", { hotkey, chord });
				keybindings.push({
					id: commandId,
					key: [chord],
				});
			} catch (error) {
				console.log("importShortcuts / error:", { hotkey, error });
			}
		} catch (error) {
			console.log("importShortcutsFromCommands / error:", { error });
		}
	}
	const uniqueCommandIds = new Set(
		keybindings.map((keybinding) => keybinding.id)
    );
    keybindings.sort((a, b) => a.id.localeCompare(b.id));
    const augKB = keybindings.map((kb) => {
        const command = app.commands.commands[kb.id];
        return {
            ...kb,
            commandName: command ? command.name : "unknown",
		};
	}).sort((a, b) => a.commandName.localeCompare(b.commandName));
	console.log("importShortcuts: result", {
		missingHotkeys,
		keybindings: augKB,
		nMissingHotkeys: missingHotkeys.length,
		nKeybindings: keybindings.length,
		nHotkeys: app.hotkeyManager.bakedIds.length,
		nCommandIds: uniqueCommandIds.size,
	});
}

async function importShortcutsWhenReady(app: App) {
	while (!app.hotkeyManager.baked) {
		await new Promise((resolve) => setTimeout(resolve, 100));
	}
	importShortcutsFromCommands(app);
}

export async function importShortcuts(app: App) {
	importShortcutsWhenReady(app);
}