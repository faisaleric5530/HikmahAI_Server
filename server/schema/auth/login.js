const { z } = require('zod');

const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'email is required' }).email(),
    password: z.string({ required_error: 'password is required' }).min(1),
  }),
});

module.exports = loginSchema;
