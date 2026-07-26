const { z } = require('zod');
const { uuidParam } = require('../custom');

const blogIdSchema = z.object({
  params: z.object({
    blogId: uuidParam('blogId'),
  }),
});

module.exports = blogIdSchema;
