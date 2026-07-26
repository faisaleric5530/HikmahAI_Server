# HikmahAI — RAG Implementation Plan (MVP)

**Goal:** Minimal working RAG pipeline wired into the existing mock app.  
**Cost target:** $0 recurring — local embeddings, existing PostgreSQL, template-based responses.  
**Scope:** Only what's needed to make the chat feature retrieve real Islamic knowledge and return grounded answers.  
**Data source:** [seemorg / OpenITI](https://github.com/seemorg) — publicly available Islamic scholarly corpus.

---

## Current State

| Layer | Status |
|---|---|
| Frontend chat (`/chat`) | Working — mock mode via `chatApi.ts` (`USE_MOCK = true`) |
| Backend chat route | Working — `POST /api/v1/chat/sessions/:sessionId/messages` calls OpenAI/Claude |
| `chat_message.sources` (JSONB) | DB column exists — currently always empty |
| Vector search | Not implemented |
| Islamic corpus | Not present |

---

## Target Architecture (MVP)

```
seemorg / OpenITI GitHub repos
        ↓
scripts/fetch-corpus.js   ← download & filter by tags (_HADITH, _TAFSIR, _FIQH, _CAQAID)
        ↓
scripts/ingest.js         ← parse mARkdown → chunk (500 tokens) → embed → store in pgvector
        ↓
User types message in /chat
        ↓
POST /api/v1/chat/sessions/:id/messages
        ↓
  [RAG Service]
  1. Embed user query  (local @xenova/transformers — bge-small-en-v1.5)
  2. Hybrid search in pgvector  (0.7 × vector cosine + 0.3 × full-text)
  3. Return top 3 chunks
        ↓
  [Response Generator]
  Template reply with retrieved passages injected
  (OR real LLM with chunks as context if API key is set)
        ↓
  Persist assistant message + sources[] (JSONB)
        ↓
Frontend ChatBubble renders reply + source citation tags
```

---

## Phase 0 — Corpus Sourcing from seemorg / OpenITI

> This phase replaces the hand-written `.md` files from the original plan.  
> All data is publicly available under open licences from the OpenITI project.

### 0.1 Understand the data

**Organization:** [https://github.com/seemorg](https://github.com/seemorg)  
**Corpus:** OpenITI — 700+ digitised classical Islamic texts, Arabic + Persian.  
**Key repos:**
- `seemorg/mARkdown-parser` — npm package `@openiti/markdown-parser` to parse OpenITI format to JSON
- `seemorg/openiti-search` — full-text search UI (Typesense-backed), useful for exploring
- OpenITI Zenodo releases — versioned snapshots of the full corpus (DOI-backed)

**Disciplines tagged in metadata:**

| Tag | Meaning |
|---|---|
| `_HADITH` | Hadith collections |
| `_TAFSIR` | Quranic exegesis |
| `_FIQH` | Islamic jurisprudence |
| `_CAQAID` | Islamic theology / creed |
| `_AKHLAQ` | Ethics |
| `_SULUK` | Spiritual practice |

**Text format:** OpenITI mARkdown (`.mARkdown` extension) — custom markup for scholarly Islamic texts.

**Parser output (JSON):**
```json
{
  "metadata": { "title": "...", "author": "...", "date": "..." },
  "content": [
    { "type": "title", "content": "باب الطهارة" },
    { "type": "paragraph", "content": "..." },
    { "type": "pageNumber", "content": { "volume": "01", "page": "5" } }
  ]
}
```

### 0.2 Install the parser

```bash
cd HikmahAI_Server
npm install @openiti/markdown-parser
```

### 0.3 Curated text selection for MVP

Download only a small, curated set — enough to demo retrieval without processing the entire 700+ text corpus.

**Recommended files to fetch from OpenITI GitHub:**

| Text | Discipline | OpenITI Path (example) |
|---|---|---|
| Sahih al-Bukhari (excerpts) | `_HADITH` | `0256Bukhari/0256Bukhari.Sahih` |
| Sahih Muslim (excerpts) | `_HADITH` | `0261Muslim/0261Muslim.Sahih` |
| Tafsir Ibn Kathir (Al-Fatiha + short surahs) | `_TAFSIR` | `0774IbnKathir/0774IbnKathir.Tafsir` |
| Al-Aqeedah Al-Wasitiyyah (Ibn Taymiyyah) | `_CAQAID` | `0728IbnTaymiyya/0728IbnTaymiyya.AqidaWasitiyya` |
| Bidayat al-Mujtahid (Ibn Rushd, first chapters) | `_FIQH` | `0595IbnRushd/0595IbnRushd.BidayaMujtahid` |

> For MVP: limit to ~500 chunks total. The ingestion script supports partial file ingestion via a line-count cap.

### 0.4 Corpus folder structure in `HikmahAI_Server`

```
corpus/
  raw/                   ← downloaded .mARkdown files (original OpenITI format)
    0256Bukhari.Sahih.mARkdown
    0261Muslim.Sahih.mARkdown
    0774IbnKathir.Tafsir.mARkdown
    0728IbnTaymiyya.AqidaWasitiyya.mARkdown
    0595IbnRushd.BidayaMujtahid.mARkdown
  cleaned/               ← auto-generated plain text after parsing (one .txt per source)
  chunks/                ← auto-generated chunk JSON (one .json per source)
```

### 0.5 Create `scripts/fetch-corpus.js`

Downloads the curated files directly from the OpenITI GitHub repos using the raw content URL.

```js
// scripts/fetch-corpus.js
// Run once: node scripts/fetch-corpus.js
// Downloads curated OpenITI mARkdown files to corpus/raw/

import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';

const OUTPUT_DIR = './corpus/raw';
mkdirSync(OUTPUT_DIR, { recursive: true });

// Curated list: [filename, raw GitHub URL]
const CORPUS_TARGETS = [
  [
    '0256Bukhari.Sahih.mARkdown',
    'https://raw.githubusercontent.com/OpenITI/0275AH/master/data/0256Bukhari/0256Bukhari.Sahih/0256Bukhari.Sahih.mARkdown'
  ],
  [
    '0261Muslim.Sahih.mARkdown',
    'https://raw.githubusercontent.com/OpenITI/0275AH/master/data/0261Muslim/0261Muslim.Sahih/0261Muslim.Sahih.mARkdown'
  ],
  [
    '0774IbnKathir.Tafsir.mARkdown',
    'https://raw.githubusercontent.com/OpenITI/0800AH/master/data/0774IbnKathir/0774IbnKathir.TafsirQuran/0774IbnKathir.TafsirQuran.mARkdown'
  ],
  // Add remaining targets here — verify raw URLs from the repo browser first
];

async function fetchFile(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

async function main() {
  for (const [filename, url] of CORPUS_TARGETS) {
    console.log(`Fetching ${filename}...`);
    try {
      const content = await fetchFile(url);
      writeFileSync(path.join(OUTPUT_DIR, filename), content, 'utf8');
      console.log(`  Saved (${(content.length / 1024).toFixed(0)} KB)`);
    } catch (err) {
      console.error(`  Failed: ${err.message}`);
    }
  }
  console.log('Fetch complete. Run: node scripts/ingest.js');
}

main();
```

> **Note:** Verify each raw URL in the OpenITI GitHub org browser before running.  
> The repo name encodes the Islamic century (e.g. `0275AH`, `0800AH`).  
> URL pattern: `https://raw.githubusercontent.com/OpenITI/{century-repo}/master/data/{author}/{author.title}/{filename}`

### 0.6 Parse mARkdown → clean text

The ingestion script (Phase 3) uses `@openiti/markdown-parser` to convert each file before chunking.

```js
import { parseMarkdown } from '@openiti/markdown-parser';

function extractPlainText(mARkdownContent) {
  const parsed = parseMarkdown(mARkdownContent);

  // Pull only text-bearing block types; skip page numbers, bio markers, etc.
  const TEXT_TYPES = ['paragraph', 'title', 'header1', 'header2', 'blockquote'];

  return parsed.content
    .filter(block => TEXT_TYPES.includes(block.type))
    .map(block => block.content)
    .filter(Boolean)
    .join('\n\n');
}
```

**Metadata extraction for `source` / `section` fields:**
```js
const { metadata } = parseMarkdown(mARkdownContent);
// metadata.title   → book title  (stored as `source` label)
// metadata.author  → author name (appended to section tag)
```

---

## Phase 1 — Database: Add pgvector (Backend)

### 1.1 Install pgvector driver
```bash
cd HikmahAI_Server
npm install pgvector
```

### 1.2 New migration — `knowledge_chunks` table

**File:** `database/migrations/XXXXXX-create-knowledge-chunks.js`

```js
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS vector;`);
    await queryInterface.createTable('knowledge_chunk', {
      id:          { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      source:      { type: Sequelize.STRING(255), allowNull: false },  // book title from metadata
      author:      { type: Sequelize.STRING(255) },                    // author from metadata
      section:     { type: Sequelize.STRING(255) },                    // chapter/header context
      discipline:  { type: Sequelize.STRING(50) },                     // _HADITH | _TAFSIR | _FIQH | _CAQAID
      tags:        { type: Sequelize.ARRAY(Sequelize.TEXT), defaultValue: [] },
      chunk_text:  { type: Sequelize.TEXT, allowNull: false },
      doc_hash:    { type: Sequelize.STRING(64) },                     // SHA-256 for re-index detection
      embedding:   { type: Sequelize.DataTypes.ARRAY(Sequelize.FLOAT) }, // 384-dim for bge-small
      created_at:  { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      updated_at:  { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
    }, { schema: 'hikmah' });

    await queryInterface.sequelize.query(`
      CREATE INDEX ON hikmah.knowledge_chunk
      USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX ON hikmah.knowledge_chunk
      USING GIN (to_tsvector('english', chunk_text));
    `);
  },
  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: 'knowledge_chunk', schema: 'hikmah' });
  }
};
```

> Run: `npm run migrate`

---

## Phase 2 — (Covered by Phase 0)

Corpus files come from OpenITI via `scripts/fetch-corpus.js` — no hand-written `.md` files needed.

---

## Phase 3 — Ingestion Script (Backend)

### 3.1 Install deps
```bash
npm install @xenova/transformers @langchain/textsplitters @openiti/markdown-parser
```

### 3.2 Create `scripts/ingest.js`

```js
// scripts/ingest.js
// Run: node scripts/ingest.js
// Parses OpenITI mARkdown → chunks → embeds → stores in pgvector
// Skips files unchanged since last run (SHA-256 check)

