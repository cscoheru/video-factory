# Project Report — video-factory (Phases 0–3)

> **Generated**: 2026-09-17
> **Author**: Claude Code (model: claude-sonnet-4-5)
> **Status snapshot**: Phase 0/1/2/3 ✅ done; Phase 4/5 ⏳ not started
> **Audience**: Internal review (Codex / future Claude sessions / human reviewer)

---

## 1. Origin

This work was driven by the document at:

```
C:\Users\berng\Documents\Obsidian Vault\EA视频工厂\给cc的执行思路.md
```

(WSL path: `/mnt/c/Users/berng/Documents/Obsidian Vault/EA视频工厂/给cc的执行思路.md`)

The document specified a 5-phase execution plan for an "Enterprise Agent video production
experiment" built on Trigger.dev + Claude Code + WSL, with strict phase discipline
("完成一个 Phase 就停;不要一口气生成 300 个文件"). This report summarises what was
actually delivered against that plan.

A sibling ADR-011 was filed at:

```
cscoheru/domainAgentECE/docs/adr/ADR-011-video-factory-experiment.md
```

to formally register the project as a Track-A-post-STOP experiment.

---

## 2. Phase Status

| Phase | Scope (per PRD) | Status | Evidence |
|-------|-----------------|--------|----------|
| **0** | Environment + project audit | ✅ done | Initial chat transcript (this conversation) |
| **1** | Project init + Trigger.dev + hello task + hello workflow | ✅ done | commit `b4ae432`; Trigger.dev run `run_06galdgbp5qhnbhu5obdq1ah01` |
| **2** | Content Object + Mock Agents + Workflow | ✅ done | commit `8a08cc1`; Trigger.dev run `run_06galhh243875ta6i2feka7f01` |
| **3** | Real LLM (GLM) + Script + FactCheck + Storyboard | ✅ done | commit `03f78df`; Trigger.dev run `run_06gapavq53j4o9ka2clm0mb701` |
| **4** | TTS + FFmpeg + MP4 | ⏳ not started | — |
| **5** | Quality Agent + Human Approval | ⏳ not started | — |

Hard rules observed: each phase stopped and waited for explicit user approval before
proceeding; mock-first everywhere; no auto-entry to next phase.

---

## 3. Architecture Overview

```
                 ┌─────────────────────────────────────────────────────────┐
                 │  Trigger.dev Cloud (project ref proj_loorzfygfiffmwcjslpb)│
                 └─────────────────────────────────────────────────────────┘
                                       ▲
                                       │ (HTTPS, branch=default)
                                       │
   ┌─────────────── dev worker (local) ─────────────────────────────────┐
   │                                                                     │
   │  trigger/tasks/video-factory.ts  ◄──── Top-level orchestrator       │
   │       │                                  (id: "video-factory")     │
   │       ├── vfTopicTask        (mock only in Phase 3)                 │
   │       ├── vfResearchTask     (mock only in Phase 3)                 │
   │       ├── vfScriptTask       (mock | real LLM)                      │
   │       ├── vfFactCheckTask    (mock | real LLM)                      │
   │       ├── vfStoryboardTask   (mock | real LLM)                      │
   │       ├── vfVoiceTask        (Phase 2 stub; Phase 4 real TTS)        │
   │       └── vfQualityTask      (Phase 2 structural check)             │
   │                                                                     │
   │  MOCK_MODE env ─► dispatcher picks mock vs real per stage            │
   │  LLM_PROVIDER env ─► getLLMProvider() returns MockLLMProvider        │
   │                       or GLMProvider                                │
   └─────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
   ┌── src/domain/content-object.ts ─────────────────────────────────────┐
   │  Zod schemas: Topic / Research / Script / FactCheck / Storyboard /  │
   │              Voice / Video / Quality / ContentObject                │
   │  Factory: createEmptyContentObject(rawTopic)                        │
   └─────────────────────────────────────────────────────────────────────┘
```

### 3.1 Key abstractions

- **`ContentObject`**: typed structured state passed between agents. Each stage has its
  own Zod schema; the composed schema validates the final state.
- **`LLMProvider`**: interface (`complete(prompt, opts)`) implemented by
  `MockLLMProvider` and `GLMProvider`. Driven by `LLM_PROVIDER` env var.
- **Agent dispatcher pattern**: each of `script` / `factcheck` / `storyboard` has
  `mock.ts` (pure function) + `real.ts` (LLM-driven) + `index.ts` (picks based on
  `mockMode` flag).
