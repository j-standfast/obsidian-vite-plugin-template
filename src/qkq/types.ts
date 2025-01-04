import type { KeyChord } from "./KeyChord";

export interface SequenceHotkey {
	command: string;
	chords: KeyChord[];
}

export interface SequenceHotkeySerialized {
	// The command id
	command: string;
	// The serialized chords
	chords: string[];
}

export interface CommandSettingHotkey {
	chords: KeyChord[];
	warning: string;
}

export type FilterOption = "All" | "Assigned" | "Unassigned";

// used in plugin settings panel
export interface IAppState {
	filter: string; // query string
	filterOption: FilterOption;
}
