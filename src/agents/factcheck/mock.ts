// FactCheck Agent — verifies the script for obvious errors.
// Phase 2: deterministic mock that returns "passed" for the mock script shape.

import type { FactCheck, Script } from "../../domain/content-object.js";

export function mockFactCheckAgent(script: Script): FactCheck {
  const issues: FactCheck["issues"] = [];
  const corrections: FactCheck["corrections"] = [];

  if (script.estimatedDurationSec < 30 || script.estimatedDurationSec > 180) {
    issues.push({
      severity: "warn",
      message: `estimated duration ${script.estimatedDurationSec}s outside 30-180s band`,
    });
  }
  if (script.hook.length < 8) {
    issues.push({ severity: "warn", message: "hook too short to grab attention" });
  }
  if (script.body.length < 80) {
    issues.push({ severity: "info", message: "body is short; consider adding one concrete example" });
  }
  if (!script.conclusion) {
    issues.push({ severity: "error", message: "missing conclusion" });
  }

  const status: FactCheck["status"] =
    issues.some((i) => i.severity === "error")
      ? "failed"
      : issues.length > 0
      ? "issues_found"
      : "passed";

  return { status, issues, corrections };
}