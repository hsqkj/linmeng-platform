'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      DELETE FROM sponsor_comments 
      WHERE parent_id IS NOT NULL 
      AND merchant_id IS NOT NULL
      AND id IN (
        SELECT id FROM (
          SELECT id FROM sponsor_comments 
          WHERE parent_id IS NOT NULL 
          AND merchant_id IS NOT NULL
        ) AS temp
      )
    `);
  },

  down: async (queryInterface, Sequelize) => {
  }
};
