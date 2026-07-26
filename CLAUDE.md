# HikmahAI Server — Claude Code Reference

Express + Sequelize REST API serving the HikmahAI Islamic knowledge platform.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js ≥ 18 |
| Framework | Express 4 |
| ORM | Sequelize 6 + pg |
| Validation | Zod 3 |
| Auth | JWT (jsonwebtoken) + bcrypt |
| AI | @anthropic-ai/sdk · openai SDK · openrouter (pluggable via `AI_PROVIDER`) |
| Env validation | envalid |
| Dev | nodemon + eslint |

---

## Project Structure

```
server/
  app.js                    # Entry: DB auth → createServer() → listen
  utils/
    server.js               # Express app factory — all middleware + route mounts
    jwt.js                  # signToken / verifyToken
    hashes.js               # hashPassword / verifyPassword (bcrypt)
    response.js             # sendResponse / throwErrorResponse / paginatedResponse
  constants/
    env.js                  # envalid-validated env (imported everywhere as { env })
    settings.js             # Rate limit defaults, EXPOSED_HEADERS
    status.js               # HttpStatusCode enum object
  middleware/
    auth.js                 # strictAuth (JWT bearer) · requireRole(...roles)
    request-validator.js    # zodValidation(schema) — validates body/params/query
    rate-limiter.js         # rateLimiter(max, windowSec) · ipRateLimiter(max, windowSec)
  controllers/              # One file per domain — thin: call service, call sendResponse
    auth-controller.js
    channel-controller.js
    chat-controller.js
    blog-controller.js
    scholar-application-controller.js
    question-controller.js
    reply-controller.js
    user-controller.js
    dm-controller.js
  services/                 # All business logic
    auth-service.js
    channel-service.js      # maskName() · toPublicQuestion/Reply · listQuestions (JOINs replies)
    chat-service.js
    blog-service.js
    scholar-application-service.js
    dm-service.js           # ts() helper · startOrGetConversation · listConversations · sendMessage
    ai/                     # AI provider abstraction
      index.js              # Selects provider from AI_PROVIDER env var
      claude.js
      openai.js
      openrouter.js
      mock.js
  routes/                   # One Router per domain
    auth.js
    channels.js
    questions.js
    replies.js
    blogs.js
    chat.js
    scholar-applications.js
    users.js
    dms.js
  schema/                   # Zod schemas, one folder per domain
    auth/         login.js · register.js · index.js
    channels/     channel-id.js · create-channel.js · create-question.js · create-reply.js · question-id.js · reply-id.js · index.js
    chat/         send-message.js · session-id.js · index.js
    blogs/        blog-id.js · create-blog.js · update-blog.js · index.js
    scholar-applications/  submit.js · review.js · index.js
    users/        update-preferences.js · index.js
    dms/          start-conversation.js · send-message.js · index.js
    custom.js     # Shared custom Zod helpers
  exceptions/
    index.js      # APIError · ServiceErrorHandler · handleSequelizeError
database/
  index.js        # Sequelize instance + model loader + associations
  models/
    user.js
    blog.js
    channel.js
    chat_session.js
    chat_message.js
    question.js
    reply.js
    scholar_application.js
    dm_conversation.js
    dm_message.js
  migrations/     # Numbered by date prefix (see Migration Naming below)
  seeders/
```

---

## API Base URL

All routes are prefixed with `/api/v1`.

Health check: `GET /api/v1/health`

---

## All Endpoints

### Auth (`/api/v1/auth`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Create account (IP rate-limited) |
| POST | `/login` | — | Get JWT (IP rate-limited) |
| GET | `/profile` | strictAuth | Current user info |

### Channels (`/api/v1/channels`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | strictAuth | List all channels |
| POST | `/` | strictAuth + admin | Create channel |
| GET | `/:channelId` | strictAuth | Get channel by public_id |
| GET | `/:channelId/questions` | strictAuth | List questions (with replies inline) |
| POST | `/:channelId/questions` | strictAuth | Post a question |

### Questions (`/api/v1/questions`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/:questionId/replies` | strictAuth | Reply to a question |

