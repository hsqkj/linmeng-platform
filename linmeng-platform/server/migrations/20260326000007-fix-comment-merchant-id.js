'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('sponsor_comments', 'merchant_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: '商家ID（商家回复时才有）'
    });
    
    await queryInterface.sequelize.query(`
      UPDATE sponsor_comments 
      SET merchant_id = NULL 
      WHERE parent_id IS NULL 
      AND community_id IS NOT NULL
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('sponsor_comments', 'merchant_id', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  }
};