import { pipeline }         from '@xenova/transformers';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { parseMarkdown }    from '@openiti/markdown-parser';
import { readFileSync, readdirSync } from 'fs';
import { createHash }       from 'crypto';
import path                 from 'path';
import db                   from '../database/index.js';

const CORPUS_DIR    = './corpus/raw';
const CHUNK_SIZE    = 500;
const CHUNK_OVERLAP = 80;
const MAX_CHUNKS_PER_FILE = 150;  // cap per file for MVP — keeps total manageable

const TEXT_TYPES = ['paragraph', 'title', 'header1', 'header2', 'blockquote'];

// Discipline map: filename keyword → tag
const DISCIPLINE_MAP = {
  'Bukhari': '_HADITH', 'Muslim': '_HADITH',
  'Tafsir':  '_TAFSIR', 'IbnKathir': '_TAFSIR',
  'Aqida':   '_CAQAID', 'Wasitiyya': '_CAQAID',
  'Bidaya':  '_FIQH',   'Mujtahid': '_FIQH',
};

function detectDiscipline(filename) {
  for (const [key, tag] of Object.entries(DISCIPLINE_MAP)) {
    if (filename.includes(key)) return tag;
  }
  return '_OTHER';
}

function extractPlainText(raw) {
  try {
    const parsed = parseMarkdown(raw);
    const text = parsed.content
      .filter(b => TEXT_TYPES.includes(b.type))
      .map(b => typeof b.content === 'string' ? b.content : '')
      .filter(Boolean)
      .join('\n\n');
    return { text, metadata: parsed.metadata ?? {} };
  } catch {
    // Fallback: strip mARkdown markers with regex if parser fails
    const text = raw
      .replace(/^#.*$/gm, '')         // remove # tags
      .replace(/^PageV\d+P\d+$/gm, '') // remove page markers
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    return { text, metadata: {} };
  }
}

async function main() {
  await db.authenticate();
  const embedder = await pipeline('feature-extraction', 'Xenova/bge-small-en-v1.5');
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: CHUNK_SIZE, chunkOverlap: CHUNK_OVERLAP });

  const files = readdirSync(CORPUS_DIR).filter(f => f.endsWith('.mARkdown') || f.endsWith('.md'));

  for (const file of files) {
    const raw        = readFileSync(path.join(CORPUS_DIR, file), 'utf8');
    const hash       = createHash('sha256').update(raw).digest('hex');
    const existing   = await db.models.knowledge_chunk.findOne({ where: { source: file, doc_hash: hash } });
    if (existing) { console.log(`Skipping unchanged: ${file}`); continue; }

    await db.models.knowledge_chunk.destroy({ where: { source: file } });

    const { text, metadata } = extractPlainText(raw);
    const allChunks = await splitter.splitText(text);
    const chunks    = allChunks.slice(0, MAX_CHUNKS_PER_FILE);

    console.log(`Embedding ${chunks.length}/${allChunks.length} chunks from ${file}...`);

    for (const chunk of chunks) {
      const output = await embedder(chunk, { pooling: 'mean', normalize: true });
      await db.models.knowledge_chunk.create({
        source:     metadata.title ?? file,
        author:     metadata.author ?? '',
        section:    '',
        discipline: detectDiscipline(file),
        chunk_text: chunk,
        doc_hash:   hash,
        embedding:  Array.from(output.data),
      });
    }
    console.log(`  Done: ${file}`);
  }

  console.log('Ingestion complete.');
  process.exit(0);
}

