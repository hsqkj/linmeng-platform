const sequelize = require('./src/config/database');
const { QueryTypes } = require('sequelize');

async function migrate() {
  try {
    console.log('开始添加编码字段...');
    
    const [communityColumns] = await sequelize.query(`
      SHOW COLUMNS FROM community_user LIKE 'community_code'
    `);
    if (communityColumns.length === 0) {
      await sequelize.query(`
        ALTER TABLE community_user 
        ADD COLUMN community_code VARCHAR(20) COMMENT '社区编码'
      `);
      console.log('✓ community_user 添加 community_code 字段');
    } else {
      console.log('✓ community_user.community_code 字段已存在');
    }
    
    const [merchantColumns] = await sequelize.query(`
      SHOW COLUMNS FROM merchant_user LIKE 'merchant_code'
    `);
    if (merchantColumns.length === 0) {
      await sequelize.query(`
        ALTER TABLE merchant_user 
        ADD COLUMN merchant_code VARCHAR(20) COMMENT '商家编码'
      `);
      console.log('✓ merchant_user 添加 merchant_code 字段');
    } else {
      console.log('✓ merchant_user.merchant_code 字段已存在');
    }
    
    const [activityColumns] = await sequelize.query(`
      SHOW COLUMNS FROM activity LIKE 'demand_code'
    `);
    if (activityColumns.length === 0) {
      await sequelize.query(`
        ALTER TABLE activity 
        ADD COLUMN demand_code VARCHAR(20) COMMENT '需求编码'
      `);
      console.log('✓ activity 添加 demand_code 字段');
    } else {
      console.log('✓ activity.demand_code 字段已存在');
    }
    
    const [sponsorColumns] = await sequelize.query(`
      SHOW COLUMNS FROM sponsor_infos LIKE 'sponsor_code'
    `);
    if (sponsorColumns.length === 0) {
      await sequelize.query(`
        ALTER TABLE sponsor_infos 
        ADD COLUMN sponsor_code VARCHAR(20) COMMENT '赞助编码'
      `);
      console.log('✓ sponsor_infos 添加 sponsor_code 字段');
    } else {
      console.log('✓ sponsor_infos.sponsor_code 字段已存在');
    }
    
    const [cooperationColumns] = await sequelize.query(`
      SHOW COLUMNS FROM cooperation LIKE 'cooperation_code'
    `);
    if (cooperationColumns.length === 0) {
      await sequelize.query(`
        ALTER TABLE cooperation 
        ADD COLUMN cooperation_code VARCHAR(20) COMMENT '合作编码'
      `);
      console.log('✓ cooperation 添加 cooperation_code 字段');
    } else {
      console.log('✓ cooperation.cooperation_code 字段已存在');
    }
    
    console.log('编码字段迁移完成！');
    
    process.exit(0);
  } catch (error) {
    console.error('迁移错误:', error);
    process.exit(1);
  }
}

migrate();
