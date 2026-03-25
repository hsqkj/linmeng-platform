/**
 * 邻盟营销助手 - API服务层
 * 使用LocalStorage模拟后端数据库
 */

const API = {
    // 基础配置
    config: {
        baseUrl: '/api',
        timeout: 5000
    },

    // 工具函数
    utils: {
        // 生成唯一ID
        generateId() {
            return Date.now() + Math.random().toString(36).substr(2, 9);
        },

        // 延迟模拟网络请求
        delay(ms = 300) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },

        // 格式化日期
        formatDate(date) {
            return new Date(date).toISOString();
        },

        // 本地存储操作
        storage: {
            get(key) {
                const data = localStorage.getItem(key);
                return data ? JSON.parse(data) : null;
            },
            set(key, value) {
                localStorage.setItem(key, JSON.stringify(value));
            },
            remove(key) {
                localStorage.removeItem(key);
            }
        }
    },

    // 用户认证相关API
    auth: {
        // 商户登录
        async merchantLogin(phone, password) {
            await API.utils.delay();
            const merchants = API.utils.storage.get('merchants') || [];
            const merchant = merchants.find(m => m.phone === phone && m.password === password);
            
            if (merchant) {
                const token = API.utils.generateId();
                API.utils.storage.set('auth_token', token);
                API.utils.storage.set('current_merchant', merchant);
                return { success: true, token, merchant };
            }
            
            return { success: false, message: '手机号或密码错误' };
        },

        // 商户注册
        async merchantRegister(data) {
            await API.utils.delay();
            const merchants = API.utils.storage.get('merchants') || [];
            
            if (merchants.find(m => m.phone === data.phone)) {
                return { success: false, message: '该手机号已注册' };
            }
            
            const merchant = {
                id: API.utils.generateId(),
                ...data,
                createTime: API.utils.formatDate(new Date())
            };
            
            merchants.push(merchant);
            API.utils.storage.set('merchants', merchants);
            
            return { success: true, merchant };
        },

        // 获取当前商户信息
        async getCurrentMerchant() {
            await API.utils.delay();
            const merchant = API.utils.storage.get('current_merchant');
            return merchant || null;
        },

        // 商户退出登录
        async merchantLogout() {
            await API.utils.delay();
            API.utils.storage.remove('auth_token');
            API.utils.storage.remove('current_merchant');
            return { success: true };
        }
    },

    // 模板管理API
    templates: {
        // 获取所有模板
        async getAllTemplates() {
            await API.utils.delay();
            const templates = [
                {
                    id: 'new-store',
                    name: '新店开业',
                    category: 'new-store',
                    icon: 'store',
                    color: 'from-orange-400 to-red-500',
                    title: '【新店开业】{商家名称}欢迎到店，开业大礼等您来',
                    content: '🎉 好消息！本店新开业啦！\n\n📍 地址：{店铺地址}\n⏰ 开业时间：{开业日期}\n🎁 开业福利：\n• 到店即送精美礼品一份\n• 全场消费满{金额}元立减{金额}元\n• 会员首单享{折扣}折优惠\n\n期待您的光临！'
                },
                {
                    id: 'discount',
                    name: '限时折扣',
                    category: 'discount',
                    icon: 'tag',
                    color: 'from-green-400 to-emerald-500',
                    title: '【限时折扣】特价促销，限时抢购',
                    content: '🔥 限时折扣活动开始啦！\n\n⏰ 活动时间：{开始时间}至{结束时间}\n💰 特价商品：\n• {商品1} 原价{原价1}元/斤 特价{特价1}元/斤\n• {商品2} 原价{原价2}元/斤 特价{特价2}元/斤\n• {商品3} 原价{原价3}元/斤 特价{特价3}元/斤\n\n数量有限，先到先得！'
                },
                {
                    id: 'package',
                    name: '套餐优惠',
                    category: 'package',
                    icon: 'package',
                    color: 'from-blue-400 to-indigo-500',
                    title: '【套餐优惠】超值套餐推荐',
                    content: '✨ 超值套餐推荐！\n\n📦 套餐名称：{套餐名称}\n💎 套餐内容：\n• {项目1}\n• {项目2}\n• {项目3}\n💰 套餐价格：{套餐价格}元（原价{原价}元）\n⏰ 有效期：{开始时间}至{结束时间}\n\n比单点更划算，快来体验吧！'
                },
                {
                    id: 'notification',
                    name: '活动通知',
                    category: 'notification',
                    icon: 'bell',
                    color: 'from-yellow-400 to-orange-500',
                    title: '【活动通知】{活动名称}即将开始',
                    content: '📢 活动通知\n\n🎉 {活动名称}即将开始！\n\n📅 活动时间：{开始时间}\n📍 活动地点：{活动地点}\n🎯 活动内容：\n• {内容1}\n• {内容2}\n• {内容3}\n\n欢迎大家踊跃参加！'
                },
                {
                    id: 'service',
                    name: '上门服务',
                    category: 'service',
                    icon: 'home',
                    color: 'from-purple-400 to-pink-500',
                    title: '【上门服务】{服务名称}，专业便捷',
                    content: '🏠 上门服务，专业便捷\n\n📋 服务项目：{服务项目}\n📍 服务范围：{服务范围}\n💰 收费标准：{收费标准}\n⏰ 服务时间：{服务时间}\n📞 预约方式：{联系电话}\n\n专业团队，品质保证，欢迎预约！'
                },
                {
                    id: 'group-buy',
                    name: '拼团集赞',
                    category: 'group-buy',
                    icon: 'users',
                    color: 'from-pink-400 to-rose-500',
                    title: '【拼团集赞】拉新引流，分享有礼',
                    content: '🎉 拼团集赞活动！\n\n📦 活动商品：{商品名称}\n💰 拼团价格：{拼团价格}元（原价{原价}元）\n👥 拼团人数：{人数}人\n⏰ 活动时间：{开始时间}至{结束时间}\n🎁 分享福利：集赞{数量}个送精美礼品一份\n\n快来邀请好友一起拼团吧！'
                },
                {
                    id: 'festival',
                    name: '节日特惠',
                    category: 'festival',
                    icon: 'gift',
                    color: 'from-red-400 to-pink-500',
                    title: '【节日特惠】{节日名称}大促销',
                    content: '🎊 {节日名称}快乐！\n\n🎉 节日特惠活动开始啦！\n\n⏰ 活动时间：{开始时间}至{结束时间}\n💰 特价商品：\n• {商品1} {优惠1}\n• {商品2} {优惠2}\n• {商品3} {优惠3}\n\n数量有限，先到先得！'
                },
                {
                    id: 'member',
                    name: '会员专享',
                    category: 'member',
                    icon: 'star',
                    color: 'from-amber-400 to-yellow-500',
                    title: '【会员专享】尊贵体验，专属福利',
                    content: '🎊 亲爱的会员朋友：\n\n🎉 本月会员专享福利已上线！\n✅ 会员折扣：全场商品{折扣}折\n✅ 积分加倍：消费1元积{积分}分\n✅ 专属礼品：到店即送精美礼品一份\n✅ 积分兑换：{积分}分可兑换精美礼品\n\n期待您的光临！'
                },
                {
                    id: 'clearance',
                    name: '尾货清仓',
                    category: 'clearance',
                    icon: 'shopping-bag',
                    color: 'from-gray-400 to-slate-500',
                    title: '【尾货清仓】清仓大甩卖，错过等一年',
                    content: '🏷️ 尾货清仓！\n\n🔥 清仓大甩卖！\n\n⏰ 活动时间：{开始时间}至{结束时间}\n💰 清仓商品：\n• {商品1} {优惠1}\n• {商品2} {优惠2}\n• {商品3} {优惠3}\n\n数量有限，售完即止！'
                },
                {
                    id: 'custom',
                    name: '自定义',
                    category: 'custom',
                    icon: 'edit',
                    color: 'from-cyan-400 to-blue-500',
                    title: '',
                    content: ''
                }
            ];
            return { success: true, data: templates };
        },

        // 根据分类获取模板
        async getTemplatesByCategory(category) {
            await API.utils.delay();
            const { data: templates } = await this.getAllTemplates();
            const filtered = category === 'all' 
                ? templates 
                : templates.filter(t => t.category === category);
            return { success: true, data: filtered };
        },

        // 根据ID获取模板
        async getTemplateById(id) {
            await API.utils.delay();
            const { data: templates } = await this.getAllTemplates();
            const template = templates.find(t => t.id === id);
            return template 
                ? { success: true, data: template }
                : { success: false, message: '模板不存在' };
        }
    },

    // 活动管理API
    activities: {
        // 创建活动
        async createActivity(data) {
            await API.utils.delay();
            const activities = API.utils.storage.get('activities') || [];
            const merchant = API.utils.storage.get('current_merchant');
            
            const activity = {
                id: API.utils.generateId(),
                merchantId: merchant.id,
                merchantName: merchant.name,
                merchantAvatar: merchant.avatar,
                ...data,
                status: 1,
                views: 0,
                likes: 0,
                shares: 0,
                comments: 0,
                orders: 0,
                createTime: API.utils.formatDate(new Date())
            };
            
            activities.unshift(activity);
            API.utils.storage.set('activities', activities);
            
            return { success: true, data: activity };
        },

        // 获取商户的活动列表
        async getMerchantActivities(merchantId) {
            await API.utils.delay();
            const activities = API.utils.storage.get('activities') || [];
            const merchantActivities = activities.filter(a => a.merchantId === merchantId);
            return { success: true, data: merchantActivities };
        },

        // 获取所有活动（用户端）
        async getAllActivities(filters = {}) {
            await API.utils.delay();
            const activities = API.utils.storage.get('activities') || [];
            
            let filtered = activities.filter(a => a.status === 1);
            
            if (filters.templateType) {
                filtered = filtered.filter(a => a.templateType === filters.templateType);
            }
            
            if (filters.search) {
                const search = filters.search.toLowerCase();
                filtered = filtered.filter(a => 
                    a.title.toLowerCase().includes(search) ||
                    a.content.toLowerCase().includes(search) ||
                    a.merchantName.toLowerCase().includes(search)
                );
            }
            
            return { success: true, data: filtered };
        },

        // 获取活动详情
        async getActivityById(id) {
            await API.utils.delay();
            const activities = API.utils.storage.get('activities') || [];
            const activity = activities.find(a => a.id === id);
            
            if (activity) {
                activity.views++;
                API.utils.storage.set('activities', activities);
                return { success: true, data: activity };
            }
            
            return { success: false, message: '活动不存在' };
        },

        // 更新活动
        async updateActivity(id, data) {
            await API.utils.delay();
            const activities = API.utils.storage.get('activities') || [];
            const index = activities.findIndex(a => a.id === id);
            
            if (index > -1) {
                activities[index] = { ...activities[index], ...data };
                API.utils.storage.set('activities', activities);
                return { success: true, data: activities[index] };
            }
            
            return { success: false, message: '活动不存在' };
        },

        // 删除活动
        async deleteActivity(id) {
            await API.utils.delay();
            const activities = API.utils.storage.get('activities') || [];
            const filtered = activities.filter(a => a.id !== id);
            API.utils.storage.set('activities', filtered);
            return { success: true };
        },

        // 点赞活动
        async likeActivity(id) {
            await API.utils.delay();
            const activities = API.utils.storage.get('activities') || [];
            const activity = activities.find(a => a.id === id);
            
            if (activity) {
                activity.likes++;
                API.utils.storage.set('activities', activities);
                return { success: true, data: activity };
            }
            
            return { success: false, message: '活动不存在' };
        },

        // 分享活动
        async shareActivity(id) {
            await API.utils.delay();
            const activities = API.utils.storage.get('activities') || [];
            const activity = activities.find(a => a.id === id);
            
            if (activity) {
                activity.shares++;
                API.utils.storage.set('activities', activities);
                return { success: true, data: activity };
            }
            
            return { success: false, message: '活动不存在' };
        }
    },

    // 草稿管理API
    drafts: {
        // 保存草稿
        async saveDraft(data) {
            await API.utils.delay();
            const drafts = API.utils.storage.get('drafts') || [];
            const merchant = API.utils.storage.get('current_merchant');
            
            const draft = {
                id: data.id || API.utils.generateId(),
                merchantId: merchant.id,
                ...data,
                saveTime: API.utils.formatDate(new Date())
            };
            
            const existingIndex = drafts.findIndex(d => d.id === draft.id);
            if (existingIndex > -1) {
                drafts[existingIndex] = draft;
            } else {
                drafts.unshift(draft);
            }
            
            API.utils.storage.set('drafts', drafts);
            return { success: true, data: draft };
        },

        // 获取商户的草稿列表
        async getMerchantDrafts(merchantId) {
            await API.utils.delay();
            const drafts = API.utils.storage.get('drafts') || [];
            const merchantDrafts = drafts.filter(d => d.merchantId === merchantId);
            return { success: true, data: merchantDrafts };
        },

        // 获取草稿详情
        async getDraftById(id) {
            await API.utils.delay();
            const drafts = API.utils.storage.get('drafts') || [];
            const draft = drafts.find(d => d.id === id);
            
            return draft 
                ? { success: true, data: draft }
                : { success: false, message: '草稿不存在' };
        },

        // 删除草稿
        async deleteDraft(id) {
            await API.utils.delay();
            const drafts = API.utils.storage.get('drafts') || [];
            const filtered = drafts.filter(d => d.id !== id);
            API.utils.storage.set('drafts', filtered);
            return { success: true };
        }
    },

    // 订单管理API
    orders: {
        // 创建订单
        async createOrder(data) {
            await API.utils.delay();
            const orders = API.utils.storage.get('orders') || [];
            
            const order = {
                id: API.utils.generateId(),
                ...data,
                status: 0,
                createTime: API.utils.formatDate(new Date())
            };
            
            orders.unshift(order);
            API.utils.storage.set('orders', orders);
            
            return { success: true, data: order };
        },

        // 获取用户订单
        async getUserOrders(userId) {
            await API.utils.delay();
            const orders = API.utils.storage.get('orders') || [];
            const userOrders = orders.filter(o => o.userId === userId);
            return { success: true, data: userOrders };
        },

        // 获取商户订单
        async getMerchantOrders(merchantId) {
            await API.utils.delay();
            const orders = API.utils.storage.get('orders') || [];
            const merchantOrders = orders.filter(o => o.merchantId === merchantId);
            return { success: true, data: merchantOrders };
        },

        // 获取订单详情
        async getOrderById(id) {
            await API.utils.delay();
            const orders = API.utils.storage.get('orders') || [];
            const order = orders.find(o => o.id === id);
            
            return order 
                ? { success: true, data: order }
                : { success: false, message: '订单不存在' };
        },

        // 更新订单状态
        async updateOrderStatus(id, status) {
            await API.utils.delay();
            const orders = API.utils.storage.get('orders') || [];
            const index = orders.findIndex(o => o.id === id);
            
            if (index > -1) {
                orders[index].status = status;
                API.utils.storage.set('orders', orders);
                return { success: true, data: orders[index] };
            }
            
            return { success: false, message: '订单不存在' };
        },

        // 取消订单
        async cancelOrder(id) {
            return await this.updateOrderStatus(id, 3);
        }
    },

    // 收藏管理API
    collections: {
        // 添加收藏
        async addCollection(userId, activityId) {
            await API.utils.delay();
            const collections = API.utils.storage.get('collections') || [];
            
            if (!collections.includes(activityId)) {
                collections.push(activityId);
                API.utils.storage.set('collections', collections);
            }
            
            return { success: true };
        },

        // 取消收藏
        async removeCollection(activityId) {
            await API.utils.delay();
            const collections = API.utils.storage.get('collections') || [];
            const filtered = collections.filter(id => id !== activityId);
            API.utils.storage.set('collections', filtered);
            return { success: true };
        },

        // 获取用户收藏列表
        async getUserCollections(userId) {
            await API.utils.delay();
            const collectionIds = API.utils.storage.get('collections') || [];
            const { data: activities } = await API.activities.getAllActivities();
            const collectedActivities = activities.filter(a => collectionIds.includes(a.id));
            return { success: true, data: collectedActivities };
        }
    },

    // 咨询管理API
    consultations: {
        // 创建咨询
        async createConsultation(data) {
            await API.utils.delay();
            const consultations = API.utils.storage.get('consultations') || [];
            
            const consultation = {
                id: API.utils.generateId(),
                ...data,
                status: 0,
                createTime: API.utils.formatDate(new Date())
            };
            
            consultations.unshift(consultation);
            API.utils.storage.set('consultations', consultations);
            
            return { success: true, data: consultation };
        },

        // 获取用户咨询列表
        async getUserConsultations(userId) {
            await API.utils.delay();
            const consultations = API.utils.storage.get('consultations') || [];
            const userConsultations = consultations.filter(c => c.userId === userId);
            return { success: true, data: userConsultations };
        },

        // 获取商户咨询列表
        async getMerchantConsultations(merchantId) {
            await API.utils.delay();
            const consultations = API.utils.storage.get('consultations') || [];
            const merchantConsultations = consultations.filter(c => c.merchantId === merchantId);
            return { success: true, data: merchantConsultations };
        }
    },

    // 数据统计API
    statistics: {
        // 获取商户统计数据
        async getMerchantStatistics(merchantId, days = 7) {
            await API.utils.delay();
            const activities = API.utils.storage.get('activities') || [];
            const orders = API.utils.storage.get('orders') || [];
            
            const merchantActivities = activities.filter(a => a.merchantId === merchantId);
            const merchantOrders = orders.filter(o => o.merchantId === merchantId);
            
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            
            const recentActivities = merchantActivities.filter(a => 
                new Date(a.createTime) >= cutoffDate
            );
            
            const totalViews = recentActivities.reduce((sum, a) => sum + (a.views || 0), 0);
            const totalLikes = recentActivities.reduce((sum, a) => sum + (a.likes || 0), 0);
            const totalShares = recentActivities.reduce((sum, a) => sum + (a.shares || 0), 0);
            const totalComments = recentActivities.reduce((sum, a) => sum + (a.comments || 0), 0);
            const totalOrders = recentActivities.reduce((sum, a) => sum + (a.orders || 0), 0);
            
            return {
                success: true,
                data: {
                    totalViews,
                    totalLikes,
                    totalShares,
                    totalComments,
                    totalOrders,
                    estimatedRevenue: totalOrders * 50,
                    activities: recentActivities
                }
            };
        },

        // 获取活动统计数据
        async getActivityStatistics(activityId) {
            await API.utils.delay();
            const activities = API.utils.storage.get('activities') || [];
            const activity = activities.find(a => a.id === activityId);
            
            if (activity) {
                return {
                    success: true,
                    data: {
                        views: activity.views || 0,
                        likes: activity.likes || 0,
                        shares: activity.shares || 0,
                        comments: activity.comments || 0,
                        orders: activity.orders || 0
                    }
                };
            }
            
            return { success: false, message: '活动不存在' };
        }
    },

    // AI优化API（模拟）
    ai: {
        // 优化内容
        async optimizeContent(content, options = {}) {
            await API.utils.delay(1000);
            
            const optimizations = {
                fluency: {
                    name: '语句通顺度',
                    improved: content.replace(/，/g, '，\n').replace(/！/g, '！\n'),
                    score: 85
                },
                marketing: {
                    name: '营销吸引力',
                    improved: '🔥 ' + content + '\n\n限时优惠，不容错过！',
                    score: 90
                },
                community: {
                    name: '社区场景适配',
                    improved: '🏘️ ' + content + '\n\n就在您身边，欢迎到店体验！',
                    score: 88
                },
                compliance: {
                    name: '广告法合规',
                    improved: content.replace(/最/g, '').replace(/第一/g, '优质'),
                    score: 95
                }
            };
            
            const results = [];
            if (options.fluency !== false) results.push(optimizations.fluency);
            if (options.marketing !== false) results.push(optimizations.marketing);
            if (options.community !== false) results.push(optimizations.community);
            if (options.compliance !== false) results.push(optimizations.compliance);
            
            return {
                success: true,
                data: {
                    original: content,
                    optimizations: results
                }
            };
        }
    }
};

// 导出API对象
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}