main();
```

---

## Phase 4 — RAG Service (Backend)

### 4.1 Create `server/services/rag-service.js`

```js
// server/services/rag-service.js
import { pipeline } from '@xenova/transformers';
import db from '../../database/index.js';

let _embedder = null;
async function getEmbedder() {
  if (!_embedder) _embedder = await pipeline('feature-extraction', 'Xenova/bge-small-en-v1.5');
  return _embedder;
}

async function retrieve(query, topK = 3) {
  const embedder = await getEmbedder();
  const output   = await embedder(query, { pooling: 'mean', normalize: true });
  const vector   = Array.from(output.data);

  // Hybrid search: 0.7 × vector cosine similarity + 0.3 × full-text rank
  const [results] = await db.sequelize.query(`
    SELECT
      chunk_text,
      source,
      author,
      section,
      discipline,
      1 - (embedding <=> :vec::vector)                                          AS vector_score,
      ts_rank(to_tsvector('english', chunk_text), plainto_tsquery('english', :query))  AS text_score
    FROM hikmah.knowledge_chunk
    ORDER BY
      (0.7 * (1 - (embedding <=> :vec::vector)))
      + (0.3 * ts_rank(to_tsvector('english', chunk_text), plainto_tsquery('english', :query))) DESC
    LIMIT :topK
  `, { replacements: { vec: JSON.stringify(vector), query, topK } });

  return results;
}

