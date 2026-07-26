'use strict';

const { Router } = require('express');
const zodValidation = require('../middleware/request-validator');
const { strictAuth } = require('../middleware/auth');
const dmSchemas = require('../schema/dms');
const dmController = require('../controllers/dm-controller');

const dmRouter = Router();

dmRouter.use(strictAuth);

dmRouter.post('/', zodValidation(dmSchemas.startConversation), dmController.start);
dmRouter.get('/', dmController.list);
dmRouter.get('/:conversationId/messages', dmController.messages);
dmRouter.post('/:conversationId/messages', zodValidation(dmSchemas.sendMessage), dmController.send);
dmRouter.patch('/:conversationId/read', dmController.markRead);

module.exports = dmRouter;
