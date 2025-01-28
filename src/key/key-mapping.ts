import { MOD_KEYS_OBS_JSON, NONMOD_KEYS_OBS } from "./keylist/obsidian-keylist";
import { KB_MOD_KEYS_JSON, NONMOD_KEYS } from "./keylist/this-plugin-keylist";

export type ObsJsonModifier = (typeof MOD_KEYS_OBS_JSON)[number];

type ObsJsonToObsInternalModifierKeymapBase = {
	Ctrl: "Ctrl";
	Shift: "Shift";
	Alt: "Alt";
	Mod: "Ctrl";
	Meta: "Meta";
};

export type ObsJsonToObsInternalModifierKeymap<
	K extends ObsJsonModifier = ObsJsonModifier
> = {
	[P in K]: ObsJsonToObsInternalModifierKeymapBase[P];
};

export type ObsJsonToObsInternalModifier<
	K extends ObsJsonModifier = ObsJsonModifier
> = ObsJsonToObsInternalModifierKeymap[K];

export const VSC_WINDOWS_TO_OBS_MODIFIERS_KEYMAP: VscWindowsToObsModifierKeymap =
	{
		Ctrl: "Ctrl",
		Shift: "Shift",
		Alt: "Alt",
		Win: "Meta",
	};

export const OBS_JSON_TO_OBS_INTERNAL_MODIFIERS_KEYMAP: ObsJsonToObsInternalModifierKeymap =
	{
		Ctrl: "Ctrl",
		Shift: "Shift",
		Alt: "Alt",
		Mod: "Ctrl",
		Meta: "Meta",
	};

type VscWindowsToObsModifierKeymapBase = {
	Ctrl: "Ctrl";
	Shift: "Shift";
	Alt: "Alt";
	Win: "Meta";
};

export type VscWindowsModifier = (typeof MOD_KEYS_VSC)[number];
export type ObsModifierInternal =
	VscWindowsToObsModifierKeymapBase[VscWindowsModifier];

export type VscWindowsToObsModifierKeymap<
	K extends VscWindowsModifier = VscWindowsModifier
> = {
	[P in K]: VscWindowsToObsModifierKeymapBase[P];
};
export type VscToObsWindowsModifier<
	K extends VscWindowsModifier = VscWindowsModifier
> = VscWindowsToObsModifierKeymap[K];

export type ObsToVscWindowsModifierKeymap<
	K extends VscWindowsModifier = VscWindowsModifier
> = {
	[P in K as VscToObsWindowsModifier<P>]: P;
};
// export type ObsidianWindowsModifier = keyof ObsidianToVSCodeWindowsModifierMap;
export type ObsToVscWindowsModifier<
	K extends ObsModifierInternal = ObsModifierInternal
> = ObsToVscWindowsModifierKeymap[K];

type VscToObsNonmodKeymapBase = {
	f1: "F1";
	f2: "F2";
	f3: "F3";
	f4: "F4";
	f5: "F5";
	f6: "F6";
	f7: "F7";
	f8: "F8";
	f9: "F9";
	f10: "F10";
	f11: "F11";
	f12: "F12";
	f13: "F13";
	f14: "F14";
	f15: "F15";
	f16: "F16";
	f17: "F17";
	f18: "F18";
	f19: "F19";
	a: "A";
	b: "B";
	c: "C";
	d: "D";
	e: "E";
	f: "F";
	g: "G";
	h: "H";
	i: "I";
	j: "J";
	k: "K";
	l: "L";
	m: "M";
	n: "N";
	o: "O";
	p: "P";
	q: "Q";
	r: "R";
	s: "S";
	t: "T";
	u: "U";
	v: "V";
	w: "W";
	x: "X";
	y: "Y";
	z: "Z";
	"0": "0";
	"1": "1";
	"2": "2";
	"3": "3";
	"4": "4";
	"5": "5";
	"6": "6";
	"7": "7";
	"8": "8";
	"9": "9";
	"`": "`";
	"-": "-";
	"=": "=";
	"[": "[";
	"]": "]";
	"\\": "\\";
	";": ";";
	"'": "'";
	",": ",";
	".": ".";
	"/": "/";
	left: "ArrowLeft";
	up: "ArrowUp";
	right: "ArrowRight";
	down: "ArrowDown";
	pageup: "PageUp";
	pagedown: "PageDown";
	end: "End";
	home: "Home";
	tab: "Tab";
	enter: "Enter";
	escape: "Escape";
	space: "Space";
	backspace: "Backspace";
	delete: "Delete";
	// pausebreak: 'Pause', // TODO? does not exist in obsidian?
	capslock: "CapsLock";
	insert: "Insert";
	numpad0: "Numpad0";
	numpad1: "Numpad1";
	numpad2: "Numpad2";
	numpad3: "Numpad3";
	numpad4: "Numpad4";
	numpad5: "Numpad5";
	numpad6: "Numpad6";
	numpad7: "Numpad7";
	numpad8: "Numpad8";
	numpad9: "Numpad9";
	numpad_multiply: "NumpadMultiply";
	numpad_add: "NumpadAdd";
	numpad_separator: "NumpadSeparator";
	numpad_subtract: "NumpadSubtract";
	numpad_decimal: "NumpadDecimal";
	numpad_divide: "NumpadDivide";
};

