const Role = require('../models/Role');
const User = require('../models/User');
const { logger } = require('./logger');

const seedRoles = async () => {
    try {
        const roles = ['admin', 'user', 'landlord', 'sale'];

        // 1. Seed Roles
        const roleMap = {};
        for (const roleName of roles) {
            const [role, created] = await Role.findOrCreate({
                where: { name: roleName },
                defaults: { description: `Role for ${roleName}` }
            });
            roleMap[roleName] = role.id;
            if (created) logger.info(`Role created: ${roleName}`);
        }

        // 2. Seed Users (Optional - for Dev/Demo)
        if (process.env.NODE_ENV === 'development') {
            const defaultUsers = [
                { username: 'admin', email: 'admin@portal.com', role: 'admin', fullName: 'System Admin' },
                { username: 'landlord', email: 'landlord@portal.com', role: 'landlord', fullName: 'Mr. Landlord' },
                { username: 'sale', email: 'sale@portal.com', role: 'sale', fullName: 'Sales Staff' },
                { username: 'student', email: 'student@portal.com', role: 'user', fullName: 'Student User' },
            ];

            for (const u of defaultUsers) {
                const existing = await User.findOne({ where: { email: u.email } });
                if (!existing) {
                    await User.create({
                        username: u.username,
                        email: u.email,
                        password: 'password123', // Will be hashed by hook
                        roleId: roleMap[u.role],
                        fullName: u.fullName,
                        phone: '0123456789'
                    });
                    logger.info(`User created: ${u.username} (password123)`);
                }
            }
        }

    } catch (error) {
        logger.error('Error seeding roles/users:', error);
    }
};

module.exports = { seedRoles };
