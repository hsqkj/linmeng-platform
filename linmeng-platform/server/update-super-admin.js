require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('./src/config/database');
const AdminUser = require('./src/models/AdminUser');

const updateSuperAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');

    const superAdminPhone = '13800138000';
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const [updated] = await AdminUser.update(
      {
        role: 'super_admin',
        password: hashedPassword,
        real_name: '超级管理员'
      },
      {
        where: { phone: superAdminPhone }
      }
    );

    if (updated > 0) {
      console.log('超级管理员更新成功！');
      console.log('手机号:', superAdminPhone);
      console.log('密码: admin123');
      console.log('角色: super_admin');
    } else {
      const newAdmin = await AdminUser.create({
        phone: superAdminPhone,
        password: hashedPassword,
        real_name: '超级管理员',
        username: 'super_admin',
        role: 'super_admin',
        permissions: [],
        status: 1
      });
      console.log('超级管理员创建成功！');
      console.log('手机号:', newAdmin.phone);
      console.log('密码: admin123');
      console.log('角色:', newAdmin.role);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('更新失败:', error);
    process.exit(1);
  }
};

updateSuperAdmin();
