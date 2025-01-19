import { createRoot, Root } from 'react-dom/client';
import React, { StrictMode } from 'react';
import { ItemView, WorkspaceLeaf } from 'obsidian';

import { BCShortcutsPlugin } from 'src/main';
import { VIEW_TYPE_BC_COMMANDS } from 'src/constants/plugin';
import { CommandsDashboard } from 'src/components/CommandsDashboard';

export class CommandsView extends ItemView {
    plugin: BCShortcutsPlugin;
    navigation = false;
    root: Root | null = null;

    constructor(leaf: WorkspaceLeaf, plugin: BCShortcutsPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    async onload() {
        super.onload();
    }

    getViewType(): string {
        return VIEW_TYPE_BC_COMMANDS;
    }

    getDisplayText(): string {
        return "BC Commands";
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