import { KeymapEventWithCodeListener } from "@/_DataManager/types/key";
import type {
	KeymapContext,
	KeymapEventHandler,
	KeymapEventListener,
	Modifier,
} from "obsidian";
import { Scope } from "obsidian";

export class KeybindingScope extends Scope {
	constructor(parent?: Scope) {
		super(parent);
	}

	register(
		modifiers: Modifier[] | null,
		key: string | null,
		func: KeymapEventWithCodeListener
	): KeymapEventHandler {
		return super.register(
			modifiers,
			key,
			this.makeHandlerWithCode.bind(this)(func)
		);
	}

	makeHandlerWithCode(
		func: KeymapEventWithCodeListener
	): KeymapEventListener {
		return (evt, ctx) => {
			const code = evt.code;
			return func(evt, { ...ctx, code });
		};
	}
}