### Replies (`/api/v1/replies`)

| Method | Path | Auth | Description |
|---|---|---|---|
| PATCH | `/:replyId/verify` | strictAuth + scholar/admin | Mark reply as verified answer |

### Blogs (`/api/v1/blogs`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | — | List all blogs |
| GET | `/:id` | — | Get blog by public_id |
| POST | `/` | strictAuth + scholar/admin | Create blog |
| PUT | `/:id` | strictAuth + owner | Update blog |
| DELETE | `/:id` | strictAuth + owner/admin | Delete blog |

### Chat (`/api/v1/chat`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/sessions` | strictAuth | List user's sessions |
| POST | `/sessions` | strictAuth | Create new session |
| GET | `/sessions/:sessionId` | strictAuth | Get session + messages |
| DELETE | `/sessions/:sessionId` | strictAuth | Delete session |
| POST | `/sessions/:sessionId/messages` | strictAuth + rate-limited | Send message, get AI reply |

Chat `POST .../messages` rate limit: 20 requests per 60 seconds per user.

### Scholar Applications (`/api/v1/scholar-applications`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | strictAuth | Submit application |
| GET | `/` | strictAuth + admin | List applications |
| PATCH | `/:id/review` | strictAuth + admin | Approve/reject application |

### Users (`/api/v1/users`)

| Method | Path | Auth | Description |
|---|---|---|---|
| PATCH | `/preferences` | strictAuth | Update preferences (e.g. hash_identity) |

### DMs (`/api/v1/dms`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | strictAuth | Start or get conversation with a scholar |
| GET | `/` | strictAuth | List caller's conversations |
| GET | `/:conversationId/messages` | strictAuth | List messages in a conversation |
| POST | `/:conversationId/messages` | strictAuth | Send a DM |
| PATCH | `/:conversationId/read` | strictAuth | Mark all incoming messages as read |

---

## Middleware

### `strictAuth`
Reads `Authorization: Bearer <token>`, calls `verifyToken()`, attaches `req.user`:
```js
req.user = { userId, publicId, email, role }
```

### `requireRole(...roles)`
Must come after `strictAuth`. Throws `403 Forbidden` if `req.user.role` is not in `roles`.

### `zodValidation(schema)`
Zod schema shape must be `{ body?, params?, query? }`. On success, mutates `req.body`, `req.params`, `req.query` with coerced values. On failure, returns `400` with `errors[]`.

### `rateLimiter(maxRequests, windowSeconds)`
In-memory fixed-window, keyed by `user:<userId>:<path>`.

### `ipRateLimiter(maxRequests, windowSeconds)`
In-memory fixed-window, keyed by `ip:<req.ip>:<path>`. Used on auth routes.

Defaults: general = 30 req/60s · auth = 10 req/60s.

---

## Error System

### `APIError`
Static constructors — throw these from service layer:

```js
APIError.BadRequest('message')        // 400
APIError.Unauthorized('message')      // 401
APIError.Forbidden('message')         // 403
APIError.NotFound('message')          // 404
APIError.Conflict('message')          // 409
APIError.TooManyRequests('message')   // 429
APIError.ServerError('message')       // 500
```

### `ServiceErrorHandler`
Wraps unexpected errors in services. Pass the caught error as the first arg — it auto-detects Sequelize errors (ValidationError, UniqueConstraintError, etc.) and maps them to HTTP codes.

```js
throw new ServiceErrorHandler(err, 'MyService::methodName');
```

### Controller pattern
```js
const handler = async (req, res, next) => {
  try {
    const result = await someService.doThing(...)
    sendResponse(res, 'success', { status: HttpStatusCode.OK, data: result })
  } catch (err) {
    next(err)  // → caught by throwErrorResponse in server.js
  }
}
```

### `sendResponse` shape
```json
{ "status": 200, "success": true, "message": "...", "data": {...} }
```
Header `x-total-records` is set when `data.count` exists (paginated responses).

---

## Database

### Connection