export { retrieve };
```

### 4.2 Create `server/services/ai/providers/mock-provider.js`

```js
// server/services/ai/providers/mock-provider.js
// Template response — no LLM cost. Injects retrieved chunks directly.

function generate(userMessage, chunks) {
  if (!chunks || chunks.length === 0) {
    return {
      reply: "I could not find relevant information in my knowledge base for your question. Please rephrase or ask about Quran, Hadith, or Islamic practice.",
      provider: 'mock',
      sources: []
    };
  }

  const passages = chunks
    .map((c, i) => `[${i + 1}] ${c.chunk_text.trim()}`)
    .join('\n\n');

  const sourceLabels = chunks
    .map(c => [c.author, c.source].filter(Boolean).join(' — '))
    .filter((v, i, a) => a.indexOf(v) === i);

  return {
    reply: `Based on Islamic sources:\n\n${passages}\n\n---\nSources:\n${sourceLabels.map(s => `• ${s}`).join('\n')}`,
    provider: 'mock',
    sources:  chunks.map(c => ({
      source:     c.source,
      author:     c.author,
      section:    c.section,
      discipline: c.discipline,
      text:       c.chunk_text.slice(0, 120) + '...'
    }))
  };
}

export { generate };
```

### 4.3 Update `server/services/chat-service.js`

```js
import { retrieve }         from './rag-service.js';
import { generate as mockGenerate } from './ai/providers/mock-provider.js';

