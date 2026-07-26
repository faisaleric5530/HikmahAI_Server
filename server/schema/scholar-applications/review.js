const { z } = require('zod');
const { uuidParam } = require('../custom');

const reviewApplicationSchema = z.object({
  params: z.object({
    applicationId: uuidParam('applicationId'),
  }),
  body: z.object({
    status: z.enum(['approved', 'rejected'], { required_error: 'status is required' }),
    reviewerNote: z.string().max(500).optional(),
  }),
});

module.exports = reviewApplicationSchema;
