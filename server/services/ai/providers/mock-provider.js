const SOURCES_MARKER = 'Relevant Islamic sources:';

const generateReply = async ({ messages, systemPrompt }) => {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  const markerIndex = systemPrompt.indexOf(SOURCES_MARKER);

  if (markerIndex === -1) {
    return {
      reply:
        `This is a template response (no AI_PROVIDER configured) echoing your question: "${lastUser?.content ?? ''}". ` +
        'Set AI_PROVIDER to openai, claude, or openrouter for a real answer.',
      provider: 'mock',
    };
  }

  const passages = systemPrompt.slice(markerIndex + SOURCES_MARKER.length).trim();

  return {
    reply: `Based on the retrieved Islamic sources for "${lastUser?.content ?? 'your question'}":\n\n${passages}`,
    provider: 'mock',
  };
};

module.exports = { generateReply };
