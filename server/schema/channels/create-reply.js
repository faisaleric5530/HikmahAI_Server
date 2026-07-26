const { z } = require('zod');
const { uuidParam } = require('../custom');

const createReplySchema = z.object({
  params: z.object({
    questionId: uuidParam('questionId'),
  }),
  body: z.object({
    body: z.string({ required_error: 'body is required' }).min(1),
  }),
});

module.exports = createReplySchema;
