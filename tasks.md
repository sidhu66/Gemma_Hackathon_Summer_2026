# Interview.me — Team Task Board

> Split across 5 members. Core product loop exists; work focuses on making it runnable, secure, complete, and shippable.

**Priority legend:** P0 = unblock run | P1 = correctness/security | P2 = product surface | P3 = polish

---

## Team overview

| Member | Focus area | Owns |
|--------|------------|------|
| **Member 1** | Backend platform & ops | Env, DB, ports, deps, docs for BE |
| **Member 2** | Auth, security & APIs | Token/authz, interview APIs, ownership |
| **Member 3** | Live interview & AI pipeline | WS, Deepgram, OpenAI, Ollama model |
| **Member 4** | Frontend UX & polish | Meeting UI, Results, Landing, nav |
| **Member 5** | Product features & QA | Waitlist/essay/history, tests, README |

---

## Member 1 — Backend platform & ops

**Goal:** Anyone on the team can start FE + BE + DB without guessing ports/env.

### Tasks

- [ ] **[P0]** Fix `queries.sql` syntax (missing comma before `CONSTRAINT score_check`)
- [ ] **[P0]** Normalize table naming (`Interviews` vs `interviews`) into one consistent schema
- [ ] **[P0]** Write a single DB setup path (fresh `CREATE` + needed columns: `intake`, `interview_date`, `QAOfInterview.feedback`)
- [ ] **[P0]** Make DB connection fully env-driven (`DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT`) — not only password
- [ ] **[P0]** Add `Back-End/.env.example` with all required vars (no secrets)
- [ ] **[P0]** Align HTTP `PORT`, `WEBSOCKET_PORT`, CORS origins, and remove hardcoded `http://localhost:8080` in `app.js` (use env base URL)
- [ ] **[P0]** Add `ollama` to `Back-End/package.json` (remove root-only hack if no longer needed)
- [ ] **[P0]** Fix `package.json` `"main"` to `app.js` (or add real `index.js` entry)
- [ ] **[P2]** Remove unused BE deps (`@google-cloud/vertexai`, `@google/generative-ai`, `react-markdown`) **or** coordinate with Member 3 if Google path is intentional
- [ ] **[P2]** Move hardcoded Sentry DSN to env (`SENTRY_DSN`)
- [ ] **[P3]** Add short **Backend Setup** section to root README (Postgres create DB, run schema, `npm run dev`)

### Acceptance criteria
- New teammate can create DB from docs and start BE with `.env.example` as a template
- No hardcoded localhost API URLs in WS handlers
- Schema applies cleanly on a fresh Postgres

### Key files
- `Back-End/queries.sql`
- `Back-End/dbConnection.js`
- `Back-End/app.js`
- `Back-End/package.json`
- `Back-End/.env.example`
- `README.md`

---

## Member 2 — Auth, security & APIs

**Goal:** Users only see their own data; tokens behave correctly.

### Tasks

- [ ] **[P1]** Scope `getRecentInterview` to `req.user.id` (recent scores + latest chat)
- [ ] **[P1]** Scope `getFeedback` to interviews owned by `req.user.id`
- [ ] **[P1]** Scope `getInterviewDetail` to interviews owned by `req.user.id`
- [ ] **[P1]** Scope score `UPDATE` in `endInterview` to `user_id = req.user.id`
- [ ] **[P1]** Restore `expiresIn` on tokens created in `refreshToken` (access + refresh)
- [ ] **[P1]** Review access-token TTL (`1m`) — keep with solid refresh, or raise to a sensible value (e.g. `15m`) with team agreement
- [ ] **[P1]** Audit signup/login error handling (e.g. `Error` constructed with multiple args)
- [ ] **[P2]** Ensure all `/api/interview/*` routes stay behind `requireAuth`; document auth cookie flow for FE
- [ ] **[P3]** Optional production auth stretch: password reset **or** email verification (pick one with Product; stub API + page if approved)

### Acceptance criteria
- User A cannot fetch User B’s feedback / interview detail / recent list
- Refresh rotation still works and new tokens expire
- Auth regression checklist filled (register → login → refresh → logout)

