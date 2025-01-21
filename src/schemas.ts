import * as z from "zod";
import {
	CHROME_CODES_PASCAL,
	CHROME_MODIFIER_CODES_PASCAL,
} from "@/constants/keys";
import type {
	Expect,
	CoExtends,
	ModifierCodePascal,
	ChromeCodePascal,
	Chord,
	ChordKeyModifiers,
	ModifierKey,
	ValidChord,
} from "@/types";

export const modifierCodeSchema = z.enum(CHROME_MODIFIER_CODES_PASCAL);
export const modifierKeySchema = z.enum(CHROME_MODIFIER_CODES_PASCAL);
export const chordKeyModifiersSchema = z.map(
	modifierKeySchema,
	z.literal(true)
);
export const codeCamelSchema = z.enum(CHROME_CODES_PASCAL);
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
	Expect<CoExtends<ModifierCodeSchemaType, ModifierCodePascal>>,
	Expect<CoExtends<ModifierKeySchemaType, ModifierKey>>,
	Expect<CoExtends<CodeSchemaType, ChromeCodePascal>>,
	Expect<CoExtends<ChordKeyModifiersSchemaType, ChordKeyModifiers>>,
	Expect<CoExtends<ValidChordSchemaType, ValidChord>>
];
