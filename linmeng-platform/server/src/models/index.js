const CommunityUser = require('./CommunityUser');
const MerchantUser = require('./MerchantUser');
const AdminUser = require('./AdminUser');
const Activity = require('./Activity');
const Cooperation = require('./Cooperation');
const Evaluate = require('./Evaluate');
const Order = require('./Order');
const Message = require('./Message');
const MemberPackage = require('./MemberPackage');
const SponsorInfo = require('./SponsorInfo');
const DemandFavorite = require('./DemandFavorite');
const TagLibrary = require('./TagLibrary');

CommunityUser.hasMany(Activity, { foreignKey: 'community_id', as: 'activities' });
Activity.belongsTo(CommunityUser, { foreignKey: 'community_id', as: 'community' });

MerchantUser.hasMany(Cooperation, { foreignKey: 'merchant_id', as: 'cooperations' });
Cooperation.belongsTo(MerchantUser, { foreignKey: 'merchant_id', as: 'merchant' });

CommunityUser.hasMany(Cooperation, { foreignKey: 'community_id', as: 'cooperations' });
Cooperation.belongsTo(CommunityUser, { foreignKey: 'community_id', as: 'communityInfo' });

Activity.hasMany(Cooperation, { foreignKey: 'activity_id', as: 'cooperations' });
Cooperation.belongsTo(Activity, { foreignKey: 'activity_id', as: 'activity' });

Activity.hasMany(Evaluate, { foreignKey: 'activity_id', as: 'evaluates' });
Evaluate.belongsTo(Activity, { foreignKey: 'activity_id', as: 'activity' });

CommunityUser.hasMany(Evaluate, { foreignKey: 'community_id', as: 'evaluates' });
Evaluate.belongsTo(CommunityUser, { foreignKey: 'community_id', as: 'communityInfo' });

MerchantUser.hasMany(Evaluate, { foreignKey: 'business_id', as: 'evaluates' });
Evaluate.belongsTo(MerchantUser, { foreignKey: 'business_id', as: 'merchant' });

MerchantUser.hasMany(Order, { foreignKey: 'business_id', as: 'orders' });
Order.belongsTo(MerchantUser, { foreignKey: 'business_id', as: 'business' });

MerchantUser.hasMany(SponsorInfo, { foreignKey: 'merchant_id', as: 'sponsorInfos' });
SponsorInfo.belongsTo(MerchantUser, { foreignKey: 'merchant_id', as: 'merchant' });

MerchantUser.hasMany(DemandFavorite, { foreignKey: 'merchant_id', as: 'favorites' });
DemandFavorite.belongsTo(MerchantUser, { foreignKey: 'merchant_id', as: 'merchant' });

Activity.hasMany(DemandFavorite, { foreignKey: 'activity_id', as: 'favorites' });
DemandFavorite.belongsTo(Activity, { foreignKey: 'activity_id', as: 'activity' });

module.exports = {
  CommunityUser,
  MerchantUser,
  AdminUser,
  Activity,
  Cooperation,
  Evaluate,
  Order,
  Message,
  MemberPackage,
  SponsorInfo,
  DemandFavorite,
  TagLibrary
};
