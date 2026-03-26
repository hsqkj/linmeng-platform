'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('merchant_user');
    
    if (!tableDesc.channel_code) {
      await queryInterface.addColumn('merchant_user', 'channel_code', {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: '渠道码'
      });
    }
    
    if (!tableDesc.salesman_id) {
      await queryInterface.addColumn('merchant_user', 'salesman_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: '业务员ID'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('merchant_user');
    
    if (tableDesc.channel_code) {
      await queryInterface.removeColumn('merchant_user', 'channel_code');
    }
    if (tableDesc.salesman_id) {
      await queryInterface.removeColumn('merchant_user', 'salesman_id');
    }
  }
};
