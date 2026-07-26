const { sendResponse, throwErrorResponse } = require('../utils/response');
const { HttpStatusCode } = require('../constants/status');
const chatService = require('../services/chat-service');

class ChatController {
  static listSessions = async (req, res) => {
    try {
      const response = await chatService.listSessions({ userId: req.user.publicId });
      return sendResponse(res, 'success', { message: 'Chat sessions fetched successfully', data: response });
    } catch (err) {
      return throwErrorResponse(req, res, err);
    }
  };

  static createSession = async (req, res) => {
    try {
      const response = await chatService.createSession({ userId: req.user.publicId });
      return sendResponse(res, 'success', {
        status: HttpStatusCode.CREATED,
        message: 'Chat session created successfully',
        data: response,
      });
    } catch (err) {
      return throwErrorResponse(req, res, err);
    }
  };

  static getSession = async (req, res) => {
    try {
      const response = await chatService.getSession({
        userId: req.user.publicId,
        sessionId: req.params.sessionId,
      });
      return sendResponse(res, 'success', { message: 'Chat session fetched successfully', data: response });
    } catch (err) {
      return throwErrorResponse(req, res, err);
    }
  };

  static deleteSession = async (req, res) => {
    try {
      const response = await chatService.deleteSession({
        userId: req.user.publicId,
        sessionId: req.params.sessionId,
      });
      return sendResponse(res, 'success', { message: 'Chat session deleted successfully', data: response });
    } catch (err) {
      return throwErrorResponse(req, res, err);
    }
  };

  static sendMessage = async (req, res) => {
    try {
      const response = await chatService.sendMessage({
        userId: req.user.publicId,
        sessionId: req.params.sessionId,
        content: req.body.content,
      });
      return sendResponse(res, 'success', { message: 'Message sent successfully', data: response });
    } catch (err) {
      return throwErrorResponse(req, res, err);
    }
  };
}

module.exports = ChatController;
