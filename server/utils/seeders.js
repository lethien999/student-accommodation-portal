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



        // 3. Seed Accommodations (if none exist)
        const Accommodation = require('../models/Accommodation');
        const count = await Accommodation.count();
        if (count === 0) {
            const landlordUser = await User.findOne({ where: { email: 'landlord@portal.com' } });
            if (landlordUser) {
                const sampleAccoms = [
                    {
                        name: 'Luxury Apartment D7', address: '123 Nguyen Van Linh, D7, HCMC', price: 5000000, description: 'High end apartment near RMIT.', latitude: 10.729, longitude: 106.69, amenities: ['Wifi', 'AC', 'Parking'], images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=80'],
                        rooms: [{ name: 'P.101', price: 5000000, area: 30, status: 'available' }, { name: 'P.102', price: 5200000, area: 32, status: 'rented' }, { name: 'P.201', price: 5500000, area: 35, status: 'available' }]
                    },
                    {
                        name: 'Cheap Room near Back Khoa', address: '456 Ly Thuong Kiet, D10, HCMC', price: 2000000, description: 'Budget room for students.', latitude: 10.772, longitude: 106.65, amenities: ['Wifi'], images: ['https://images.unsplash.com/photo-1596276020528-4d9611e15dc0?w=500&q=80'],
                        rooms: [{ name: 'Room A', price: 2000000, area: 15, status: 'available' }, { name: 'Room B', price: 2000000, area: 15, status: 'available' }]
                    },
                    {
                        name: 'Mini House Binh Thanh', address: '789 Xoviet Nghe Tinh, Binh Thanh, HCMC', price: 3500000, description: 'Cozy mini house.', latitude: 10.80, longitude: 106.70, amenities: ['Wifi', 'Kitchen'], images: ['https://images.unsplash.com/photo-1526725702345-bdda2b97ef73?w=500&q=80'],
                        rooms: [{ name: 'F.01', price: 3500000, area: 25, status: 'available' }]
                    },
                    {
                        name: 'Studio District 1', address: '12 Bui Vien, D1, HCMC', price: 8000000, description: 'Center of the city.', latitude: 10.76, longitude: 106.69, amenities: ['Full furniture'], images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&q=80'],
                        rooms: [{ name: 'S.01', price: 8000000, area: 40, status: 'available' }, { name: 'S.02', price: 8500000, area: 45, status: 'rented' }]
                    }
                ];

                for (const acc of sampleAccoms) {
                    await Accommodation.create({
                        ...acc,
                        ownerId: landlordUser.id,
                        status: 'available'
                    });
                }
                logger.info('Seeded 4 sample accommodations.');
            }
        }

    } catch (error) {
        logger.error('Error seeding data:', error);
    }
};

module.exports = { seedRoles };
