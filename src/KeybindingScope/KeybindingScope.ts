import type {
	Modifier,
	KeymapEventHandler,
	KeymapEventListener,
	KeymapInfo,
} from "obsidian";
import { Scope as ObsScope } from "obsidian";

import type {
	KeyEventContext,
	CompiledModifierString,
} from "@/tailored-cuts-obsidian";
import type {
	KBCodeSig,
	KBKeysig,
	KBNonmodKey,
	KeyCode,
	ObsVirtualKey,
} from "@/key";

export interface KBKeymapInfo extends KeymapInfo {
	modifiers: CompiledModifierString | null;
	key: KBNonmodKey | null;
}

export interface KBKeyEventContext extends KeyEventContext {
	modifiers: CompiledModifierString;
	key: KBNonmodKey;
	vkey: ObsVirtualKey; // virtual key, from Obsidian internals
	code: KeyCode;
	keysig: KBKeysig; // 0+ KB_MOD_KEYS and 1 of NONMOD_KEYS, joined with '+'
	codesig: KBCodeSig; // 0+ KB_MOD_KEYS and 1 of NONMOD_CODE, joined with '+'
}

export type KBKeymapEventListener = (
	event: KeyboardEvent,
	ctx: KBKeyEventContext
) => false | any;

export interface KBKeymapEventHandler extends KeymapEventHandler {
	scope: KBScope;
	func: KeymapEventListener;
	wrappedKBFunc: KBKeymapEventListener;
}

export class KBScope extends ObsScope {
	constructor(parent?: KBScope) {
		super(parent);
	}

	register(
		modifiers: Modifier[] | null, //  TODO | KBNonmodKey with conversion for super
		key: string | null,
		func: KBKeymapEventListener
	): KBKeymapEventHandler {
		const handler = super.register(
			modifiers,
			key,
			this.makeKBKeymapListener.bind(this)(func)
		);
		return {
			...handler,
			scope: this, // TODO why necessary? can be avoided?
			wrappedKBFunc: func,
		};
	}

	keyEventContextToKeysig(ctx: {
		modifiers: CompiledModifierString;
		key: KBNonmodKey;
	}): string {
		return ctx.modifiers + "+" + ctx.key;
	}

	makeKBKeymapListener(func: KBKeymapEventListener): KeymapEventListener {
		return (evt, ctx) => {
			const key = ctx.key as KBNonmodKey; // TODO check?
			if (!key) throw new Error("Key is required");

			const modifiers = (ctx.modifiers ?? "") as CompiledModifierString; // TODO check?
			const keysig = this.keyEventContextToKeysig({ modifiers, key });
      const code = evt.code as KeyCode; // TODO check?
			const vkey = ctx.vkey as ObsVirtualKey; // TODO check?
			return func(evt, { modifiers, key, code, keysig, codesig: keysig, vkey });   // TODO codesig
		};
	}
}
