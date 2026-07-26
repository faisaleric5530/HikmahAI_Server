const { z } = require('zod');
const { uuidParam } = require('../custom');

const replyIdSchema = z.object({
  params: z.object({
    replyId: uuidParam('replyId'),
  }),
});

module.exports = replyIdSchema;
