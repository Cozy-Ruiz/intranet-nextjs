// backend/Links/routes.js
const express = require('express');
const router = express.Router();
const { status } = require('./controllers/statusController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * /Links/status:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Status del servicio Links
 *     description: Obtiene el estado del servicio Links.
 *     tags:
 *       - Links
 *     responses:
 *       200:
 *         description: Estado del servicio Links.
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Token inválido
 */
router.get('/status', auth, status);

module.exports = router;