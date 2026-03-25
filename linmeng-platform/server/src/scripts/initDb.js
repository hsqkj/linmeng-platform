require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const { 
  CommunityUser, 
  MerchantUser, 
  AdminUser, 
  Activity, 
  Cooperation, 
  Evaluate, 
  Order, 
  Message,
  MemberPackage 
} = require('../models');

const initDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('数据库表创建成功');

    const hashedPassword = await bcrypt.hash('admin123', 10);
    await AdminUser.create({
      username: 'admin',
      password: hashedPassword,
      real_name: '系统管理员',
      phone: '13800138000',
      status: 1
    });
    console.log('管理员账号创建成功');

    await MemberPackage.bulkCreate([
      {
        name: '普通会员',
        price: 99.00,
        duration: 30,
        apply_quota: 1,
        features: JSON.stringify(['一个月内可报1场活动', '基础展示', '无匹配权重加成']),
        status: 1,
        sort_order: 1
      },
      {
        name: '银卡会员',
        price: 2980.00,
        duration: 365,
        apply_quota: 2,
        features: JSON.stringify(['每月可报2场活动，全年合计24场', '匹配权重+1', '活动优先推送']),
        status: 1,
        sort_order: 2
      },
      {
        name: '金卡会员',
        price: 5880.00,
        duration: 365,
        apply_quota: 4,
        features: JSON.stringify(['每月可报4场活动，全年合计48场', '匹配权重+2', '活动列表优先展示']),
        status: 1,
        sort_order: 3
      },
      {
        name: '钻石会员',
        price: 12800.00,
        duration: 365,
        apply_quota: 999,
        features: JSON.stringify(['每月报名次数不限', '匹配权重+3', '首页置顶推荐']),
        status: 1,
        sort_order: 4
      }
    ]);
    console.log('会员套餐创建成功');

    const community1 = await CommunityUser.create({
      phone: '13800000001',
      community_name: '阳光花园社区',
      contact_name: '张主任',
      street: '幸福街道',
      address: '北京市朝阳区幸福路88号',
      total_households: 2500,
      status: 1
    });

    const community2 = await CommunityUser.create({
      phone: '13800000002',
      community_name: '和谐家园社区',
      contact_name: '李书记',
      street: '和平街道',
      address: '北京市海淀区和平路168号',
      total_households: 1800,
      status: 1
    });
    console.log('测试社区创建成功');

    const merchant1 = await MerchantUser.create({
      phone: '13900000001',
      business_name: '鲜果多超市',
      industry: '零售',
      contact_name: '王经理',
      address: '北京市朝阳区幸福路90号',
      member_level: 2,
      member_expire: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 1
    });

    const merchant2 = await MerchantUser.create({
      phone: '13900000002',
      business_name: '美味轩餐饮',
      industry: '餐饮',
      contact_name: '陈老板',
      address: '北京市朝阳区幸福路92号',
      member_level: 0,
      status: 1
    });

    const merchant3 = await MerchantUser.create({
      phone: '13900000003',
      business_name: '康乐药店',
      industry: '医疗健康',
      contact_name: '刘药师',
      address: '北京市海淀区和平路170号',
      member_level: 3,
      member_expire: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      status: 1
    });
    console.log('测试商家创建成功');

    const activity1 = await Activity.create({
      community_id: community1.id,
      title: '阳光花园社区端午节包粽子活动',
      description: '为弘扬传统文化，增进邻里感情，社区将举办端午节包粽子活动，欢迎居民踊跃参加！',
      start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      location: '阳光花园社区活动中心',
      expected_count: 100,
      sponsor_types: JSON.stringify(['食品饮料', '日用品', '礼品']),
      target_crowd: JSON.stringify(['老年人', '家庭主妇', '儿童']),
      status: 1
    });

    const activity2 = await Activity.create({
      community_id: community1.id,
      title: '阳光花园社区亲子运动会',
      description: '增进亲子关系，培养孩子运动兴趣，社区举办亲子运动会，设置多个趣味项目！',
      start_time: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      end_time: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      location: '阳光花园社区体育场',
      expected_count: 200,
      sponsor_types: JSON.stringify(['体育用品', '食品饮料', '儿童用品']),
      target_crowd: JSON.stringify(['儿童', '家庭']),
      status: 1
    });

    const activity3 = await Activity.create({
      community_id: community2.id,
      title: '和谐家园社区健康义诊活动',
      description: '联合周边医疗机构，为居民提供免费健康检查和医疗咨询服务。',
      start_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      end_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
      location: '和谐家园社区服务中心',
      expected_count: 150,
      sponsor_types: JSON.stringify(['医疗健康', '保健用品']),
      target_crowd: JSON.stringify(['老年人', '慢性病患者']),
      status: 1
    });
    console.log('测试活动创建成功');

    const cooperation1 = await Cooperation.create({
      activity_id: activity1.id,
      merchant_id: merchant1.id,
      community_id: community1.id,
      sponsor_type: '物资赞助',
      sponsor_detail: '提供糯米50斤、粽叶1000张、红枣10斤',
      status: 1
    });

    const cooperation2 = await Cooperation.create({
      activity_id: activity1.id,
      merchant_id: merchant2.id,
      community_id: community1.id,
      sponsor_type: '现金赞助',
      sponsor_detail: '赞助现金500元用于活动奖品',
      status: 0
    });

    const cooperation3 = await Cooperation.create({
      activity_id: activity3.id,
      merchant_id: merchant3.id,
      community_id: community2.id,
      sponsor_type: '服务赞助',
      sponsor_detail: '提供2名医师现场义诊，免费测量血压血糖',
      status: 3
    });
    console.log('测试合作记录创建成功');

    await Evaluate.create({
      activity_id: activity3.id,
      community_id: community2.id,
      business_id: merchant3.id,
      score_quality: 5,
      score_cooperate: 5,
      score_service: 5,
      total_score: 5.0,
      content: '康乐药店的服务非常专业，医师耐心细致，居民反馈很好！'
    });
    console.log('测试评价创建成功');

    await Message.create({
      user_id: merchant1.id,
      user_type: 1,
      sender_type: 0,
      msg_type: 0,
      content: '您报名的「阳光花园社区端午节包粽子活动」合作申请已被社区接受，请及时联系社区负责人确认合作细节。',
      read_status: 0
    });

    await Message.create({
      user_id: merchant2.id,
      user_type: 1,
      sender_type: 0,
      msg_type: 0,
      content: '您已成功报名「阳光花园社区端午节包粽子活动」，请等待社区审核。',
      read_status: 0
    });
    console.log('测试消息创建成功');

    console.log('\n========================================');
    console.log('数据库初始化完成！');
    console.log('========================================');
    console.log('\n测试账号信息：');
    console.log('----------------------------------------');
    console.log('管理后台：');
    console.log('  用户名: admin');
    console.log('  密码: admin123');
    console.log('----------------------------------------');
    console.log('社区端测试账号：');
    console.log('  手机号1: 13800000001 (阳光花园社区)');
    console.log('  手机号2: 13800000002 (和谐家园社区)');
    console.log('----------------------------------------');
    console.log('商家端测试账号：');
    console.log('  手机号1: 13900000001 (鲜果多超市-月度会员)');
    console.log('  手机号2: 13900000002 (美味轩餐饮-普通用户)');
    console.log('  手机号3: 13900000003 (康乐药店-季度会员)');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
};

initDatabase();
