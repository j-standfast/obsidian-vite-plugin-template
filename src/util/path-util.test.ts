import { describe, it, expect } from "vitest";
import { normalizeFilePath } from "./path-util";

describe("path-utils", () => {
	it("should normalize file paths across platforms", () => {
		const paths = {
			windows: "folder\\subfolder\\note.md",
			posix: "folder/subfolder/note.md",
		};

		expect(normalizeFilePath(paths.windows)).toBe(
			"folder/subfolder/note.md"
		);
		expect(normalizeFilePath(paths.posix)).toBe("folder/subfolder/note.md");
	});

	it("should handle empty paths", () => {
		expect(normalizeFilePath("")).toBe("");
	});
});
