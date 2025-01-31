import { vi } from "vitest";

// Mock Obsidian's API modules that might be imported
vi.mock("obsidian", () => ({
	Plugin: class MockPlugin {},
	Notice: class MockNotice {},
	// Add other Obsidian APIs as needed
}));
