import { createRoot, Root } from "react-dom/client";
import React, { StrictMode } from "react";
import { ItemView, WorkspaceLeaf } from "obsidian";

import type { TailoredCutsPlugin } from "@/types";
import { Dashboard } from "./Dashboard";

// https://docs.obsidian.md/Plugins/User+interface/Views
export const DASHBOARD_VIEW_TYPE = "barraclough-tailored-cuts-any-dashboard";

export class DashboardView extends ItemView {
	plugin: TailoredCutsPlugin;
	navigation = false;
	root: Root | null = null;
	_viewType = DASHBOARD_VIEW_TYPE;
	_displayText = "Tailor Cuts Dashboard";

	constructor(leaf: WorkspaceLeaf, plugin: TailoredCutsPlugin) {
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
				<Dashboard dataManager={this.plugin.dataManager} />
			</StrictMode>
		);
	}

	async onClose() {
		this.root?.unmount();
	}
}
