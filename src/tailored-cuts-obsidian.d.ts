import { UserEvent, PaneType, KeymapContext } from "obsidian";
import { Hotkey, App, Debouncer, Modifier } from "obsidian";
declare const customKeysSymbol: unique symbol;

// !NOTE: these are the types from the obsidian-typings package, corrected below
// /** @public */
// export interface HotkeyManagerCustomKeysRecord extends Record<string, KeymapInfo[]> {
// }
// /** @public */
// export interface HotkeyManagerDefaultKeysRecord extends Record<string, KeymapInfo[]> {
// }
export type { Modifier, UserEvent, PaneType, KeymapContext } from "obsidian";

export type ModifierKey = "Control" | "Alt" | "Shift" | "Meta" | "OS";

export type CompiledModifier = Exclude<Modifier, "Mod">;

export type KeymapEventListener = (
	event: KeyboardEvent,
	context: KeyEventContext
) => false | any;

export interface KeymapEventHandler extends KeymapInfo {
	scope: Scope;
	func: KeymapEventListener;
}

export interface Scope {
	parent?: Scope | undefined;
	keys: KeymapEventHandler[];
	tabFocusContainerEl: HTMLElement | null;
	register: (
		modifiers: Modifier[] | null,
		key: string | null,
		func: KeymapEventListener
	) => KeymapEventHandler;
	unregister: (handler: KeymapEventHandler) => void;
	setTabFocusContainerEl: (el: HTMLElement) => void;
	handleKey: (event: KeyboardEvent, context: KeyEventContext) => false | void;
}

export type KeyEventContext = {
	key: string;
	modifiers: CompiledModifierString;
	vkey: string;
};

// All possible pairs, sorted
type TwoCompiledModifiers =
	| "Alt,Ctrl"
	| "Alt,Meta"
	| "Alt,Shift"
	| "Ctrl,Meta"
	| "Ctrl,Shift"
	| "Meta,Shift";

// All possible triples, sorted
type ThreeCompiledModifiers =
	| "Alt,Ctrl,Meta"
	| "Alt,Ctrl,Shift"
	| "Alt,Meta,Shift"
	| "Ctrl,Meta,Shift";

// All four, sorted
type FourCompiledModifiers = "Alt,Ctrl,Meta,Shift";

// Empty string is also valid
export type CompiledModifierString =
	| ""
	| CompiledModifier
	| TwoCompiledModifiers
	| ThreeCompiledModifiers
	| FourCompiledModifiers;

export interface KeymapInfo {
	key: string | null;
	modifiers: CompiledModifierString | null;
}

/** @public */
export interface HotkeyManagerCustomKeysRecord
	extends Record<string, Hotkey[]> {}
/** @public */
export interface HotkeyManagerDefaultKeysRecord
	extends Record<string, Hotkey[]> {}

export class Keymap {
	static global: Keymap;

	static compileModifiers(modifiers: Modifier[]): CompiledModifierString;

	static decompileModifiers(modifiers: CompiledModifierString): Modifier[];
	/**
	 *
	 */

	static getModifiers: (event: KeyboardEvent) => CompiledModifierString;

	static init(): Keymap;

	static isMatch: (
		keymapInfo: KeymapInfo,
		keyEventContext: KeyEventContext
	) => boolean;

	/**
	 * Translates an event into the type of pane that should open.
	 * Returns 'tab' if the modifier key Cmd/Ctrl is pressed OR if this is a middle-click MouseEvent.
	 * Returns 'split' if Cmd/Ctrl+Alt is pressed.
	 * Returns 'window' if Cmd/Ctrl+Alt+Shift is pressed.
	 * @public
	 * */
	static isModEvent(evt?: UserEvent | null): PaneType | false;

	/**
	 * Checks whether the modifier key is pressed during this event.
	 * @public
	 */
	static isModifier(
		evt: MouseEvent | TouchEvent | KeyboardEvent,
		modifier: Modifier
	): boolean;

	static isModifierKey: (key: string | null) => key is ModifierKey;

	modifiers: CompiledModifierString;
	prevScopes: Scope[];
	rootScope: Scope;
	scope: Scope;

	getRootScope: () => Scope;

	getVirtualKey: (event: KeyboardEvent) => string;

	hasModifier: (modifier: Modifier) => boolean;

	matchModifiers: (modifiers: CompiledModifierString) => boolean;
	/**
	 * Push a scope onto the scope stack, setting it as the active scope to handle all key events.
	 * @public
	 */

	onFocusIn: (event: FocusEvent) => void;
	/**
	 * @internal
	 * callback for keydown event listener registered by constructor
	 * calls the internal updateModifiers(event)
	 * calls (non-public) extractKey(event)
	 * if the extracted key is a modifier keydown, returns void
	 * otherwise, constructs a KeyEventContext and passes to the active scope's handleKey
	 * if handleKey callback returns false, consumes the event (prevents default and stops propagation) and returns false
	 * otherwise, returns undefined/void
	 */

	onKeyEvent: (event: KeyboardEvent) => false | void;
	/* @internal */

	popScope(scope: Scope): void;

	pushScope(scope: Scope): void;
	/**
	 * Remove a scope from the scope stack.
	 * If the given scope is active, the next scope in the stack will be made active.
	 * @public
	 */

	updateModifiers: (event: KeyboardEvent) => void;
}

declare module "obsidian" {
	interface KeymapEventInfo {}

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
		 * Assigned hotkeys
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
		/** @internal
		 * debounced callback for hotkey config file changes
		 * calls `load()`
		 */
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
		 * Get default hotkey associated with command ID
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
		/** @internal Load hotkeys from storage
		 * note that this is async (returns a promise), which is not how it's typed by Obsidian/fevol
		 * */
		load(): Promise<void>;
		/** @Internal
		 * callback registered with `app.vault.on('raw', ...)`
		 * checks if the changed file is the user's hotkey config file
		 * if so, calls `onConfigFileChange()`
		 */
		onRaw(e: unknown): void;
		/**
		 * Trigger a command by keyboard event
		 *
		 * @param event - Keyboard event to trigger command with
		 * @param keymapInfo - Pressed key information
		 */
		onTrigger(event: KeyboardEvent, keymapInfo: ObsKeymapInfo): boolean;
		/**
		 * Pretty-print hotkey of a command
		 *
		 * @param commandId - Command ID to print hotkey for
		 */
		printHotkeyForCommand(commandId: string): string;
		/** @internal
		 * invoked during initialization
		 * passes `onRaw` to `app.vault.on('raw', ...)`
		 */
		registerListeners(): void;
		/**
		 * Remove a hotkey from the default hotkeys
		 *
		 * @param commandId - Command ID to remove hotkey from
		 */
		removeDefaultHotkeys(commandId: string): void;
		/**
		 * Remove a hotkey from the custom hotkeys
		 *
		 * @param commandId - Command ID to remove hotkey from
		 */
		removeHotkeys(commandId: string): void;
		/** @internal Save custom hotkeys to storage
		 * note that this is async (returns a promise), which is not how it's typed by Obsidian/fevol
		 */
		save(): Promise<void>;
		/**
		 * Add a hotkey to the custom hotkeys (overrides default hotkeys)
		 *
		 * @param commandId - Command ID to add hotkey to
		 * @param hotkeys - Hotkeys to add
		 */
		setHotkeys(commandId: string, hotkeys: Hotkey[]): void;
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