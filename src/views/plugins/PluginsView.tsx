import { ItemView, WorkspaceLeaf } from "obsidian";
import React, { StrictMode } from "react";
import { Root, createRoot } from "react-dom/client";

import { PluginsDashboard } from "@/views/plugins/PluginsDashboard";
import { VIEW_TYPE_BARRACLOUGH_TAILOR_CUTS_PLUGINS } from "@/constants/plugin";
import type { TailorCutsPlugin } from "@/types";

export class PluginsView extends ItemView {
	plugin: TailorCutsPlugin;
	navigation = true;
	root: Root | null = null;
	_viewType = VIEW_TYPE_BARRACLOUGH_TAILOR_CUTS_PLUGINS;
	_displayText = "Plugins Dashboard";

	constructor(leaf: WorkspaceLeaf, plugin: TailorCutsPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	async onload() {
		super.onload();
	}

	getViewType(): string {
		return this._viewType;
	}

	getDisplayText(): string {
		return this._displayText;
	}

	async onOpen() {
		this.root = createRoot(this.contentEl);
		this.root.render(
			<StrictMode>
				<PluginsDashboard dataManager={this.plugin.dataManager} />
			</StrictMode>
		);
	}

	async onClose() {
		this.root?.unmount();
	}
}
