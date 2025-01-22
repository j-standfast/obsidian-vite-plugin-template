import { createRoot, Root } from "react-dom/client";
import React, { StrictMode } from "react";
import { ItemView, WorkspaceLeaf } from "obsidian";

import type { TailorCutsPluginType } from "@/types";
import { TAILOR_CUTS_VIEW_TYPE } from "@/constants/plugin";
import { TailorCutsDashboard } from "./TailorDashboard";

// https://docs.obsidian.md/Plugins/User+interface/Views

export class TailorView extends ItemView {
	plugin: TailorCutsPluginType;
	navigation = false;
	root: Root | null = null;
	_viewType = TAILOR_CUTS_VIEW_TYPE;
	_displayText = "Tailor Cuts Dashboard";

	constructor(leaf: WorkspaceLeaf, plugin: TailorCutsPluginType) {
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
				<TailorCutsDashboard dataManager={this.plugin.dataManager} />
			</StrictMode>
		);
	}

	async onClose() {
		this.root?.unmount();
	}
}
