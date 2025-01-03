import { Command, Hotkey } from "obsidian";

declare module "obsidian" {
    interface Command {
        hotkeys?: Hotkey[];
    }
}
