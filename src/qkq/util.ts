import type { Command } from "obsidian";
import type { SequenceHotkey } from "./types";
import type { KeyChord } from "./KeyChord";
import { CODE_STR_MAP } from "./constants";

export const codeToString = (e: string): string => CODE_STR_MAP.get(e) || e;

export const isModifier = (key: string): boolean => {
	switch (key) {
		case "Control":
		case "Alt":
		case "Shift":
		case "Meta":
		case "ControlLeft":
		case "AltLeft":
		case "ShiftLeft":
		case "MetaLeft":
		case "ControlRight":
		case "AltRight":
		case "ShiftRight":
		case "MetaRight":
			return true;
		default:
			return false;
	}
};

export const keySequenceEqual = (a: KeyChord[], b: KeyChord[]): boolean =>
	a.length === b.length && a.every((c, i) => c.equals(b[i]));

export const keySequencePartiallyEqual = (
	a: KeyChord[],
	b: KeyChord[]
): boolean => {
	if (a.length === 0 || b.length === 0) {
		// Empty sequence always returns false
		return false;
	}
	if (a.length > b.length) {
		// If a is longer, check that every chord in b matches a
		return b.every((c, i) => c.equals(a[i]));
	}
	// If b is longer, check that every chord in a matches b
	return a.every((c, i) => c.equals(b[i]));
};

export function allCommands(app: any): Command[] {
	const commands: Command[] = Object.values((app as any).commands.commands);
	commands.sort((a: Command, b: Command): number =>
		a.name.localeCompare(b.name)
	);
	return commands;
}

export const commandName = (app: any, id: string): string | undefined =>
	allCommands(app).find((c: Command) => c.id === id)?.name;

export const hotkeysForCommand = (
	s: SequenceHotkeysSettings,
	id: string
): SequenceHotkey[] =>
	s.hotkeys.filter((h: SequenceHotkey) => h.command === id);

export const hotkeysEqual = (a: SequenceHotkey, b: SequenceHotkey): boolean =>
	a.command === b.command && keySequenceEqual(a.chords, b.chords);