- `DATABASE_URL` set → single connection string (SSL on by default, `DB_SSL=false` to disable).
- `DATABASE_URL` not set → uses `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`.
- Schema: `DB_SCHEMA` (default: `hikmah`).

### Models

All models use `underscored: true` — column names are `snake_case`, Sequelize exposes timestamps as **camelCase** on instances (`createdAt`, `updatedAt`).

**Timestamp access pattern in services:**
```js
// Sequelize instances expose camelCase; raw query results may expose snake_case
const ts = (record) => record.createdAt ?? record.created_at ?? null;
```

| Model | Table | Key fields |
|---|---|---|
| `user` | `users` | `public_id`, `name`, `email`, `password_hash`, `role` (user/scholar/admin), `hash_identity` |
| `chat_session` | `chat_sessions` | `public_id`, `user_id`, `title` |
| `chat_message` | `chat_messages` | `public_id`, `session_id`, `role`, `content`, `suggested_channel` |
| `channel` | `channels` | `public_id`, `name`, `description`, `color_variant` |
| `question` | `questions` | `public_id`, `channel_id`, `author_id`, `title`, `body` |
| `reply` | `replies` | `public_id`, `question_id`, `author_id`, `body`, `is_verified_answer`, `verified_at` |
| `scholar_application` | `scholar_applications` | `public_id`, `user_id`, `status`, `reviewer_note` |
| `blog` | `blogs` | `public_id`, `author_id`, `title`, `excerpt`, `body` |
| `dm_conversation` | `dm_conversations` | `public_id`, `user_id`, `scholar_id` — unique on `(user_id, scholar_id)` |
| `dm_message` | `dm_messages` | `public_id`, `conversation_id`, `sender_id`, `body`, `is_read` |

### Associations
- `user` hasMany `question` (as 'questions'), `reply` (as 'replies'), `blog`, `dm_conversation` (as 'user' and 'scholar'), `dm_message` (as 'sender')
- `channel` hasMany `question`
- `question` hasMany `reply` (as 'replies'), belongsTo `user` (as 'author')
- `reply` belongsTo `user` (as 'author')
- `dm_conversation` belongsTo `user` (as 'user') + `user` (as 'scholar'), hasMany `dm_message`
- `dm_message` belongsTo `dm_conversation`, belongsTo `user` (as 'sender')

### Migration Naming Convention

```
YYYYMMDDHHMMSS-description.js
```

Examples:
```
20260725100001-create-user.js
20260726100011-create-dm-conversation.js
20260726100012-create-dm-message.js
```

Run migrations: `npm run migrate`  
Undo last: `npm run migrate:undo`

---

## Role System

| Role | Permissions |
|---|---|
| `user` | Post questions, view channels/blogs/chat, DM scholars |
| `scholar` | All user perms + post replies, verify answers, write blogs |
| `admin` | All scholar perms + create channels, review scholar applications |

Enforce with `requireRole('admin')` or `requireRole('scholar', 'admin')` in routes.

---

## AI Provider Abstraction

`AI_PROVIDER` env var selects the implementation:

| Value | SDK | Key env vars |
|---|---|---|
| `claude` (default) | `@anthropic-ai/sdk` | `ANTHROPIC_API_KEY`, `CLAUDE_MODEL` |
| `openai` | `openai` | `OPENAI_API_KEY`, `OPENAI_MODEL` |
| `openrouter` | `openai` (base URL override) | `OPENROUTER_API_KEY`, `OPENROUTER_MODEL` |
| `mock` | — | No key needed, returns canned/template replies |

All implementations export the same interface — import from `server/services/ai/index.js`.

---

## Identity Masking

Users with `hash_identity = true` have their names masked on all public question/reply responses:

