'use strict';

const { z } = require('zod');

module.exports = z.object({
  body: z.object({
    scholarPublicId: z.string().uuid(),
  }),
});
