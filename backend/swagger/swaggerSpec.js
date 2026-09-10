const swaggerJSDoc = require('swagger-jsdoc');
require('dotenv').config();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Grupo Escalante API',
      version: '1.0.0',
      description: 'Documentación de API para Links e Intranet',
    },
    servers: [
    ...(process.env.NODE_ENV === 'production'
        ? [
            {
            url: 'https://react.escalante.com.mx:2053/backend',
            description: 'Servidor en producción',
            },
        ]
        : [
            {
            url: 'https://localhost:3000/backend',
            description: 'Servidor local seguro',
            },
        ]),
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
  apis: [
    './backend/Links/routes.js',
    './backend/Intranet/routes.js',
    './backend/Auth/routes.js',
    './backend/KPI/routes.js',
  ],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;