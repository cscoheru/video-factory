// Topic Agent — converts a raw topic into a structured enterprise-friendly topic.
// Phase 2: deterministic mock that derives angle/audience from the input.

import type { Topic } from "../../domain/content-object.js";

export function mockTopicAgent(rawTopic: string, seed?: number): Topic {
  // Deterministic angle: any Chinese-keyword heuristics could live here; mock returns fixed shapes.
  const angle = pickAngle(rawTopic, seed);
  const audience = pickAudience(rawTopic, seed);
  // Title = the raw topic, lightly trimmed.
  const title = rawTopic.trim().replace(/[\s　]+/g, " ");
  return { title, angle, audience };
}

function pickAngle(raw: string, seed?: number): Topic["angle"] {
  const angles: Topic["angle"][] = [
    "knowledge-silo",
    "search-to-action",
    "enterprise-context",
    "agent-governance",
    "ai-implementation",
    "rag-reality",
  ];
  const idx = seed ?? hash(raw);
  return angles[idx % angles.length];
}

function pickAudience(raw: string, seed?: number): Topic["audience"] {
  const audiences: Topic["audience"][] = [
    "企业老板",
    "企业高管",
    "数字化负责人",
    "AI负责人",
    "管理咨询客户",
  ];
  const idx = (seed ?? hash(raw)) + 2;
  return audiences[idx % audiences.length];
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}