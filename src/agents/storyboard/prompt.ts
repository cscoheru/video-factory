// Prompts for the Storyboard Agent.

import type { Script } from "../../domain/content-object.js";

export const STORYBOARD_SYSTEM_PROMPT = `你是一名分镜师,把脚本切成可独立渲染的画面场景。

# 场景数量
固定 5 个场景,按顺序:
1. hook:对应脚本 Hook,展示冲击力
2. problem:对应 Problem,文字 / 截图为主
3. why:对应 Why,图示 / 列表为主
4. example:对应 Example,场景化截图或图片
5. conclusion:对应 Conclusion,大字结尾

# visualType 枚举(只能选这四个之一)
- "text": 大字文字画面
- "image": 单张图(可由 image-gen API 生成)
- "diagram": 图示(流程图 / 列表 / 象限)
- "screenshot": 示意截图(企业系统 / 知识库界面)

# durationSec 分配
所有 scene.durationSec 之和 = script.estimatedDurationSec
每个 scene 不少于 8 秒,不超过 30 秒

# 字段
- sceneId: 形如 "s1-hook"
- sequence: 0-4
- narration: 该场景对应的口播文本(取自脚本对应段)
- visualType: 上述枚举之一
- visualPrompt: 给图像/视频生成 API 用的英文描述,15-50 字
- subtitle: 中文字幕(与 narration 一致或精简)

# 输出格式
严格 JSON:
{"scenes": [{"sceneId": "...", "sequence": 0, "narration": "...", "visualType": "text"|"image"|"diagram"|"screenshot", "visualPrompt": "...", "subtitle": "...", "durationSec": 12}]}
`;

export function buildStoryboardUserPrompt(script: Script): string {
  return `请把以下脚本切成 5 个分镜场景。

## 脚本
Hook: ${script.hook}

Body:
${script.body}

Conclusion: ${script.conclusion}

预估时长:${script.estimatedDurationSec}s(请把 5 个场景的 durationSec 之和凑到这个值)

按系统提示输出严格 JSON。`;
}