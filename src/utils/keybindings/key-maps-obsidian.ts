import { HotkeyManager } from "obsidian";
import type {
	ChromeCode,
	ObsidianModifierInternal,
	ObsidianModifierInternalWindows,
} from "@/types/keys";
import { OBSIDIAN_MODIFIERS_INTERNAL } from "@/constants/keys";

export const isObsidianInternalModifier = (
	k: string
): k is ObsidianModifierInternal => {
	return (OBSIDIAN_MODIFIERS_INTERNAL as readonly string[]).includes(k);
};

// TODO: define/use OBSIDIAN_KEYS
export const OBSIDIAN_KEY_TO_CHROME_CODE: Record<string, ChromeCode> =
	Object.entries({
		ArrowDown: "ArrowDown",
		ArrowLeft: "ArrowLeft",
		ArrowRight: "ArrowRight",
		ArrowUp: "ArrowUp",
		A: "KeyA",
		B: "KeyB",
		C: "KeyC",
		D: "KeyD",
		E: "KeyE",
		F: "KeyF",
		G: "KeyG",
		H: "KeyH",
		I: "KeyI",
		J: "KeyJ",
		K: "KeyK",
		L: "KeyL",
		M: "KeyM",
		N: "KeyN",
		O: "KeyO",
		P: "KeyP",
		Q: "KeyQ",
		R: "KeyR",
		S: "KeyS",
		T: "KeyT",
		U: "KeyU",
		V: "KeyV",
		W: "KeyW",
		X: "KeyX",
		Y: "KeyY",
		Z: "KeyZ",
		"0": "Digit0",
		"1": "Digit1",
		"2": "Digit2",
		"3": "Digit3",
		"4": "Digit4",
		"5": "Digit5",
		"6": "Digit6",
		"7": "Digit7",
		"8": "Digit8",
		"9": "Digit9",
		"`": "Backquote",
		"\\": "Backslash",
		"[": "BracketLeft",
		"]": "BracketRight",
		"{": "BracketLeft",
		"}": "BracketRight",
		PageUp: "PageUp",
		PageDown: "PageDown",
		Home: "Home",
		End: "End",
		Insert: "Insert",
		Delete: "Delete",
		Escape: "Escape",
		Backspace: "Backspace",
		Tab: "Tab",
		CapsLock: "CapsLock",
		F1: "F1",
		F2: "F2",
		F3: "F3",
		F4: "F4",
		F5: "F5",
		F6: "F6",
		F7: "F7",
		F8: "F8",
		F9: "F9",
		F10: "F10",
		F11: "F11",
		F12: "F12",
		F13: "F13",
		F14: "F14",
		F15: "F15",
		F17: "F17",
		F16: "F16",
		F18: "F18",
		F19: "F19",
		F20: "F20",
		F21: "F21",
		F22: "F22",
		F23: "F23",
		F24: "F24",
		",": "Comma",
		"-": "Minus",
		".": "Period",
		"/": "Slash",
		";": "Semicolon",
		"=": "Equal",
		Space: "Space",
		Numpad0: "Numpad0",
		Numpad1: "Numpad1",
		Numpad2: "Numpad2",
		Numpad3: "Numpad3",
		Numpad4: "Numpad4",
		Numpad5: "Numpad5",
		Numpad6: "Numpad6",
		Numpad7: "Numpad7",
		Numpad8: "Numpad8",
		Numpad9: "Numpad9",
		"'": "Quote",
		Enter: "Enter",
	}).reduce((acc, [key, value]) => {
		acc[key.toLowerCase()] = value as ChromeCode;
		return acc;
	}, {} as Record<string, ChromeCode>);

export const obsidianInternalModifierToWindowsDict: {
	[P in ObsidianModifierInternal]: ObsidianModifierInternalWindows;
} = {
	Ctrl: "Ctrl",
	Mod: "Ctrl",
	Shift: "Shift",
	Meta: "Meta",
	Alt: "Alt",
};

export const obsidianInternalModifierToWindows = (
	k: ObsidianModifierInternal
) => {
	if (!isObsidianInternalModifier(k)) {
		throw new Error(`Unknown obsidian modifier key: ${k}`);
	}
	return obsidianInternalModifierToWindowsDict[k];
};

// export const OBSIDIAN_MODIFIER_KEYS_MAP: Record<
// 	ObsidianModifierInternal,
// 	ObsidianModifierInternalWindows
// > = {
// 	ctrl: "ctrl",
// 	mod: "alt",
// 	shift: "shift",
// 	meta: "meta",
// 	alt: "alt",
// };

// const mappedKeyCodes = new Set(Object.values(OBSIDIAN_KEY_TO_CHROME_CODE));
// const keyCodes = new Set(CODES_CHROME_CAMEL);
// console.log({
//     mapped:
//         mappedKeyCodes.size, codes: keyCodes.size
// });
// console.log('missing from mapped:');
// for (const code of keyCodes) {
//     if (!mappedKeyCodes.has(code)) {
//         console.log(code);
//     }
// }

// console.log('missing from codes:');
// for (const code of Object.values(mappedKeyCodes)) {
//     if (!keyCodes.has(code)) {
//         console.log(code);
//     }
// }
