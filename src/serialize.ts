import type { Settings, SettingsSerialized } from "./new/newTypes";
import { DEFAULT_SETTINGS } from "./new/newConstants";
import { SequenceHotkeySerialized, SequenceHotkey } from "./types";
import { KeyChord } from "./KeyChord";

export const serializeSequenceHotkeys = (
	settings: SequenceHotkey[]
): SequenceHotkeySerialized[] => {
	return settings.map((h) => ({
		command: h.command,
		chords: h.chords.map((c) => c.serialize()),
	}));
};

export const deserializeSequenceHotkeys = (
	data: SequenceHotkeySerialized[]
): SequenceHotkey[] => {
	return data.map((h) => ({
		command: h.command,
		chords: h.chords.map((c) => new KeyChord(c)),
	}));
};
