'use strict';

const dmService = require('../services/dm-service');
const { sendResponse } = require('../utils/response');
const { HttpStatusCode } = require('../constants/status');

const start = async (req, res, next) => {
  try {
    const conv = await dmService.startOrGetConversation(req.user.publicId, req.body.scholarPublicId);
    sendResponse(res, 'success', { status: HttpStatusCode.OK, data: conv });
  } catch (err) {
    next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const conversations = await dmService.listConversations(req.user.publicId);
    sendResponse(res, 'success', { status: HttpStatusCode.OK, data: conversations });
  } catch (err) {
    next(err);
  }
};

const messages = async (req, res, next) => {
  try {
    const msgs = await dmService.listMessages(req.params.conversationId, req.user.publicId);
    sendResponse(res, 'success', { status: HttpStatusCode.OK, data: msgs });
  } catch (err) {
    next(err);
  }
};

const send = async (req, res, next) => {
  try {
    const msg = await dmService.sendMessage(req.params.conversationId, req.user.publicId, req.body.body);
    sendResponse(res, 'success', { status: HttpStatusCode.CREATED, data: msg });
  } catch (err) {
    next(err);
  }
};

const markRead = async (req, res, next) => {
  try {
    await dmService.markAsRead(req.params.conversationId, req.user.publicId);
    res.status(HttpStatusCode.NO_CONTENT).end();
  } catch (err) {
    next(err);
  }
};

module.exports = { start, list, messages, send, markRead };
