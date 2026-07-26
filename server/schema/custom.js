const { z } = require('zod');

const uuidRegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const strongPassword = z
  .string({ required_error: 'password is required' })
  .min(8, 'password must be at least 8 characters')
  .regex(/[a-z]/, 'password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'password must contain at least one special character');

const uuidParam = (name) =>
  z.string({ required_error: `${name} is required` }).regex(uuidRegExp, `${name} must be a valid UUID`);

module.exports = { uuidRegExp, strongPassword, uuidParam };
