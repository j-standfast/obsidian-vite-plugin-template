import { ChordListener } from "./ChordListener";
import type { KeyChord } from "./KeyChord";

export class CaptureChord {
	chordListener: ChordListener;
	chords: KeyChord[];
	onUpdate: (cs: KeyChord[]) => void;
	onComplete: (cs: KeyChord[]) => void;

	constructor(
		onUpdate: (cs: KeyChord[]) => void,
		onComplete: (cs: KeyChord[]) => void
	) {
		// console.log("CaptureChord | constructor");

		this.chords = new Array<KeyChord>();
		this.onUpdate = onUpdate;
		this.onComplete = onComplete;

		this.chordListener = new ChordListener((c: KeyChord): boolean => {
			// console.log("onChord callback (from CaptureChord)", {
			// 	this: this,
			// 	cKeyChord: c,
			// });
			if (
				!c.alt &&
				!c.ctrl &&
				!c.shift &&
				!c.meta &&
				(c.key === "Enter" || c.key === "Escape")
			) {
				this.destruct();
				if (c.key === "Enter") {
					this.onComplete(this.chords);
				}
				return true;
			}

			this.pushChord(c);
			return true;
		});
	}

	pushChord = (c: KeyChord) => {
		// console.log("CaptureChord | pushChord", { this: this, cKeyChord: c });
		this.chords.push(c);
		this.onUpdate(this.chords);
	};

	destruct = () => {
		// console.log("CaptureChord | destruct", { this: this });
		this.chordListener.destruct();
	};
}
