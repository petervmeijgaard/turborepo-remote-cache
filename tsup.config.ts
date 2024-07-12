import { defineConfig } from "tsup";

export default defineConfig({
	bundle: false,
	clean: true,
	dts: false,
	entry: ["src/**/*.ts"],
	format: "esm",
	outDir: "dist",
	sourcemap: false,
});
