// Voice Agent — Phase 2 stub only. Real TTS lands in Phase 4.
// Returns Voice metadata with provider set but audioPath/durationMs null
// so downstream consumers can detect "not yet rendered".

import type { Storyboard, Voice } from "../../domain/content-object.js";

export function mockVoiceAgent(storyboard: Storyboard): Voice {
  const totalSec = storyboard.scenes.reduce((s, sc) => s + sc.durationSec, 0);
  return {
    provider: "mock",
    audioPath: null,
    durationMs: totalSec * 1000, // expected narration length in ms
  };
}