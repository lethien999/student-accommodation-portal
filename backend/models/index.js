const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const User = require('./User')(sequelize, DataTypes);
const Accommodation = require('./Accommodation')(sequelize, DataTypes);
const Review = require('./Review')(sequelize, DataTypes);
const Message = require('./Message')(sequelize, DataTypes);
const Favorite = require('./Favorite')(sequelize, DataTypes);
const Role = require('./Role')(sequelize, DataTypes);
const Permission = require('./Permission')(sequelize, DataTypes);
const RolePermission = require('./RolePermission')(sequelize, DataTypes);
const Advertisement = require('./Advertisement')(sequelize, DataTypes);
const Report = require('./Report')(sequelize, DataTypes);
const News = require('./News')(sequelize, DataTypes);
const NewsCategory = require('./NewsCategory')(sequelize, DataTypes);
const NewsComment = require('./NewsComment')(sequelize, DataTypes);
const StaticPage = require('./StaticPage')(sequelize, DataTypes);
const FAQ = require('./FAQ')(sequelize, DataTypes);
const AdvertisementStats = require('./AdvertisementStats')(sequelize, DataTypes);
const Payment = require('./Payment')(sequelize, DataTypes);
const Invoice = require('./Invoice')(sequelize, DataTypes);
const AdvertisementPosition = require('./AdvertisementPosition')(sequelize, DataTypes);

// New models for role and permission management
const UserActivityLog = require('./UserActivityLog')(sequelize, DataTypes);
const UserPreference = require('./UserPreference')(sequelize, DataTypes);
const UserGroup = require('./UserGroup')(sequelize, DataTypes);
const UserGroupMember = require('./UserGroupMember')(sequelize, DataTypes);
const GroupRole = require('./GroupRole')(sequelize, DataTypes);

// New models for contract, amenity, price history management
const RentalContract = require('./RentalContract')(sequelize, DataTypes);
const Amenity = require('./Amenity')(sequelize, DataTypes);
const AccommodationAmenity = require('./AccommodationAmenity')(sequelize, DataTypes);
const AccommodationPriceHistory = require('./AccommodationPriceHistory')(sequelize, DataTypes);

// Property model for multi-property management
const Property = require('./Property')(sequelize, DataTypes);

// New models for notification and chatbot management
const Notification = require('./Notification');
const NotificationTemplate = require('./NotificationTemplate');
const ChatbotTrainingData = require('./ChatbotTrainingData');
const NotificationSubscription = require('./NotificationSubscription')(sequelize, DataTypes);

// New model for recommendation feedback
const RecommendationFeedback = require('./RecommendationFeedback')(sequelize, DataTypes);

// User Associations
User.hasMany(Accommodation, { foreignKey: 'ownerId', as: 'accommodations', onDelete: 'CASCADE' });
Accommodation.belongsTo(User, { foreignKey: 'ownerId', as: 'accommodationOwner', onDelete: 'CASCADE' });

User.hasMany(Review, { foreignKey: 'userId', as: 'reviews', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'reviewUser', onDelete: 'CASCADE' });

User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages', onDelete: 'CASCADE' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender', onDelete: 'CASCADE' });

User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages', onDelete: 'CASCADE' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver', onDelete: 'CASCADE' });

User.hasMany(Favorite, { foreignKey: 'userId', as: 'favorites', onDelete: 'CASCADE' });
Favorite.belongsTo(User, { foreignKey: 'userId', as: 'favoriteUser', onDelete: 'CASCADE' });

User.hasMany(Advertisement, { foreignKey: 'userId', as: 'createdAdvertisements', onDelete: 'CASCADE' });

// News Associations
User.hasMany(News, { foreignKey: 'authorId', as: 'newsArticles', onDelete: 'CASCADE' });
News.belongsTo(User, { foreignKey: 'authorId', as: 'author', onDelete: 'CASCADE' });

User.hasMany(News, { foreignKey: 'approvedBy', as: 'approvedNews', onDelete: 'SET NULL' });
News.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver', onDelete: 'SET NULL' });

User.hasMany(NewsComment, { foreignKey: 'authorId', as: 'newsComments', onDelete: 'CASCADE' });
NewsComment.belongsTo(User, { foreignKey: 'authorId', as: 'author', onDelete: 'CASCADE' });

User.hasMany(NewsComment, { foreignKey: 'approvedBy', as: 'approvedComments', onDelete: 'SET NULL' });
NewsComment.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver', onDelete: 'SET NULL' });

// Accommodation Associations
Accommodation.hasMany(Review, { foreignKey: 'accommodationId', as: 'reviews', onDelete: 'CASCADE' });
Review.belongsTo(Accommodation, { foreignKey: 'accommodationId', as: 'accommodation', onDelete: 'CASCADE' });

Accommodation.hasMany(Favorite, { foreignKey: 'accommodationId', as: 'favoritedBy', onDelete: 'CASCADE' });
Favorite.belongsTo(Accommodation, { foreignKey: 'accommodationId', as: 'accommodation', onDelete: 'CASCADE' });

// News Category Associations
NewsCategory.hasMany(News, { foreignKey: 'categoryId', as: 'articles', onDelete: 'SET NULL' });
News.belongsTo(NewsCategory, { foreignKey: 'categoryId', as: 'category', onDelete: 'SET NULL' });

// Self-referencing for parent-child categories
NewsCategory.belongsTo(NewsCategory, { as: 'parent', foreignKey: 'parentId' });
NewsCategory.hasMany(NewsCategory, { as: 'children', foreignKey: 'parentId' });

