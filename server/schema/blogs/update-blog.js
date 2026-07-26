const { z } = require('zod');
const { uuidParam } = require('../custom');

const updateBlogSchema = z.object({
  params: z.object({
    blogId: uuidParam('blogId'),
  }),
  body: z
    .object({
      title: z.string().min(3).optional(),
      body: z.string().min(1).optional(),
      status: z.enum(['draft', 'published']).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required' }),
});

module.exports = updateBlogSchema;
