'use strict';

const { z } = require('zod');

module.exports = {
  body: z.object({
    scholarPublicId: z.string().uuid(),
  }),
};
