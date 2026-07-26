const { z } = require('zod');
const { uuidParam } = require('../custom');

const sendMessageSchema = z.object({
  params: z.object({
    sessionId: uuidParam('sessionId'),
  }),
  body: z.object({
    content: z.string({ required_error: 'content is required' }).min(1, 'content cannot be empty').max(4000),
  }),
});

module.exports = sendMessageSchema;
