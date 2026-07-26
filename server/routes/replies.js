const { Router } = require('express');
const ChannelController = require('../controllers/channel-controller');
const zodValidation = require('../middleware/request-validator');
const { strictAuth, requireRole } = require('../middleware/auth');
const { replyIdSchema } = require('../schema/channels');

const replyRouter = Router();

replyRouter.use(strictAuth);

replyRouter.patch(
  '/:replyId/verify',
  requireRole('scholar', 'admin'),
  zodValidation(replyIdSchema),
  ChannelController.verifyReply
);

module.exports = replyRouter;
