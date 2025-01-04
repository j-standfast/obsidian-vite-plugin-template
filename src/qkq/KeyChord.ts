import { isModifier, codeToString } from "./util";

export class KeyChord {
	meta: boolean = false;
	ctrl: boolean = false;
	alt: boolean = false;
	shift: boolean = false;
	key: string = ""; // KeyboardEvent.code

	constructor(input: KeyboardEvent | string) {
		// console.log(
		// "Bsk KeyPress | constructor",
		// input instanceof KeyboardEvent ? input.code : input
		// );
		// console.log("Bsk KeyPress | constructor", { input });
		// If one checks `input instanceof KeyboardEvent` the jest tests fail
		// with `ReferenceError: KeyboardEvent is not defined`.
		if (typeof input === "string") {
			const parts = input.split("-");
			const part = parts.pop();
			if (part === undefined) {
				console.error("No key in chord");
				throw new Error("No key in chord");
			}
			this.key = part;
			parts.map((p) => {
				switch (p) {
					case "M":
						this.meta = true;
						break;
					case "C":
						this.ctrl = true;
						break;
					case "A":
						this.alt = true;
						break;
					case "S":
						this.shift = true;
						break;
				}
			});
		} else {
			if (!isModifier(input.code)) {
				this.key = input.code;
			}
			this.meta = input.metaKey;
			this.ctrl = input.ctrlKey;
			this.alt = input.altKey;
			this.shift = input.shiftKey;
		}
	}

	equals = (other: KeyChord): boolean => {
		return (
			!!other &&
			this.key === other.key &&
			this.meta === other.meta &&
			this.ctrl === other.ctrl &&
			this.alt === other.alt &&
			this.shift === other.shift
		);
	};

	serialize = (): string => {
		const parts = new Array<string>();
		if (this.meta) {
			parts.push("M");
		}
		if (this.ctrl) {
			parts.push("C");
		}
		if (this.alt) {
			parts.push("A");
		}
		if (this.shift) {
			parts.push("S");
		}
		parts.push(this.key);
		return parts.join("-");
	};

	toString = (): string => {
		const keys = new Array<string>();
		if (this.meta) {
			keys.push("Meta");
		}
		if (this.ctrl) {
			keys.push("Control");
		}
		if (this.alt) {
			keys.push("Alt");
		}
		if (this.shift) {
			keys.push("Shift");
		}
		keys.push(codeToString(this.key));
		return keys.map(codeToString).join("");
	};
}
