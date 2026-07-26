const { v4: uuidv4 } = require('uuid');
const { chat_session: ChatSessionModel, chat_message: ChatMessageModel } = require('../../database');
const { APIError, ServiceErrorHandler } = require('../exceptions');
const aiService = require('./ai');

const toPublicSession = (session) => ({
  id: session.public_id,
  title: session.title,
  createdAt: session.created_at,
  updatedAt: session.updated_at,
});

const toPublicMessage = (message) => ({
  id: message.public_id,
  role: message.role,
  content: message.content,
  detectedLang: message.detected_lang,
  sources: message.sources || [],
  createdAt: message.created_at,
});

const findOwnedSession = async (userId, sessionId) => {
  const session = await ChatSessionModel.findOne({ where: { public_id: sessionId, user_id: userId } });
  if (!session) throw APIError.NotFound('Chat session not found');
  return session;
};

const listSessions = async ({ userId }) => {
  try {
    const sessions = await ChatSessionModel.findAll({
      where: { user_id: userId },
      order: [['updated_at', 'DESC']],
    });
    return sessions.map(toPublicSession);
  } catch (err) {
    throw new ServiceErrorHandler(err, 'ChatService::listSessions');
  }
};

const createSession = async ({ userId }) => {
  try {
    const session = await ChatSessionModel.create({ public_id: uuidv4(), user_id: userId, title: 'New Chat' });
    return toPublicSession(session);
  } catch (err) {
    throw new ServiceErrorHandler(err, 'ChatService::createSession');
  }
};

const getSession = async ({ userId, sessionId }) => {
  try {
    const session = await findOwnedSession(userId, sessionId);
    const messages = await ChatMessageModel.findAll({
      where: { session_id: sessionId },
      order: [['created_at', 'ASC']],
    });

    return { ...toPublicSession(session), messages: messages.map(toPublicMessage) };
  } catch (err) {
    if (err instanceof APIError) throw err;
    throw new ServiceErrorHandler(err, 'ChatService::getSession');
  }
};

const deleteSession = async ({ userId, sessionId }) => {
  try {
    const session = await findOwnedSession(userId, sessionId);
    await session.destroy();
    return { id: sessionId };
  } catch (err) {
    if (err instanceof APIError) throw err;
    throw new ServiceErrorHandler(err, 'ChatService::deleteSession');
  }
};

const sendMessage = async ({ userId, sessionId, content }) => {
  try {
    const session = await findOwnedSession(userId, sessionId);

    const history = await ChatMessageModel.findAll({
      where: { session_id: sessionId },
      order: [['created_at', 'ASC']],
    });

    const userMessage = await ChatMessageModel.create({
      public_id: uuidv4(),
      session_id: sessionId,
      role: 'user',
      content,
    });

    const aiMessages = [...history, userMessage].map((m) => ({ role: m.role, content: m.content }));
    const { reply, provider } = await aiService.generateReply(aiMessages);

    const assistantMessage = await ChatMessageModel.create({
      public_id: uuidv4(),
      session_id: sessionId,
      role: 'assistant',
      content: reply,
      provider,
    });

    if (session.title === 'New Chat') {
      await session.update({ title: content.slice(0, 50) });
    } else {
      await session.update({ updated_at: new Date() });
    }

    return { userMessage: toPublicMessage(userMessage), assistantMessage: toPublicMessage(assistantMessage) };
  } catch (err) {
    if (err instanceof APIError) throw err;
    throw new ServiceErrorHandler(err, 'ChatService::sendMessage');
  }
};

module.exports = { listSessions, createSession, getSession, deleteSession, sendMessage };
