const OpenAI = require('openai');
const { env } = require('../../../constants/env');
const { APIError } = require('../../../exceptions');

let client = null;
const getClient = () => {
  if (!client) client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  return client;
};

const generateReply = async ({ messages, systemPrompt }) => {
  try {
    const completion = await getClient().chat.completions.create({
      model: env.OPENAI_MODEL,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    });

    return {
      reply: completion.choices[0].message.content,
      provider: 'openai',
    };
  } catch (err) {
    throw APIError.ServerError(`OpenAI request failed: ${err.message}`);
  }
};

module.exports = { generateReply };
