const { env } = require('../../constants/env');
const { ISLAMIC_SYSTEM_PROMPT } = require('./system-prompt');
const openaiProvider = require('./providers/openai-provider');
const claudeProvider = require('./providers/claude-provider');
const openrouterProvider = require('./providers/openrouter-provider');
const mockProvider = require('./providers/mock-provider');

// Add a new entry here when the fine-tuned Islamic model is ready — everything
// else (chat-service, controllers, routes) stays unchanged.
const PROVIDERS = {
  openai: openaiProvider,
  claude: claudeProvider,
  openrouter: openrouterProvider,
  mock: mockProvider,
};

// Claude (and any other provider) is instructed to end its reply with this exact
// tag when it wants to hand the user off to a community channel instead of
// guessing. It's stripped out of the visible reply before persisting/returning.
const CHANNEL_MARKER_REGEX = /\[\[CHANNEL:\s*([a-z0-9-]+)\s*\]\]\s*$/i;

const slugify = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const buildRagSection = (chunks) => {
  if (!chunks || chunks.length === 0) return '';

  const context = chunks
    .map((c, i) => `[${i + 1}] (${c.discipline}) ${c.chunk_text}`)
    .join('\n\n');

  return `\n\nRelevant Islamic sources:\n${context}`;
};

const buildChannelSection = (channels) => {
  if (!channels || channels.length === 0) return '';

  const list = channels
    .map((c) => `- ${slugify(c.name)}: ${c.name} — ${c.description ?? ''}`)
    .join('\n');

  return (
    `\n\nIf the question is personal, hypothetical, or uncertain, don't guess — ` +
    `suggest a channel instead and end your reply with exactly: [[CHANNEL: <slug>]]. ` +
    `Only use a slug below, and only when it truly helps:\n${list}`
  );
};

const buildSystemPrompt = (chunks, channels) =>
  `${ISLAMIC_SYSTEM_PROMPT}${buildRagSection(chunks)}${buildChannelSection(channels)}`;

const extractSuggestedChannel = (rawReply, channels) => {
  const match = rawReply.match(CHANNEL_MARKER_REGEX);
  if (!match) return { reply: rawReply, suggestedChannel: null };

  const slug = match[1].toLowerCase();
  const channel = channels.find((c) => slugify(c.name) === slug);
  const reply = rawReply.replace(CHANNEL_MARKER_REGEX, '').trim();

  return {
    reply,
    suggestedChannel: channel
      ? { id: channel.public_id, name: channel.name, colorVariant: channel.color_variant }
      : null,
  };
};

const generateReply = async (messages, { chunks = [], channels = [] } = {}) => {
  const provider = PROVIDERS[env.AI_PROVIDER];
  const systemPrompt = buildSystemPrompt(chunks, channels);

  const { reply: rawReply, provider: providerName } = await provider.generateReply({ messages, systemPrompt });
  const { reply, suggestedChannel } = extractSuggestedChannel(rawReply, channels);

  return { reply, provider: providerName, suggestedChannel };
};

module.exports = { generateReply };
