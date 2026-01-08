const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');
const Accommodation = require('../models/Accommodation');
const { seedRoles } = require('../utils/seeders');

const checkAndSeed = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const count = await Accommodation.count();
        console.log(`Current Accommodation Count: ${count}`);

        if (count > 0) {
            const first = await Accommodation.findOne();
            console.log('First Accommodation Rooms:', JSON.stringify(first.rooms, null, 2));

            if (!first.rooms || first.rooms.length === 0) {
                console.log('Data exists but "rooms" is empty. Clearing and Re-seeding required for new features.');

                // Delete dependencies first
                const Booking = require('../models/Booking');
                const Review = require('../models/Review');

                await Booking.destroy({ where: {} });
                await Review.destroy({ where: {} });
                await Accommodation.destroy({ where: {} }); // Regular destroy, not truncate

                console.log('Cleared existing accommodations and related data.');
                await seedRoles(); // Re-seed
                console.log('Re-seeded successfully.');
            } else {
                console.log('Data seems up-to-date with rooms.');
            }
        } else {
            console.log('Details: No data found. Seeding now...');
            await seedRoles();
            console.log('Seeded successfully.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
};

checkAndSeed();
