const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const tokenStore = require('./tokenStore');
const db = require('../config/db').mysqlPool;
//const bcrypt = require('bcrypt'); // si vas a encriptar

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión y obtener token JWT
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: 1234
 *     responses:
 *       200:
 *         description: Token generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM perfiles.usuarios WHERE xt_usuario = ?', [username]);
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    const user = rows[0];

    // Si las contraseñas están en texto plano (NO recomendado)
    const passwordValida = user.xt_password === password;

    // Si usas bcrypt (más seguro):
    // const passwordValida = await bcrypt.compare(password, user.password);

    if (!passwordValida) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const accessToken = jwt.sign({ username }, process.env.JWT_SECRET || 'clave-secreta', {
      expiresIn: '15m',
    });

    const refreshToken = jwt.sign({ username }, process.env.JWT_SECRET || 'clave-secreta', {
      expiresIn: '7d',
    });

    tokenStore.addToken(refreshToken);

    res.json({ token: accessToken, refreshToken });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});


/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Renovar token de acceso con un refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Nuevo token de acceso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Token de actualización inválido o expirado
 */
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!tokenStore.isValid(refreshToken)) {
    return res.status(401).json({ message: 'Refresh token no válido o revocado' });
  }

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token requerido' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'clave-secreta');

    const newToken = jwt.sign(
      { username: decoded.username },
      process.env.JWT_SECRET || 'clave-secreta',
      { expiresIn: '15m' }
    );

    res.json({ token: newToken });
  } catch (err) {
    return res.status(401).json({ message: 'Refresh token inválido o expirado' });
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión e invalidar refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sesión cerrada correctamente
 *       400:
 *         description: Token no proporcionado
 */
router.post('/logout', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token requerido' });
  }

  tokenStore.removeToken(refreshToken);
  res.json({ message: 'Sesión cerrada correctamente' });
});

module.exports = router;
