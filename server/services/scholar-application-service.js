const { v4: uuidv4 } = require('uuid');
const {
  scholar_application: ScholarApplicationModel,
  user: UserModel,
  sequelize,
} = require('../../database');
const { APIError, ServiceErrorHandler } = require('../exceptions');

const toPublicApplication = (application) => ({
  id: application.public_id,
  fullName: application.full_name,
  qualifications: application.qualifications,
  ijazah: application.ijazah,
  status: application.status,
  reviewerNote: application.reviewer_note ?? null,
  reviewedAt: application.reviewed_at,
  createdAt: application.created_at,
  updatedAt: application.updated_at,
});

const submit = async ({ userId, fullName, qualifications, ijazah }) => {
  try {
    const user = await UserModel.findByPk(userId);
    if (user.role !== 'user') throw APIError.Conflict('Only regular users can apply to become a scholar');

    const existingPending = await ScholarApplicationModel.findOne({
      where: { user_id: user.public_id, status: 'pending' },
    });
    if (existingPending) throw APIError.Conflict('You already have a pending scholar application');

    const application = await ScholarApplicationModel.create({
      public_id: uuidv4(),
      user_id: user.public_id,
      full_name: fullName,
      qualifications,
      ijazah,
    });

    return toPublicApplication(application);
  } catch (err) {
    if (err instanceof APIError) throw err;
    throw new ServiceErrorHandler(err, 'ScholarApplicationService::submit');
  }
};

const getOwn = async ({ userPublicId }) => {
  try {
    const application = await ScholarApplicationModel.findOne({
      where: { user_id: userPublicId },
      order: [['created_at', 'DESC']],
    });
    return application ? toPublicApplication(application) : null;
  } catch (err) {
    throw new ServiceErrorHandler(err, 'ScholarApplicationService::getOwn');
  }
};

const listApplications = async ({ status }) => {
  try {
    const where = status ? { status } : {};
    const applications = await ScholarApplicationModel.findAll({
      where,
      include: [{ model: UserModel, as: 'applicant', attributes: ['public_id', 'name', 'email'] }],
      order: [['created_at', 'DESC']],
    });

    return applications.map((application) => ({
      ...toPublicApplication(application),
      applicant: {
        id: application.applicant.public_id,
        name: application.applicant.name,
        email: application.applicant.email,
      },
    }));
  } catch (err) {
    throw new ServiceErrorHandler(err, 'ScholarApplicationService::listApplications');
  }
};

const review = async ({ applicationId, reviewerPublicId, status, reviewerNote }) => {
  const transaction = await sequelize.transaction();

  try {
    const application = await ScholarApplicationModel.findOne({
      where: { public_id: applicationId },
      transaction,
    });
    if (!application) throw APIError.NotFound('Scholar application not found');
    if (application.status !== 'pending') throw APIError.Conflict('This application has already been reviewed');

    await application.update(
      { status, reviewed_by: reviewerPublicId, reviewed_at: new Date(), reviewer_note: reviewerNote ?? null },
      { transaction }
    );

    if (status === 'approved') {
      await UserModel.update(
        { role: 'scholar' },
        { where: { public_id: application.user_id }, transaction }
      );
    }

    await transaction.commit();
    return toPublicApplication(application);
  } catch (err) {
    await transaction.rollback();
    if (err instanceof APIError) throw err;
    throw new ServiceErrorHandler(err, 'ScholarApplicationService::review');
  }
};

module.exports = { submit, getOwn, listApplications, review };
