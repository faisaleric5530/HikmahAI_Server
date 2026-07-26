const { z } = require('zod');

const updatePreferencesSchema = z.object({
  body: z.object({
    hashIdentity: z.boolean({ required_error: 'hashIdentity is required' }),
  }),
});

module.exports = updatePreferencesSchema;
