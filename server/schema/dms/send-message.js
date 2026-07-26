'use strict';

const { z } = require('zod');

module.exports = z.object({
  body: z.object({
    body: z.string().min(1).max(2000),
  }),
});
