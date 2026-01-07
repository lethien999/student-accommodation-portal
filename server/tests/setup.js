require('dotenv').config(); // Load env vars

// Mock Sequelize to prevent real connection during simplistic tests
// If we need real DB later, we remove this mock
jest.mock('../config/database', () => {
    const Sequelize = require('sequelize');
    return {
        sequelize: {
            authenticate: jest.fn(),
            sync: jest.fn(),
            close: jest.fn()
        },
        Sequelize
    };
});

// We can keep beforeAll and afterAll empty if we mock DB
beforeAll(async () => {
});

afterAll(async () => {
});
