const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const next = require('next');
const { parse } = require('url');
const express = require('express');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./backend/swagger/swaggerSpec');

require('dotenv').config();

const port = Number(process.env.PORT || 3000);
const sslKeyFile = process.env.SSL_KEY_FILE;
const sslCertificateFile = process.env.SSL_CRT_FILE;
const sslEnabled = Boolean(sslKeyFile && sslCertificateFile);

const httpsOptions = sslEnabled
  ? {
      key: fs.readFileSync(path.resolve(__dirname, sslKeyFile)),
      cert: fs.readFileSync(path.resolve(__dirname, sslCertificateFile)),
    }
  : null;

// Inicializa Next.js
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev: dev });
const handle = nextApp.getRequestHandler();

// Inicializa Express
const expressApp = express();

// 🛠️ Solo aplica body parser a rutas que empiezan con /backend
expressApp.use('/backend', express.json());

// 👉 Importa tus routers separados
const linksRoutes = require('./backend/Links/routes');
const intranetRoutes = require('./backend/Intranet/routes');
const authRoutes = require('./backend/Auth/routes');
const kpiRoutes = require('./backend/KPI/routes');

// 👉 Monta cada uno bajo su propio prefijo
expressApp.use('/backend/Links', linksRoutes);
expressApp.use('/backend/Intranet', intranetRoutes);
expressApp.use('/backend/auth', authRoutes);
expressApp.use('/backend/kpi', kpiRoutes);
//expressApp.use('/backend/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Middleware para validar token antes de mostrar swagger
expressApp.get('/backend/api-docs', (req, res, next) => {
  const token = req.query.token;

  if (!token) {
    // 🔁 Redirige al login de Next.js si no hay token
    return res.redirect('/Sistemas/Swagger/login-swagger');
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET || 'clave-secreta');
    // ✅ Token válido, continúa a Next.js
    return next(); // Deja que Next.js maneje la ruta /api-docs
  } catch (err) {
    // ❌ Token inválido o expirado
    return res.redirect('/Sistemas/Swagger/login-swagger');
  }
});

expressApp.get('/backend/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Middleware para manejar todo lo demás con Next.js
expressApp.use((req, res, next) => {
  // 👉 Rutas del backend que solo maneja Express
  if (req.url.startsWith('/backend')) return next();

  // 👉 Todo lo demás (vistas, páginas, static, etc.)
  const parsedUrl = parse(req.url, true);
  return handle(req, res, parsedUrl);
});

// Ejecuta HTTP en contenedores; HTTPS queda disponible cuando se configuran certificados.
nextApp.prepare().then(() => {
  const server = httpsOptions
    ? https.createServer(httpsOptions, expressApp)
    : http.createServer(expressApp);

  server.listen(port, () => {
    const protocol = sslEnabled ? 'https' : 'http';
    console.log(`Sistema completo corriendo en: ${protocol}://localhost:${port}`);
  });
}).catch((error) => {
  console.error('No se pudo iniciar Next.js:', error);
  process.exit(1);
});