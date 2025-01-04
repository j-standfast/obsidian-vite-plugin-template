import {
	PluginSettingTab,
	Setting,
	Menu,
	ButtonComponent,
	SearchComponent,
} from "obsidian";
import type { App, Command, MenuItem } from "obsidian";

import { CommandSetting } from "./CommandSetting";
import { changeFilter, changeFilterOption, store } from "../store";
import {
	hotkeysEqual,
	keySequencePartiallyEqual,
	hotkeysForCommand,
	commandName,
	allCommands,
} from "../util";

import type { SequenceHotkeysPlugin } from "../../../main";
import type {
	CommandSettingHotkey,
	FilterOption,
	SequenceHotkey,
} from "../types";
import type { Settings } from "../../types";

export class SequenceHotkeysSettingTab extends PluginSettingTab {
	plugin: SequenceHotkeysPlugin;
	// A list of the CommandSetting elements
	commandSettingEls: Array<CommandSetting>;
	// The element showing how many shortcuts are visible
	descEl: HTMLDivElement;

	filterOptionDiv: HTMLDivElement;
	menuItems: { [id: string]: MenuItem } = {};

	// Callback to unsubscribe from the redux store
	unsubscribe: () => void;

	constructor(app: App, plugin: SequenceHotkeysPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.commandSettingEls = new Array<CommandSetting>();
	}

	hasCommands = (cs: CommandSetting) => {
		const hotkeys = hotkeysForCommand(
			this.plugin.settings,
			cs.getCommand().id
		);
		return hotkeys.length > 0;
	};

	render = () => {
		const state = store.getState();

		this.filterOptionDiv.setText(state.filterOption);

		Object.keys(this.menuItems).forEach((k) => {
			// this.menuItems[k].setActive(k === state.filterOption);
			this.menuItems[k].setDisabled(k !== state.filterOption);
		});

		// Hide/show the command settings based on the filter value.
		const filterParts = state.filter.toLowerCase().split(" ");
		this.commandSettingEls.map((cs: CommandSetting) => {
			const matchesFilter = filterParts.every((part) =>
				cs.getCommand().name.toLowerCase().contains(part)
			);
			let assignedFilter = true;
			if (state.filterOption === "Assigned") {
				assignedFilter = this.hasCommands(cs);
			} else if (state.filterOption === "Unassigned") {
				assignedFilter = !this.hasCommands(cs);
			}
			cs.settingEl.toggle(matchesFilter && assignedFilter);
		});

		this.updateDescription();
	};

	updateDescription = () => {
		this.descEl.setText(
			`Showing ${
				this.commandSettingEls.filter((e: CommandSetting) =>
					e.settingEl.isShown()
				).length
			} hotkeys.`
		);
	};

	// Run every time the settings page is closed
	hide(): void {
		this.unsubscribe();
		this.commandSettingEls.map((s) => s.hide());
	}

	// Run every time the settings page is opened
	display(): void {
		this.unsubscribe = store.subscribe(this.render);

		const { containerEl } = this;
		containerEl.empty();

		const searchBar = new Setting(containerEl);
		const title = searchBar.infoEl.createDiv();
		title.addClass("setting-item-name");
		title.setText("Search hotkeys");
		this.descEl = searchBar.infoEl.createDiv();
		this.descEl.addClass("setting-item-description");

		const filterMenu = new Menu();
		["All", "Assigned", "Unassigned"].forEach((o: FilterOption) => {
			filterMenu.addItem((i: MenuItem) => {
				i.setTitle(o);
				i.onClick(() => {
					store.dispatch(changeFilterOption(o));
				});
				this.menuItems[o] = i;
			});
		});

		this.filterOptionDiv = searchBar.controlEl.createDiv();
		this.filterOptionDiv.addClass("setting-item-description");
		const filterButton = new ButtonComponent(searchBar.controlEl);
		filterButton.setClass("clickable-icon");
		filterButton.setIcon("lucide-filter");
		filterButton.onClick((e: MouseEvent) => {
			filterMenu.showAtPosition({ x: e.pageX, y: e.pageY });
		});

		const searchEl = new SearchComponent(searchBar.controlEl);
		searchEl.setPlaceholder("Filter...");
		searchEl.onChange((s: string) => store.dispatch(changeFilter(s)));

		const spacer = containerEl.createDiv();
		spacer.addClass("setting-filter-container");

		const commandsContainer = containerEl.createDiv();

		// console.log(
		// 	"Bsk | SequenceHotkeysSettingTab | display | allCommands(this.app)",
		// 	allCommands(this.app)
		// );
		this.commandSettingEls = allCommands(this.app).map(
			(command: Command) =>
				new CommandSetting(
					commandsContainer,
					command,
					this.plugin.addHotkey,
					this.plugin.deleteHotkey
				)
		);

		const updateCommands = (s: SequenceHotkeysSettings) => {
			this.commandSettingEls.map((cs: CommandSetting) => {
				const hotkeys: CommandSettingHotkey[] = hotkeysForCommand(
					s,
					cs.getCommand().id
				).map((h: SequenceHotkey) => {
					const conflict = s.hotkeys.find(
						(shc: SequenceHotkey) =>
							!hotkeysEqual(shc, h) &&
							keySequencePartiallyEqual(shc.chords, h.chords)
					);
					return {
						chords: h.chords,
						warning: !!conflict
							? `This hotkey conflicts with "${commandName(
									this.app,
									conflict.command
							  )}"`
							: "",
					};
				});
				cs.display(hotkeys);
			});
		};

		this.plugin.setSaveListener(updateCommands);

		// Update the command with the current setting's hotkeys
		updateCommands(this.plugin.settings);

		this.render();

		// Focus on the search input
		searchEl.inputEl.focus();
	}
}