// Inside sendMessage(), replace the current aiService.generateReply() call:

const chunks = await retrieve(userMessageContent, 3);

let assistantReply, provider, sources;

if (!env.OPENAI_API_KEY && !env.ANTHROPIC_API_KEY) {
  // Mock mode — template response with retrieved OpenITI chunks
  ({ reply: assistantReply, provider, sources } = mockGenerate(userMessageContent, chunks));
} else {
  // Real LLM — inject chunks as grounding context
  const context = chunks.map((c, i) => `[${i+1}] (${c.discipline}) ${c.chunk_text}`).join('\n\n');
  const augmentedMessages = [
    { role: 'system', content: `${systemPrompt}\n\nRelevant Islamic sources:\n${context}` },
    ...existingMessages,
    { role: 'user', content: userMessageContent }
  ];
  ({ reply: assistantReply, provider } = await aiService.generateReply(augmentedMessages));
  sources = chunks.map(c => ({ source: c.source, author: c.author, section: c.section, discipline: c.discipline }));
}

await ChatMessage.create({
  session_id: session.id,
  role:       'assistant',
  content:    assistantReply,
  provider,
  sources:    sources ?? [],
});
```

---

## Phase 5 — Frontend: Connect to Real Backend

### 5.1 Set `VITE_API_BASE_URL` in `.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Flips `USE_MOCK = false` in all domain API files automatically.

### 5.2 Update `src/api/chatApi.ts`

Real endpoint mapping (differs from current mock shape):

```ts
// Create session:   POST  /chat/sessions                    body: { title? }
// List sessions:    GET   /chat/sessions                    → [{ public_id, title, updated_at }]
// Get session:      GET   /chat/sessions/:id                → { messages: [{role, content, sources}] }
// Send message:     POST  /chat/sessions/:id/messages       body: { content: string }
// Delete session:   DELETE /chat/sessions/:id
```

### 5.3 Update `src/store/useChatStore.ts`

Replace `localStorage` persistence with real API calls:

- `newSession()` → `POST /chat/sessions` → use returned `public_id` as session key
- `loadSession(id)` → `GET /chat/sessions/:id` → restore `messages[]` from backend
- `deleteSession(id)` → `DELETE /chat/sessions/:id`
- Keep `localStorage` only as a loading-state cache (optional)

### 5.4 Update `src/components/ChatBubble/ChatBubble.tsx`

Display OpenITI source citations on assistant messages:

```tsx
{message.role === 'assistant' && message.sources?.length > 0 && (
  <div className="chat-bubble-sources">
    <span className="chat-bubble-sources-label">Sources</span>
    <div className="chat-bubble-sources-list">
      {message.sources.map((s, i) => (
        <span key={i} className="chat-bubble-source-tag">
          {[s.author, s.source].filter(Boolean).join(' — ')}
        </span>
      ))}
    </div>
  </div>
)}
```

Add styles in `ChatBubble.scss`:
```scss
.chat-bubble-sources {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-border-subtle);

  &-label {
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-muted);
    display: block;
    margin-bottom: 0.25rem;
  }

  &-list { display: flex; flex-wrap: wrap; gap: 0.25rem; }
}

.chat-bubble-source-tag {
  font-size: 0.6875rem;
  font-family: "Inter", sans-serif;
  color: var(--color-primary);
  background-color: var(--color-primary-xlight);
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
}
```

---

## Full Execution Order

