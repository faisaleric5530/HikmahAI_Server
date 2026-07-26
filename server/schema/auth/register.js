const { z } = require('zod');
const { strongPassword } = require('../custom');

const registerSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'name is required' }).min(2),
    email: z.string({ required_error: 'email is required' }).email(),
    password: strongPassword,
  }),
});

module.exports = registerSchema;
