'use strict';

const { z } = require('zod');

module.exports = {
  body: z.object({
    body: z.string().min(1).max(2000),
  }),
};
