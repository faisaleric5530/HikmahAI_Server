const { z } = require('zod');
const { uuidParam } = require('../custom');

const sessionIdSchema = z.object({
  params: z.object({
    sessionId: uuidParam('sessionId'),
  }),
});

module.exports = sessionIdSchema;
