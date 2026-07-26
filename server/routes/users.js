const { Router } = require('express');
const UserController = require('../controllers/user-controller');
const zodValidation = require('../middleware/request-validator');
const { strictAuth } = require('../middleware/auth');
const { updatePreferencesSchema } = require('../schema/users');

const userRouter = Router();

userRouter.use(strictAuth);

userRouter.patch('/me/preferences', zodValidation(updatePreferencesSchema), UserController.updatePreferences);

module.exports = userRouter;
