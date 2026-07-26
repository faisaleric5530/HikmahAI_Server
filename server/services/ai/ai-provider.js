/**
 * Every provider in ./providers must implement this shape:
 *
 *   generateReply({ messages, systemPrompt }) => Promise<{ reply: string, provider: string }>
 *
 * `messages` is an ordered array of { role: 'user' | 'assistant', content: string }.
 * Callers (chat-service.js) only ever talk to this interface — never to a specific SDK —
 * so switching AI_PROVIDER in .env is the only thing needed to change models.
 */
module.exports = {};
