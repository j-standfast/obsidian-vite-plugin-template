// import type {
//   ChromeCodePascal,
//   ChromeModifierCodeLower,
//   ChromeModifierCodePascal,
// 	Chord,
// 	ChordKeyModifiers,
// 	ModifierCodePascal,
// 	ModifierKey,
// 	SerializedKeybinding,
// 	Keybinding,
// 	ValidChord,
// } from "@/types";
// import {
// 	CHROME_CODES_PASCAL,
// 	CHROME_MODIFIER_CODES_PASCAL,
// } from "@/constants/keys";

// export const isModifierCodePascal = (v: unknown): v is ModifierCodePascal =>
// 	CHROME_MODIFIER_CODES_PASCAL.some((c) => c === v);
// const isModifierCodePascal = (v: unknown): v is  =>
// 	CHROME_MODIFIER_KEYS.some((k) => k === v);
// export const isCodeCamel = (code: unknown): code is ChromeCodePascal => {
// 	return (
// 		typeof code === "string" &&
// 		CODES_CHROME_CAMEL.includes(code as ChromeCodePascal)
// 	);
// };

// const KEY_DELIMITER = "+";
// const CHORD_DELIMITER = " ";
// export const deserializeChord = (s: string): ValidChord => {
// 	const modifiers: ChordKeyModifiers = new Map();
// 	let code: ChromeCodePascal | undefined = undefined;

// 	for (const k of s.split(KEY_DELIMITER)) {
// 		if (isModifierKey(k)) {
// 			modifiers.set(k, true);
// 			continue;
// 		}
// 		if (!isCodeCamel(k)) {
// 			throw new Error(`Invalid code ${k} in chord`);
// 		}
// 		if (code !== undefined) {
// 			throw new Error(`multiple non-modifier codes: ${code} and ${k}`);
// 		}
// 		code = k;
// 	}

// 	if (code === undefined) {
// 		throw new Error("no non-modifier code in chord");
// 	}
// 	return {
// 		modifiers: modifiers,
// 		base: code,
// 		type: "valid",
// 	};
// };

// export const deserializeKey = (k: string): Chord[] => {
// 	const chords: Chord[] = [];
// 	for (const c of k.split(CHORD_DELIMITER)) {
// 		try {
// 			chords.push(deserializeChord(c));
// 		} catch (error) {
// 			throw error;
// 		}
// 	}
// 	if (chords.length === 0) {
// 		throw new Error("no chords in keybinding");
// 	}
// 	return chords;
// };

// export const deserializeKeybinding = (s: SerializedKeybinding): Keybinding => {
// 	return {
// 		key: deserializeKey(s.key),
// 		id: s.id,
// 	};
// };

// export const deserializeKeybindings = (
// 	kbs: SerializedKeybinding[]
// ): Keybinding[] => {
// 	const res: Keybinding[] = [];
// 	const errors: string[] = [];
// 	for (const kb of kbs) {
// 		try {
// 			res.push(deserializeKeybinding(kb));
// 		} catch (error) {
// 			errors.push(`Error deserializing "${kb.key}" (${kb.id}): ${error}`);
// 		}
// 	}
// 	if (errors.length > 0) {
// 		console.log(errors);
// 		console.error(
// 			`${errors.length} errors deserializing ${kbs.length} keybindings`,
// 			errors
// 		);
// 	} else {
// 		// console.log(`${res.length} keybindings deserialized successfully`);
// 		// console.log("deserializeKeybindings", {
// 		// 	serialized: kbs,
// 		// 	deserialized: res,
// 		// });
// 	}
// 	return res;
// };

// export const serializeChord = (chord: Chord): string => {
// 	return [
// 		...Array.from(chord.modifiers.keys()).sort(),
// 		chord.base ?? "undefined",
// 	].join(KEY_DELIMITER);
// };

// export const serializeChords = (chords: Chord[]): string[] => {
// 	return chords.map(serializeChord);
// };

// export const serializeKeybinding = (
// 	keybinding: Keybinding
// ): SerializedKeybinding => {
// 	return {
// 		id: keybinding.id,
// 		key: serializeChords(keybinding.key).join(CHORD_DELIMITER),
// 	};
// };

// export const serializeKeybindings = (
// 	keybindings: Keybinding[]
// ): SerializedKeybinding[] => {
// 	return keybindings.map(serializeKeybinding);
// };

// export const keyEventToChord = (event: KeyboardEvent): Chord => {
// 	const modifiers: ChordKeyModifiers = new Map();
// 	if (event.ctrlKey) modifiers.set("ctrl", true);
// 	if (event.metaKey) modifiers.set("meta", true);
// 	if (event.altKey) modifiers.set("alt", true);
// 	if (event.shiftKey) modifiers.set("shift", true);
// 	if (isModifierCodeCamel(event.code)) {
// 		return { modifiers, base: undefined, type: "modifier event" };
// 	} else if (!isCodeCamel(event.code)) {
// 		return { modifiers, base: undefined, type: "invalid base" };
// 	} else if (event.type === "keyup") {
// 		return { modifiers, base: undefined, type: "keyup event" };
// 	} else {
// 		return { modifiers, base: event.code, type: "valid" };
// 	}
// };
