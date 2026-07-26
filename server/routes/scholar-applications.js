const { Router } = require('express');
const ScholarApplicationController = require('../controllers/scholar-application-controller');
const zodValidation = require('../middleware/request-validator');
const { strictAuth, requireRole } = require('../middleware/auth');
const { submitApplicationSchema, reviewApplicationSchema } = require('../schema/scholar-applications');

const scholarApplicationRouter = Router();

scholarApplicationRouter.use(strictAuth);

scholarApplicationRouter.post('/', zodValidation(submitApplicationSchema), ScholarApplicationController.submit);
scholarApplicationRouter.get('/me', ScholarApplicationController.getOwn);

scholarApplicationRouter.get('/', requireRole('admin'), ScholarApplicationController.list);
scholarApplicationRouter.patch(
  '/:applicationId',
  requireRole('admin'),
  zodValidation(reviewApplicationSchema),
  ScholarApplicationController.review
);

module.exports = scholarApplicationRouter;
