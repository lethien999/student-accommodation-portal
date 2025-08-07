'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create users table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      verificationToken: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      resetPasswordToken: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      resetPasswordExpires: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      twoFactorEnabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      twoFactorSecret: {
        type: Sequelize.STRING,
        allowNull: true
      },
      twoFactorMethod: {
        type: Sequelize.ENUM('authenticator', 'sms', 'email'),
        allowNull: true
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: true
      },
      role: {
        type: Sequelize.ENUM('admin', 'landlord', 'tenant', 'moderator'),
        defaultValue: 'tenant',
      },
      isVerifiedLandlord: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      verificationRequest: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: null,
      },
      oauthProvider: {
        type: Sequelize.ENUM('google', 'facebook'),
        allowNull: true
      },
      oauthId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      refreshToken: {
        type: Sequelize.STRING,
        allowNull: true
      },
      refreshTokenExpires: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Create accommodations table
    await queryInterface.createTable('accommodations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false
      },
      city: {
        type: Sequelize.STRING,
        allowNull: false
      },
      state: {
        type: Sequelize.STRING,
        allowNull: false
      },
      zipCode: {
        type: Sequelize.STRING,
        allowNull: false
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true
      },
      amenities: {
        type: Sequelize.JSON,
        allowNull: true
      },
      images: {
        type: Sequelize.JSON,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('available', 'rented', 'pending'),
        defaultValue: 'available'
      },
      depositAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Required deposit amount'
      },
      depositStatus: {
        type: Sequelize.ENUM('not_required', 'pending', 'paid', 'refunded'),
        defaultValue: 'not_required'
      },
      depositDueDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      averageRating: {
        type: Sequelize.DECIMAL(2, 1),
        allowNull: false,
        defaultValue: 0.0
      },
      numberOfReviews: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      ownerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Create reviews table
    await queryInterface.createTable('reviews', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5
        }
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      images: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      accommodationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'accommodations',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Create messages table
    await queryInterface.createTable('messages', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      senderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      receiverId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Create favorites table
    await queryInterface.createTable('favorites', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      accommodationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'accommodations',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Create roles table
    await queryInterface.createTable('roles', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true
      },
      isSystem: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'System roles cannot be deleted or modified'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Create permissions table
    await queryInterface.createTable('permissions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true
      },
      module: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Module this permission belongs to (e.g., accommodation, user, review)'
      },
      action: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Action this permission allows (e.g., create, read, update, delete)'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Create role_permissions table
    await queryInterface.createTable('role_permissions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      roleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      permissionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'permissions',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });
    await queryInterface.addIndex('role_permissions', ['roleId', 'permissionId'], {
      unique: true,
      name: 'idx_role_permissions_unique'
    });

    // Create advertisements table
    await queryInterface.createTable('advertisements', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      imageUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      targetUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('active', 'paused', 'ended'),
        defaultValue: 'active'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Create reports table
    await queryInterface.createTable('reports', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      reporterId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      reportedItemId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      reportedItemType: {
        type: Sequelize.ENUM('Accommodation', 'Review'),
        allowNull: false
      },
      reason: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'reviewed', 'resolved', 'rejected'),
        defaultValue: 'pending'
      },
      resolvedById: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      resolvedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Create payments table
    await queryInterface.createTable('payments', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      accommodationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'accommodations',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'completed', 'failed', 'refunded'),
        defaultValue: 'pending'
      },
      paymentMethod: {
        type: Sequelize.ENUM('credit_card', 'bank_transfer', 'cash', 'vnpay', 'momo'),
        allowNull: false
      },
      paymentDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      dueDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      transactionId: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Create invoices table
    await queryInterface.createTable('invoices', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      paymentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'payments',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      invoiceNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      issueDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      dueDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('draft', 'issued', 'paid', 'cancelled'),
        defaultValue: 'draft'
      },
      items: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Array of items with description, quantity, unit price, and amount'
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      tax: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      pdfUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for Accommodation model
    await queryInterface.addIndex('accommodations', ['city'], {
      name: 'idx_accommodations_city'
    });
    await queryInterface.addIndex('accommodations', ['price'], {
      name: 'idx_accommodations_price'
    });
    await queryInterface.addIndex('accommodations', ['status'], {
      name: 'idx_accommodations_status'
    });
    await queryInterface.addIndex('accommodations', ['ownerId'], {
      name: 'idx_accommodations_owner'
    });
    await queryInterface.addIndex('accommodations', ['createdAt'], {
      name: 'idx_accommodations_created'
    });

    // Add indexes for Review model
    await queryInterface.addIndex('reviews', ['accommodationId'], {
      name: 'idx_reviews_accommodation'
    });
    await queryInterface.addIndex('reviews', ['userId'], {
      name: 'idx_reviews_user'
    });
    await queryInterface.addIndex('reviews', ['createdAt'], {
      name: 'idx_reviews_created'
    });

    // Add indexes for Message model
    await queryInterface.addIndex('messages', ['senderId'], {
      name: 'idx_messages_sender'
    });
    await queryInterface.addIndex('messages', ['receiverId'], {
      name: 'idx_messages_receiver'
    });
    await queryInterface.addIndex('messages', ['createdAt'], {
      name: 'idx_messages_created'
    });

    // Add indexes for Payment model
    await queryInterface.addIndex('payments', ['status'], {
      name: 'idx_payments_status'
    });
    await queryInterface.addIndex('payments', ['dueDate'], {
      name: 'idx_payments_due'
    });
    await queryInterface.addIndex('payments', ['userId'], {
      name: 'idx_payments_user'
    });

    // Add indexes for Report model
    await queryInterface.addIndex('reports', ['reporterId'], {
      name: 'idx_reports_reporter'
    });
    await queryInterface.addIndex('reports', ['reportedItemType', 'reportedItemId'], {
      name: 'idx_reports_item'
    });
    await queryInterface.addIndex('reports', ['status'], {
      name: 'idx_reports_status'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes first
    await queryInterface.removeIndex('reports', 'idx_reports_status');
    await queryInterface.removeIndex('reports', 'idx_reports_item');
    await queryInterface.removeIndex('reports', 'idx_reports_reporter');
    await queryInterface.removeIndex('payments', 'idx_payments_user');
    await queryInterface.removeIndex('payments', 'idx_payments_due');
    await queryInterface.removeIndex('payments', 'idx_payments_status');
    await queryInterface.removeIndex('messages', 'idx_messages_created');
    await queryInterface.removeIndex('messages', 'idx_messages_receiver');
    await queryInterface.removeIndex('messages', 'idx_messages_sender');
    await queryInterface.removeIndex('reviews', 'idx_reviews_created');
    await queryInterface.removeIndex('reviews', 'idx_reviews_user');
    await queryInterface.removeIndex('reviews', 'idx_reviews_accommodation');
    await queryInterface.removeIndex('accommodations', 'idx_accommodations_created');
    await queryInterface.removeIndex('accommodations', 'idx_accommodations_owner');
    await queryInterface.removeIndex('accommodations', 'idx_accommodations_status');
    await queryInterface.removeIndex('accommodations', 'idx_accommodations_price');
    await queryInterface.removeIndex('accommodations', 'idx_accommodations_city');
    await queryInterface.removeIndex('role_permissions', 'idx_role_permissions_unique');

    // Drop tables in reverse order of creation to respect foreign key constraints
    await queryInterface.dropTable('invoices');
    await queryInterface.dropTable('payments');
    await queryInterface.dropTable('reports');
    await queryInterface.dropTable('advertisements');
    await queryInterface.dropTable('role_permissions');
    await queryInterface.dropTable('permissions');
    await queryInterface.dropTable('roles');
    await queryInterface.dropTable('favorites');
    await queryInterface.dropTable('messages');
    await queryInterface.dropTable('reviews');
    await queryInterface.dropTable('accommodations');
    await queryInterface.dropTable('users');
  }
};
