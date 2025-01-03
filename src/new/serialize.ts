import type {
	CodeCamel,
	Chord,
	ChordKeyModifiers,
	ModifierCodeCamel,
	ModifierKey,
	KeybindingSerialized,
	Keybinding,
	ValidChord,
} from "./newTypes";
import {
	CODES_CHROME_CAMEL,
	MODIFIER_CODES_CHROME_CAMEL,
	MODIFIER_KEYS,
} from "./newConstants";

export const isModifierCodeCamel = (v: unknown): v is ModifierCodeCamel =>
	MODIFIER_CODES_CHROME_CAMEL.some((c) => c === v);
const isModifierKey = (v: unknown): v is ModifierKey =>
	MODIFIER_KEYS.some((k) => k === v);
export const isCodeCamel = (code: unknown): code is CodeCamel => {
	return (
		typeof code === "string" &&
		CODES_CHROME_CAMEL.includes(code as CodeCamel)
	);
};

const KEY_DELIMITER = "+";
const CHORD_DELIMITER = " ";
export const deserializeChord = (s: string): ValidChord => {
	const modifiers: ChordKeyModifiers = new Map();
	let code: CodeCamel | undefined = undefined;

	for (const k of s.split(KEY_DELIMITER)) {
		if (isModifierKey(k)) {
			modifiers.set(k, true);
			continue;
		}
		if (!isCodeCamel(k)) {
			throw new Error(`Invalid code ${k} in chord`);
		}
		if (code !== undefined) {
			throw new Error(`multiple non-modifier codes: ${code} and ${k}`);
		}
		code = k;
	}

	if (code === undefined) {
		throw new Error("no non-modifier code in chord");
	}
	return {
		modifiers: modifiers,
		base: code,
		type: "valid",
	};
};

export const deserializeKey = (k: string): Chord[] => {
	const chords: Chord[] = [];
	for (const c of k.split(CHORD_DELIMITER)) {
		try {
			chords.push(deserializeChord(c));
		} catch (error) {
			throw error;
		}
	}
	if (chords.length === 0) {
		throw new Error("no chords in keybinding");
	}
	return chords;
};

export const deserializeKeybinding = (s: KeybindingSerialized): Keybinding => {
	return {
		key: deserializeKey(s.key),
		id: s.id,
	};
};

export const deserializeKeybindings = (
	kbs: KeybindingSerialized[]
): Keybinding[] => {
	const res: Keybinding[] = [];
	const errors: string[] = [];
	for (const kb of kbs) {
		try {
			res.push(deserializeKeybinding(kb));
		} catch (error) {
			errors.push(`Error deserializing "${kb.key}" (${kb.id}): ${error}`);
		}
	}
	if (errors.length > 0) {
		console.log(errors);
		console.error(
			`${errors.length} errors deserializing ${kbs.length} keybindings`,
			errors
		);
	} else {
		console.log(`${res.length} keybindings deserialized successfully`);
		console.log("deserializeKeybindings", {
			serialized: kbs,
			deserialized: res,
		});
	}
	return res;
};

export const serializeChord = (chord: Chord): string => {
	return [
		...Array.from(chord.modifiers.keys()).sort(),
		chord.base ?? "undefined",
	].join(KEY_DELIMITER);
};

export const serializeChords = (chords: Chord[]): string[] => {
	return chords.map(serializeChord);
};

export const serializeKeybinding = (
	keybinding: Keybinding
): KeybindingSerialized => {
	return {
		id: keybinding.id,
		key: serializeChords(keybinding.key).join(CHORD_DELIMITER),
	};
};

export const serializeKeybindings = (
	keybindings: Keybinding[]
): KeybindingSerialized[] => {
	return keybindings.map(serializeKeybinding);
};

export const keyEventToChord = (event: KeyboardEvent): Chord => {
	const modifiers: ChordKeyModifiers = new Map();
	if (event.ctrlKey) modifiers.set("ctrl", true);
	if (event.metaKey) modifiers.set("meta", true);
	if (event.altKey) modifiers.set("alt", true);
	if (event.shiftKey) modifiers.set("shift", true);
    if (isModifierCodeCamel(event.code)) {
        return { modifiers, base: undefined, type: "modifier event" };
    } else if (!isCodeCamel(event.code)) {
        return { modifiers, base: undefined, type: "invalid base" };
    } else if (event.type === 'keyup') {
        return { modifiers, base: undefined, type: "keyup event" };
    } else {
		return { modifiers, base: event.code, type: "valid" };
	}
};
