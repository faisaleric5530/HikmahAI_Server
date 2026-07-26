const Anthropic = require('@anthropic-ai/sdk');
const { env } = require('../../../constants/env');
const { APIError } = require('../../../exceptions');

let client = null;
const getClient = () => {
  if (!client) client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  return client;
};

const generateReply = async ({ messages, systemPrompt }) => {
  try {
    const completion = await getClient().messages.create({
      model: env.CLAUDE_MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    return {
      reply: completion.content[0].text,
      provider: 'claude',
    };
  } catch (err) {
    throw APIError.ServerError(`Claude request failed: ${err.message}`);
  }
};

module.exports = { generateReply };
