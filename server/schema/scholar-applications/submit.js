const { z } = require('zod');

const submitApplicationSchema = z.object({
  body: z.object({
    fullName: z.string({ required_error: 'fullName is required' }).min(2),
    qualifications: z.string({ required_error: 'qualifications is required' }).min(10),
    ijazah: z.string().optional(),
  }),
});

module.exports = submitApplicationSchema;
