import { ItemView, WorkspaceLeaf } from "obsidian";
import React, { StrictMode } from "react";
import { Root, createRoot } from "react-dom/client";

import { BCPluginsDashboard } from "src/components/BCPluginsDashboard";
import { VIEW_TYPE_BC_PLUGINS } from "src/constants/plugin";
import type { BCShortcutsPlugin } from "src/main";

export class BCPluginsView extends ItemView {
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
		return VIEW_TYPE_BC_PLUGINS;
	}

	getDisplayText(): string {
		return "BC Plugins";
	}

	async onOpen() {
		this.root = createRoot(this.contentEl);
		this.root.render(
			<StrictMode>
				<BCPluginsDashboard
					dataManager={this.plugin.dataManager}
					view={this}
				/>
			</StrictMode>
		);
	}

	async onClose() {
		this.root?.unmount();
	}
}