### Key files
- `Back-End/controllers/mainController.js`
- `Back-End/controllers/userController.js`
- `Back-End/middleware/requireAuth.js`
- `Back-End/routes/user.js`
- `Back-End/routes/main.js`
- `Front-End/src/lib/axios.ts`

### Depends on
- Member 1’s env/port alignment for local testing

---

## Member 3 — Live interview & AI / ML pipeline

**Goal:** End-to-end voice interview + STAR grading works reliably with a named Ollama model.

### Tasks

- [ ] **[P0]** Decide single Ollama model name (`interview-qwen` vs `finetunedmodel`) and use it everywhere
- [ ] **[P0]** Update `evaluateInterview` to use that model name
- [ ] **[P0]** Document GGUF → `Modelfile` → `npm run create-model` flow (or provide shared model artifact location)
- [ ] **[P0]** Verify `Ml/main.ipynb` + `tdata.json` export path matches `Modelfile` base GGUF
- [ ] **[P0]** Smoke-test: start interview → speak → AI reply + TTS → end → feedback JSON (`grade`, `summary`, `star`, `mockAnswer`, `suggestions`)
- [ ] **[P1]** Harden Ollama eval: invalid JSON / model missing → clear 500 message; don’t leave interview half-saved without feedback UX
- [ ] **[P1]** Confirm Deepgram STT/TTS + OpenAI streaming still work after Member 1 port changes
- [ ] **[P2]** Remove dead `VertexAI` import if not used; confirm OpenAI is the only interviewer path
- [ ] **[P3]** Improve grading prompt/schema validation (retry parse once, or fallback structured response)

### Acceptance criteria
- `create-model` produces a model the BE can call
- Ending an interview returns parseable STAR feedback and stores score
- Failure modes (Ollama down / wrong model) are visible in logs and API error

### Key files
- `Back-End/controllers/mainController.js` (`evaluateInterview`, `endInterview`)
- `Back-End/Modelfile`
- `Back-End/openai/openai.js`
- `Back-End/deepgram/deepgram.js`
- `Back-End/app.js` (WS session)
- `Ml/main.ipynb`
- `Ml/tdata.json`

### Depends on
- Member 1 (`ollama` dep + ports)
- Member 2 (auth on start/end interview)

---

## Member 4 — Frontend UX & polish

**Goal:** Meeting/Results/Landing feel finished and match real behavior.

### Tasks

- [ ] **[P0]** Add `Front-End/.env.example` (`VITE_REACT_APP_API_URL`, `VITE_WEBSOCKET_URL`) aligned with Member 1 ports
- [ ] **[P1]** Fix Results polling: stop interval when data loads; add timeout + error UI if feedback never arrives
- [ ] **[P2]** Re-enable **or** delete `MeetingOptions` (mic/cam/end) — do not leave commented half-UI
- [ ] **[P2]** Re-enable **or** delete `ModeToggle`
- [ ] **[P2]** Fix mobile navbar placeholders (“Deets”, “something else”) — real links or remove menu
- [ ] **[P2]** Landing waitlist: wire Subscribe **or** remove form until Member 5 ships API (coordinate)
- [ ] **[P2]** Landing features section: keep only features that exist **or** mark “Coming soon” until Member 5 implements
- [ ] **[P2]** Clean unused FE packaging (`name: "landingpage"`, unused `dotenv` if unused)
- [ ] **[P3]** Improve Meeting empty-state / connection errors (WS fail, mic permission denied)
- [ ] **[P3]** Move FE Sentry DSN to env if hardcoded

### Acceptance criteria
- Results page stops polling after success
- No placeholder nav labels
- Landing does not claim unshipped features without “Coming soon”
- FE starts with `.env.example` values matching BE

### Key files
- `Front-End/src/Pages/Results.tsx`
- `Front-End/src/Pages/Meeting.tsx`
- `Front-End/src/Pages/Landing.tsx`
- `Front-End/src/components/MeetingOptions.tsx`
- `Front-End/src/components/navbar.tsx`
- `Front-End/src/components/mode-toggle.tsx`
- `Front-End/.env.example`

