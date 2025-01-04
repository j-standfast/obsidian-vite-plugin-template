import { Setting, setIcon, Menu } from "obsidian";
import type { Command } from "obsidian";

import { KeyChord } from "../KeyChord";
import { CaptureChord } from "../CaptureChord";
import { codeToString } from "../util";
import type { CommandSettingHotkey } from "../types";

export class CommandSetting extends Setting {
	command: Command;
	onCreated: (id: string, chords: KeyChord[]) => void;
	onDelete: (id: string, chords: KeyChord[]) => void;

	cancelCapture: (() => void) | undefined;

	constructor(
		containerEl: HTMLElement,
		command: Command,
		onCreated: (id: string, chords: KeyChord[]) => void,
		onDelete: (id: string, chords: KeyChord[]) => void
	) {
		super(containerEl);
		this.command = command;
		this.onCreated = onCreated;
		this.onDelete = onDelete;
	}

	getCommand = (): Command => this.command;

	// Should be run to clean up pending event listeners
	hide = () => {
		this.setCancelCapture(undefined);
	};

	setCancelCapture = (cb: (() => void) | undefined) => {
		// Call current callback if it exists before replacing it
		this.cancelCapture?.();
		this.cancelCapture = cb;
	};

	display = (hotkeys: CommandSettingHotkey[]) => {
		this.clear();

		this.setName(this.command.name);

		const hotkeyDiv = this.controlEl.createDiv({
			cls: "setting-command-hotkeys",
		});

		for (const hotkey of hotkeys) {
			const warnClass = !!hotkey.warning ? " has-conflict" : "";
			const hotkeySpan = hotkeyDiv.createSpan({
				cls: "setting-hotkey" + warnClass,
				attr: { "aria-label": hotkey.warning },
			});
			const hotkeySpanText = hotkeySpan.createSpan({
				text: hotkey.chords.map((c) => c.toString()).join(" ") + " ",
			});
			const deleteBtn = hotkeySpanText.createSpan({
				cls: "setting-hotkey-icon setting-delete-hotkey",
				attr: { "aria-label": "Delete hotkey" },
			});
			setIcon(deleteBtn, "cross"); // , 8);
			deleteBtn.onClickEvent(() => {
				this.onDelete(this.command.id, hotkey.chords);
			});
		}

		const addBtn = this.controlEl.createSpan({
			cls: "setting-add-hotkey-button",
			attr: { "aria-label": "Customize this command" },
		});
		setIcon(addBtn, "any-key"); //, 22);

		addBtn.onClickEvent(() => {
			const newHotkeySpan = hotkeyDiv.createSpan({
				cls: "setting-hotkey",
			});
			const newHotkeySpanText = newHotkeySpan.createSpan({
				text: "Press hotkey...",
			});
			const onUpdate = (chords: KeyChord[]) => {
				// console.log("onUpdate callback (from CommandSetting)", {
				// 	this: this,
				// 	chordsKeyChord: chords,
				// });
				newHotkeySpanText.setText(
					chords.map((c) => c.toString()).join(" ")
				);
			};
			const onComplete = (chords: KeyChord[]) => {
				// console.log("onComplete callback (from CommandSetting)", {
				// 	this: this,
				// 	chordsKeyChord: chords,
				// });
				this.setCancelCapture(undefined);
				this.onCreated?.(this.command.id, chords);
			};
			const chordCapturer = new CaptureChord(onUpdate, onComplete);
			this.setCancelCapture(chordCapturer.destruct);

			newHotkeySpan.addClass("mod-active");

			addBtn.hide();
			const menuBtn = this.controlEl.createSpan({
				cls: "setting-add-hotkey-button",
				attr: {
					"aria-label": `Add ${codeToString(
						"Enter"
					)} or ${codeToString("Escape")} key to sequence`,
				},
			});
			setIcon(menuBtn, "plus"); //, 22);

			const menu = new Menu().setNoIcon(); // Menu(menuBtn)
			menu.addItem((item) =>
				item.setTitle("Add " + codeToString("Enter")).onClick(() => {
					chordCapturer.pushChord(new KeyChord("Enter"));
				})
			);

			menu.addItem((item) =>
				item.setTitle("Add " + codeToString("Escape")).onClick(() => {
					chordCapturer.pushChord(new KeyChord("Escape"));
				})
			);
			menuBtn.onClickEvent((event) => {
				menu.showAtMouseEvent(event);
			});

			const doneBtn = this.controlEl.createSpan({
				cls: "setting-add-hotkey-button",
				attr: {
					"aria-label": "Accept hotkey sequence",
				},
			});
			setIcon(doneBtn, "checkbox-glyph"); //, 22);
			doneBtn.onClickEvent(() => {
				onComplete(chordCapturer.chords);
			});
		});
	};
}
