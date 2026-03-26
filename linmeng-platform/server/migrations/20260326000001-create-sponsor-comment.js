const { DataTypes } = require('sequelize')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('sponsor_comments', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      comment_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: '留言编码'
      },
      sponsor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '赞助信息ID'
      },
      community_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '社区ID'
      },
      merchant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '商家ID'
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '留言内容'
      },
      parent_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        comment: '父留言ID（用于回复）'
      },
      reply_to_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        comment: '回复的留言ID'
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否已读'
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
      comment: '赞助留言表'
    })

    await queryInterface.addIndex('sponsor_comments', ['sponsor_id'])
    await queryInterface.addIndex('sponsor_comments', ['community_id'])
    await queryInterface.addIndex('sponsor_comments', ['merchant_id'])
    await queryInterface.addIndex('sponsor_comments', ['parent_id'])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('sponsor_comments')
  }
}
