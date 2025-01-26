import type {
	App,
	Command,
	Hotkey,
	HotkeyManager,
	KeymapInfo,
	Modifier,
} from "obsidian";
import {
	getCommandData,
	getCommandHotkeyData,
	// getKeybindings,
	getPluginData,
} from "@/_DataManager/commands";
import type { TailorCutsPlugin } from "@/types";

interface TodoNavigator {
	keyboard: {
		getLayoutMap(): Promise<Map<string, string>>;
	};
}

type CustomHotkeySymbol = keyof HotkeyManager;
const kmiString = (kmi: KeymapInfo) =>
	"KeymapInfo: " + kmi.modifiers + " + " + kmi.key;
const hkString = (hk: Hotkey) =>
	"Hotkey: " + hk.modifiers.join(",") + " + " + hk.key;
const dummyHotkey: Hotkey = { modifiers: ["Alt", "Mod", "Shift"], key: "Y" };

const qualifiedId = (id: string): string => `barraclough-tailor-cuts:${id}`;

const TEST_COMMANDS: Command[] = [
	{
		id: "debug-test",
		name: "debug-test",
		callback: () => {
			// console.log("EXECUTED tailor-cuts: test");
		},
		checkCallback: () => {
			// console.log("CHECKED tailor-cuts: test");
			return true;
		},
	},
	{
		id: "debug-test-2",
		name: "debug-test-2",
		callback: () => {
			// console.log("EXECUTED tailor-cuts: test2");
		},
	},
];

export class DebugUtils {
	sym: CustomHotkeySymbol;
	app: App;
	plugin: TailorCutsPlugin;
	TEST_COMMANDS: Command[] = TEST_COMMANDS;

	constructor(app: App, plugin: TailorCutsPlugin) {
		this.sym = Object.getOwnPropertySymbols(
			app.hotkeyManager
		)[0] as unknown as CustomHotkeySymbol;
		this.app = app;
		this.plugin = plugin;
	}

	onload() {
		this.TEST_COMMANDS.forEach((cmd) => this.plugin.addCommand(cmd));
	}

	unload() {
		this.TEST_COMMANDS.forEach((cmd) => this.plugin.removeCommand(cmd.id));
	}

	getCommandData() {
		return getCommandData(this.app);
	}
	getCommandHotkeyData() {
		const commandData = this.getCommandData();
		return getCommandHotkeyData(this.app, commandData);
	}
	getPluginData() {
		return getPluginData(this.app);
	}
	// getKeybindings() {
	// 	return getKeybindings(this.app);
	// }
	testShow(id: string) {
		const hotkey: Hotkey | undefined = (this.app.hotkeyManager.getHotkeys(
			id
		) ?? [undefined])[0];
		const idx = this.app.hotkeyManager.bakedIds.indexOf(id);
		const baked: KeymapInfo | undefined =
			idx !== -1 ? this.app.hotkeyManager.bakedHotkeys[idx] : undefined;
		console.log({
			id,
			getHotkeys: hotkey ? hkString(hotkey) : "NONE",
			baked: `(${idx}) ${baked ? kmiString(baked) : "NONE"}`,
		});
	}
	testBindFlipMod(id: string) {
		const ks = this.app.hotkeyManager.getHotkeys(id) ?? [];
		if (ks.length === 0) {
			console.log(`testBindFlipMod (${id}) | \tno hotkeys`);
			return;
		}

		const k = ks[0];
		const oldMods: string[] = k.modifiers ?? [];
		const newMods: Modifier[] = oldMods.includes("Shift")
			? ["Alt", "Meta", "Mod"]
			: ["Alt", "Meta", "Mod", "Shift"];
		console.log(
			`testBindFlipMod (${id}) | \toldMods: ${oldMods.join(
				","
			)} \t newMods: ${newMods.join(",")}`
		);

		this.app.hotkeyManager.setHotkeys(id, [
			{
				modifiers: newMods,
				key: k.key,
			},
		]);
	}
	testBind(id: string) {
		this.app.hotkeyManager.setHotkeys(id, [dummyHotkey]);
		this.app.hotkeyManager.bake();
		this.testShow(id);
	}
	async testCreateBindConflict(flip: boolean = false) {
		const id1 = flip ? this.TEST_COMMANDS[1].id : this.TEST_COMMANDS[0].id;
		const id2 = flip ? this.TEST_COMMANDS[0].id : this.TEST_COMMANDS[1].id;
		console.log(`testCreateBindConflict (${id1}, ${id2}, flip=${flip})`);

		this.app.hotkeyManager.removeHotkeys(id1);
		this.app.hotkeyManager.removeHotkeys(id2);
		this.app.hotkeyManager.bake();

		console.log("\ncleared");
		this.testShow(id1);
		this.testShow(id2);

		console.log("\nset id1");
		this.testBind(id1);
		console.log("\nset id2");
		this.testBind(id2);

		console.log("\nand review post conflict: (flip=" + flip + ")");
		this.testShow(id1);
		this.testShow(id2);

		this.app.hotkeyManager.bake();
		await this.app.hotkeyManager.save();
	}
	async listenKeyboard(app: App, window: Window) {
		const kmiMatch = (a: KeymapInfo, b: KeymapInfo) => {
			return (
				(a.modifiers?.toLowerCase() ?? null) ===
					(b.modifiers?.toLowerCase() ?? null) &&
				(a.key?.toLowerCase() ?? null) ===
					(b.key?.toLowerCase() ?? null)
			);
		};
		const keymap = await (
			navigator as unknown as TodoNavigator
		).keyboard.getLayoutMap();

		const handleKeyboardEvent = (e: KeyboardEvent) => {
			if (
				[
					"ShiftLeft",
					"ShiftRight",
					"CtrlLeft",
					"CtrlRight",
					"MetaLeft",
					"MetaRight",
					"AltLeft",
					"AltRight",
				].includes(e.code)
			) {
				return;
			}
			const mods = [
				e.altKey ? "Alt" : null,
				e.ctrlKey ? "Ctrl" : null,
				e.metaKey ? "Meta" : null,
				e.shiftKey ? "Shift" : null,
			].filter((v) => v !== null);
			const key = keymap.get(e.code) ?? `Unknown: ${e.key}`;

			const kmiMods = mods.join(",");
			const scancodeMods = mods.join("+");
			const keysig = [...mods, key].map((m) => m.toLowerCase()).join("+");
			const scancodeSig = [scancodeMods, `[${e.code}]`].join("+");
			const kmi = { modifiers: kmiMods, key };

			const commandId = app.hotkeyManager.bakedHotkeys.findIndex((hk) =>
				kmiMatch(hk, kmi)
			);
			console.log(
				`${e.type.padEnd(10, " ")}: \t\t code=${e.code} \t key=${
					e.key
				} \t kmiMods=${kmiMods} \t keysig=${keysig} \t commandId=${commandId} \t scancode=${scancodeSig} \t`
			);
		};

		const down = window.addEventListener("keydown", handleKeyboardEvent);
		const up = window.addEventListener("keyup", handleKeyboardEvent);
		return { down, up };
	}
}
