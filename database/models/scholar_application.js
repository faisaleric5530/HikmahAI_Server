module.exports = (sequelize, DataTypes) => {
  const scholar_application = sequelize.define(
    'scholar_application',
    {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: DataTypes.INTEGER },
      public_id: { type: DataTypes.UUID, unique: true, allowNull: false },
      user_id: { type: DataTypes.UUID, allowNull: false },
      full_name: { type: DataTypes.STRING, allowNull: false },
      qualifications: { type: DataTypes.TEXT, allowNull: false },
      ijazah: { type: DataTypes.STRING, allowNull: true },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
      },
      reviewed_by: { type: DataTypes.UUID, allowNull: true },
      reviewed_at: { type: DataTypes.DATE, allowNull: true },
      reviewer_note: { type: DataTypes.TEXT, allowNull: true },
      created_at: { allowNull: false, type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { allowNull: false, type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      freezeTableName: true,
      underscored: true,
      timestamps: true,
    }
  );

  scholar_application.associate = (models) => {
    scholar_application.belongsTo(models.user, { foreignKey: 'user_id', targetKey: 'public_id', as: 'applicant' });
    scholar_application.belongsTo(models.user, { foreignKey: 'reviewed_by', targetKey: 'public_id', as: 'reviewer' });
  };

  return scholar_application;
};
