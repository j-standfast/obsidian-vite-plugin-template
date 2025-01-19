import * as z from "zod";
import {
	CODES_CHROME_CAMEL,
	MODIFIER_CODES_CHROME_CAMEL,
	MODIFIER_KEYS,
} from "./constants/constants";
import type {
	Expect,
	CoExtends,
	ModifierCodeCamel,
	CodeCamel,
	Chord,
	ChordKeyModifiers,
	ModifierKey,
	ValidChord,
} from "./types";

export const modifierCodeSchema = z.enum(MODIFIER_CODES_CHROME_CAMEL);
export const modifierKeySchema = z.enum(MODIFIER_KEYS);
export const chordKeyModifiersSchema = z.map(
	modifierKeySchema,
	z.literal(true)
);
export const codeCamelSchema = z.enum(CODES_CHROME_CAMEL);
export const validChordSchema = z.object({
	modifiers: chordKeyModifiersSchema,
	base: codeCamelSchema,
	type: z.literal("valid"),
});

export const serializedKeybdingsSchema = z.object({
	key: z.string(),
	id: z.string(),
});
export type KeybindingSerialized = z.infer<typeof serializedKeybdingsSchema>;

export const keybindingSchema = z.object({
	key: z.array(validChordSchema),
	id: z.string(),
});
export type Keybinding = z.infer<typeof keybindingSchema>;

// settings
export const sequenceHotkeySerializedSchema = z.object({
	command: z.string(),
	chords: z.array(z.string()),
});

export const serializedSettingsSchema = z.object({
	keybindings: z.array(serializedKeybdingsSchema),
	obsidianHotkeys: z.record(
		z.string(),
		z.array(
			z.object({
				modifiers: z.array(z.string()),
				key: z.string(),
			})
		)
	),
});

// type tests
type ModifierKeySchemaType = z.infer<typeof modifierKeySchema>;
type ModifierCodeSchemaType = z.infer<typeof modifierCodeSchema>;
type ChordKeyModifiersSchemaType = z.infer<typeof chordKeyModifiersSchema>;

type CodeSchemaType = z.infer<typeof codeCamelSchema>;
type ValidChordSchemaType = z.infer<typeof validChordSchema>;

type TypeTests = [
	Expect<CoExtends<ModifierCodeSchemaType, ModifierCodeCamel>>,
	Expect<CoExtends<ModifierKeySchemaType, ModifierKey>>,
	Expect<CoExtends<CodeSchemaType, CodeCamel>>,
	Expect<CoExtends<ChordKeyModifiersSchemaType, ChordKeyModifiers>>,
	Expect<CoExtends<ValidChordSchemaType, ValidChord>>
];