```js
// channel-service.js
const maskName = (author) => {
  if (!author || !author.hash_identity) return author ? author.name : undefined;
  const hash = crypto.createHash('sha1').update(author.public_id).digest('hex');
  return `Anon#${hash.slice(0, 4)}`;
};
```

`authorPublicId` is always returned unmasked — the frontend uses it for ownership checks and patches the display name for the authenticated user's own entries.

---

## Channel Questions + Replies

`listQuestions` returns questions with replies inline (single query, no N+1):

```js
const toPublicQuestionWithReplies = (question) => {
  const replies = (question.replies ?? []).map(toPublicReply);
  return {
    ...toPublicQuestion(question),
    isVerifiedAnswer: replies.some((r) => r.isVerifiedAnswer),
    replies,
  };
};
```

Each reply includes `authorRole` — the frontend uses this to show "Message Scholar" only on scholar replies.

---

## DM Conversation Model

Conversations are keyed by a unique `(user_id, scholar_id)` pair — `findOrCreate` ensures idempotency:

```js
const [conv] = await dm_conversation.findOrCreate({
  where: { user_id: userId, scholar_id: scholId },
  defaults: { user_id: userId, scholar_id: scholId },
});
```

If the caller is a scholar initiating a conversation, `user_id` and `scholar_id` are swapped so the column roles stay consistent.

---

## Environment Variables

```
# Server
PORT=5000                   # default 4000
NODE_ENV=development

# Database (Option A — single URL)
DATABASE_URL=               # if set, DB_* fields are ignored
# Database (Option B — individual)
DB_NAME=hikmah_ai
DB_USER=postgres
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=5432
DB_SCHEMA=hikmah            # Postgres schema name (not database name)
DB_SSL=                     # true/false — defaults depend on connection method

# Auth
JWT_SECRET=                 # required, no default
JWT_EXPIRY=7d
JWT_ISSUER=hikmah-ai-backend

# AI
AI_PROVIDER=claude          # openai | claude | openrouter | mock
ANTHROPIC_API_KEY=
CLAUDE_MODEL=claude-haiku-4-5-20251001
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
OPENROUTER_API_KEY=
OPENROUTER_MODEL=openai/gpt-4o-mini
```

---

## NPM Scripts

| Script | Command |
|---|---|
| `npm run dev` | `nodemon ./server/app.js` — hot reload |
| `npm start` | `migrate + node ./server/app.js` — production |
| `npm run migrate` | `sequelize db:migrate` |
| `npm run migrate:undo` | `sequelize db:migrate:undo` (last one) |
| `npm run seed` | `sequelize db:seed:all` |
| `npm run lint` | eslint over `server/` and `database/` |

---

## Response Shape

All endpoints return:
```json
{
  "status": 200,
  "success": true,
  "message": "...",
  "data": { ... }
}
```

DM list response wraps in `.data`:
```json
{ "status": 200, "success": true, "data": [ ...conversations ] }
```
Frontend unwraps: `(response.data as any).data ?? response.data`.

---

## Coding Conventions

- **Controllers are thin** — call service, call `sendResponse`, call `next(err)`. No business logic.
- **Services own logic** — validate ownership, call models, map to public shapes. Always wrap unexpected errors with `ServiceErrorHandler`.
- **Schemas validate at the boundary** — `zodValidation(schema)` middleware runs before controllers. Services trust that inputs are already valid.
- **No raw SQL** — use Sequelize model methods. Use `separate: true` for nested `hasMany` includes to avoid cartesian products.
- **Public IDs only** — expose `public_id` (UUID) to clients, never the integer primary key.
- **`ts()` for timestamps** — always use the helper when reading timestamps from Sequelize instances: `record.createdAt ?? record.created_at ?? null`.
- **`requireRole`** must always come after `strictAuth` in route chains.
- **No `Authorization` headers in controllers** — `strictAuth` middleware populates `req.user`; never read the header directly in controllers.

---

## Do Not

- Do not add columns to `users` table without a migration.
- Do not query integer PKs across service boundaries — always use `public_id`.
- Do not catch errors silently in services — either rethrow as `APIError` or wrap in `ServiceErrorHandler`.
- Do not bypass `zodValidation` middleware for routes that accept user input.
- Do not hardcode `DB_SCHEMA` — read from `env.DB_SCHEMA`.
- Do not use `Op.like` with unsanitised user input — use parameterised Zod-validated values only.
- Do not put endpoint logic in `axiosInstance.ts` — that file is infrastructure only (frontend concern).
