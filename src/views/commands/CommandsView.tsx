import { createRoot, Root } from 'react-dom/client';
import React, { StrictMode } from 'react';
import { ItemView, WorkspaceLeaf } from 'obsidian';

import type { TailorCutsPluginType } from '@/types';
import { VIEW_TYPE_BARRACLOUGH_TAILOR_CUTS_COMMANDS } from '@/constants/plugin';
import { CommandsDashboard } from '@/views/commands/CommandsDashboard';

// https://docs.obsidian.md/Plugins/User+interface/Views

export class CommandsView extends ItemView {
    plugin: TailorCutsPluginType;
    navigation = false;
    root: Root | null = null;
    _viewType = VIEW_TYPE_BARRACLOUGH_TAILOR_CUTS_COMMANDS;
    _displayText = "Commands Dashboard";

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
                <CommandsDashboard
                    dataManager={this.plugin.dataManager}
                />
            </StrictMode>
        )
    }

    async onClose() {
        this.root?.unmount();
    }
}