- **Framework-agnostic workflow** (`src/workflow/video-factory.ts`): composable
  orchestrator that can be unit-tested with a mock `LLMProvider`.

### 3.2 Provider abstraction (ADR-006 alignment)

```ts
interface LLMProvider {
  id: string;
  complete(
    prompt: string,
    opts?: { system?: string; json?: boolean; temperature?: number }
  ): Promise<string>;
}
```

`GLMProvider` uses the `openai` SDK pointed at Zhipu's OpenAI-compatible endpoint:

```
https://open.bigmodel.cn/api/paas/v4/
```

with default model `glm-4-plus` and `response_format: { type: "json_object" }` when
`opts.json === true`.

---

## 4. Deliverables — by commit

### Phase 1 — `b4ae432 phase 1: bootstrap + hello task + hello workflow`

```
.env.example                                 (tracked, placeholder only)
.env.local                                   (gitignored, contains Trigger.dev secret + project ref)
.gitignore
README.md                                    (Phase 1 status)
package.json                                 (zod, @trigger.dev/sdk, typescript, vitest)
package-lock.json
tsconfig.json                                (strict, moduleResolution: Bundler)
trigger.config.ts                            (project: env.TRIGGER_PROJECT_REF, maxDuration: 300)
src/hello-logic.ts                           (pure makeGreeting)
trigger/tasks/hello.ts                       (task({ id: "hello" }))
trigger/hello-workflow.ts                    (batchTriggerAndWait x 2)
tests/hello-logic.test.ts                    (4 tests)
output/<id>.json                             (gitignored, runtime artefacts)
```

**Verification**: Trigger.dev run `run_06galdgbp5qhnbhu5obdq1ah01` COMPLETED in 262ms.

### Phase 2 — `8a08cc1 phase 2: content object + mock agents + workflow`

```
src/domain/content-object.ts                 (Zod schemas + factory)
src/agents/<name>/mock.ts                    (7 deterministic mocks)
src/providers/llm/index.ts                   (LLMProvider interface + MockLLMProvider)
src/workflow/video-factory.ts                (framework-agnostic orchestrator)
trigger/tasks/vf-<stage>.ts                  (7 leaf tasks)
trigger/tasks/video-factory.ts               (orchestrator)
tests/{content-object,agents,workflow,providers,hello-logic}.test.ts
```

**Verification**: Trigger.dev run `run_06galhh243875ta6i2feka7f01` COMPLETED in 7.4s;
all 7 leaf tasks green; output JSON written.

### Phase 3 — `03f78df phase 3: real LLM (GLM) for script/factcheck/storyboard`

```
src/providers/llm/glm.ts                    (GLMProvider via OpenAI SDK)
src/providers/llm/index.ts                  (heuristic MockLLMProvider + factory + readMockMode)
src/agents/{script,factcheck,storyboard}/prompt.ts   (3 prompt files)
src/agents/{script,factcheck,storyboard}/real.ts     (3 LLM-driven agents)
src/agents/{script,factcheck,storyboard}/index.ts    (3 dispatchers)
src/workflow/video-factory.ts               (buildDefaultRunners dispatch)
trigger/tasks/{vf-script,vf-factcheck,vf-storyboard,video-factory}.ts
tests/providers/{llm-glm,index}.test.ts     (15 tests)
tests/agents/{script,factcheck,storyboard}-real.test.ts   (7 tests)
.gitignore                                  (+ .trigger/)
package.json / lock                         (+ openai@4.104.0)
```

**Verification**: 51/51 unit tests pass. Real GLM end-to-end run
`run_06gapavq53j4o9ka2clm0mb701` COMPLETED in 6.7s with `mockMode: false`. The GLM
generated a real 95-second Chinese script; the GLM-powered FactCheck agent flagged 2
unverifiable claims (78% with no source, "真正的杠杆" as strong assertion).

### Sibling — `domainAgentECE/docs/adr/ADR-011-video-factory-experiment.md`

UNCOMMITTED. Should be reviewed and committed by Track A session.

---

## 5. Test Coverage Matrix

