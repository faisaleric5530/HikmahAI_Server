const { z } = require('zod');
const { uuidParam } = require('../custom');

const questionIdSchema = z.object({
  params: z.object({
    questionId: uuidParam('questionId'),
  }),
});

module.exports = questionIdSchema;