export const VSC_TO_OBS_NONMOD_KEYMAP: VscToObsNonmodKeymap = {
	f1: "F1",
	f2: "F2",
	f3: "F3",
	f4: "F4",
	f5: "F5",
	f6: "F6",
	f7: "F7",
	f8: "F8",
	f9: "F9",
	f10: "F10",
	f11: "F11",
	f12: "F12",
	f13: "F13",
	f14: "F14",
	f15: "F15",
	f16: "F16",
	f17: "F17",
	f18: "F18",
	f19: "F19",
	a: "A",
	b: "B",
	c: "C",
	d: "D",
	e: "E",
	f: "F",
	g: "G",
	h: "H",
	i: "I",
	j: "J",
	k: "K",
	l: "L",
	m: "M",
	n: "N",
	o: "O",
	p: "P",
	q: "Q",
	r: "R",
	s: "S",
	t: "T",
	u: "U",
	v: "V",
	w: "W",
	x: "X",
	y: "Y",
	z: "Z",
	"0": "0",
	"1": "1",
	"2": "2",
	"3": "3",
	"4": "4",
	"5": "5",
	"6": "6",
	"7": "7",
	"8": "8",
	"9": "9",
	"`": "`",
	"-": "-",
	"=": "=",
	"[": "[",
	"]": "]",
	"\\": "\\",
	";": ";",
	"'": "'",
	",": ",",
	".": ".",
	"/": "/",
	left: "ArrowLeft",
	up: "ArrowUp",
	right: "ArrowRight",
	down: "ArrowDown",
	pageup: "PageUp",
	pagedown: "PageDown",
	end: "End",
	home: "Home",
	tab: "Tab",
	enter: "Enter",
	escape: "Escape",
	space: "Space",
	backspace: "Backspace",
	delete: "Delete",
	// pausebreak: 'Pause', // TODO? does not exist in obsidian?
	capslock: "CapsLock",
	insert: "Insert",
	numpad0: "Numpad0",
	numpad1: "Numpad1",
	numpad2: "Numpad2",
	numpad3: "Numpad3",
	numpad4: "Numpad4",
	numpad5: "Numpad5",
	numpad6: "Numpad6",
	numpad7: "Numpad7",
	numpad8: "Numpad8",
	numpad9: "Numpad9",
	numpad_multiply: "NumpadMultiply",
	numpad_add: "NumpadAdd",
	numpad_separator: "NumpadSeparator",
	numpad_subtract: "NumpadSubtract",
	numpad_decimal: "NumpadDecimal",
	numpad_divide: "NumpadDivide",
} as const;

export type VscNonmodKey = keyof VscToObsNonmodKeymapBase;
export type VscToObsNonmodKey<K extends VscNonmodKey = VscNonmodKey> =
	VscToObsNonmodKeymapBase[K];
export type VscToObsNonmodKeymap<K extends VscNonmodKey = VscNonmodKey> = {
	[P in K]: VscToObsNonmodKey<P>;
};

export type ObsToVscNonmodKeymap<K extends VscNonmodKey = VscNonmodKey> = {
	[P in K as VscToObsNonmodKey<P>]: P;
};
export type ObsNonmodKey = keyof ObsToVscNonmodKeymap;
export type ObsToVscNonmodKey<K extends ObsNonmodKey = ObsNonmodKey> =
	ObsToVscNonmodKeymap[K];

export const obsNonmodToUnlowercaseKeymap: ObsNonmodToUnlowerCaseKeymap =
	NONMOD_KEYS_OBS.reduce((acc, key) => {
		// @ts-ignore
		acc[key.toLowerCase()] = key;
		// @ts-ignore
		acc[key] = key;
		return acc;
	}, {} as ObsNonmodToUnlowerCaseKeymap);

export const obsToVscNonmodKeymap: ObsToVscNonmodKeymap = Object.entries(
	VSC_TO_OBS_NONMOD_KEYMAP
).reduce((acc, [key, value]) => {
	// @ts-ignore
	acc[value] = key;
	return acc;
}, {} as ObsToVscNonmodKeymap);

export const obsToVscNonmodKey = <T extends ObsNonmodKey>(
	key: T
): ObsToVscNonmodKey<T> => {
	const res = obsToVscNonmodKeymap[key];
	if (res === undefined) {
		throw new Error(`Key ${key} not found in obsToVscNonmodKeymap`);
	}
	return res;
};

export const obsNonmodToUnlowercaseKey = <T extends Lowercase<ObsNonmodKey>>(
	key: T
): ObsNonmodToUnlowerCaseKeymap[T] => {
	const res = obsNonmodToUnlowercaseKeymap[key];
	if (res === undefined) {
		throw new Error(`Key ${key} not found in obsNonmodToUnlowercaseKeymap`);
	}
	return res;
};

type ObsNonmodLowercaseKey = Lowercase<ObsNonmodKey>;
export type ObsNonmodToLowercaseKeymapBase<
	K extends ObsNonmodKey = ObsNonmodKey
> = {
	[P in K]: Lowercase<P>;
};
type ObsNonmodToUnloweredcaseKeymapBase<K extends ObsNonmodKey = ObsNonmodKey> =
	{
		[P in K as ObsNonmodToLowercaseKeymapBase[P]]: P;
	};
export type ObsNonmodToUnlowerCaseKeymap<
	K extends ObsNonmodKey | ObsNonmodLowercaseKey =
		| ObsNonmodKey
		| ObsNonmodLowercaseKey
> = {
	[P in K]: P extends ObsNonmodLowercaseKey
		? ObsNonmodToUnloweredcaseKeymapBase[P]
		: P;
};
type ObsNonmodToLowercaseKeymap<
	K extends ObsNonmodKey | ObsNonmodLowercaseKey =
		| ObsNonmodKey
		| ObsNonmodLowercaseKey
> = {
	[P in K]: P extends ObsNonmodKey ? ObsNonmodToLowercaseKeymapBase[P] : P;
};
