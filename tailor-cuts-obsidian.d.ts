// import "obsidian";
import { Hotkey, KeymapInfo, App, Debouncer } from "obsidian";
declare const customKeysSymbol: unique symbol;
type CustomKeysSymbol = typeof customKeysSymbol;

// !NOTE: these are the types from the obsidian-typings package, corrected below
// /** @public */
// export interface HotkeyManagerCustomKeysRecord extends Record<string, KeymapInfo[]> {
// }
// /** @public */
// export interface HotkeyManagerDefaultKeysRecord extends Record<string, KeymapInfo[]> {
// }

/** @public */
export interface HotkeyManagerCustomKeysRecord
	extends Record<string, Hotkey[]> {}
/** @public */
export interface HotkeyManagerDefaultKeysRecord
	extends Record<string, Hotkey[]> {}

declare module "obsidian" {
  interface KeymapEventHandler {
    func: KeymapEventListener;
  }

  interface HotkeyManager {
		/**
		 * Reference to App
		 */
		app: App;
		/** @internal Whether hotkeys have been baked (checks completed) */
		baked: boolean;
		/**
		 * Assigened hotkeys
		 */
		bakedHotkeys: KeymapInfo[];
		/**
		 * Array of hotkey index to command ID
		 */
		bakedIds: string[];
		/**
		 * Custom (non-Obsidian default) hotkeys, one to many mapping of command ID to assigned hotkey
		 */
    customKeys: HotkeyManagerCustomKeysRecord;
    [customKeysSymbol]: HotkeyManagerCustomKeysRecord;
		/**
		 * Default hotkeys, one to many mapping of command ID to assigned hotkey
		 */
		defaultKeys: HotkeyManagerDefaultKeysRecord;
		/** @internal */
		onConfigFileChange: Debouncer<[], Promise<void>>;
		/**
		 * Add a hotkey to the default hotkeys
		 *
		 * @param command - Command ID to add hotkey to
		 * @param keys - Hotkeys to add
		 */
		// addDefaultHotkeys(command: string, keys: KeymapInfo[]): void;  // !NOTE: corrected
		addDefaultHotkeys(command: string, keys: Hotkey[]): void;
		/** @internal Bake hotkeys (create mapping of pressed key to command ID) */
		bake(): void;
		/**
		 * Get hotkey associated with command ID
		 *
		 * @param command - Command ID to get hotkey for
		 */
		// getDefaultHotkeys(command: string): KeymapInfo[];  // !NOTE: corrected
		getDefaultHotkeys(command: string): Hotkey[];
		/**
		 * Get hotkey associated with command ID
		 *
		 * @param command - Command ID to get hotkey for
		 */
		// getHotkeys(command: string): KeymapInfo[];   // !NOTE: corrected
		getHotkeys(command: string): Hotkey[];
		/** @internal Load hotkeys from storage */
		load(): void; // TODO!: async?
		/** @internal */
		onRaw(e: unknown): void;
		/**
		 * Trigger a command by keyboard event
		 *
		 * @param event - Keyboard event to trigger command with
		 * @param keypress - Pressed key information
		 */
		onTrigger(event: KeyboardEvent, keypress: KeymapInfo): boolean;
		/**
		 * Pretty-print hotkey of a command
		 *
		 * @param commandId - Command ID to print hotkey for
		 */
		printHotkeyForCommand(commandId: string): string;
		/** @internal */
		registerListeners(): void;
		/**
		 * Remove a hotkey from the default hotkeys
		 *
		 * @param command - Command ID to remove hotkey from
		 */
		removeDefaultHotkeys(command: string): void;
		/**
		 * Remove a hotkey from the custom hotkeys
		 *
		 * @param command - Command ID to remove hotkey from
		 */
		removeHotkeys(command: string): void;
		/** @internal Save custom hotkeys to storage */
		save(): void; // TODO!: async?
		/**
		 * Add a hotkey to the custom hotkeys (overrides default hotkeys)
		 *
		 * @param command - Command ID to add hotkey to
		 * @param keys - Hotkeys to add
		 */
		// setHotkeys(command: string, keys: KeymapInfo[]): void;  // !NOTE: corrected
		setHotkeys(command: string, keys: Hotkey[]): void;
	}

	interface Command {
		hotkeys?: Hotkey[];
	}

	interface Plugin {
		_lastDataModifiedTime: number;
		_userDisabled: boolean;
		// _children: Component[];
		// _events: EventRef[];
		// _loaded: boolean;
	}

	interface App {
		hotkeyManager: HotkeyManager;
	}
}
