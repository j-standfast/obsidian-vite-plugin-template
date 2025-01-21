import type { ObsidianModifier } from "./keys";

export type HotkeyTableDatum = {
  // keysig: string;
  commandId: string;
  obsidianModifiers: string;
  obsidianKey: string;
  isDefault: boolean;
}