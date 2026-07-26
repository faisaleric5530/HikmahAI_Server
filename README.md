# Hikmah AI Backend

Express + Sequelize (PostgreSQL) + Zod backend for the HikmahAI Islamic knowledge platform.
Architecture mirrors `digital-wallet-apis-main` (routes → zod validation → controller → service → Sequelize models), used as a structural reference only.

## Setup

```bash
npm install
cp .env.example .env   # fill in DB creds + at least one AI provider key
npm run migrate
npm run dev
```

## AI provider

Chat replies are routed through `server/services/ai/index.js`, which picks a provider from `AI_PROVIDER` in `.env`:

- `AI_PROVIDER=openai` (default) — uses `OPENAI_API_KEY` / `OPENAI_MODEL`
- `AI_PROVIDER=claude` — uses `ANTHROPIC_API_KEY` / `CLAUDE_MODEL`

Both providers implement the same `generateReply({ messages, systemPrompt })` interface (`server/services/ai/providers/`), so switching models is a `.env` change only — no code changes in `chat-service.js` or above. When the fine-tuned Islamic model is ready, add `providers/islamic-provider.js` and register it in `services/ai/index.js`.

## Roles

Three roles on `users.role`: `user` (default) → `scholar` (granted automatically when an admin approves their scholar application) → `admin` (no self-serve path — promote the first admin directly in the DB, e.g. `UPDATE "hikmah"."user" SET role = 'admin' WHERE email = '...';`, after that admins can only be created by editing the DB or by an admin-only endpoint if you add one later).

## Endpoints (v1, prefixed `/api/v1`)

**Auth**
- `POST /auth/register` — { name, email, password }
- `POST /auth/login` — { email, password }
- `GET /auth/profile` — requires `Authorization: Bearer <token>`

**Scholar Applications** (auth required)
- `POST /scholar-applications` — { fullName, qualifications, ijazah? } — one pending application at a time
- `GET /scholar-applications/me` — latest application + status for the current user
- `GET /scholar-applications?status=pending` — admin only
- `PATCH /scholar-applications/:applicationId` — { status: 'approved' | 'rejected' } — admin only; approving flips the applicant's role to `scholar`

**Channels & Q&A** (auth required)
- `GET /channels` / `GET /channels/:channelId`
- `POST /channels` — { name, description?, colorVariant? } — admin only
- `GET /channels/:channelId/questions`
- `POST /channels/:channelId/questions` — { title, body } — any authenticated user
- `GET /questions/:questionId` — includes replies
- `POST /questions/:questionId/replies` — { body } — any authenticated user
- `PATCH /replies/:replyId/verify` — marks a reply as the verified answer — scholar or admin only

**Blogs** (auth required)
- `GET /blogs` — published only
- `GET /blogs/:blogId` — any status, for direct access by the author/admin
- `POST /blogs` — { title, body, status? } — scholar or admin only
- `PATCH /blogs/:blogId` — owner or admin only
- `DELETE /blogs/:blogId` — owner or admin only

**Chat** (auth required)
- `GET /chat/sessions`
- `POST /chat/sessions`
- `GET /chat/sessions/:sessionId`
- `DELETE /chat/sessions/:sessionId`
- `POST /chat/sessions/:sessionId/messages` — { content } → persists the user message, calls the active AI provider, persists + returns the assistant reply

## Postman

Import `postman/Hikmah-AI-API.postman_collection.json`. Run **Auth → Register**, then **Auth → Register Second User**, then promote the second user to admin in the DB and run **Auth → Login as Admin** to populate `admin_token` — everything else (scholar approval, channel creation, verifying replies, blog publishing) depends on that token.
