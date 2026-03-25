const sequelize = require('./src/config/database');

async function migrate() {
  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS tag_library (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL COMMENT '标签名称',
        category VARCHAR(50) NOT NULL COMMENT '标签分类: demand需求标签, merchant商家标签',
        type VARCHAR(50) COMMENT '标签类型: sponsor赞助类型, crowd人群, industry行业等',
        sort_order INT DEFAULT 0 COMMENT '排序',
        status TINYINT DEFAULT 1 COMMENT '状态: 0禁用 1启用',
        create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_type (type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='标签库'
    `);
    console.log('创建 tag_library 表成功');
  } catch (error) {
    console.error('创建 tag_library 表失败:', error.message);
  }

  try {
    await sequelize.query(`
      ALTER TABLE activity
      ADD COLUMN tags TEXT COMMENT '标签ID列表JSON数组'
    `);
    console.log('添加 activity.tags 字段成功');
  } catch (error) {
    if (error.message.includes('Duplicate column')) {
      console.log('activity.tags 字段已存在');
    } else {
      console.error('添加 activity.tags 字段失败:', error.message);
    }
  }

  try {
    await sequelize.query(`
      ALTER TABLE merchant_user
      ADD COLUMN tags TEXT COMMENT '标签ID列表JSON数组'
    `);
    console.log('添加 merchant_user.tags 字段成功');
  } catch (error) {
    if (error.message.includes('Duplicate column')) {
      console.log('merchant_user.tags 字段已存在');
    } else {
      console.error('添加 merchant_user.tags 字段失败:', error.message);
    }
  }

  try {
    const defaultTags = [
      { name: '现金赞助', category: 'demand', type: 'sponsor' },
      { name: '物资赞助', category: 'demand', type: 'sponsor' },
      { name: '人力支持', category: 'demand', type: 'sponsor' },
      { name: '场地提供', category: 'demand', type: 'sponsor' },
      { name: '媒体宣传', category: 'demand', type: 'sponsor' },
      { name: '技术支持', category: 'demand', type: 'sponsor' },
      { name: '老年人', category: 'demand', type: 'crowd' },
      { name: '亲子家庭', category: 'demand', type: 'crowd' },
      { name: '青少年', category: 'demand', type: 'crowd' },
      { name: '中青年', category: 'demand', type: 'crowd' },
      { name: '宝妈', category: 'demand', type: 'crowd' },
      { name: '全社区居民', category: 'demand', type: 'crowd' },
      { name: '餐饮美食', category: 'merchant', type: 'industry' },
      { name: '生活服务', category: 'merchant', type: 'industry' },
      { name: '教育培训', category: 'merchant', type: 'industry' },
      { name: '医疗健康', category: 'merchant', type: 'industry' },
      { name: '美容美发', category: 'merchant', type: 'industry' },
      { name: '家居装修', category: 'merchant', type: 'industry' },
      { name: '亲子教育', category: 'merchant', type: 'industry' },
      { name: '运动健身', category: 'merchant', type: 'industry' },
      { name: '可提供现金', category: 'merchant', type: 'sponsor' },
      { name: '可提供物资', category: 'merchant', type: 'sponsor' },
      { name: '可提供人力', category: 'merchant', type: 'sponsor' },
      { name: '可提供场地', category: 'merchant', type: 'sponsor' },
      { name: '可提供宣传', category: 'merchant', type: 'sponsor' },
      { name: '服务老年人', category: 'merchant', type: 'crowd' },
      { name: '服务亲子家庭', category: 'merchant', type: 'crowd' },
      { name: '服务青少年', category: 'merchant', type: 'crowd' },
      { name: '服务中青年', category: 'merchant', type: 'crowd' },
      { name: '服务宝妈', category: 'merchant', type: 'crowd' }
    ];

    for (let i = 0; i < defaultTags.length; i++) {
      const tag = defaultTags[i];
      await sequelize.query(`
        INSERT INTO tag_library (name, category, type, sort_order, status)
        SELECT '${tag.name}', '${tag.category}', '${tag.type}', ${i}, 1
        WHERE NOT EXISTS (
          SELECT 1 FROM tag_library WHERE name = '${tag.name}' AND category = '${tag.category}'
        )
      `);
    }
    console.log('插入默认标签成功');
  } catch (error) {
    console.error('插入默认标签失败:', error.message);
  }

  process.exit(0);
}

migrate();
