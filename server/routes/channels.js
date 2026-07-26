const { Router } = require('express');
const ChannelController = require('../controllers/channel-controller');
const zodValidation = require('../middleware/request-validator');
const { strictAuth, requireRole } = require('../middleware/auth');
const {
  createChannelSchema,
  channelIdSchema,
  createQuestionSchema,
} = require('../schema/channels');

const channelRouter = Router();

channelRouter.use(strictAuth);

channelRouter.get('/', ChannelController.listChannels);
channelRouter.post('/', requireRole('admin'), zodValidation(createChannelSchema), ChannelController.createChannel);
channelRouter.get('/:channelId', zodValidation(channelIdSchema), ChannelController.getChannel);
channelRouter.get('/:channelId/questions', zodValidation(channelIdSchema), ChannelController.listQuestions);
channelRouter.post(
  '/:channelId/questions',
  zodValidation(createQuestionSchema),
  ChannelController.createQuestion
);

module.exports = channelRouter;
