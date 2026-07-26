const { env } = require('../../constants/env');
const { ISLAMIC_SYSTEM_PROMPT } = require('./system-prompt');
const openaiProvider = require('./providers/openai-provider');
const claudeProvider = require('./providers/claude-provider');

// Add a new entry here when the fine-tuned Islamic model is ready — everything
// else (chat-service, controllers, routes) stays unchanged.
const PROVIDERS = {
  openai: openaiProvider,
  claude: claudeProvider,
};

const generateReply = (messages) => {
  const provider = PROVIDERS[env.AI_PROVIDER];
  return provider.generateReply({ messages, systemPrompt: ISLAMIC_SYSTEM_PROMPT });
};

module.exports = { generateReply };
