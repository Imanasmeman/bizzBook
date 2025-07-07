// config/swaggerConfig.js
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BizzBook API',
      version: '1.0.0',
      description: 'BizzBook Swagger API Docs',
    },
    servers: [
      {
        url: 'http://localhost:3000', // or your server URL
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./routes/*.js'], // Ensure this path is correct
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
