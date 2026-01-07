const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Student Accommodation Portal API',
            version: '1.0.0',
            description: 'API documentation for Student Accommodation Portal',
        },
        servers: [
            {
                url: 'http://localhost:5000/api',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./routes/*.js'], // Scan routes folder
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
