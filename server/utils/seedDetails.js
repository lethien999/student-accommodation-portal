const sequelize = require('../config/database');
const Accommodation = require('../models/Accommodation');

const seedDetails = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Sync schema to ensure columns exist
        await sequelize.sync({ alter: true });
        console.log('Database synced.');

        // Update all accommodations with sample data
        await Accommodation.update({
            services: [
                { name: 'Điện', price: '4.000', unit: 'đ/kWh' },
                { name: 'Nước', price: '100.000', unit: 'đ/người' },
                { name: 'Wifi', price: '50.000', unit: 'đ/phòng' },
                { name: 'Vệ sinh', price: '30.000', unit: 'đ/người' },
                { name: 'Gửi xe', price: 'Miễn phí', unit: '' }
            ],
            detailInfo: {
                general: {
                    floor: 'Tầng 2',
                    capacity: '3 người',
                    bikeLimit: '2 xe',
                    area: '25m2',
                    bathroom: 'Khép kín'
                },
                features: {
                    hasWindow: true,
                    hasAC: true,
                    hasFridge: false,
                    hasLoft: true,
                    hasBed: false,
                    hasWardrobe: false,
                    hasWashingMachine: true,
                    isOwnerLive: false,
                    allowPet: false
                }
            }
        }, {
            where: {} // Apply to ALL
        });

        console.log('Successfully updated accommodations with detailed specs!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding details:', error);
        process.exit(1);
    }
};

seedDetails();
