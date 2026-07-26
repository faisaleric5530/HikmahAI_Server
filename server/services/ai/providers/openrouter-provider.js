const OpenAI = require('openai');
const { env } = require('../../../constants/env');
const { APIError } = require('../../../exceptions');

let client = null;
const getClient = () => {
  if (!client) {
    client = new OpenAI({
      apiKey: env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://hikmah-ai.app',
        'X-Title': 'Hikmah AI',
      },
    });
  }
  return client;
};

const generateReply = async ({ messages, systemPrompt }) => {
  try {
    const completion = await getClient().chat.completions.create({
      model: env.OPENROUTER_MODEL,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    });

    return {
      reply: completion.choices[0].message.content,
      provider: 'openrouter',
    };
  } catch (err) {
    throw APIError.ServerError(`OpenRouter request failed: ${err.message}`);
  }
};

module.exports = { generateReply };
