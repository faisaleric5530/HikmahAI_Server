const { sendResponse, throwErrorResponse } = require('../utils/response');
const { HttpStatusCode } = require('../constants/status');
const scholarApplicationService = require('../services/scholar-application-service');

class ScholarApplicationController {
  static submit = async (req, res) => {
    try {
      const response = await scholarApplicationService.submit({ userId: req.user.userId, ...req.body });
      return sendResponse(res, 'success', {
        status: HttpStatusCode.CREATED,
        message: 'Scholar application submitted successfully',
        data: response,
      });
    } catch (err) {
      return throwErrorResponse(req, res, err);
    }
  };

  static getOwn = async (req, res) => {
    try {
      const response = await scholarApplicationService.getOwn({ userPublicId: req.user.publicId });
      return sendResponse(res, 'success', { message: 'Application status fetched successfully', data: response });
    } catch (err) {
      return throwErrorResponse(req, res, err);
    }
  };

  static list = async (req, res) => {
    try {
      const response = await scholarApplicationService.listApplications({ status: req.query.status });
      return sendResponse(res, 'success', { message: 'Applications fetched successfully', data: response });
    } catch (err) {
      return throwErrorResponse(req, res, err);
    }
  };

  static review = async (req, res) => {
    try {
      const response = await scholarApplicationService.review({
        applicationId: req.params.applicationId,
        reviewerPublicId: req.user.publicId,
        status: req.body.status,
        reviewerNote: req.body.reviewerNote ?? null,
      });
      return sendResponse(res, 'success', { message: 'Application reviewed successfully', data: response });
    } catch (err) {
      return throwErrorResponse(req, res, err);
    }
  };
}

module.exports = ScholarApplicationController;
