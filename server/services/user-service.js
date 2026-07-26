const { user: UserModel } = require('../../database');
const { APIError, ServiceErrorHandler } = require('../exceptions');

const updatePreferences = async ({ userPublicId, hashIdentity }) => {
  try {
    const user = await UserModel.findOne({ where: { public_id: userPublicId } });
    if (!user) throw APIError.NotFound('User not found');

    await user.update({ hash_identity: hashIdentity });
    return { hashIdentity: user.hash_identity };
  } catch (err) {
    if (err instanceof APIError) throw err;
    throw new ServiceErrorHandler(err, 'UserService::updatePreferences');
  }
};

module.exports = { updatePreferences };
