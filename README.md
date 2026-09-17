# video-factory

> **Phase 1 (Bootstrap) — work in progress.**
> An experimental project: from a topic input → research → script → storyboard → voice → FFmpeg render → MP4, all orchestrated by Trigger.dev.

This repository is **not** the Glean / Enterprise Agent research repo (that lives at
`../domainAgentECE`). It is a sibling experiment that exercises the Enterprise Agent
workflow shape (Trigger → Context → Agent → Tool → Structured State → Workflow →
Human Approval → Action → Observability → Feedback) using video production as a
concrete, demonstrable vertical.

See `../domainAgentECE/CLAUDE.md` for the strategic context, and (forthcoming)
`docs/architecture/video-factory.md` for the experiment-level architecture notes.

---

## Status

| Phase | Scope | Status |
|-------|-------|--------|
| 0 | Environment + project audit | ✅ done |
| 1 | Project init + Trigger.dev + hello task + hello workflow | ✅ done (`run_06galdgbp5qhnbhu5obdq1ah01`, 262ms, success) |
| 2 | Content Object + Mock Agents + Workflow | ✅ done (`run_06galhh243875ta6i2feka7f01`, 7.4s, success, all 7 leaf tasks green) |
| 3 | Real LLM (GLM) + Script + FactCheck + Storyboard | ✅ done (real-GLM E2E: `run_06gapavq53j4o9ka2clm0mb701`, 6.7s, GLM produced 95s script + 5-scene storyboard; FactCheck caught 2 unverifiable claims) |
| 4 | TTS + FFmpeg + MP4 | ⏳ |
| 5 | Quality Agent + Human Approval | ⏳ |

Hard rule: **do not enter the next phase before the user signs off on the current one.**

---

## Toolchain

- Node v24.x
- npm 11.x
- Docker 29.x (not yet used)
- ffmpeg 7.0.2 (static build at `~/bin/ffmpeg` — see note below)
- Trigger.dev CLI 4.6.x
- Trigger.dev SDK 4.x

### ffmpeg note (WSL)

The host WSL environment does not allow passwordless `sudo apt install`. We
therefore use a static build at `~/bin/ffmpeg` (johnvansickle.com build, 7.0.2).
- Use the absolute path `~/bin/ffmpeg` from any scripts.
- Or add `export PATH="$HOME/bin:$PATH"` to your `~/.bashrc` manually.

---

## Setup

```bash
# 1. Copy env
cp .env.example .env.local
# Edit .env.local and fill TRIGGER_SECRET_KEY from https://cloud.trigger.dev

# 2. Install deps
npm install

# 3. Login / link the Trigger.dev project
npx trigger.dev login --profile default   # OAuth (or skip if TRIGGER_SECRET_KEY is set)
npx trigger.dev init                       # creates project ref

# 4. Run the dev runtime (foreground)
npx trigger.dev dev
```

In another terminal:

```bash
# Trigger the example workflow via the CLI / dashboard
# (Phase 1: hello-task only, no business logic yet)
```

The dev runtime streams logs to stdout and exposes each task run in the
Trigger.dev dashboard.

---

## Layout (planned)

```
src/
  agents/
    research/
    topic/
    script/
    factcheck/
    storyboard/
    voice/
    quality/
  providers/
    llm/
    voice/
  domain/
    content-object.ts
    schemas.ts
    types.ts
  render/

trigger/
  hello.ts
  tasks/
  video-factory.ts        # Phase 2+

assets/
output/
tests/
docs/
.env.example
.env.local                # gitignored
.gitignore
package.json
trigger.config.ts
README.md
```

---

## Phase discipline

- **Mock-first**: every agent must have a working mock before any real provider is wired in.
- **Provider interfaces**: `LLMProvider`, `VoiceProvider` — never call vendor SDKs from business logic.
- **Structured state**: agents communicate via a typed `ContentObject` (Zod schema), not free-form chat.
- **Observability**: every task logs `contentId / taskId / duration / provider / status`.
- **Errors are typed**: retryable / non-retryable / needs-human.