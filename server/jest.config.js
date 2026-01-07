module.exports = {
    testEnvironment: 'node',
    coveragePathIgnorePatterns: [
        "/node_modules/"
    ],
    verbose: true,
    setupFilesAfterEnv: ['./tests/setup.js'] // We will create this
};
