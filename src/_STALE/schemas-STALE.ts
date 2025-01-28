import * as z from "zod";
import { CHROME_CODES, CHROME_MODIFIER_CODES } from "@/_STALE_KEYS";
import type {
	Expect,
	CoExtends,
	// ModifierCodePascal,
	ChromeCode,
	Chord,
	ChordKeyModifiers,
	// ModifierKey,
	ValidChord,
} from "@/types";

const modifierCodeSchema = z.enum(CHROME_MODIFIER_CODES);
const modifierKeySchema = z.enum(CHROME_MODIFIER_CODES);
const chordKeyModifiersSchema = z.map(modifierKeySchema, z.literal(true));
const codeCamelSchema = z.enum(CHROME_CODES);
const validChordSchema = z.object({
	modifiers: chordKeyModifiersSchema,
	base: codeCamelSchema,
	type: z.literal("valid"),
});

const serializedKeybdingsSchema = z.object({
	key: z.string(),
	id: z.string(),
});
// type KeybindingSerialized = z.infer<typeof serializedKeybdingsSchema>;

const keybindingSchema = z.object({
	key: z.array(validChordSchema),
	id: z.string(),
});
// type Keybinding = z.infer<typeof keybindingSchema>;

// settings
// const sequenceHotkeySerializedSchema = z.object({
// 	command: z.string(),
// 	chords: z.array(z.string()),
// });

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
	Expect<CoExtends<CodeSchemaType, ChromeCode>>,
	Expect<CoExtends<ChordKeyModifiersSchemaType, ChordKeyModifiers>>,
	Expect<CoExtends<ValidChordSchemaType, ValidChord>>
];
