import type {
	SerializedSettings,
} from "@/types";

export const DEFAULT_SETTINGS: SerializedSettings = {
	keybindings: [],
	obsidianHotkeys: {},
};

export const TAILOR_CUTS_VIEW_TYPE = "barraclough-tailor-cuts-any-dashboard";

export const DASHBOARD_KINDS = ["plugins", "commands", "keybindings"] as const;
