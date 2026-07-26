module.exports = (sequelize, DataTypes) => {
  const channel = sequelize.define(
    'channel',
    {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: DataTypes.INTEGER },
      public_id: { type: DataTypes.UUID, unique: true, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.STRING, allowNull: true },
      color_variant: {
        type: DataTypes.ENUM('green', 'blue', 'amber', 'purple', 'orange', 'teal'),
        allowNull: false,
        defaultValue: 'green',
      },
      created_by: { type: DataTypes.UUID, allowNull: true },
      created_at: { allowNull: false, type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { allowNull: false, type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      freezeTableName: true,
      underscored: true,
      timestamps: true,
    }
  );

  channel.associate = (models) => {
    channel.hasMany(models.question, { foreignKey: 'channel_id', sourceKey: 'public_id' });
  };

  return channel;
};
