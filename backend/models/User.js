const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // 2FA fields
    twoFactorEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    twoFactorSecret: {
      type: DataTypes.STRING,
      allowNull: true
    },
    twoFactorMethod: {
      type: DataTypes.ENUM('authenticator', 'sms', 'email'),
      allowNull: true
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('admin', 'landlord', 'tenant', 'moderator'),
      defaultValue: 'tenant',
    },
    isVerifiedLandlord: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verificationRequest: {
      type: DataTypes.JSON, // To store status, documents, etc.
      allowNull: true,
      defaultValue: null,
    },
    // OAuth fields
    oauthProvider: {
      type: DataTypes.ENUM('google', 'facebook', null),
      allowNull: true
    },
    oauthId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Refresh token
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    refreshTokenExpires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Login attempts tracking
    loginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lockUntil: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isLocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    loyaltyPointsBalance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'users',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    },
    timestamps: true,
  });

  User.prototype.validatePassword = async function(password) {
    return bcrypt.compare(password, this.password);
  };

  // Instance method to check if account is locked
  User.prototype.isAccountLocked = function() {
    return this.lockUntil && this.lockUntil > new Date();
  };

  // Instance method to increment login attempts
  User.prototype.incrementLoginAttempts = async function() {
    if (this.lockUntil && this.lockUntil < new Date()) {
      return await this.update({
        $set: { loginAttempts: 1 },
        $unset: { lockUntil: 1 }
      });
    }
    const updates = { $inc: { loginAttempts: 1 } };
    if (this.loginAttempts + 1 >= 5) {
      updates.$set = {
        lockUntil: new Date(Date.now() + 2 * 60 * 60 * 1000) // Lock for 2 hours
      };
    }
    return await this.update(updates);
  };

  // Instance method to check if user has a specific role
  User.prototype.hasRole = async function(roleName) {
    const roles = await this.getRoles();
    return roles.some(role => role.name === roleName);
  };

  // Instance method to check if user has a specific permission
  User.prototype.hasPermission = async function(permissionName) {
    if (!this.role) {
      return false;
    }

    // Lazy load Role and Permission models to avoid circular dependency
    const Role = sequelize.models.Role;
    const Permission = sequelize.models.Permission;

    try {
      const userRole = await Role.findOne({
        where: { name: this.role },
        include: {
          model: Permission,
          as: 'permissions',
          attributes: ['name'],
        },
      });

      if (!userRole || !userRole.permissions) {
        return false;
      }
      
      return userRole.permissions.some(permission => permission.name === permissionName);

    } catch (error) {
      console.error('Error in hasPermission:', error);
      return false;
    }
  };

  User.associate = function(models) {
    // Reviews written by this user
    User.hasMany(models.Review, { foreignKey: 'userId', as: 'reviews' });
    // Reviews received by this user (as a landlord)
    User.hasMany(models.Review, { foreignKey: 'landlordId', as: 'reviewsReceived' });
    
    User.hasMany(models.Payment, { foreignKey: 'userId', as: 'payments' });
    User.hasMany(models.Accommodation, { foreignKey: 'landlordId', as: 'properties' });
    User.hasMany(models.Favorite, { foreignKey: 'userId', as: 'favorites' });
    User.hasMany(models.Report, { foreignKey: 'reporterId', as: 'reportsMade' });
    User.hasMany(models.Report, { foreignKey: 'reportedUserId', as: 'reportsReceived' });
    User.hasMany(models.LoyaltyPoint, { foreignKey: 'userId', as: 'loyaltyPoints' });
    User.hasOne(models.LandlordReputation, { foreignKey: 'userId', as: 'reputation' });
    
    // Maintenance requests submitted by the user (as a tenant)
    User.hasMany(models.MaintenanceRequest, { foreignKey: 'tenantId', as: 'submittedMaintenanceRequests' });
    // Maintenance requests received by the user (as a landlord)
    User.hasMany(models.MaintenanceRequest, { foreignKey: 'landlordId', as: 'receivedMaintenanceRequests' });
  };

  return User;
}; 