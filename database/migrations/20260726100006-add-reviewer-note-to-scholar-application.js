module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('scholar_application', 'reviewer_note', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('scholar_application', 'reviewer_note');
  },
};
