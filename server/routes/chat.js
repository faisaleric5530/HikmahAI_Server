const { Router } = require('express');
const ChatController = require('../controllers/chat-controller');
const zodValidation = require('../middleware/request-validator');
const { strictAuth } = require('../middleware/auth');
const { rateLimiter } = require('../middleware/rate-limiter');
const { sendMessageSchema, sessionIdSchema } = require('../schema/chat');

const chatRouter = Router();

chatRouter.use(strictAuth);

chatRouter.get('/sessions', ChatController.listSessions);
chatRouter.post('/sessions', ChatController.createSession);
chatRouter.get('/sessions/:sessionId', zodValidation(sessionIdSchema), ChatController.getSession);
chatRouter.delete('/sessions/:sessionId', zodValidation(sessionIdSchema), ChatController.deleteSession);

chatRouter.post(
  '/sessions/:sessionId/messages',
  rateLimiter(20, 60),
  zodValidation(sendMessageSchema),
  ChatController.sendMessage
);

module.exports = chatRouter;
