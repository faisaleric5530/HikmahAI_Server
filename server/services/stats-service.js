const {
  reply: ReplyModel,
  channel: ChannelModel,
  blog: BlogModel,
} = require('../../database');
const { ServiceErrorHandler } = require('../exceptions');

const getPlatformStats = async () => {
  try {
    const [qnaAnswered, topicChannels, publishedArticles] = await Promise.all([
      ReplyModel.count({ distinct: true, col: 'question_id' }),
      ChannelModel.count(),
      BlogModel.count({ where: { status: 'published' } }),
    ]);

    return { qnaAnswered, topicChannels, publishedArticles };
  } catch (err) {
    throw new ServiceErrorHandler(err, 'StatsService::getPlatformStats');
  }
};

module.exports = { getPlatformStats };
