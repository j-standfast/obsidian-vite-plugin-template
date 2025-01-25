import type { App, KeymapContext } from "obsidian";
import type { TailorCutsPlugin } from "@/types";

export class TailorCutsKeymap {
	app: App;
	plugin: TailorCutsPlugin;

	constructor(app: App, plugin: TailorCutsPlugin) {
		this.app = app;
		this.plugin = plugin;
  }
  
  async load() {
    
  }

  onKeymapEvent(event: KeyboardEvent, keymapContext: KeymapContext) {
    console.log("onKeymapEvent", { event, keymapContext });
  }
}
