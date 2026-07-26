const { v4: uuidv4 } = require('uuid');
const {
  channel: ChannelModel,
  question: QuestionModel,
  reply: ReplyModel,
  user: UserModel,
} = require('../../database');
const { APIError, ServiceErrorHandler } = require('../exceptions');

const toPublicChannel = (channel) => ({
  id: channel.public_id,
  name: channel.name,
  description: channel.description,
  colorVariant: channel.color_variant,
  createdAt: channel.created_at,
  updatedAt: channel.updated_at,
});

const toPublicQuestion = (question) => ({
  id: question.public_id,
  channelId: question.channel_id,
  title: question.title,
  body: question.body,
  authorName: question.author ? question.author.name : undefined,
  createdAt: question.created_at,
  updatedAt: question.updated_at,
});

const toPublicReply = (reply) => ({
  id: reply.public_id,
  questionId: reply.question_id,
  body: reply.body,
  authorName: reply.author ? reply.author.name : undefined,
  authorRole: reply.author ? reply.author.role : undefined,
  isVerifiedAnswer: reply.is_verified_answer,
  verifiedAt: reply.verified_at,
  createdAt: reply.created_at,
  updatedAt: reply.updated_at,
});

const listChannels = async () => {
  try {
    const channels = await ChannelModel.findAll({ order: [['created_at', 'ASC']] });
    return channels.map(toPublicChannel);
  } catch (err) {
    throw new ServiceErrorHandler(err, 'ChannelService::listChannels');
  }
};

const findChannelOrThrow = async (channelId) => {
  const channel = await ChannelModel.findOne({ where: { public_id: channelId } });
  if (!channel) throw APIError.NotFound('Channel not found');
  return channel;
};

const getChannel = async ({ channelId }) => {
  try {
    return toPublicChannel(await findChannelOrThrow(channelId));
  } catch (err) {
    if (err instanceof APIError) throw err;
    throw new ServiceErrorHandler(err, 'ChannelService::getChannel');
  }
};

const createChannel = async ({ name, description, colorVariant, createdBy }) => {
  try {
    const channel = await ChannelModel.create({
      public_id: uuidv4(),
      name,
      description,
      color_variant: colorVariant || 'green',
      created_by: createdBy,
    });
    return toPublicChannel(channel);
  } catch (err) {
    throw new ServiceErrorHandler(err, 'ChannelService::createChannel');
  }
};

const listQuestions = async ({ channelId }) => {
  try {
    await findChannelOrThrow(channelId);

    const questions = await QuestionModel.findAll({
      where: { channel_id: channelId },
      include: [{ model: UserModel, as: 'author', attributes: ['name'] }],
      order: [['created_at', 'DESC']],
    });

    return questions.map(toPublicQuestion);
  } catch (err) {
    if (err instanceof APIError) throw err;
    throw new ServiceErrorHandler(err, 'ChannelService::listQuestions');
  }
};

const createQuestion = async ({ channelId, authorId, title, body }) => {
  try {
    await findChannelOrThrow(channelId);

    const question = await QuestionModel.create({
      public_id: uuidv4(),
      channel_id: channelId,
      author_id: authorId,
      title,
      body,
    });

    const withAuthor = await QuestionModel.findOne({
      where: { public_id: question.public_id },
      include: [{ model: UserModel, as: 'author', attributes: ['name'] }],
    });

    return toPublicQuestion(withAuthor);
  } catch (err) {
    if (err instanceof APIError) throw err;
    throw new ServiceErrorHandler(err, 'ChannelService::createQuestion');
  }
};

const findQuestionOrThrow = async (questionId) => {
  const question = await QuestionModel.findOne({
    where: { public_id: questionId },
    include: [{ model: UserModel, as: 'author', attributes: ['name'] }],
  });
  if (!question) throw APIError.NotFound('Question not found');
  return question;
};

const getQuestion = async ({ questionId }) => {
  try {
    const question = await findQuestionOrThrow(questionId);

    const replies = await ReplyModel.findAll({
      where: { question_id: questionId },
      include: [{ model: UserModel, as: 'author', attributes: ['name', 'role'] }],
      order: [['created_at', 'ASC']],
    });

    return { ...toPublicQuestion(question), replies: replies.map(toPublicReply) };
  } catch (err) {
    if (err instanceof APIError) throw err;
    throw new ServiceErrorHandler(err, 'ChannelService::getQuestion');
  }
};

const createReply = async ({ questionId, authorId, body }) => {
  try {
    await findQuestionOrThrow(questionId);

    const reply = await ReplyModel.create({
      public_id: uuidv4(),
      question_id: questionId,
      author_id: authorId,
      body,
    });

    const withAuthor = await ReplyModel.findOne({
      where: { public_id: reply.public_id },
      include: [{ model: UserModel, as: 'author', attributes: ['name', 'role'] }],
    });

    return toPublicReply(withAuthor);
  } catch (err) {
    if (err instanceof APIError) throw err;
    throw new ServiceErrorHandler(err, 'ChannelService::createReply');
  }
};

const verifyReply = async ({ replyId, verifierId }) => {
  try {
    const reply = await ReplyModel.findOne({
      where: { public_id: replyId },
      include: [{ model: UserModel, as: 'author', attributes: ['name', 'role'] }],
    });
    if (!reply) throw APIError.NotFound('Reply not found');

    await reply.update({ is_verified_answer: true, verified_by: verifierId, verified_at: new Date() });

    return toPublicReply(reply);
  } catch (err) {
    if (err instanceof APIError) throw err;
    throw new ServiceErrorHandler(err, 'ChannelService::verifyReply');
  }
};

module.exports = {
  listChannels,
  getChannel,
  createChannel,
  listQuestions,
  createQuestion,
  getQuestion,
  createReply,
  verifyReply,
};
