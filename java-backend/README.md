# 邻盟营销助手 - Java后台

基于Spring Boot 3.2 + MyBatis Plus的社区营销助手后台服务

## 技术栈

- **Spring Boot 3.2.0** - 基础框架
- **MyBatis Plus 3.5.5** - ORM框架
- **MySQL 8.0+** - 数据库
- **Spring Security** - 安全框架
- **JWT** - 认证授权
- **Knife4j** - API文档
- **Redis** - 缓存

## 项目结构

```
java-backend/
├── src/main/java/com/linmeng/
│   ├── NeighborAllianceApplication.java    # 启动类
│   ├── common/                             # 公共类
│   │   ├── Result.java                     # 统一返回结果
│   │   ├── PageResult.java                 # 分页结果
│   │   └── ResultCode.java                 # 状态码枚举
│   ├── config/                             # 配置类
│   │   ├── MybatisPlusConfig.java          # MyBatis Plus配置
│   │   ├── SecurityConfig.java             # Security配置
│   │   ├── Knife4jConfig.java              # API文档配置
│   │   ├── GlobalExceptionHandler.java     # 全局异常处理
│   │   └── WebConfig.java                  # Web配置
│   ├── controller/                         # 控制器层
│   │   ├── MerchantAuthController.java     # 商家认证
│   │   ├── MerchantController.java         # 商家管理
│   │   ├── ActivityController.java         # 营销活动
│   │   ├── OrderController.java            # 订单管理
│   │   ├── IndustryController.java         # 行业分类
│   │   ├── CommunityController.java        # 社区管理
│   │   └── TemplateController.java         # 营销模板
│   ├── dto/                                # 数据传输对象
│   │   ├── LoginDTO.java
│   │   └── RegisterDTO.java
│   ├── entity/                             # 实体类
│   │   ├── MerchantAccount.java
│   │   ├── MerchantInfo.java
│   │   ├── ResidentUser.java
│   │   ├── MarketingActivity.java
│   │   ├── Order.java
│   │   ├── Industry.java
│   │   ├── Community.java
│   │   └── MarketingTemplate.java
│   ├── mapper/                             # 数据访问层
│   │   ├── MerchantAccountMapper.java
│   │   ├── MerchantInfoMapper.java
│   │   ├── ResidentUserMapper.java
│   │   ├── MarketingActivityMapper.java
│   │   ├── OrderMapper.java
│   │   ├── IndustryMapper.java
│   │   ├── CommunityMapper.java
│   │   └── MarketingTemplateMapper.java
│   ├── service/                            # 服务层接口
│   │   ├── MerchantAccountService.java
│   │   ├── MerchantInfoService.java
│   │   ├── ResidentUserService.java
│   │   ├── MarketingActivityService.java
│   │   ├── OrderService.java
│   │   ├── IndustryService.java
│   │   ├── CommunityService.java
│   │   └── MarketingTemplateService.java
│   └── service/impl/                       # 服务层实现
│       ├── MerchantAccountServiceImpl.java
│       ├── MerchantInfoServiceImpl.java
│       ├── ResidentUserServiceImpl.java
│       ├── MarketingActivityServiceImpl.java
│       ├── OrderServiceImpl.java
│       ├── IndustryServiceImpl.java
│       ├── CommunityServiceImpl.java
│       └── MarketingTemplateServiceImpl.java
└── src/main/resources/
    └── application.yml                     # 配置文件
```

## 快速开始

### 1. 环境要求

- JDK 17+
- Maven 3.6+
- MySQL 8.0+
- Redis 6.0+

### 2. 数据库准备

```bash
# 执行SQL脚本创建数据库
mysql -u root -p < database/create_database.sql
```

### 3. 修改配置

修改 `application.yml` 中的数据库和Redis配置：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/neighbor_alliance
    username: root
    password: your_password
  redis:
    host: localhost
    port: 6379
    password: your_redis_password
```

### 4. 启动项目

```bash
# 编译项目
mvn clean install

# 启动服务
mvn spring-boot:run
```

### 5. 访问API文档

启动成功后访问：http://localhost:8080/api/doc.html

## API接口说明

### 商家认证模块

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/merchant/auth/register | POST | 商家注册 |
| /api/merchant/auth/login | POST | 商家登录 |
| /api/merchant/auth/info | GET | 获取商家信息 |

### 商家管理模块

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/merchant/list | GET | 获取商家列表 |
| /api/merchant/page | GET | 分页查询商家 |
| /api/merchant/{id} | GET | 获取商家详情 |
| /api/merchant | POST | 创建商家信息 |
| /api/merchant | PUT | 更新商家信息 |

### 营销活动模块

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/activity/published | GET | 获取已发布活动 |
| /api/activity/page | GET | 分页查询活动 |
| /api/activity/{id} | GET | 获取活动详情 |
| /api/activity | POST | 发布活动 |
| /api/activity | PUT | 更新活动 |
| /api/activity/{id}/like | POST | 点赞活动 |
| /api/activity/{id}/share | POST | 分享活动 |

### 订单管理模块

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/order/user/{userId} | GET | 获取用户订单 |
| /api/order/merchant/{merchantId} | GET | 获取商家订单 |
| /api/order/page | GET | 分页查询订单 |
| /api/order/{id} | GET | 获取订单详情 |
| /api/order | POST | 创建订单 |
| /api/order/{id}/cancel | POST | 取消订单 |

### 基础数据模块

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/industry/list | GET | 获取行业分类 |
| /api/community/list | GET | 获取社区列表 |
| /api/template/list | GET | 获取营销模板 |

## 核心功能

### 1. 商家管理
- 商家注册登录
- 商家信息维护
- 商家认证审核

### 2. 营销活动
- 活动发布管理
- 活动统计分析
- 多渠道内容推送

### 3. 订单管理
- 订单创建处理
- 订单状态流转
- 订单评价管理

### 4. 用户互动
- 收藏、关注、点赞
- 评论咨询
- 行为日志记录

## 开发规范

### 命名规范
- 类名：大驼峰（MerchantAccount）
- 方法名：小驼峰（getByPhone）
- 常量：全大写下划线（MAX_SIZE）
- 包名：全小写（com.linmeng.service）

### 代码规范
- 使用Lombok简化代码
- 统一使用Result返回结果
- 异常统一处理
- 使用MyBatis Plus的Lambda查询

### 注释规范
- 类注释说明功能
- 方法注释说明参数和返回值
- 复杂逻辑添加行内注释

## 部署说明

### 打包部署

```bash
# 打包
mvn clean package -DskipTests

# 运行
java -jar target/neighbor-alliance-1.0.0.jar
```

### Docker部署

```dockerfile
FROM openjdk:17-jdk-alpine
VOLUME /tmp
COPY target/neighbor-alliance-1.0.0.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

## 联系方式

- 项目地址：https://github.com/linmeng/neighbor-alliance
- 技术支持：support@linmeng.com
