const createChannelSchema = require('./create-channel');
const channelIdSchema = require('./channel-id');
const createQuestionSchema = require('./create-question');
const questionIdSchema = require('./question-id');
const createReplySchema = require('./create-reply');
const replyIdSchema = require('./reply-id');

module.exports = {
  createChannelSchema,
  channelIdSchema,
  createQuestionSchema,
  questionIdSchema,
  createReplySchema,
  replyIdSchema,
};
