require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('./src/config/database');
const AdminUser = require('./src/models/AdminUser');

const initSuperAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');

    await sequelize.sync({ alter: false });

    const superAdminPhone = '13800138000';
    const existingAdmin = await AdminUser.findOne({ 
      where: { phone: superAdminPhone } 
    });

    if (existingAdmin) {
      console.log('超级管理员已存在');
      console.log('手机号:', existingAdmin.phone);
      console.log('角色:', existingAdmin.role);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const superAdmin = await AdminUser.create({
      phone: superAdminPhone,
      password: hashedPassword,
      real_name: '超级管理员',
      username: 'super_admin',
      role: 'super_admin',
      permissions: [],
      status: 1
    });

    console.log('超级管理员创建成功！');
    console.log('手机号:', superAdmin.phone);
    console.log('密码: admin123');
    console.log('角色:', superAdmin.role);
    console.log('请及时修改默认密码！');
    
    process.exit(0);
  } catch (error) {
    console.error('初始化失败:', error);
    process.exit(1);
  }
};

initSuperAdmin();
