const request = require('supertest');
const express = require('express');
const dashboardRoutes = require('../../routes/dashboardRoutes');
const dashboardController = require('../../controllers/dashboardController');
const auth = require('../../middleware/auth');

// Mock auth middleware to bypass real JWT checks
jest.mock('../../middleware/auth', () => ({
    protect: (req, res, next) => {
        req.user = { id: 1, role: 'admin', Role: { name: 'admin' } }; // Mock user
        next();
    },
    authorize: (role) => (req, res, next) => next(), // Bypass role check
    admin: (req, res, next) => next(),
    landlord: (req, res, next) => next(),
    landlordOrAdmin: (req, res, next) => next()
}));

// Mock DashboardService
jest.mock('../../services/DashboardService', () => ({
    getAdminStats: jest.fn().mockResolvedValue({ overview: { totalUsers: 10 } }),
    getLandlordStats: jest.fn().mockResolvedValue({ overview: { totalListings: 5 } }),
    getSaleStats: jest.fn().mockResolvedValue({ overview: { totalLeads: 3 } })
}));

const app = express();
app.use(express.json());
app.use('/api/dashboard', dashboardRoutes);

describe('Dashboard API (AAA Pattern)', () => {

    describe('GET /api/dashboard/admin', () => {
        it('should return admin stats', async () => {
            // Arrange
            const expectedData = { overview: { totalUsers: 10 } };

            // Act
            const res = await request(app).get('/api/dashboard/admin');

            // Assert
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toEqual(expectedData);
        });
    });

    describe('GET /api/dashboard/landlord', () => {
        it('should return landlord stats', async () => {
            // Arrange
            // (Mock user already set to role, but authorize is mocked to pass anyway)

            // Act
            const res = await request(app).get('/api/dashboard/landlord');

            // Assert
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.overview.totalListings).toBe(5);
        });
    });

});
