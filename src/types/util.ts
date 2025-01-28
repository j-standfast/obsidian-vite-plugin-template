import type { Command, Hotkey, KeymapInfo, PluginManifest } from "obsidian";

// utility / test types
export type Expect<T extends true> = T;

export type CoExtends<T, U> = [T] extends [U]
	? [U] extends [T]
		? true
		: false
	: false;