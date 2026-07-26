const { z } = require('zod');
const { uuidParam } = require('../custom');

const channelIdSchema = z.object({
  params: z.object({
    channelId: uuidParam('channelId'),
  }),
});

module.exports = channelIdSchema;
