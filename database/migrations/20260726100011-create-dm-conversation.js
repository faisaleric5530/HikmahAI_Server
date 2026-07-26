'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = process.env.DB_SCHEMA || 'hikmah';
    await queryInterface.createTable(
      { tableName: 'dm_conversation', schema },
      {
        id:         { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
        public_id:  { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, allowNull: false, unique: true },
        user_id:    { type: Sequelize.UUID, allowNull: false },
        scholar_id: { type: Sequelize.UUID, allowNull: false },
        created_at: { type: Sequelize.DATE, allowNull: false },
        updated_at: { type: Sequelize.DATE, allowNull: false },
      }
    );
    await queryInterface.addIndex(
      { tableName: 'dm_conversation', schema },
      ['user_id', 'scholar_id'],
      { unique: true, name: 'dm_conversation_pair_unique' }
    );
  },

  async down(queryInterface) {
    const schema = process.env.DB_SCHEMA || 'hikmah';
    await queryInterface.dropTable({ tableName: 'dm_conversation', schema });
  },
};
