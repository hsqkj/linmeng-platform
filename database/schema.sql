-- 邻盟营销助手 - 数据库Schema设计
-- 数据库: MySQL 8.0+
-- 字符集: utf8mb4
-- 创建时间: 2026-03-09

-- 创建数据库
CREATE DATABASE IF NOT EXISTS neighbor_alliance 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE neighbor_alliance;

-- ============================================
-- 商家表 (merchants)
-- ============================================
CREATE TABLE IF NOT EXISTS merchants (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '商家ID',
    phone VARCHAR(20) NOT NULL COMMENT '手机号',
    password VARCHAR(255) NOT NULL COMMENT '密码（加密存储）',
    name VARCHAR(100) NOT NULL COMMENT '店铺名称',
    avatar VARCHAR(500) DEFAULT NULL COMMENT '店铺头像URL',
    industry VARCHAR(50) NOT NULL COMMENT '所属行业',
    address VARCHAR(255) NOT NULL COMMENT '店铺地址',
    business_hours VARCHAR(50) DEFAULT '08:00-22:00' COMMENT '营业时间',
    description TEXT COMMENT '店铺简介',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-正常',
    rating DECIMAL(2,1) DEFAULT 5.0 COMMENT '评分（1-5）',
    rating_count INT DEFAULT 0 COMMENT '评分人数',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    last_login_time DATETIME DEFAULT NULL COMMENT '最后登录时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_phone (phone),
    KEY idx_industry (industry),
    KEY idx_status (status),
    KEY idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商家表';

-- ============================================
-- 用户表 (users)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    phone VARCHAR(20) NOT NULL COMMENT '手机号',
    password VARCHAR(255) DEFAULT NULL COMMENT '密码（加密存储）',
    nickname VARCHAR(50) DEFAULT NULL COMMENT '昵称',
    avatar VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
    gender TINYINT DEFAULT 0 COMMENT '性别：0-未知，1-男，2-女',
    birthday DATE DEFAULT NULL COMMENT '生日',
    address VARCHAR(255) DEFAULT NULL COMMENT '地址',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-正常',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    last_login_time DATETIME DEFAULT NULL COMMENT '最后登录时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_phone (phone),
    KEY idx_status (status),
    KEY idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ============================================
-- 营销模板表 (templates)
-- ============================================
CREATE TABLE IF NOT EXISTS templates (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '模板ID',
    code VARCHAR(50) NOT NULL COMMENT '模板代码',
    name VARCHAR(100) NOT NULL COMMENT '模板名称',
    category VARCHAR(50) NOT NULL COMMENT '分类',
    icon VARCHAR(100) DEFAULT NULL COMMENT '图标',
    title_template VARCHAR(255) NOT NULL COMMENT '标题模板',
    content_template TEXT NOT NULL COMMENT '内容模板',
    description VARCHAR(500) DEFAULT NULL COMMENT '描述',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_code (code),
    KEY idx_category (category),
    KEY idx_status (status),
    KEY idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='营销模板表';

-- ============================================
-- 活动表 (activities)
-- ============================================
CREATE TABLE IF NOT EXISTS activities (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '活动ID',
    merchant_id BIGINT UNSIGNED NOT NULL COMMENT '商家ID',
    template_id BIGINT UNSIGNED DEFAULT NULL COMMENT '模板ID',
    title VARCHAR(255) NOT NULL COMMENT '活动标题',
    content TEXT NOT NULL COMMENT '活动内容',
    media JSON COMMENT '媒体文件（图片/视频）',
    channels JSON COMMENT '发布渠道',
    status TINYINT DEFAULT 0 COMMENT '状态：0-草稿，1-已发布，2-已下架',
    view_count INT DEFAULT 0 COMMENT '浏览量',
    like_count INT DEFAULT 0 COMMENT '点赞数',
    share_count INT DEFAULT 0 COMMENT '分享数',
    comment_count INT DEFAULT 0 COMMENT '评论数',
    order_count INT DEFAULT 0 COMMENT '订单数',
    publish_time DATETIME DEFAULT NULL COMMENT '发布时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    KEY idx_merchant_id (merchant_id),
    KEY idx_template_id (template_id),
    KEY idx_status (status),
    KEY idx_publish_time (publish_time),
    KEY idx_create_time (create_time),
    FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动表';

-- ============================================
-- 草稿表 (drafts)
-- ============================================
CREATE TABLE IF NOT EXISTS drafts (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '草稿ID',
    merchant_id BIGINT UNSIGNED NOT NULL COMMENT '商家ID',
    template_id BIGINT UNSIGNED DEFAULT NULL COMMENT '模板ID',
    title VARCHAR(255) DEFAULT NULL COMMENT '草稿标题',
    content TEXT DEFAULT NULL COMMENT '草稿内容',
    media JSON COMMENT '媒体文件',
    channels JSON COMMENT '发布渠道',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    KEY idx_merchant_id (merchant_id),
    KEY idx_update_time (update_time),
    FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='草稿表';

-- ============================================
-- 订单表 (orders)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '订单ID',
    order_no VARCHAR(50) NOT NULL COMMENT '订单编号',
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    merchant_id BIGINT UNSIGNED NOT NULL COMMENT '商家ID',
    activity_id BIGINT UNSIGNED DEFAULT NULL COMMENT '活动ID',
    service_name VARCHAR(255) NOT NULL COMMENT '服务名称',
    price DECIMAL(10,2) NOT NULL COMMENT '价格',
    quantity INT DEFAULT 1 COMMENT '数量',
    total_amount DECIMAL(10,2) NOT NULL COMMENT '总金额',
    remark VARCHAR(500) DEFAULT NULL COMMENT '备注',
    status TINYINT DEFAULT 0 COMMENT '状态：0-待处理，1-已确认，2-已完成，3-已取消',
    contact_name VARCHAR(50) DEFAULT NULL COMMENT '联系人姓名',
    contact_phone VARCHAR(20) DEFAULT NULL COMMENT '联系人电话',
    contact_address VARCHAR(255) DEFAULT NULL COMMENT '联系人地址',
    appointment_time DATETIME DEFAULT NULL COMMENT '预约时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_order_no (order_no),
    KEY idx_user_id (user_id),
    KEY idx_merchant_id (merchant_id),
    KEY idx_activity_id (activity_id),
    KEY idx_status (status),
    KEY idx_create_time (create_time),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- ============================================
-- 收藏表 (collections)
-- ============================================
CREATE TABLE IF NOT EXISTS collections (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '收藏ID',
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    activity_id BIGINT UNSIGNED NOT NULL COMMENT '活动ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_user_activity (user_id, activity_id),
    KEY idx_user_id (user_id),
    KEY idx_activity_id (activity_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收藏表';

-- ============================================
-- 咨询表 (consultations)
-- ============================================
CREATE TABLE IF NOT EXISTS consultations (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '咨询ID',
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    merchant_id BIGINT UNSIGNED NOT NULL COMMENT '商家ID',
    activity_id BIGINT UNSIGNED DEFAULT NULL COMMENT '活动ID',
    content TEXT NOT NULL COMMENT '咨询内容',
    reply_content TEXT DEFAULT NULL COMMENT '回复内容',
    reply_time DATETIME DEFAULT NULL COMMENT '回复时间',
    status TINYINT DEFAULT 0 COMMENT '状态：0-待回复，1-已回复',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    KEY idx_user_id (user_id),
    KEY idx_merchant_id (merchant_id),
    KEY idx_activity_id (activity_id),
    KEY idx_status (status),
    KEY idx_create_time (create_time),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='咨询表';

-- ============================================
-- 评价表 (reviews)
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '评价ID',
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    merchant_id BIGINT UNSIGNED NOT NULL COMMENT '商家ID',
    order_id BIGINT UNSIGNED DEFAULT NULL COMMENT '订单ID',
    rating TINYINT NOT NULL COMMENT '评分（1-5）',
    content TEXT DEFAULT NULL COMMENT '评价内容',
    media JSON COMMENT '评价图片',
    reply_content TEXT DEFAULT NULL COMMENT '商家回复',
    reply_time DATETIME DEFAULT NULL COMMENT '回复时间',
    status TINYINT DEFAULT 1 COMMENT '状态：0-隐藏，1-显示',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    KEY idx_user_id (user_id),
    KEY idx_merchant_id (merchant_id),
    KEY idx_order_id (order_id),
    KEY idx_rating (rating),
    KEY idx_status (status),
    KEY idx_create_time (create_time),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评价表';

-- ============================================
-- 关注表 (follows)
-- ============================================
CREATE TABLE IF NOT EXISTS follows (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '关注ID',
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    merchant_id BIGINT UNSIGNED NOT NULL COMMENT '商家ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_user_merchant (user_id, merchant_id),
    KEY idx_user_id (user_id),
    KEY idx_merchant_id (merchant_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='关注表';

-- ============================================
-- 数据统计表 (statistics)
-- ============================================
CREATE TABLE IF NOT EXISTS statistics (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '统计ID',
    merchant_id BIGINT UNSIGNED NOT NULL COMMENT '商家ID',
    activity_id BIGINT UNSIGNED DEFAULT NULL COMMENT '活动ID',
    stat_date DATE NOT NULL COMMENT '统计日期',
    view_count INT DEFAULT 0 COMMENT '浏览量',
    like_count INT DEFAULT 0 COMMENT '点赞数',
    share_count INT DEFAULT 0 COMMENT '分享数',
    comment_count INT DEFAULT 0 COMMENT '评论数',
    order_count INT DEFAULT 0 COMMENT '订单数',
    order_amount DECIMAL(10,2) DEFAULT 0.00 COMMENT '订单金额',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_merchant_date_activity (merchant_id, stat_date, activity_id),
    KEY idx_merchant_id (merchant_id),
    KEY idx_activity_id (activity_id),
    KEY idx_stat_date (stat_date),
    FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数据统计表';

-- ============================================
-- 系统配置表 (configs)
-- ============================================
CREATE TABLE IF NOT EXISTS configs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '配置ID',
    config_key VARCHAR(100) NOT NULL COMMENT '配置键',
    config_value TEXT COMMENT '配置值',
    description VARCHAR(500) DEFAULT NULL COMMENT '描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_config_key (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- ============================================
-- 初始化数据
-- ============================================

-- 插入默认营销模板
INSERT INTO templates (code, name, category, icon, title_template, content_template, description, sort_order) VALUES
('new-store', '新店开业', 'promotion', 'store', '【新店开业】欢迎到店，开业大礼等您来', '🎉 好消息！本店新开业啦！\n\n📍 地址：{address}\n⏰ 开业时间：{date}\n🎁 开业福利：\n• 到店即送{gift}\n• 全场消费满{amount}立减{discount}\n• 会员首单享{discount_rate}折\n\n期待您的光临！', '适用于新店开业宣传', 1),
('discount', '限时折扣', 'promotion', 'tag', '【限时折扣】特价促销，限时抢购', '🔥 限时折扣活动开始啦！\n\n⏰ 活动时间：{start_time}至{end_time}\n💰 特价商品：\n• {product1} 原价{price1} 特价{special_price1}\n• {product2} 原价{price2} 特价{special_price2}\n• {product3} 原价{price3} 特价{special_price3}\n\n数量有限，先到先得！', '适用于限时折扣促销', 2),
('package', '套餐优惠', 'promotion', 'gift', '【套餐优惠】组合推荐，超值划算', '✨ 超值套餐推荐！\n\n📦 套餐名称：{package_name}\n💎 套餐内容：\n• {content1}\n• {content2}\n• {content3}\n💰 套餐价格：{price}\n⏰ 有效期：{validity}\n\n比单点更划算，快来体验吧！', '适用于套餐组合推广', 3),
('notice', '活动通知', 'notice', 'bell', '【活动通知】重要通知，敬请关注', '📢 重要通知\n\n尊敬的顾客：\n\n{reason}\n\n⏰ 生效时间：{effective_time}\n📍 涉及范围：{scope}\n📞 联系方式：{contact}\n\n感谢您的理解与配合！', '适用于重要通知公告', 4),
('service', '上门服务', 'service', 'home', '【上门服务】预约下单，方便快捷', '🏠 上门服务预约开启！\n\n📋 服务项目：{service_items}\n💰 服务价格：{price}起\n⏰ 服务时间：{service_time}\n📍 服务范围：{service_area}\n\n专业团队，品质保证！\n\n📞 预约电话：{phone}\n💬 在线咨询：点击咨询', '适用于上门服务推广', 5),
('group-buy', '拼团集赞', 'promotion', 'users', '【拼团集赞】邀请好友，一起省钱', '🎊 拼团集赞活动来啦！\n\n🎯 活动规则：\n• 邀请{invite_count}位好友助力\n• 或组团{group_count}人购买\n\n🎁 活动奖励：\n• {reward1}\n• {reward2}\n• {reward3}\n\n⏰ 活动时间：{start_time}至{end_time}\n\n快来邀请好友参与吧！', '适用于拼团集赞活动', 6),
('holiday', '节日特惠', 'promotion', 'calendar', '【节日特惠】{festival}特惠，限时抢购', '🎉 {festival}特惠活动！\n\n⏰ 活动时间：{start_time}至{end_time}\n🎁 节日福利：\n• {benefit1}\n• {benefit2}\n• {benefit3}\n\n💰 特惠商品：\n• {product1} 特价{price1}\n• {product2} 特价{price2}\n\n{festival}快乐，优惠享不停！', '适用于节日促销活动', 7),
('member', '会员专享', 'promotion', 'crown', '【会员专享】尊贵会员，专属福利', '👑 会员专享福利！\n\n🎁 会员特权：\n• 全场商品{discount}折\n• 积分{multiple}倍\n• 生日礼券{birthday_gift}\n• 专属客服服务\n\n💰 会员价格：\n• {product1} 会员价{member_price1}\n• {product2} 会员价{member_price2}\n\n成为会员，享受更多优惠！', '适用于会员专享活动', 8),
('clearance', '尾货清仓', 'promotion', 'truck', '【尾货清仓】清仓大甩卖，一件不留', '🔥 尾货清仓大甩卖！\n\n⏰ 清仓时间：{start_time}至{end_time}\n📍 清仓地点：{location}\n\n💰 清仓商品：\n• {product1} 原价{original_price1} 清仓价{clearance_price1}\n• {product2} 原价{original_price2} 清仓价{clearance_price2}\n• {product3} 原价{original_price3} 清仓价{clearance_price3}\n\n数量有限，清完为止！', '适用于尾货清仓促销', 9),
('custom', '自定义', 'other', 'edit', '【{custom_title}】', '{custom_content}', '自定义营销内容', 10);

-- 插入系统配置
INSERT INTO configs (config_key, config_value, description) VALUES
('app_name', '邻盟营销助手', '应用名称'),
('app_version', '1.0.0', '应用版本'),
('max_media_count', '9', '最大媒体文件数量'),
('draft_expire_days', '7', '草稿过期天数'),
('verify_code_expire', '300', '验证码过期时间（秒）'),
('default_page_size', '20', '默认分页大小');

-- ============================================
-- 创建视图
-- ============================================

-- 商家活动统计视图
CREATE OR REPLACE VIEW v_merchant_activity_stats AS
SELECT 
    m.id AS merchant_id,
    m.name AS merchant_name,
    COUNT(DISTINCT a.id) AS total_activities,
    COUNT(DISTINCT CASE WHEN a.status = 1 THEN a.id END) AS published_activities,
    SUM(a.view_count) AS total_views,
    SUM(a.like_count) AS total_likes,
    SUM(a.share_count) AS total_shares,
    SUM(a.comment_count) AS total_comments,
    SUM(a.order_count) AS total_orders
FROM merchants m
LEFT JOIN activities a ON m.id = a.merchant_id
GROUP BY m.id, m.name;

-- 商家订单统计视图
CREATE OR REPLACE VIEW v_merchant_order_stats AS
SELECT 
    m.id AS merchant_id,
    m.name AS merchant_name,
    COUNT(DISTINCT o.id) AS total_orders,
    COUNT(DISTINCT CASE WHEN o.status = 0 THEN o.id END) AS pending_orders,
    COUNT(DISTINCT CASE WHEN o.status = 1 THEN o.id END) AS confirmed_orders,
    COUNT(DISTINCT CASE WHEN o.status = 2 THEN o.id END) AS completed_orders,
    SUM(o.total_amount) AS total_amount
FROM merchants m
LEFT JOIN orders o ON m.id = o.merchant_id
GROUP BY m.id, m.name;

-- ============================================
-- 创建存储过程
-- ============================================

-- 更新商家评分存储过程
DELIMITER //
CREATE PROCEDURE UpdateMerchantRating(IN p_merchant_id BIGINT)
BEGIN
    DECLARE avg_rating DECIMAL(2,1);
    DECLARE rating_count INT;
    
    SELECT AVG(rating), COUNT(*) INTO avg_rating, rating_count
    FROM reviews
    WHERE merchant_id = p_merchant_id AND status = 1;
    
    UPDATE merchants
    SET rating = COALESCE(avg_rating, 5.0),
        rating_count = COALESCE(rating_count, 0),
        update_time = NOW()
    WHERE id = p_merchant_id;
END //
DELIMITER ;

-- ============================================
-- 创建触发器
-- ============================================

-- 订单状态更新触发器
DELIMITER //
CREATE TRIGGER trg_order_status_update
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO order_logs (order_id, old_status, new_status, create_time)
        VALUES (NEW.id, OLD.status, NEW.status, NOW());
    END IF;
END //
DELIMITER ;

-- ============================================
-- 权限设置
-- ============================================

-- 创建应用数据库用户（请根据实际情况修改密码）
-- CREATE USER 'neighbor_app'@'localhost' IDENTIFIED BY 'your_secure_password';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON neighbor_alliance.* TO 'neighbor_app'@'localhost';
-- FLUSH PRIVILEGES;

-- ============================================
-- 完成
-- ============================================
SELECT 'Database schema created successfully!' AS message;
