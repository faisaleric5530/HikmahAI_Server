const { z } = require('zod');
const { uuidParam } = require('../custom');

const createQuestionSchema = z.object({
  params: z.object({
    channelId: uuidParam('channelId'),
  }),
  body: z.object({
    title: z.string({ required_error: 'title is required' }).min(3),
    body: z.string({ required_error: 'body is required' }).min(1),
  }),
});

module.exports = createQuestionSchema;