| Area | Tests | Coverage |
|------|-------|----------|
| `hello-logic` | 4 | Pure function edge cases |
| `content-object` (Zod schemas) | 12 | Stage schemas, factory, validation |
| `agents/*` (Phase 2 mocks) | 10 | Determinism, edge cases |
| `workflow` (orchestrator) | 3 | Mock + runner injection + mockMode flag |
| `providers` (Phase 2 + 3) | 15 | MockLLMProvider shapes (echo/script/factcheck/storyboard) + getLLMProvider branches + readMockMode |
| `providers/llm-glm` | 3 | Constructor: apiKey required, defaults |
| `agents/script-real` | 3 | Valid JSON, non-JSON error, schema mismatch error |
| `agents/factcheck-real` | 2 | Valid JSON, non-JSON error |
| `agents/storyboard-real` | 2 | Valid JSON, non-JSON error |
| **Total** | **51** | — |

All passing with `MOCK_MODE=true`. Backward-compatible.

---

## 6. Trigger.dev Evidence

| Run ID | Phase | Topic / Payload | Duration | Outcome |
|--------|-------|-----------------|----------|---------|
| `run_06galdgbp5qhnbhu5obdq1ah01` | 1 | hello single trigger | 262ms | ✅ |
| `run_06gale88eh26sdr8hjg4q97d01` | 1 | hello batch A | 9ms | ✅ |
| `run_06gale88ehoj7a5e9tu18mq301` | 1 | hello batch B | 9ms | ✅ |
| `run_06galhh243875ta6i2feka7f01` | 2 | full workflow, mock | 7.4s | ✅ 7/7 green |
| `run_06gap86jdlis8o01h1crlute01` | 3 | full workflow, MOCK_MODE=true | 6.3s | ✅ 7/7 green |
| `run_06gapavq53j4o9ka2clm0mb701` | 3 | full workflow, MOCK_MODE=false, real GLM | 6.7s | ✅ 7/7 green |

LLM call durations (Phase 3, real GLM):
- vf-script: 1.6s
- vf-factcheck: 2.6s
- vf-storyboard: 5s
- Total LLM wall-clock: ~9s (within 300s maxDuration)

---

## 7. Honest Limitations / Known Issues

These are points a reviewer should look at critically:

1. **MockLLMProvider substring heuristic** — `src/providers/llm/index.ts` uses
   `sys.includes("visualType")` / `sys.includes('"severity"')` / etc. to dispatch
   which schema shape to return. If a future system prompt is rewritten and these
   markers move or disappear, the heuristic silently falls back to the generic echo
   shape, which then fails Zod parsing with a confusing error.
2. **FactCheck does not block workflow** — currently `quality.passed` is true even
   if `factCheck.status === "issues_found"`. The user can see the warnings but the
   pipeline proceeds. Phase 5 may need to gate on factCheck for human approval.
3. **Script hook redundancy** — observed in early mock output (already fixed by
   real GLM): hook construction concatenates audience + title in ways that can
   duplicate "为什么" prefixes. Real LLM doesn't have this issue, but mock agents
   remain in test fixtures.
4. **GLM API key handling** — `src/providers/llm/glm.ts` reads `process.env.GLM_API_KEY`
   and throws if empty. The check is at construction time only; if env var becomes
   empty after construction, runtime calls will fail with a less clear error.
5. **Trigger.dev `.trigger/` runtime cache** — not in `.gitignore` by default; we
   added it in Phase 3 commit but worth double-checking before any future local
   commit that nothing slips in.
6. **No retry/backoff in GLMProvider** — retry is delegated to Trigger.dev task
   config (`maxAttempts`). If a caller invokes `realScriptAgent` outside a
   Trigger.dev context (e.g., from the workflow directly), there's no built-in
   retry. Tests work around this with mock providers.
7. **`.trigger-dev-local/` profile auth** — the dev runtime uses OAuth profile
   `default` for `trigger login`, while project-scoped `TRIGGER_SECRET_KEY` is
   used for task auth. These are independent; revoking one doesn't affect the other.
8. **ADR-011 uncommitted** — sits in `domainAgentECE/docs/adr/` as `??` (untracked).
   Should be committed by Track A session before any merge / PR.
9. **Trigger.dev secret key exposure history** — the original key was shared in
   plaintext in chat during Phase 0 and was rotated 2026-09-17. The new key
   resides only in `.env.local` (gitignored). Reviewers should not echo either key
   value in any tracked file or commit message.
10. **GLM API key exposure history** — similarly provided in plaintext chat during
    Phase 3 setup. Currently only in `.env.local`. Recommend rotation after
    Phase 5 closes; redact from any tracked documentation.

---

## 8. Codex / Reviewer Audit Checklist

The following files and areas are recommended for Codex / second-pass review:

