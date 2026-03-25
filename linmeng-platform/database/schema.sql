-- 邻盟社区活动与商业资源智能对接助手 数据库设计
-- 创建数据库
CREATE DATABASE IF NOT EXISTS linmeng DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE linmeng;

-- 1. 社区用户表
CREATE TABLE IF NOT EXISTS community_user (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  openid VARCHAR(100) DEFAULT NULL COMMENT '微信openid',
  phone VARCHAR(20) NOT NULL UNIQUE COMMENT '手机号',
  community_name VARCHAR(100) NOT NULL COMMENT '社区全称',
  contact_name VARCHAR(50) NOT NULL COMMENT '负责人姓名',
  street VARCHAR(100) NOT NULL COMMENT '所属街道',
  address VARCHAR(255) NOT NULL COMMENT '详细地址',
  location VARCHAR(100) DEFAULT NULL COMMENT '社区具体位置',
  total_households INT DEFAULT NULL COMMENT '居民总户数',
  elderly_ratio DECIMAL(5,2) DEFAULT NULL COMMENT '老年人占比',
  youth_family_ratio DECIMAL(5,2) DEFAULT NULL COMMENT '青少年家庭占比',
  public_space_area DECIMAL(10,2) DEFAULT NULL COMMENT '公共空间面积(㎡)',
  residential_areas VARCHAR(500) DEFAULT NULL COMMENT '所辖小区名称',
  nearby_merchants INT DEFAULT NULL COMMENT '辖区商户数量',
  license_img VARCHAR(255) DEFAULT NULL COMMENT '资质证明照片',
  status TINYINT DEFAULT 0 COMMENT '审核状态: 0待审核 1已通过 2已驳回',
  reject_reason VARCHAR(255) DEFAULT NULL COMMENT '驳回原因',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='社区用户表';

-- 2. 商家用户表
CREATE TABLE IF NOT EXISTS merchant_user (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  openid VARCHAR(100) DEFAULT NULL COMMENT '微信openid',
  phone VARCHAR(20) NOT NULL UNIQUE COMMENT '手机号',
  business_name VARCHAR(100) NOT NULL COMMENT '商家名称',
  contact_name VARCHAR(50) NOT NULL COMMENT '联系人姓名',
  industry VARCHAR(50) NOT NULL COMMENT '所属行业',
  address VARCHAR(255) NOT NULL COMMENT '商家地址',
  location VARCHAR(100) DEFAULT NULL COMMENT '商家位置坐标',
  license_img VARCHAR(255) DEFAULT NULL COMMENT '营业执照照片',
  logo VARCHAR(255) DEFAULT NULL COMMENT '商家logo',
  description TEXT DEFAULT NULL COMMENT '商家简介',
  sponsor_types VARCHAR(100) DEFAULT NULL COMMENT '可提供赞助类型',
  target_crowd VARCHAR(100) DEFAULT NULL COMMENT '目标人群标签',
  member_level TINYINT DEFAULT 0 COMMENT '会员等级: 0无 1银卡 2金卡 3钻石',
  member_expire DATETIME DEFAULT NULL COMMENT '会员到期时间',
  monthly_quota INT DEFAULT 0 COMMENT '每月报名配额',
  used_quota INT DEFAULT 0 COMMENT '已使用配额',
  star_rating DECIMAL(2,1) DEFAULT 5.0 COMMENT '综合星级评分',
  status TINYINT DEFAULT 0 COMMENT '审核状态: 0待审核 1已通过 2已驳回',
  reject_reason VARCHAR(255) DEFAULT NULL COMMENT '驳回原因',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商家用户表';

-- 3. 活动表
CREATE TABLE IF NOT EXISTS activity (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  community_id INT NOT NULL COMMENT '社区用户ID',
  title VARCHAR(100) NOT NULL COMMENT '活动名称',
  start_time DATETIME NOT NULL COMMENT '开始时间',
  end_time DATETIME NOT NULL COMMENT '结束时间',
  location VARCHAR(255) NOT NULL COMMENT '活动地点',
  expected_count INT DEFAULT NULL COMMENT '预计人数',
  target_crowd VARCHAR(50) NOT NULL COMMENT '面向人群',
  sponsor_types VARCHAR(100) NOT NULL COMMENT '需求赞助类型',
  need_detail TEXT DEFAULT NULL COMMENT '具体需求详情JSON',
  description TEXT DEFAULT NULL COMMENT '活动简介',
  returns VARCHAR(255) DEFAULT NULL COMMENT '商家回报设置',
  cover_img VARCHAR(255) DEFAULT NULL COMMENT '活动封面图',
  extra_images TEXT DEFAULT NULL COMMENT '活动宣传图JSON数组',
  extra_content TEXT DEFAULT NULL COMMENT '平台补充图文内容',
  status TINYINT DEFAULT 0 COMMENT '状态: 0待审核 1招募中 2对接中 3已完成 4已取消',
  reject_reason VARCHAR(255) DEFAULT NULL COMMENT '驳回原因',
  site_photos TEXT DEFAULT NULL COMMENT '现场照片JSON数组',
  summary TEXT DEFAULT NULL COMMENT '活动小结',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_community_id (community_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='活动表';

-- 4. 合作表
CREATE TABLE IF NOT EXISTS cooperation (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  activity_id INT NOT NULL COMMENT '活动ID',
  merchant_id INT NOT NULL COMMENT '商家ID',
  community_id INT NOT NULL COMMENT '社区ID',
  sponsor_type VARCHAR(50) NOT NULL COMMENT '赞助类型',
  sponsor_detail TEXT DEFAULT NULL COMMENT '赞助详情',
  status TINYINT DEFAULT 0 COMMENT '状态: 0待确认 1已通过 2已拒绝 3已完成',
  reject_reason VARCHAR(255) DEFAULT NULL COMMENT '拒绝原因',
  confirm_time DATETIME DEFAULT NULL COMMENT '确认时间',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_activity_id (activity_id),
  INDEX idx_merchant_id (merchant_id),
  INDEX idx_community_id (community_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='合作表';

-- 5. 评价表
CREATE TABLE IF NOT EXISTS evaluate (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  activity_id INT NOT NULL COMMENT '活动ID',
  community_id INT NOT NULL COMMENT '社区ID',
  business_id INT NOT NULL COMMENT '商家ID',
  score_quality INT NOT NULL COMMENT '赞助质量评分1-5',
  score_cooperate INT NOT NULL COMMENT '配合度评分1-5',
  score_service INT NOT NULL COMMENT '服务态度评分1-5',
  total_score FLOAT NOT NULL COMMENT '综合评分',
  content TEXT DEFAULT NULL COMMENT '评价内容',
  img VARCHAR(500) DEFAULT NULL COMMENT '评价照片',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_activity_id (activity_id),
  INDEX idx_business_id (business_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评价表';

-- 6. 订单表
CREATE TABLE IF NOT EXISTS `order` (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  business_id INT NOT NULL COMMENT '商家ID',
  order_type TINYINT NOT NULL COMMENT '订单类型: 0会员年费 1定制活动服务',
  order_name VARCHAR(100) NOT NULL COMMENT '订单名称',
  amount DECIMAL(10,2) NOT NULL COMMENT '订单金额',
  pay_status TINYINT DEFAULT 0 COMMENT '支付状态: 0待支付 1支付成功 2支付失败 3已退款',
  pay_time DATETIME DEFAULT NULL COMMENT '支付时间',
  order_code VARCHAR(50) NOT NULL UNIQUE COMMENT '订单编号',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_business_id (business_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 7. 消息表
CREATE TABLE IF NOT EXISTS message (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  user_type TINYINT NOT NULL COMMENT '接收用户类型: 0社区 1商家',
  user_id INT NOT NULL COMMENT '用户ID',
  sender_type TINYINT DEFAULT NULL COMMENT '发送者类型: 0系统 1社区 2商家',
  sender_id INT DEFAULT NULL COMMENT '发送者ID',
  msg_type TINYINT NOT NULL COMMENT '消息类型: 0系统通知 1对接聊天',
  content TEXT NOT NULL COMMENT '消息内容',
  read_status TINYINT DEFAULT 0 COMMENT '读取状态: 0未读 1已读',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_user (user_type, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='消息表';

-- 8. 违规记录表
CREATE TABLE IF NOT EXISTS violation_record (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  user_type TINYINT NOT NULL COMMENT '用户类型: 0社区 1商家',
  user_id INT NOT NULL COMMENT '用户ID',
  violation_type VARCHAR(50) NOT NULL COMMENT '违规类型',
  violation_content TEXT NOT NULL COMMENT '违规详情',
  punish_level TINYINT NOT NULL COMMENT '处罚等级: 0警告 1一级 2二级 3三级',
  punish_content VARCHAR(255) NOT NULL COMMENT '处罚内容',
  punish_admin VARCHAR(50) NOT NULL COMMENT '执行处罚管理员',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='违规记录表';

-- 9. 会员套餐配置表
CREATE TABLE IF NOT EXISTS member_package (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  name VARCHAR(50) NOT NULL COMMENT '套餐名称',
  level TINYINT NOT NULL COMMENT '会员等级: 1银卡 2金卡 3钻石',
  price DECIMAL(10,2) NOT NULL COMMENT '套餐价格',
  monthly_quota INT NOT NULL COMMENT '每月报名配额',
  features TEXT DEFAULT NULL COMMENT '套餐权益JSON',
  sort_order INT DEFAULT 0 COMMENT '排序',
  status TINYINT DEFAULT 1 COMMENT '状态: 0禁用 1启用',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会员套餐配置表';

-- 初始化会员套餐数据
INSERT INTO member_package (name, level, price, monthly_quota, features, sort_order) VALUES
('银卡会员', 1, 299.00, 5, '["每月5次报名机会","优先展示","基础客服支持"]', 1),
('金卡会员', 2, 599.00, 15, '["每月15次报名机会","优先展示","专属客服支持","数据报告"]', 2),
('钻石会员', 3, 999.00, 999, '["无限报名机会","优先展示","专属客服支持","数据报告","定制活动服务"]', 3);

-- 10. 管理员表
CREATE TABLE IF NOT EXISTS admin_user (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  password VARCHAR(255) NOT NULL COMMENT '密码',
  real_name VARCHAR(50) DEFAULT NULL COMMENT '真实姓名',
  role TINYINT DEFAULT 1 COMMENT '角色: 1普通管理员 2超级管理员',
  status TINYINT DEFAULT 1 COMMENT '状态: 0禁用 1启用',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';

-- 初始化管理员账号 (密码: admin123)
INSERT INTO admin_user (username, password, real_name, role) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '超级管理员', 2);
