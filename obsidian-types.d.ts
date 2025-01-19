import { Command, Hotkey, KeymapInfo, Plugin } from "obsidian";
declare module "obsidian" {
    interface Command {
        hotkeys?: Hotkey[];
    }
}

 
export interface HotkeyManager {
        getDefaultHotkeys(commandId: string): Hotkey[] | undefined;
        getHotkeys(commandId: string): Hotkey[] | undefined;
        bakedHotkeys: KeymapInfo[];
        bakedIds: string[];
        defaultKeys: Record<string, Hotkey[]>;
        customKeys: Record<string, Hotkey[]>;
        bake(): void;
    }


declare module "obsidian" {
    interface Plugin {
        _loaded: boolean;
        _userDisabled: boolean;
        _lastDataModifiedTime: number ;
        _children: Component[];
        _events: EventRef[];
    }
}