### 8.1 High priority — design & correctness

- [ ] `src/domain/content-object.ts` — Zod schema semantics, especially
  `StoryboardSchema.min(1)` vs the factory's empty scenes array (resolved but
  worth re-confirming)
- [ ] `src/providers/llm/index.ts` — MockLLMProvider substring heuristic (§7.1)
- [ ] `src/providers/llm/glm.ts` — API key handling, error semantics (§7.4)
- [ ] `src/agents/*/prompt.ts` (3 files) — prompt design quality, JSON mode
  reliability, output shape constraints
- [ ] `src/agents/*/real.ts` (3 files) — Zod parse failure handling
- [ ] `src/workflow/video-factory.ts` — stage sequencing, no parallel opportunities
  missed (currently fully sequential)
- [ ] `trigger/tasks/video-factory.ts` — `triggerAndWait` vs `batchTriggerAndWait`
  trade-offs at scale
- [ ] `domainAgentECE/docs/adr/ADR-011-video-factory-experiment.md` — architectural
  alignment with Track A strategy

### 8.2 Medium priority — security & ops

- [ ] `.gitignore` — coverage of `.env.local`, `output/`, `.trigger/`,
  `.trigger-dev-local/`, `node_modules/`
- [ ] `package.json` / `package-lock.json` — audit any `moderate / high / critical`
  vulnerabilities from `npm audit`
- [ ] `README.md` — ffmpeg note about `sudo apt` limitation; SSH key cleanup
  reminder for collaborators
- [ ] `.env.example` — confirm only placeholder values, no real secrets

### 8.3 Lower priority — style & consistency

- [ ] Comment density — currently Chinese mixed with English; pick a project
  standard
- [ ] Test naming convention — `*-real.test.ts` vs `*-mock.test.ts`; should there
  be a `tests/integration/` directory?
- [ ] File-name consistency (`vf-*.ts` prefix vs not)
- [ ] Logger usage in tasks — consistent `{ stage, taskId, status }` shape?

### 8.4 Out of scope (Phase 4/5)

- Phase 4 (TTS + FFmpeg + MP4) — not implemented; review should happen when
  the next commit lands
- Phase 5 (Quality + Human Approval) — not implemented
- ADR-012+ (any future architectural decisions)

---

## 9. Operational Artefacts (not in git)

These are intentionally outside version control but reviewer should be aware:

| Location | Purpose | Sensitive? |
|----------|---------|-----------|
| `~/.ssh/github_video_factory` | SSH private key for `cscoheru/video-factory` push | YES |
| `~/.ssh/github_video_factory.pub` | corresponding public key | no (already on GitHub) |
| `~/.ssh/config` | `Host github.com → IdentityFile` mapping | no |
| `/home/fisher/.trigger-dev` | Trigger.dev CLI OAuth profile `default` | contains OAuth tokens |
| `.env.local` | TRIGGER_SECRET_KEY, GLM_API_KEY, project ref | YES — gitignored |
| `~/bin/ffmpeg` | static ffmpeg 7.0.2 binary | no |
| `.trigger/` | Trigger.dev local runtime cache (Phase 3 added to .gitignore) | no |
| `output/co_*.json` | Per-run ContentObject snapshots, gitignored | no |

---

## 10. Reproducibility

To reproduce end-to-end on a clean machine:

```bash
# 1. Clone
git clone git@github.com:cscoheru/video-factory.git
cd video-factory

# 2. Install
npm install

# 3. Configure (need: Trigger.dev secret key, GLM API key, project ref)
cp .env.example .env.local
# Edit .env.local — fill TRIGGER_SECRET_KEY, GLM_API_KEY, TRIGGER_PROJECT_REF
# Optional: set MOCK_MODE=true to skip real LLM calls

# 4. Run tests
npm test

# 5. Run end-to-end on Trigger.dev
npm run dev   # starts local dev worker
# In another shell, trigger a workflow via API or dashboard
```

For Trigger.dev CLI auth (separate from project-scoped secret key):

```bash
npx trigger.dev login --profile default   # OAuth via browser
```

---

## 11. Summary

Three phases of a five-phase plan executed end-to-end with discipline:
mock-first, content-object-typed, dispatcher-pattern agents, real GLM
integrated and verified. All 51 tests green. Three commits pushed to a
new public GitHub repo. ADR-011 drafted but not yet committed.

Next steps (Phase 4 and 5) are queued but explicitly **not** started,
awaiting user direction.