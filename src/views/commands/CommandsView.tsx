import { createRoot, Root } from 'react-dom/client';
import React, { StrictMode } from 'react';
import { ItemView, WorkspaceLeaf } from 'obsidian';

import { TailorCutsPlugin } from '@/main';
import { VIEW_TYPE_BARRACLOUGH_TAILOR_CUTS_COMMANDS } from '@/constants/plugin';
import { CommandsDashboard } from '@/views/commands/CommandsDashboard';

// https://docs.obsidian.md/Plugins/User+interface/Views

export class CommandsView extends ItemView {
    plugin: TailorCutsPlugin;
    navigation = false;
    root: Root | null = null;

    constructor(leaf: WorkspaceLeaf, plugin: TailorCutsPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    async onload() {
        super.onload(); 
    }

    getViewType(): string {
        return VIEW_TYPE_BARRACLOUGH_TAILOR_CUTS_COMMANDS;
    }

    getDisplayText(): string {
        return "Commands Dashboard";
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