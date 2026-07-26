const { z } = require('zod');

const createChannelSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'name is required' }).min(2),
    description: z.string().optional(),
    colorVariant: z.enum(['green', 'blue', 'amber', 'purple', 'orange', 'teal']).optional(),
  }),
});

module.exports = createChannelSchema;
