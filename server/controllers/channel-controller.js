const { sendResponse, throwErrorResponse } = require('../utils/response');
const { HttpStatusCode } = require('../constants/status');
const channelService = require('../services/channel-service');

class ChannelController {
  static listChannels = async (req, res) => {
    try {
      const response = await channelService.listChannels();
      return sendResponse(res, 'success', { message: 'Channels fetched successfully', data: response });
    } catch (err) {
      return throwErrorResponse(req, res, err);
    }
  };

  static getChannel = async (req, res) => {
    try {
      const response = await channelService.getChannel({ channelId: req.params.channelId });
      return sendResponse(res, 'success', { message: 'Channel fetched successfully', data: response });
    } catch (err) {
      return throwErrorResponse(req, res, err);
    }
  };

  static createChannel = async (req, res) => {
    try {
      const response = await channelService.createChannel({ ...req.body, createdBy: req.user.publicId });
      return sendResponse(res, 'success', {
        status: HttpStatusCode.CREATED,
        message: 'Channel created successfully',
        data: response,
      });
    } catch (err) {
      return throwErrorResponse(req, res, err);
    }
  };

  static listQuestions = async (req, res) => {
    try {
      const response = await channelService.listQuestions({ channelId: req.params.channelId });
      return sendResponse(res, 'success', { message: 'Questions fetched successfully', data: response });
    } catch (err) {
      return throwErrorResponse(req, res, err);
    }
  };

  static createQuestion = async (req, res) => {
    try {
      const response = await channelService.createQuestion({
        channelId: req.params.channelId,
        authorId: req.user.publicId,
        title: req.body.title,
        body: req.body.body,
      });
      return sendResponse(res, 'success', {
        status: HttpStatusCode.CREATED,
        message: 'Question posted successfully',
        data: response,
      });
    } catch (err) {
      return throwErrorResponse(req, res, err);
    }
  };

  static getQuestion = async (req, res) => {
    try {
      const response = await channelService.getQuestion({ questionId: req.params.questionId });
      return sendResponse(res, 'success', { message: 'Question fetched successfully', data: response });
    } catch (err) {
      return throwErrorResponse(req, res, err);
    }
  };

  static createReply = async (req, res) => {
    try {
      const response = await channelService.createReply({
        questionId: req.params.questionId,
        authorId: req.user.publicId,
        body: req.body.body,
      });
      return sendResponse(res, 'success', {
        status: HttpStatusCode.CREATED,
        message: 'Reply posted successfully',
        data: response,
      });
    } catch (err) {
      return throwErrorResponse(req, res, err);
    }
  };

  static verifyReply = async (req, res) => {
    try {
      const response = await channelService.verifyReply({
        replyId: req.params.replyId,
        verifierId: req.user.publicId,
      });
      return sendResponse(res, 'success', { message: 'Reply marked as verified answer', data: response });
    } catch (err) {
      return throwErrorResponse(req, res, err);
    }
  };
}

module.exports = ChannelController;
