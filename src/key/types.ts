import { NONMOD_KEYS } from "./keylist";
import {
	MOD_KEYS_OBS_JSON,
	MOD_KEYS_OBS_RUN,
} from "./keylist/obsidian-keylist"; // TODO test vs Modifier

export type KeyCode = string; // scan code, #TODO type

export type KBKeysig = string; // 0+ KB_MOD_KEYS and 1 of NONMOD_KEYS, joined with '+'
export type KBCodeSig = string; // 0+ KB_MOD_KEYS and 1 of NONMOD_CODE, joined with '+'

export type KBNonmodKey = (typeof NONMOD_KEYS)[number];

export type ObsCompiledModKey = (typeof MOD_KEYS_OBS_RUN)[number];
export type ObsCompiledModKeysig = string; // 0+ ObsidianCompiledModkey and 1 of NonmodKey, joined with '+'
export type ObsVirtualKey = string; // virtual key, from Obsidian internals
