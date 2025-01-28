import { NONMOD_KEYS_VSC } from "./vscode-keylist";

export const KB_MOD_KEYS_JSON = ["ctrl", "shift", "alt", "meta", "mod"] as const;
export const KB_MOD_KEYS = ['ctrl', 'shift', 'alt', 'meta'] as const;

export const NONMOD_KEYS = NONMOD_KEYS_VSC.filter(
	(k) =>
		k !== "pausebreak" &&
		k !== "numpad_multiply" &&
		k !== "numpad_add" &&
		k !== "numpad_subtract" &&
		k !== "numpad_decimal" &&
		k !== "numpad_divide" &&
		k !== "numpad_separator" &&
		k !== "numpad0" &&
		k !== "numpad1" &&
		k !== "numpad2" &&
		k !== "numpad3" &&
		k !== "numpad4" &&
		k !== "numpad5" &&
		k !== "numpad6" &&
		k !== "numpad7" &&
		k !== "numpad8" &&
		k !== "numpad9"
);
