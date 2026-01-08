const sequelize = require('../config/database');
const User = require('../models/User');
const Role = require('../models/Role');
const Accommodation = require('../models/Accommodation');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const SavedAccommodation = require('../models/SavedAccommodation');
const VerificationReport = require('../models/VerificationReport');
const bcrypt = require('bcryptjs');

const seedFullData = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');
        await sequelize.sync({ alter: true }); // Ensure schema is up to date

        // 1. Ensure Roles & Users
        console.log('Seeding Users...');
        try {
            const roles = ['admin', 'landlord', 'student', 'sale'];
            const roleMap = {};

            for (const r of roles) {
                const [role] = await Role.findOrCreate({ where: { name: r } });
                roleMap[r] = role.id;
            }
            console.log('Role Map:', roleMap);


            const usersData = [
                { username: 'admin', email: 'admin@example.com', password: 'password123', roleId: roleMap['admin'], fullName: 'System Admin' },
                { username: 'landlord1', email: 'landlord1@example.com', password: 'password123', roleId: roleMap['landlord'], fullName: 'Chu Tro A', phone: '0901234567' },
                { username: 'student1', email: 'student1@example.com', password: 'password123', roleId: roleMap['student'], fullName: 'Sinh Vien A' },
                { username: 'student2', email: 'student2@example.com', password: 'password123', roleId: roleMap['student'], fullName: 'Sinh Vien B' },
                { username: 'sale1', email: 'sale1@example.com', password: 'password123', roleId: roleMap['sale'], fullName: 'Nhan Vien Sale' }
            ];

            for (const u of usersData) {
                const existing = await User.findOne({ where: { email: u.email } });
                if (!existing) {
                    await User.create(u);
                }
            }
        } catch (err) {
            console.error('Error seeding users:', err);
        }

        // Get User IDs (Re-query to be safe)
        const landlord1 = await User.findOne({ where: { username: 'landlord1' } });
        const student1 = await User.findOne({ where: { username: 'student1' } });
        const student2 = await User.findOne({ where: { username: 'student2' } });
        const sale1 = await User.findOne({ where: { username: 'sale1' } });
        const admin = await User.findOne({ where: { username: 'admin' } });

        if (!landlord1 || !student1 || !student2 || !sale1 || !admin) {
            throw new Error('Some users were not created. Stopping.');
        }

        // 2. Ensure Accommodations
        console.log('Seeding Accommodations...');
        let accommodations = await Accommodation.findAll();
        try {
            if (accommodations.length === 0) {
                const accData = [
                    {
                        name: 'Phòng trọ cao cấp Quận 7',
                        address: '123 Nguyễn Thị Thập, Q7',
                        price: 3500000,
                        description: 'Phòng đẹp, mới xây, giờ giấc tự do.',
                        ownerId: landlord1.id,
                        verifyStatus: 'verified',
                        isVerified: true,
                        services: [
                            { name: 'Điện', price: '3.500', unit: 'đ/kWh' },
                            { name: 'Nước', price: '100.000', unit: 'đ/người' }
                        ],
                        detailInfo: {
                            general: { floor: '3', capacity: 2, area: 20 },
                            features: { hasAC: true, hasFridge: true, hasWindow: true }
                        }
                    },
                    {
                        name: 'Ký túc xá giá rẻ Bình Thạnh',
                        address: '456 Xô Viết Nghệ Tĩnh, BT',
                        price: 1500000,
                        description: 'Giường tầng, máy lạnh, bao điện nước.',
                        ownerId: landlord1.id,
                        verifyStatus: 'pending',
                        isVerified: false,
                        services: [
                            { name: 'Trọn gói', price: '0', unit: '' }
                        ],
                        detailInfo: {
                            general: { floor: '1', capacity: 8, area: 40 },
                            features: { hasAC: true, hasWashingMachine: true }
                        }
                    }
                ];
                for (const acc of accData) {
                    await Accommodation.create(acc);
                }
                accommodations = await Accommodation.findAll();
            }
        } catch (err) {
            console.error('Error seeding accommodations:', err);
        }

        const acc1 = accommodations[0];
        const acc2 = accommodations[1] || accommodations[0];

        // 3. Seed Bookings
        console.log('Seeding Bookings...');
        try {
            const bookingsData = [
                { userId: student1.id, accommodationId: acc1.id, type: 'viewing', checkInDate: new Date(), status: 'pending', note: 'Em muốn xem phòng chiều nay' },
                { userId: student2.id, accommodationId: acc1.id, type: 'viewing', checkInDate: new Date(Date.now() + 86400000), status: 'confirmed' },
            ];
            const existingBookings = await Booking.count();
            if (existingBookings === 0) {
                await Booking.bulkCreate(bookingsData);
            }
        } catch (err) {
            console.error('Error seeding bookings:', err);
        }

        // 4. Seed Reviews
        console.log('Seeding Reviews...');
        try {
            const reviewsData = [
                { userId: student1.id, accommodationId: acc1.id, rating: 5, comment: 'Phòng rất đẹp và sạch sẽ!' },
                { userId: student2.id, accommodationId: acc1.id, rating: 4, comment: 'Chủ nhà thân thiện, nhưng hơi xa trường.' }
            ];
            const existingReviews = await Review.count();
            if (existingReviews === 0) {
                await Review.bulkCreate(reviewsData);
            }
        } catch (err) {
            console.error('Error seeding reviews:', err);
        }

        // 5. Seed Favorites
        console.log('Seeding Favorites...');
        try {
            const savedData = [
                { userId: student1.id, accommodationId: acc2.id }
            ];
            const existingSaved = await SavedAccommodation.count();
            if (existingSaved === 0) {
                await SavedAccommodation.bulkCreate(savedData);
            }
        } catch (err) {
            console.error('Error seeding favorites:', err);
        }

        // 6. Seed Verification Reports
        console.log('Seeding Verification Reports...');
        try {
            const reportsData = [
                {
                    accommodationId: acc2.id,
                    staffId: sale1.id,
                    criteria: { realImages: true, safeLocation: true, correctPrice: true, amenitiesMatch: false },
                    comment: 'Nhà đẹp nhưng giá hơi cao so với web.',
                    status: 'pending'
                },
                {
                    accommodationId: acc1.id,
                    staffId: sale1.id,
                    criteria: { realImages: true, safeLocation: true, correctPrice: true, amenitiesMatch: true },
                    comment: 'Đã kiểm tra, mọi thứ tốt.',
                    status: 'approved',
                    adminId: admin.id,
                    adminComment: 'Duyệt.'
                }
            ];
            const existingReports = await VerificationReport.count();
            if (existingReports === 0) {
                await VerificationReport.bulkCreate(reportsData);
            }
        } catch (err) {
            console.error('Error seeding reports:', err);
        }

        console.log('✅ SEEDING COMPLETED SUCCESSFULLY!');
        process.exit(0);

    } catch (error) {
        console.error('❌ SEEDING FATAL ERROR:', error);
        process.exit(1);
    }
};

seedFullData();
