import { createRoot, Root } from 'react-dom/client';
import React, { StrictMode } from 'react';
import { ItemView, WorkspaceLeaf } from 'obsidian';

import { TailorCutsPlugin } from '@/main';
import { VIEW_TYPE_BARRACLOUGH_TAILOR_CUTS_ANY } from '@/constants/plugin';
import { DashboardSelector } from './DashboardSelector';

// https://docs.obsidian.md/Plugins/User+interface/Views

export class TailorView extends ItemView { 
    plugin: TailorCutsPlugin;
    navigation = false;
    root: Root | null = null;
    _viewType = VIEW_TYPE_BARRACLOUGH_TAILOR_CUTS_ANY;
    _displayText = "Tailor Cuts Dashboard";

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
                <DashboardSelector
                    dataManager={this.plugin.dataManager}
                />
            </StrictMode>
        )
    }

    async onClose() {
        this.root?.unmount();
    }
}