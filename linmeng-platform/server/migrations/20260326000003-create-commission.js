const { DataTypes } = require('sequelize')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('commissions', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      commission_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: '提成编码'
      },
      salesman_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '业务员ID'
      },
      merchant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '商家ID'
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '订单ID'
      },
      order_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: '订单金额'
      },
      commission_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        comment: '提成比例'
      },
      commission_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: '提成金额'
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '状态：0-待结算，1-已结算，2-已取消'
      },
      settle_time: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '结算时间'
      },
      create_time: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      update_time: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      comment: '提成记录表'
    })

    await queryInterface.addIndex('commissions', ['salesman_id'])
    await queryInterface.addIndex('commissions', ['merchant_id'])
    await queryInterface.addIndex('commissions', ['order_id'])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('commissions')
  }
}
