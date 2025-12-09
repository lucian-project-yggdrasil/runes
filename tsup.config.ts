import { defineConfig } from "tsup"

export default defineConfig({
	entry: {
		"core/index": "src/core/index.ts",
		"social/index": "src/social/index.ts",
	},
	format: ["esm", "cjs"],
	dts: true,
	splitting: false,
	sourcemap: true,
	clean: true,
	external: ["@azure/cosmos", "zod", "luxon"],
})
