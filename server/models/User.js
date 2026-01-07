const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');
const Role = require('./Role');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50],
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 255],
      notEmpty: true
    }
  },
  roleId: {
    type: DataTypes.INTEGER,
    references: {
      model: Role,
      key: 'id'
    },
    allowNull: true // Allow null initially for migration
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [10, 15]
    }
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 100]
    }
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Associations
Role.hasMany(User, { foreignKey: 'roleId' });
User.belongsTo(Role, { foreignKey: 'roleId' });

// Instance method to compare password
User.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to return user without password
User.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  delete values.password;
  // Flattern role name for frontend compatibility if populated
  if (values.Role) {
    values.role = values.Role.name;
    // delete values.Role; // Keep it or remove? Maybe keep for detailed info
  }
  return values;
};

module.exports = User;
