const { Router } = require('express');
const ChannelController = require('../controllers/channel-controller');
const zodValidation = require('../middleware/request-validator');
const { strictAuth } = require('../middleware/auth');
const { questionIdSchema, createReplySchema } = require('../schema/channels');

const questionRouter = Router();

questionRouter.use(strictAuth);

questionRouter.get('/:questionId', zodValidation(questionIdSchema), ChannelController.getQuestion);
questionRouter.post('/:questionId/replies', zodValidation(createReplySchema), ChannelController.createReply);

module.exports = questionRouter;
