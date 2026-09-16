// Research Agent — turns a topic into structured research (sources + findings).
// Phase 2: deterministic mock that returns canned enterprise-research content.

import type { Research, Topic } from "../../domain/content-object.js";

export function mockResearchAgent(topic: Topic, seed?: number): Research {
  const sources = [
    {
      id: "src-001",
      title: "Glean Enterprise Context — 公开能力概述",
      url: "https://www.glean.com/enterprise-search",
    },
    {
      id: "src-002",
      title: "企业内部知识管理现状(中文综述)",
    },
    {
      id: "src-003",
      title: "RAG 落地常见误区 — 行业观察",
    },
  ];
  const findings = [
    `${topic.audience}最关心的是"投入能不能减少加班",而不是 AI 概念本身。`,
    "知识库上线后使用率低,常见根因:检索质量差、权限不清、缺乏流程嵌入。",
    `${topic.angle}相关能力,需要在"企业 Context"层而非单点 RAG 解决。`,
    "Search → Answer → Action 链路中,Action 缺位是普遍痛点。",
  ];
  return { sources, findings };
}