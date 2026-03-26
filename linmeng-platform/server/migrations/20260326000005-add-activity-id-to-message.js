'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('message', 'activity_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: '关联活动ID'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('message', 'activity_id');
  }
};
