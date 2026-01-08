const sequelize = require('../config/database');
const User = require('../models/User');
const Accommodation = require('../models/Accommodation');
const Review = require('../models/Review');
const SavedAccommodation = require('../models/SavedAccommodation');
const VerificationReport = require('../models/VerificationReport');

const seedMissingData = async () => {
    try {
        await sequelize.authenticate();
        console.log('✓ Database connected');

        // Get existing users and accommodations
        const users = await User.findAll();
        const accommodations = await Accommodation.findAll();

        if (users.length < 2 || accommodations.length < 1) {
            console.log('⚠ Not enough users or accommodations. Please run main seeder first.');
            process.exit(1);
        }

        const student1 = users.find(u => u.email.includes('student')) || users[0];
        const student2 = users[users.length - 1];
        const sale = users.find(u => u.email.includes('sale')) || users[0];
        const admin = users.find(u => u.email.includes('admin')) || users[0];
        const acc1 = accommodations[0];
        const acc2 = accommodations[1] || accommodations[0];

        // 1. Seed Reviews
        const reviewCount = await Review.count();
        if (reviewCount === 0) {
            console.log('Adding Reviews...');
            await Review.bulkCreate([
                { userId: student1.id, accommodationId: acc1.id, rating: 5, comment: 'Phòng rất đẹp và sạch sẽ! Chủ nhà thân thiện.' },
                { userId: student2.id, accommodationId: acc1.id, rating: 4, comment: 'Vị trí thuận tiện, giá hợp lý. Recommend!' },
                { userId: student1.id, accommodationId: acc2.id, rating: 3, comment: 'Phòng ổn nhưng hơi xa trường.' }
            ]);
            console.log('✓ Added 3 reviews');
        } else {
            console.log('✓ Reviews already exist');
        }

        // 2. Seed SavedAccommodations
        const savedCount = await SavedAccommodation.count();
        if (savedCount === 0) {
            console.log('Adding Saved Accommodations...');
            await SavedAccommodation.bulkCreate([
                { userId: student1.id, accommodationId: acc2.id },
                { userId: student2.id, accommodationId: acc1.id }
            ]);
            console.log('✓ Added 2 saved items');
        } else {
            console.log('✓ Saved accommodations already exist');
        }

        // 3. Seed VerificationReports
        const reportCount = await VerificationReport.count();
        if (reportCount === 0) {
            console.log('Adding Verification Reports...');
            await VerificationReport.bulkCreate([
                {
                    accommodationId: acc1.id,
                    staffId: sale.id,
                    criteria: {
                        realImages: true,
                        safeLocation: true,
                        correctPrice: true,
                        amenitiesMatch: true
                    },
                    comment: 'Đã kiểm tra thực tế. Mọi thông tin chính xác.',
                    status: 'approved',
                    adminId: admin.id,
                    adminComment: 'Duyệt tin.'
                },
                {
                    accommodationId: acc2.id,
                    staffId: sale.id,
                    criteria: {
                        realImages: true,
                        safeLocation: true,
                        correctPrice: false,
                        amenitiesMatch: true
                    },
                    comment: 'Giá thực tế cao hơn đăng trên web.',
                    status: 'pending'
                }
            ]);
            console.log('✓ Added 2 verification reports');
        } else {
            console.log('✓ Verification reports already exist');
        }

        console.log('\n✅ SEEDING COMPLETED SUCCESSFULLY!');
        console.log('Summary:');
        console.log('- Reviews:', await Review.count());
        console.log('- Saved:', await SavedAccommodation.count());
        console.log('- Reports:', await VerificationReport.count());

        process.exit(0);

    } catch (error) {
        console.error('❌ SEEDING ERROR:', error.message);
        console.error(error);
        process.exit(1);
    }
};

seedMissingData();
