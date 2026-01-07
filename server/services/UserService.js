const User = require('../models/User');
const Role = require('../models/Role'); // Import Role
const AppError = require('../utils/AppError');
const jwt = require('jsonwebtoken');

class UserService {
    constructor() {
        this.User = User;
        this.Role = Role; // DIish
    }

    // Generate JWT
    _signToken(id) {
        return jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });
    }

    async register(userData) {
        const { username, email, password, role } = userData;

        // Check if user exists
        const userExists = await this.User.findOne({
            where: sequelize.or({ email }, { username })
        });

        if (userExists) {
            throw AppError.badRequest('User already exists');
        }

        // Assign Role
        let roleId;
        const roleName = role || 'user'; // Default to user
        const roleRecord = await this.Role.findOne({ where: { name: roleName } });

        if (roleRecord) {
            roleId = roleRecord.id;
        } else {
            // Should we create it? Better to throw error or default to user.
            // For now, if 'landlord' requested but not in DB, fallback to 'user'?
            // Or throw error.
            // Let's create default roles if missing (Self-healing? No, seeding is better)
            // Throw error if valid role not found.
            const defaultRole = await this.Role.findOne({ where: { name: 'user' } });
            if (defaultRole) roleId = defaultRole.id;
            // If even 'user' role missing, it will be null -> Error later.
        }

        const user = await this.User.create({
            username,
            email,
            password,
            roleId, // Use roleId
            fullName: userData.fullName,
            phone: userData.phone
        });

        // Valid only if roleId is set.

        // Return user with token
        const token = this._signToken(user.id);

        // Reload to get Role name for frontend
        const userWithRole = await this.User.findByPk(user.id, { include: this.Role });

        return { user: userWithRole, token };
    }

    async login(email, password) {
        const user = await this.User.findOne({
            where: { email },
            include: this.Role
        });

        if (!user || !(await user.comparePassword(password))) {
            throw AppError.unauthorized('Invalid credentials');
        }

        const token = this._signToken(user.id);

        return { user, token };
    }

    async getProfile(userId) {
        const user = await this.User.findByPk(userId, {
            include: this.Role,
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            throw AppError.notFound('User not found');
        }

        return user;
    }

    async updateProfile(userId, updateData) {
        const user = await this.User.findByPk(userId);

        if (!user) {
            throw AppError.notFound('User not found');
        }

        // Avoid updating sensitive fields like password/role via this method
        // Remove role/roleId/password from updateData
        const { password, role, roleId, ...filteredData } = updateData;

        await user.update(filteredData);

        // Reload with Role
        return await this.User.findByPk(userId, { include: this.Role });
    }

    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.User.findByPk(userId);

        if (!(await user.comparePassword(currentPassword))) {
            throw AppError.badRequest('Invalid current password');
        }

        user.password = newPassword;
        await user.save();

        return { message: 'Password updated successfully' };
    }
}

const sequelize = require('../config/database'); // Needed for Op/Or check in register
module.exports = new UserService();
