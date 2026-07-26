const { v4: uuidv4 } = require('uuid');
const { user: UserModel } = require('../../database');
const { hashPassword, verifyPassword } = require('../utils/hashes');
const { signToken } = require('../utils/jwt');
const { APIError, ServiceErrorHandler } = require('../exceptions');

const toPublicUser = (user) => ({
  id: user.public_id,
  name: user.name,
  email: user.email,
  role: user.role,
  preferredLanguage: user.preferred_language,
});

const register = async ({ name, email, password }) => {
  try {
    const existing = await UserModel.findOne({ where: { email } });
    if (existing) throw APIError.Conflict('An account with this email already exists');

    const passwordHash = await hashPassword(password);

    const user = await UserModel.create({
      public_id: uuidv4(),
      name,
      email,
      password_hash: passwordHash,
    });

    const token = signToken({ userId: user.id, publicId: user.public_id, email: user.email, role: user.role });

    return { token, user: toPublicUser(user) };
  } catch (err) {
    if (err instanceof APIError) throw err;
    throw new ServiceErrorHandler(err, 'AuthService::register');
  }
};

const login = async ({ email, password }) => {
  try {
    const user = await UserModel.findOne({ where: { email } });
    if (!user) throw APIError.Unauthorized('Invalid email or password');

    const isMatch = await verifyPassword(user.password_hash, password);
    if (!isMatch) throw APIError.Unauthorized('Invalid email or password');

    const token = signToken({ userId: user.id, publicId: user.public_id, email: user.email, role: user.role });

    return { token, user: toPublicUser(user) };
  } catch (err) {
    if (err instanceof APIError) throw err;
    throw new ServiceErrorHandler(err, 'AuthService::login');
  }
};

const getCurrentUser = async ({ userId }) => {
  try {
    const user = await UserModel.findByPk(userId);
    if (!user) throw APIError.NotFound('User not found');

    return toPublicUser(user);
  } catch (err) {
    if (err instanceof APIError) throw err;
    throw new ServiceErrorHandler(err, 'AuthService::getCurrentUser');
  }
};

module.exports = { register, login, getCurrentUser };
