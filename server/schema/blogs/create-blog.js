const { z } = require('zod');

const createBlogSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'title is required' }).min(3),
    body: z.string({ required_error: 'body is required' }).min(1),
    status: z.enum(['draft', 'published']).optional(),
  }),
});

module.exports = createBlogSchema;
