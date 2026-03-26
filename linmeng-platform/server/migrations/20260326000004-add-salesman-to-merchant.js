const { DataTypes } = require('sequelize')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('merchant_user', 'salesman_id', {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '业务员ID',
        after: 'member_level'
      })
    } catch (error) {
      console.log('Column may already exist:', error.message)
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('merchant_user', 'salesman_id')
    } catch (error) {
      console.log('Column may not exist:', error.message)
    }
  }
}