// News Comment Associations
News.hasMany(NewsComment, { foreignKey: 'newsId', as: 'comments', onDelete: 'CASCADE' });
NewsComment.belongsTo(News, { foreignKey: 'newsId', as: 'news', onDelete: 'CASCADE' });

// Self-referencing for nested comments
NewsComment.belongsTo(NewsComment, { as: 'parent', foreignKey: 'parentId' });
NewsComment.hasMany(NewsComment, { as: 'replies', foreignKey: 'parentId' });

// Role and Permission Associations
Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'roleId', as: 'permissions' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permissionId', as: 'roles' });

User.belongsToMany(Role, { through: 'UserRoles', foreignKey: 'userId', as: 'roles' });
Role.belongsToMany(User, { through: 'UserRoles', foreignKey: 'roleId', as: 'users' });

// Report Associations
Report.belongsTo(User, { as: 'reporter', foreignKey: 'reporterId' });
User.hasMany(Report, { foreignKey: 'reporterId' });
Report.belongsTo(User, { as: 'resolvedBy', foreignKey: 'resolvedById' });
// Polymorphic association for reportedItem
Report.belongsTo(Accommodation, { foreignKey: 'reportedItemId', constraints: false, as: 'Accommodation' });
Report.belongsTo(Review, { foreignKey: 'reportedItemId', constraints: false, as: 'Review' });

// Advertisement Associations
Advertisement.belongsTo(User, { as: 'adCreator', foreignKey: 'userId' });
Advertisement.belongsTo(User, { as: 'adApprover', foreignKey: 'approvedBy' });

// AdvertisementStats Associations
AdvertisementStats.belongsTo(Advertisement, { foreignKey: 'advertisementId', onDelete: 'CASCADE' });

// User Activity Log Associations
User.hasMany(UserActivityLog, { foreignKey: 'userId', as: 'activityLogs', onDelete: 'CASCADE' });
UserActivityLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User Preference Associations
User.hasMany(UserPreference, { foreignKey: 'userId', as: 'preferences', onDelete: 'CASCADE' });
UserPreference.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User Group Associations
User.belongsToMany(UserGroup, { through: UserGroupMember, foreignKey: 'userId', as: 'groups' });
UserGroup.belongsToMany(User, { through: UserGroupMember, foreignKey: 'groupId', as: 'members' });

// Group Role Associations
UserGroup.belongsToMany(Role, { through: GroupRole, foreignKey: 'groupId', as: 'roles' });
Role.belongsToMany(UserGroup, { through: GroupRole, foreignKey: 'roleId', as: 'groups' });

// Rental Contract Associations
RentalContract.belongsTo(Accommodation, { foreignKey: 'accommodationId', as: 'accommodation' });
Accommodation.hasMany(RentalContract, { foreignKey: 'accommodationId', as: 'rentalContracts' });

RentalContract.belongsTo(User, { foreignKey: 'tenantId', as: 'tenant' });
User.hasMany(RentalContract, { foreignKey: 'tenantId', as: 'tenantContracts' });

RentalContract.belongsTo(User, { foreignKey: 'landlordId', as: 'landlord' });
User.hasMany(RentalContract, { foreignKey: 'landlordId', as: 'landlordContracts' });

// Amenity Associations
Amenity.belongsToMany(Accommodation, { through: AccommodationAmenity, foreignKey: 'amenityId', as: 'accommodations' });
Accommodation.belongsToMany(Amenity, { through: AccommodationAmenity, foreignKey: 'accommodationId', as: 'amenityList' });

// Price History Associations
AccommodationPriceHistory.belongsTo(Accommodation, { foreignKey: 'accommodationId', as: 'accommodation' });
Accommodation.hasMany(AccommodationPriceHistory, { foreignKey: 'accommodationId', as: 'priceHistory' });

AccommodationPriceHistory.belongsTo(User, { foreignKey: 'changedBy', as: 'changedByUser' });
User.hasMany(AccommodationPriceHistory, { foreignKey: 'changedBy', as: 'priceChanges' });

// Property Associations
Property.belongsTo(User, { foreignKey: 'landlordId', as: 'landlord' });
User.hasMany(Property, { foreignKey: 'landlordId', as: 'properties' });
Property.hasMany(Accommodation, { foreignKey: 'propertyId', as: 'accommodations' });
Accommodation.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });

// Notification Associations
Notification.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
User.hasMany(Notification, { foreignKey: 'createdBy', as: 'createdNotifications' });

// Notification Subscription Associations
User.hasMany(NotificationSubscription, { foreignKey: 'userId', as: 'notificationSubscriptions', onDelete: 'CASCADE' });
NotificationSubscription.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  User,
  Accommodation,
  Review,
  Message,
  Favorite,
  Role,
  Permission,
  RolePermission,
  Advertisement,
  Report,
  News,
  NewsCategory,
  NewsComment,
  StaticPage,
  FAQ,
  AdvertisementStats,
  Payment,
  Invoice,
  AdvertisementPosition,
  UserActivityLog,
  UserPreference,
  UserGroup,
  UserGroupMember,
  GroupRole,
  RentalContract,
  Amenity,
  AccommodationAmenity,
  AccommodationPriceHistory,
  Notification,
  NotificationTemplate,
  ChatbotTrainingData,
  RecommendationFeedback,
  NotificationSubscription,
  Property
}; 