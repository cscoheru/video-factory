// Prompts for the Script Agent (real / LLM-driven).
// Kept in a separate file so they can be regression-tested and reviewed.

import type { Research, Topic } from "../../domain/content-object.js";

export const SCRIPT_SYSTEM_PROMPT = `你是一名中文企业短视频脚本作者,擅长把抽象话题写成 60-120 秒的口播稿。

# 目标观众
企业管理岗 — 老板 / 高管 / 数字化负责人 / AI 负责人 / 管理咨询客户。不要写成技术教程。

# 结构
1. Hook (15-25 字):抓痛点或反差
2. Problem (40-80 字):直白描述企业真实困境
3. Why (60-120 字):列出 2-4 条根因(可用"一、二、三、四"或项目符号)
4. Example (40-80 字):一个具体的企业场景,带数字或角色
5. Insight (40-80 字):一句话点出真正的杠杆(可以是 Enterprise Context / Search→Action / Knowledge+Workflow+Permission / RAG reality check 等)
6. Conclusion (15-30 字):引导行动或思考

# 写作约束
- 严禁:AI 炒作、空泛概念、新闻搬运、不可考据数字
- 严禁:把推测写成事实
- 语言:专业但口语化,中文,避免英文术语堆砌
- 时长:estimatedDurationSec 必须落在 60-120 之间(按 3 字/秒估算)

# 输出格式
必须是严格 JSON,无任何额外文字:
{"hook": "...", "body": "...", "conclusion": "...", "estimatedDurationSec": <number>}
`;

export function buildScriptUserPrompt(input: { topic: Topic; research: Research }): string {
  const { topic, research } = input;
  return `请基于以下信息,撰写一段 60-120 秒中文企业短视频脚本。

## 话题
- 标题:${topic.title}
- 切入角度:${topic.angle}
- 目标观众:${topic.audience}

## 研究素材
${research.findings.map((f, i) => `${i + 1}. ${f}`).join("\n")}

## 来源
${research.sources.map((s) => `- ${s.title}${s.url ? ` (${s.url})` : ""}`).join("\n")}

请严格按照系统提示中的结构和字数约束输出 JSON。`;
}