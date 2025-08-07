const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Student Accommodation Portal API',
      version: '1.0.0',
      description:
        'API documentation for the Student Accommodation Portal application. This API provides endpoints for managing users, accommodations, reviews, payments, advertisements, and more.',
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT Bearer token **_only_**',
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: [
    './routes/v1/*.js',
    './models/*.js',
    './controllers/*.js',
  ], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = specs;