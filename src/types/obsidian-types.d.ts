import { Modifier, Hotkey, KeymapInfo, Keymap, KeymapEventHandler, Scope, App } from "obsidian";

declare module "obsidian" {
	type CompiledModXX = Exclude<Modifier, "Mod">;
	type CompiledModsXX =
		| ["Alt"]
		| ["Ctrl"]
		| ["Meta"]
		| ["Shift"]
		| ["Alt", "Ctrl"]
		| ["Alt", "Meta"]
		| ["Alt", "Shift"]
		| ["Ctrl", "Meta"]
		| ["Ctrl", "Shift"]
		| ["Meta", "Shift"]
		| ["Alt", "Ctrl", "Meta"]
		| ["Alt", "Ctrl", "Shift"]
		| ["Alt", "Meta", "Shift"]
		| ["Ctrl", "Meta", "Shift"]
		| ["Alt", "Ctrl", "Meta", "Shift"];
	type ConcatModsXX<T extends CompiledModXX[]> = T extends [
		infer U extends CompiledModXX
	]
		? U
		: T extends [infer U extends string, ...infer V extends CompiledModXX[]]
		? `${U},${ConcatModsXX<V>}`
		: never;
	type CompiledModSigXX = ConcatModsXX<CompiledModsXX>;

	interface HotkeysByCommandIdXX extends Record<string, Hotkey[]> {}

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
		customKeys: HotkeysByCommandIdXX;
		// [customKeysSymbol]: HotkeysByCommandIdXX;
		/**
		 * Default hotkeys, one to many mapping of command ID to assigned hotkey
		 */
		defaultKeys: HotkeysByCommandIdXX;
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
		onTrigger(event: KeyboardEvent, keymapInfo: KeymapInfoX): boolean;
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

	namespace Keymap {
		let global: Keymap;
		function compileModifiers(modifiers: Modifier[]): CompiledModSigXX;
		function decompileModifiers(modifiers: CompiledModSigXX): Modifier[];
		function getModifiers(event: KeyboardEvent): CompiledModSigXX;
		function init(): Keymap;
		function isMatch(
			keymapInfo: KeymapInfo,
			keyEventContext: KeyEventContextX
		): boolean;
	}

	interface Keymap {
		modifiers: CompiledModSigXX;
		prevScopes: Scope[];
		rootScope: Scope;
		scope: Scope;
		getRootScope: () => Scope;
		getVirtualKey: (event: KeyboardEvent) => string;
		hasModifier: (modifier: Modifier) => boolean;
		matchModifiers: (modifiers: CompiledModSigXX) => boolean;
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

	interface KeymapInfoX extends KeymapInfo {
		modifiers: CompiledModSigXX;
		key: string; // TODO: refine
	}

	interface KeyEventContextX extends KeymapContext {
		vkey: string;
	}


	type KeymapEventListenerX = (
		event: KeyboardEvent,
		context: KeyEventContextX
	) => false | any;

	interface KeymapEventHandlerX extends KeymapEventListenerX {
		func: KeymapEventListenerX;
	}

	type ModifierKeyXX = "Control" | "Alt" | "Shift" | "Meta" | "OS";

	interface Scope {
		parent?: Scope | undefined;
		keys: KeymapEventHandlerX[];
		tabFocusContainerEl: HTMLElement | null;
		register: (
			modifiers: Modifier[] | null,
			key: string | null,
			func: KeymapEventListener
		) => KeymapEventHandler;
		unregister: (handler: KeymapEventHandler) => void;
		setTabFocusContainerEl: (el: HTMLElement) => void;
		handleKey: (
			event: KeyboardEvent,
			context: KeyEventContextX
		) => false | void;
  }
  
  interface Vault {
    
  }

  interface Workspace {
    scope: Scope;  // TODO: WorkspaceScope
    app: App;
    vault: Vault;
  }
}
