const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

/**
 * UserService - Xử lý logic liên quan đến User
 * Tuân thủ SRP: Chỉ chứa business logic của User
 * Tuân thủ DIP: Inject dependencies (User model)
 */
class UserService {
    constructor(userModel) {
        this.userModel = userModel;
    }

    // Helper: Generate JWT Token
    _generateToken(id) {
        return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key-change-in-production', {
            expiresIn: process.env.JWT_EXPIRE || '30d'
        });
    }

    /**
     * Đăng ký user mới
     * @param {Object} userData 
     */
    async register(userData) {
        // Check duplicates
        const existingUser = await this.userModel.findOne({
            where: {
                [Op.or]: [
                    { email: userData.email },
                    { username: userData.username }
                ]
            }
        });

        if (existingUser) {
            if (existingUser.email === userData.email) {
                throw AppError.conflict('Email này đã được sử dụng');
            }
            throw AppError.conflict('Tên đăng nhập này đã được sử dụng');
        }

        // Create user
        const user = await this.userModel.create(userData);
        const token = this._generateToken(user.id);

        return { user, token };
    }

    /**
     * Đăng nhập
     * @param {String} email 
     * @param {String} password 
     */
    async login(email, password) {
        // Check email
        const user = await this.userModel.findOne({ where: { email } });
        if (!user) {
            throw AppError.unauthorized('Email hoặc mật khẩu không đúng');
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw AppError.unauthorized('Email hoặc mật khẩu không đúng');
        }

        const token = this._generateToken(user.id);
        return { user, token };
    }

    /**
     * Lấy profile user theo ID
     * @param {Number} userId 
     */
    async getProfile(userId) {
        const user = await this.userModel.findByPk(userId);
        if (!user) {
            throw AppError.notFound('Không tìm thấy người dùng');
        }
        return user;
    }

    /**
     * Cập nhật thông tin user
     * @param {Number} userId 
     * @param {Object} updateData 
     */
    async updateProfile(userId, updateData) {
        const user = await this.userModel.findByPk(userId);
        if (!user) {
            throw AppError.notFound('Không tìm thấy người dùng');
        }

        // Prevent password update via this method
        if (updateData.password) {
            delete updateData.password;
        }

        await user.update(updateData);
        return user;
    }

    /**
     * Đổi mật khẩu
     * @param {Number} userId 
     * @param {String} currentPassword 
     * @param {String} newPassword 
     */
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.userModel.findByPk(userId);
        if (!user) {
            throw AppError.notFound('Không tìm thấy người dùng');
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            throw AppError.badRequest('Mật khẩu hiện tại không đúng');
        }

        user.password = newPassword;
        await user.save(); // Hook will hash password

        // Optional: Return new token if needed, or just success
        return { message: 'Đổi mật khẩu thành công' };
    }
}

// Export singleton instance with dependency injected
module.exports = new UserService(User);
