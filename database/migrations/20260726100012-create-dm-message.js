'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = process.env.DB_SCHEMA || 'hikmah';
    await queryInterface.createTable(
      { tableName: 'dm_message', schema },
      {
        id:              { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
        public_id:       { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, allowNull: false, unique: true },
        conversation_id: { type: Sequelize.UUID, allowNull: false },
        sender_id:       { type: Sequelize.UUID, allowNull: false },
        body:            { type: Sequelize.TEXT, allowNull: false },
        is_read:         { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        created_at:      { type: Sequelize.DATE, allowNull: false },
        updated_at:      { type: Sequelize.DATE, allowNull: false },
      }
    );
  },

  async down(queryInterface) {
    const schema = process.env.DB_SCHEMA || 'hikmah';
    await queryInterface.dropTable({ tableName: 'dm_message', schema });
  },
};
