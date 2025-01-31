import { defineConfig } from "vitest/config";
import { resolve } from "path";
import builtins from "builtin-modules";

export default defineConfig({
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
			// Mock Obsidian module for tests
			obsidian: resolve(__dirname, "./__mocks__/obsidian.ts"),
		},
	},
	test: {
		deps: {
			optimizer: {
				ssr: {
					exclude: [
						"obsidian",
						"electron",
						"@codemirror/state",
						"@codemirror/view",
						"@codemirror/search",
						...builtins,
					],
				},
			},
		},
		environment: "node",
		exclude: [
			"node_modules",
			"dist",
			// Exclude browser-specific tests if you add them later
			"src/**/*.browser.test.ts",
		],
		globals: true,
		include: ["src/**/*.test.ts"],
		setupFiles: ["./vitest.setup.ts"],
	},
});
