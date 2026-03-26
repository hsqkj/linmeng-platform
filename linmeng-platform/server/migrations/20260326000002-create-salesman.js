const { DataTypes } = require('sequelize')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('salesmen', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      salesman_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: '业务员编码'
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '姓名'
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        comment: '手机号'
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '密码'
      },
      channel_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: '渠道码'
      },
      channel_link: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '渠道链接'
      },
      commission_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 10.00,
        comment: '提成比例（百分比）'
      },
      total_commission: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: '累计提成金额'
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: '状态：0-禁用，1-启用'
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
      comment: '业务员表'
    })

    await queryInterface.addIndex('salesmen', ['phone'])
    await queryInterface.addIndex('salesmen', ['channel_code'])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('salesmen')
  }
}
