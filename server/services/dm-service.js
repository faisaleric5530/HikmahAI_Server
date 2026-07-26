'use strict';

const { Op } = require('sequelize');
const { dm_conversation, dm_message, user } = require('../../database');
const { APIError, ServiceErrorHandler } = require('../exceptions');

const ts = (record) => record.createdAt ?? record.created_at ?? null;

const toPublicConversation = (conv, myPublicId) => {
  const other = conv.user_id === myPublicId ? conv.scholar : conv.user;
  const messages = conv.dm_messages ?? [];
  const lastMsg = messages[0] ?? null;
  const unreadCount = messages.filter((m) => !m.is_read && m.sender_id !== myPublicId).length;
  return {
    id: conv.public_id,
    otherUserId: other.public_id,
    otherUserName: other.name,
    otherUserRole: other.role,
    lastMessage: lastMsg ? lastMsg.body : null,
    lastMessageAt: lastMsg ? ts(lastMsg) : ts(conv),
    unreadCount,
  };
};

const toPublicMessage = (msg) => ({
  id: msg.public_id,
  conversationId: msg.conversation_id,
  senderId: msg.sender_id,
  body: msg.body,
  isRead: msg.is_read,
  createdAt: ts(msg),
});

const startOrGetConversation = async (callerPublicId, scholarPublicId) => {
  try {
    const scholar = await user.findOne({ where: { public_id: scholarPublicId } });
    if (!scholar || scholar.role !== 'scholar') throw APIError.NotFound('Scholar not found');

    const caller = await user.findOne({ where: { public_id: callerPublicId } });
    const userId   = caller.role !== 'scholar' ? callerPublicId : scholarPublicId;
    const scholId  = caller.role !== 'scholar' ? scholarPublicId : callerPublicId;

    const [conv] = await dm_conversation.findOrCreate({
      where: { user_id: userId, scholar_id: scholId },
      defaults: { user_id: userId, scholar_id: scholId },
    });

    return { id: conv.public_id };
  } catch (err) {
    if (err instanceof APIError) throw err;
    throw new ServiceErrorHandler(err, 'DmService::startOrGetConversation');
  }
};

const listConversations = async (myPublicId) => {
  try {
    const conversations = await dm_conversation.findAll({
      where: { [Op.or]: [{ user_id: myPublicId }, { scholar_id: myPublicId }] },
      include: [
        { model: user, as: 'user',    attributes: ['public_id', 'name', 'role'] },
        { model: user, as: 'scholar', attributes: ['public_id', 'name', 'role'] },
        {
          model: dm_message,
          attributes: ['public_id', 'body', 'sender_id', 'is_read', 'created_at'],
          order: [['created_at', 'DESC']],
          separate: true,
        },
      ],
      order: [['updated_at', 'DESC']],
    });
    return conversations.map((c) => toPublicConversation(c, myPublicId));
  } catch (err) {
    throw new ServiceErrorHandler(err, 'DmService::listConversations');
  }
};

const findConversationOrThrow = async (conversationPublicId, myPublicId) => {
  const conv = await dm_conversation.findOne({ where: { public_id: conversationPublicId } });
  if (!conv) throw APIError.NotFound('Conversation not found');
  if (conv.user_id !== myPublicId && conv.scholar_id !== myPublicId) {
    throw APIError.Forbidden('Access denied');
  }
  return conv;
};

const listMessages = async (conversationPublicId, myPublicId) => {
  try {
    await findConversationOrThrow(conversationPublicId, myPublicId);
    const messages = await dm_message.findAll({
      where: { conversation_id: conversationPublicId },
      order: [['created_at', 'ASC']],
    });
    return messages.map(toPublicMessage);
  } catch (err) {
    if (err instanceof APIError) throw err;
    throw new ServiceErrorHandler(err, 'DmService::listMessages');
  }
};

const sendMessage = async (conversationPublicId, senderPublicId, body) => {
  try {
    await findConversationOrThrow(conversationPublicId, senderPublicId);
    const msg = await dm_message.create({
      conversation_id: conversationPublicId,
      sender_id: senderPublicId,
      body,
    });
    await dm_conversation.update(
      { updated_at: new Date() },
      { where: { public_id: conversationPublicId } }
    );
    return toPublicMessage(msg);
  } catch (err) {
    if (err instanceof APIError) throw err;
    throw new ServiceErrorHandler(err, 'DmService::sendMessage');
  }
};

const markAsRead = async (conversationPublicId, readerPublicId) => {
  try {
    await findConversationOrThrow(conversationPublicId, readerPublicId);
    await dm_message.update(
      { is_read: true },
      {
        where: {
          conversation_id: conversationPublicId,
          sender_id: { [Op.ne]: readerPublicId },
          is_read: false,
        },
      }
    );
  } catch (err) {
    if (err instanceof APIError) throw err;
    throw new ServiceErrorHandler(err, 'DmService::markAsRead');
  }
};

module.exports = { startOrGetConversation, listConversations, listMessages, sendMessage, markAsRead };