| # | Task | Where | Effort |
|---|---|---|---|
| 0 | `npm install @openiti/markdown-parser` | `HikmahAI_Server` | 2 min |
| 1 | Write `scripts/fetch-corpus.js` with curated OpenITI URLs | `HikmahAI_Server` | 20 min |
| 2 | Run `node scripts/fetch-corpus.js` — verify files landed in `corpus/raw/` | `HikmahAI_Server` | 5 min |
| 3 | `npm install pgvector @xenova/transformers @langchain/textsplitters` | `HikmahAI_Server` | 3 min |
| 4 | Write & run migration (`knowledge_chunks` table + indexes) | `HikmahAI_Server` | 15 min |
| 5 | Write `scripts/ingest.js` (parse mARkdown → chunk → embed → store) | `HikmahAI_Server` | 25 min |
| 6 | Run `node scripts/ingest.js` — first run downloads the bge-small model (~120 MB) | `HikmahAI_Server` | 10 min |
| 7 | Write `server/services/rag-service.js` (hybrid search) | `HikmahAI_Server` | 15 min |
| 8 | Write `server/services/ai/providers/mock-provider.js` | `HikmahAI_Server` | 10 min |
| 9 | Update `server/services/chat-service.js` to use RAG | `HikmahAI_Server` | 20 min |
| 10 | Set `VITE_API_BASE_URL` in FE `.env` | `HikmahAI_FE` | 2 min |
| 11 | Update `src/api/chatApi.ts` for real endpoints | `HikmahAI_FE` | 20 min |
| 12 | Update `src/store/useChatStore.ts` for backend sessions | `HikmahAI_FE` | 25 min |
| 13 | Add sources display to `ChatBubble` (tsx + scss) | `HikmahAI_FE` | 15 min |
| 14 | Smoke test: send a message, verify chunks appear, verify sources render | Both | 10 min |

**Total estimate:** ~3 hours end-to-end.

---

## Corpus URL Verification Checklist

Before running `fetch-corpus.js`, verify each URL manually in the browser:

1. Open `https://github.com/OpenITI` — find the century repo (e.g. `0275AH`)
2. Navigate: `data/ → {author}/ → {author.title}/ → {filename}.mARkdown`
3. Click **Raw** → copy that URL into `CORPUS_TARGETS` in `fetch-corpus.js`
4. Confirm the file is `.completed` status (not `.inProgress`) for better text quality

---

## What is NOT in scope (skip for MVP)

- Reranker (bge-reranker-base) — add after demo
- Redis / node-cache — not needed at this scale
- node-cron for automatic corpus refresh — manual re-run is fine
- Evaluation benchmark harness — add after demo
- Streaming responses (SSE) — plain JSON is fine for now
- Arabic text embeddings — English translations only for MVP (OpenITI has both)
- Full corpus ingestion (700+ texts) — curated 5-file set is sufficient

---

## Environment Variables Needed

### `HikmahAI_Server/.env`
```env
# existing vars unchanged — no new vars needed for mock RAG mode
# Optionally set one of these to use a real LLM with grounding context:
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...
# AI_PROVIDER=openai
```

### `HikmahAI_FE/.env`
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

---

## Key Decisions

| Decision | Rationale |
|---|---|
| seemorg / OpenITI as corpus | Publicly available, scholar-reviewed Islamic texts — authoritative source |
| `@openiti/markdown-parser` | Official parser from seemorg — handles the custom mARkdown format correctly |
| Curated 5-file subset | Avoids ingesting 700+ texts for MVP; expandable by adding URLs to `fetch-corpus.js` |
| `MAX_CHUNKS_PER_FILE = 150` cap | Keeps total chunks manageable (~750 max) without rewriting the ingestion logic |
| Discipline field in DB | Enables future filtering (e.g. "only search Hadith for this query") |
| `@xenova/transformers` bge-small-en-v1.5 | Runs in Node.js — no Python service, no API cost, 384-dim vectors |
| Template mock response | Demoes RAG retrieval without any LLM API key — works out of the box |
| Real LLM path preserved | Same code path, chunks injected as context — swap `AI_PROVIDER` env var only |
| `sources` JSONB column in DB | Already exists in schema — no migration needed for citation storage |
| Hybrid search (0.7 vector + 0.3 FTS) | Better recall for Islamic keyword queries than pure vector search |