### Depends on
- Member 1 (API/WS URLs)
- Member 5 (waitlist/essay APIs if wiring real forms)

---

## Member 5 — Product features, docs & QA

**Goal:** Decide what’s in MVP vs cut; document the system; add minimal tests.

### Tasks

- [ ] **[P2]** Product decision write-up: implement vs cut for Essay Grader, Admission Boost, Waitlist, Payments
- [ ] **[P2]** If Waitlist = yes: add `POST /api/user/waitlist` (or similar) + store email + FE wire-up with Member 4
- [ ] **[P2]** If Essay Grader = yes: minimal page + API stub that grades text (can reuse OpenAI); else remove from Landing
- [ ] **[P2]** If Admission Boost = yes: define scope (content? tips?); else remove from Landing
- [ ] **[P2]** Optional: full interview history page (beyond last 3 + search) — API + FE route
- [ ] **[P3]** Rewrite root `README.md`: architecture diagram, stack, setup (Postgres, Ollama, Deepgram, OpenAI, FE, BE)
- [ ] **[P3]** Replace Front-End Vite boilerplate README with product-oriented notes
- [ ] **[P3]** Add minimal BE tests: register/login, ownership on `getFeedback`, start/end interview happy path (mock Ollama if needed)
- [ ] **[P3]** Manual QA checklist (below) — run end-to-end before merge of “MVP complete”
- [ ] **[P3]** Explicitly defer Payments unless Product mandates it (document “out of scope”)

### Acceptance criteria
- Landing matches shipped features
- README is enough for a new hire to run the app
- At least a small automated auth/ownership test suite exists **or** a signed manual QA checklist is green

### Key files
- `README.md`
- `Front-End/README.md`
- New: waitlist/essay routes + pages (if approved)
- `Back-End/controllers/*` (feature APIs)
- Test folder / QA checklist

### Depends on
- Members 1–4 for stable local environment

---

## Cross-team milestones

### Milestone A — “It runs locally” (P0)
- Member 1: schema + env + ports  
- Member 3: Ollama model wired  
- Member 4: FE `.env.example`  
- **Exit:** signup → intake → meeting → results with a grade

### Milestone B — “It’s safe” (P1)
- Member 2: ownership + token expiry  
- Member 4: Results polling fix  
- Member 3: eval error handling  
- **Exit:** no cross-user data leaks; refresh works; results don’t spin forever

### Milestone C — “It’s honest & polished” (P2–P3)
- Member 5: product cuts / waitlist or essay  
- Member 4: Landing + Meeting UI cleanup  
- Member 5: README + QA  
- **Exit:** marketing matches product; docs + checklist done

---

## Manual QA checklist (Member 5 owns; all help)

- [ ] Register new user
- [ ] Login / logout / session persist on refresh
- [ ] Access token refresh via axios interceptor
- [ ] Intake validation (required fields, job description length)
- [ ] Meeting: mic permission, transcript appears, AI speaks
- [ ] End interview → Results grade + STAR + mock answer + suggestions
- [ ] Home: recent scores, charts, search by company
- [ ] User B cannot open User A’s `feedback/:id`
- [ ] CORS/cookies work on configured FE origin
- [ ] Ollama down → clear error (no silent hang)

---

## Suggested ownership of open product questions

| Question | Owner | Default if undecided |
|----------|--------|----------------------|
| Essay Grader in MVP? | Member 5 + Product | Cut from Landing |
| Admission Boost in MVP? | Member 5 + Product | Cut / rename to “Progress tracking” |
| Waitlist? | Member 5 + Member 4 | Simple email store API |
| Payments? | Member 5 | Out of scope |
| Ollama model name | Member 3 | `interview-qwen` |
| Access token TTL | Member 2 | `15m` access / `7d` refresh |

---

## Communication rules

1. **Member 1 merges env/port changes first** — others rebase before deep FE/WS work.
2. **Member 3 and Member 2** sync on `endInterview` / ownership before changing controllers.
3. **Member 4 and Member 5** agree Landing copy before Member 4 ships UI.
4. No secrets in PRs (`.env` stays local; only `.env.example` committed).
