import { Modifier } from "obsidian";

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
	type ConcatMods<T extends CompiledModXX[]> = T extends [
		infer U extends CompiledModXX
	]
		? U
		: T extends [infer U extends string, ...infer V extends CompiledModXX[]]
		? `${U},${ConcatMods<V>}`
		: never;
	type CompiledModSig = ConcatMods<CompiledModsXX>;
}
