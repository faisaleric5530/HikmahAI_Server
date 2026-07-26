'use strict';

module.exports = (sequelize, DataTypes) => {
  const DmMessage = sequelize.define(
    'dm_message',
    {
      public_id:       { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false },
      conversation_id: { type: DataTypes.UUID, allowNull: false },
      sender_id:       { type: DataTypes.UUID, allowNull: false },
      body:            { type: DataTypes.TEXT, allowNull: false },
      is_read:         { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    { underscored: true }
  );

  DmMessage.associate = (models) => {
    DmMessage.belongsTo(models.dm_conversation, { foreignKey: 'conversation_id', targetKey: 'public_id' });
    DmMessage.belongsTo(models.user, { as: 'sender', foreignKey: 'sender_id', targetKey: 'public_id' });
  };

  return DmMessage;
};
