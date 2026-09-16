import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  project: process.env.TRIGGER_PROJECT_REF ?? "proj_xxx_replace_me",
  // The runtime reads TRIGGER_SECRET_KEY from the environment automatically.
  runtime: "node",
  maxDuration: 300, // seconds; per-task ceiling
  // Directories scanned for trigger tasks.
  dirs: ["./trigger"],
});