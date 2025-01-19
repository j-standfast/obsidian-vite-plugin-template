import { ItemView, WorkspaceLeaf } from "obsidian";
import React, { StrictMode } from "react";
import { Root, createRoot } from "react-dom/client";

import { BCDashboard } from "src/components/BCDashboard";
import { VIEW_TYPE_BC_DASHBOARD } from "src/constants/plugin";
import type { BCShortcutsPlugin } from "src/main";

export class BCDashboardView extends ItemView {
	plugin: BCShortcutsPlugin;
	navigation = true;
	root: Root | null = null;

	constructor(leaf: WorkspaceLeaf, plugin: BCShortcutsPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	async onload() {
		super.onload();
	}

	getViewType(): string {
		return VIEW_TYPE_BC_DASHBOARD;
	}

	getDisplayText(): string {
		return "BC Shortcuts";
	}

	async onOpen() {
		this.root = createRoot(this.contentEl);
		this.root.render(
			<StrictMode>
				<BCDashboard view={this} dataManager={this.plugin.dataManager} />
			</StrictMode>
		);
	}
	async onClose() {
		this.root?.unmount();
	}
}
