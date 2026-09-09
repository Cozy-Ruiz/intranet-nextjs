// backend/Intranet/routes.js
const express = require('express');
const router = express.Router();
const { status } = require('./controllers/statusController');
const auth = require('../middleware/auth');

const upload = require('../middleware/upload');
const { altaUsuario, altaIntranet, detalleUsuario, listaUsuarios, catalogoPuestos, bajaIntranet, listaClientesExtractor, altaExtractor, bajaExtractor, usuarioClientesExtractor, registraClienteUsuario, eliminaClienteUsuario, altaReportes, bajaReportes, listaClientes } = require('./controllers/perfilesController');

/**
 * @swagger
 * /Intranet/status:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Status del servicio Intranet
 *     description: Obtiene el estado del servicio Intranet.
 *     tags:
 *       - Intranet
 *     responses:
 *       200:
 *         description: Estado del servicio Intranet.
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Token inválido
 */
router.get('/status', auth, status);

/**
 * @swagger
 * /Intranet/Perfiles/enviaCorreo:
 *   post:
 *     summary: Enviar correo a destinatarios y copias
 *     description: Envía un correo electrónico a los destinatarios y copias indicados.
 *     tags:
 *       - Perfiles
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - destinatarios
 *               - asunto
 *               - mensaje
 *             properties:
 *               destinatarios:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Correos de los destinatarios principales
 *               copias:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Correos en copia (opcional)
 *               asunto:
 *                 type: string
 *               mensaje:
 *                 type: string
 *               perfil_puesto:
 *                 type: string
 *     responses:
 *       200:
 *         description: Correo enviado correctamente.
 *       400:
 *         description: Campos faltantes.
 *       500:
 *         description: Error del servidor.
 */
router.post('/Perfiles/enviaCorreo', require('./controllers/perfilesController').enviaCorreo);

/**
 * @swagger
 * /Intranet/Perfiles/listaClientes:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Lista de clientes
 *     description: Obtiene una lista de todos los clientes registrados.
 *     tags:
 *       - Perfiles
 *     responses:
 *       200:
 *         description: Lista de clientes.
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Token inválido
 */
router.get('/Perfiles/listaClientes'/*, auth*/, listaClientes);

/**
 * @swagger
 * /Intranet/Perfiles/catalogoPuestos:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Catálogo de puestos
 *     description: Obtiene una lista de todos los puestos disponibles.
 *     tags:
 *       - Perfiles
 *     responses:
 *       200:
 *         description: Lista de puestos.
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Token inválido
 */
router.get('/Perfiles/catalogoPuestos'/*, auth*/, catalogoPuestos);

/**
 * @swagger
 * /Intranet/Perfiles/Extractor/usuarioClientesExtractor:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Clientes de un usuario
 *     description: Obtiene la lista de clientes asociados a un usuario específico.
 *     tags:
 *       - Extractor
 *     parameters:
 *       - in: query
 *         name: usuario
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de usuario del cual se desea obtener su lista de clientes
 *     responses:
 *       200:
 *         description: Lista de clientes del usuario.
 *       400:
 *         description: Parámetro usuario faltante
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Token inválido
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/Perfiles/Extractor/usuarioClientesExtractor'/*, auth*/, usuarioClientesExtractor);

/**
 * @swagger
 * /Intranet/Perfiles/Extractor/listaClientesExtractor:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Lista de clientes
 *     description: Obtiene una lista de todos los clientes registrados.
 *     tags:
 *       - Extractor
 *     responses:
 *       200:
 *         description: Lista de clientes.
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Token inválido
 */
router.get('/Perfiles/Extractor/listaClientesExtractor'/*, auth*/, listaClientesExtractor);

/**
 * @swagger
 * /Intranet/Perfiles/listaUsuarios:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Lista de usuarios
 *     description: Obtiene una lista de todos los usuarios registrados.
 *     tags:
 *       - Perfiles
 *     responses:
 *       200:
 *         description: Lista de usuarios.
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Token inválido
 */
router.get('/Perfiles/listaUsuarios'/*, auth*/, listaUsuarios);

/**
 * @swagger
 * /Intranet/Perfiles/detalleUsuario:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Detalle de un usuario
 *     description: Obtiene el detalle de un usuario específico.
 *     tags:
 *       - Perfiles
 *     parameters:
 *       - in: query
 *         name: usuario
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de usuario del cual se desea obtener el detalle
 *     responses:
 *       200:
 *         description: Detalle del usuario.
 *       400:
 *         description: Parámetro usuario faltante
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Token inválido
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/Perfiles/detalleUsuario'/*, auth*/, detalleUsuario);

/**
 * @swagger
 * /Intranet/Perfiles/registroUsuario:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     description: Crea un nuevo usuario en la base de datos.
 *     tags:
 *       - Perfiles
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellidoPaterno
 *               - apellidoMaterno
 *               - correo
 *               - categoria
 *               - rfc
 *               - curp
 *               - grupo
 *               - empresa
 *               - oficina
 *               - puesto
 *               - jefeDirecto
 *             properties:
 *               nombre:
 *                 type: string
 *               apellidoPaterno:
 *                 type: string
 *               apellidoMaterno:
 *                 type: string
 *               correo:
 *                 type: string
 *               categoria:
 *                 type: string
 *               rfc:
 *                 type: string
 *               curp:
 *                 type: string
 *               grupo:
 *                 type: string
 *               empresa:
 *                 type: string
 *               oficina:
 *                 type: string
 *               puesto:
 *                 type: string
 *               jefeDirecto:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente.
 *       400:
 *         description: Campos faltantes.
 *       409:
 *         description: Usuario ya existente.
 *       500:
 *         description: Error del servidor.
 */
router.post('/Perfiles/registroUsuario', upload.single('foto'), require('./controllers/perfilesController').registroUsuario);

/**
 * @swagger
 * /Intranet/Perfiles/modificaUsuario:
 *   put:
 *     summary: Modificar un usuario existente
 *     description: Actualiza los datos de un usuario existente. La foto es opcional.
 *     tags:
 *       - Perfiles
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *               - nombre
 *               - apellidoPaterno
 *               - apellidoMaterno
 *               - correo
 *               - categoria
 *               - oficina
 *             properties:
 *               usuario:
 *                 type: string
 *                 description: Usuario que se modificará.
 *               nombre:
 *                 type: string
 *               apellidoPaterno:
 *                 type: string
 *               apellidoMaterno:
 *                 type: string
 *               correo:
 *                 type: string
 *                 format: email
 *               categoria:
 *                 type: string
 *                 enum: [Cliente, Empleado, Proveedor]
 *               rfc:
 *                 type: string
 *               curp:
 *                 type: string
 *               grupo:
 *                 type: string
 *               empresa:
 *                 type: string
 *               oficina:
 *                 type: string
 *               puesto:
 *                 type: string
 *               jefeDirecto:
 *                 type: string
 *               usuarioModifica:
 *                 type: string
 *               foto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Usuario modificado exitosamente.
 *       400:
 *         description: Campos faltantes o inválidos.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error del servidor.
 */
router.put('/Perfiles/modificaUsuario', upload.single('foto'), require('./controllers/perfilesController').modificaUsuario);

/**
 * @swagger
 * /Intranet/Perfiles/actualizaDatosToUTF8:
 *   post:
 *     summary: Actualizar datos a UTF-8
 *     description: Actualiza los datos de los usuarios a UTF-8.
 *     tags:
 *       - Perfiles
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente.
 *       400:
 *         description: Campos faltantes.
 *       409:
 *         description: Usuario ya existente.
 *       500:
 *         description: Error del servidor.
 */
router.post('/Perfiles/actualizaDatosToUTF8', require('./controllers/perfilesController').actualizaDatosToUTF8);

/**
 * @swagger
 * /Intranet/Perfiles/altaUsuario:
 *   post:
 *     summary: Activar usuario en Perfiles
 *     description: Activa un usuario en Perfiles.
 *     tags:
 *       - Perfiles
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *             properties:
 *               usuario:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario activado exitosamente.
 *       400:
 *         description: Campos faltantes.
 *       500:
 *         description: Error del servidor.
 */
router.post('/Perfiles/altaUsuario', require('./controllers/perfilesController').altaUsuario);

/**
 * @swagger
 * /Intranet/Perfiles/bajaUsuario:
 *   post:
 *     summary: Desactivar usuario en Perfiles
 *     description: Desactiva un usuario en Perfiles.
 *     tags:
 *       - Perfiles
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *             properties:
 *               usuario:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario desactivado exitosamente.
 *       400:
 *         description: Campos faltantes.
 *       500:
 *         description: Error del servidor.
 */
router.post('/Perfiles/bajaUsuario', require('./controllers/perfilesController').bajaUsuario);

/**
 * @swagger
 * /Intranet/Perfiles/altaIntranet:
 *   post:
 *     summary: Registrar usuario a Intranet
 *     description: Registra usuario a Intranet.
 *     tags:
 *       - Intranet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *             properties:
 *               usuario:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado a Intranet exitosamente.
 *       400:
 *         description: Campos faltantes.
 *       409:
 *         description: Usuario ya existente.
 *       500:
 *         description: Error del servidor.
 */
router.post('/Perfiles/altaIntranet', altaIntranet);

/**
 * @swagger
 * /Intranet/Perfiles/altaExtractor:
 *   post:
 *     summary: Registrar usuario a Extractor
 *     description: Registra usuario a Extractor.
 *     tags:
 *       - Extractor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *             properties:
 *               usuario:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado a Extractor exitosamente.
 *       400:
 *         description: Campos faltantes.
 *       409:
 *         description: Usuario ya existente.
 *       500:
 *         description: Error del servidor.
 */
router.post('/Perfiles/altaExtractor', altaExtractor);

/**
 * @swagger
 * /Intranet/Perfiles/bajaIntranet:
 *   post:
 *     summary: Desactivar usuario en Intranet
 *     description: Desactiva un usuario en Intranet.
 *     tags:
 *       - Intranet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *             properties:
 *               usuario:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado a Intranet exitosamente.
 *       400:
 *         description: Campos faltantes.
 *       409:
 *         description: Usuario ya existente.
 *       500:
 *         description: Error del servidor.
 */
router.post('/Perfiles/bajaIntranet', bajaIntranet);

/**
 * @swagger
 * /Intranet/Perfiles/bajaExtractor:
 *   post:
 *     summary: Desactivar usuario en Extractor
 *     description: Desactiva un usuario en Extractor.
 *     tags:
 *       - Extractor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *             properties:
 *               usuario:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario dado de baja a Extractor exitosamente.
 *       400:
 *         description: Campos faltantes.
 *       409:
 *         description: Usuario ya existente.
 *       500:
 *         description: Error del servidor.
 */
router.post('/Perfiles/bajaExtractor', bajaExtractor);

/**
 * @swagger
 * /Intranet/Perfiles/Extractor/registraClienteUsuario:
 *   post:
 *     summary: Asigna un cliente a un usuario para el Extractor
 *     description: Asocia un cliente al usuario para acceso al Extractor.
 *     tags:
 *       - Extractor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *               - cliente
 *             properties:
 *               usuario:
 *                 type: string
 *               cliente:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cliente asignado exitosamente.
 *       400:
 *         description: Campos faltantes.
 *       409:
 *         description: Relación ya existente.
 *       500:
 *         description: Error del servidor.
 */
router.post('/Perfiles/Extractor/registraClienteUsuario', registraClienteUsuario);

/**
 * @swagger
 * /Intranet/Perfiles/Extractor/eliminaClienteUsuario:
 *   post:
 *     summary: Elimina un cliente de un usuario para el Extractor
 *     description: Elimina la relación de un cliente con el usuario para acceso al Extractor.
 *     tags:
 *       - Extractor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *               - cliente
 *             properties:
 *               usuario:
 *                 type: string
 *               cliente:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cliente eliminado exitosamente.
 *       400:
 *         description: Campos faltantes.
 *       404:
 *         description: Relación no encontrada.
 *       500:
 *         description: Error del servidor.
 */
router.post('/Perfiles/Extractor/eliminaClienteUsuario', eliminaClienteUsuario);

/**
 * @swagger
 * /Intranet/Perfiles/altaReportes:
 *   post:
 *     summary: Registrar usuario a Reportes
 *     description: Registra usuario a Reportes.
 *     tags:
 *       - Reportes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *             properties:
 *               usuario:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado a Reportes exitosamente.
 *       400:
 *         description: Campos faltantes.
 *       409:
 *         description: Usuario ya existente.
 *       500:
 *         description: Error del servidor.
 */
router.post('/Perfiles/altaReportes', altaReportes);

/**
 * @swagger
 * /Intranet/Perfiles/bajaReportes:
 *   post:
 *     summary: Desactivar usuario en Reportes
 *     description: Desactiva un usuario en Reportes.
 *     tags:
 *       - Reportes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *             properties:
 *               usuario:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario dado de baja a Reportes exitosamente.
 *       400:
 *         description: Campos faltantes.
 *       409:
 *         description: Usuario ya existente.
 *       500:
 *         description: Error del servidor.
 */
router.post('/Perfiles/bajaReportes', bajaReportes);

/**
 * @swagger
 * /Intranet/Perfiles/altaAuditoriaDatos:
 *   post:
 *     summary: Registrar usuario a Auditoria Datos
 *     description: Registra usuario a Auditoria Datos.
 *     tags:
 *       - Auditoria Datos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *             properties:
 *               usuario:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado a Auditoria Datos exitosamente.
 *       400:
 *         description: Campos faltantes.
 *       409:
 *         description: Usuario ya existente.
 *       500:
 *         description: Error del servidor.
 */
router.post('/Perfiles/altaAuditoriaDatos', require('./controllers/perfilesController').altaAuditoriaDatos);

/**
 * @swagger
 * /Intranet/Perfiles/bajaAuditoriaDatos:
 *   post:
 *     summary: Desactivar usuario en Auditoria Datos
 *     description: Desactiva un usuario en Auditoria Datos.
 *     tags:
 *       - Auditoria Datos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *             properties:
 *               usuario:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario dado de baja a Auditoria Datos exitosamente.
 *       400:
 *         description: Campos faltantes.
 *       409:
 *         description: Usuario ya existente.
 *       500:
 *         description: Error del servidor.
 */
router.post('/Perfiles/bajaAuditoriaDatos', require('./controllers/perfilesController').bajaAuditoriaDatos);

/**
 * @swagger
 * /Intranet/Perfiles/altaBacklog:
 *   post:
 *     summary: Registrar usuario a Backlog
 *     description: Registra usuario a Backlog.
 *     tags:
 *       - Backlog
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *             properties:
 *               usuario:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado a Backlog exitosamente.
 *       400:
 *         description: Campos faltantes.
 *       409:
 *         description: Usuario ya existente.
 *       500:
 *         description: Error del servidor.
 */
router.post('/Perfiles/altaBacklog', require('./controllers/perfilesController').altaBacklog);

/**
 * @swagger
 * /Intranet/Perfiles/bajaBacklog:
 *   post:
 *     summary: Desactivar usuario en Backlog
 *     description: Desactiva un usuario en Backlog.
 *     tags:
 *       - Backlog
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *             properties:
 *               usuario:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario dado de baja a Backlog exitosamente.
 *       400:
 *         description: Campos faltantes.
 *       409:
 *         description: Usuario ya existente.
 *       500:
 *         description: Error del servidor.
 */
router.post('/Perfiles/bajaBacklog', require('./controllers/perfilesController').bajaBacklog);

/**
 * @swagger
 * /Intranet/Perfiles/altaEstadisticas:
 *   post:
 *     summary: Registrar usuario a Estadisticas
 *     description: Registra usuario a Estadisticas.
 *     tags:
 *       - Estadisticas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *             properties:
 *               usuario:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado a Estadisticas exitosamente.
 *       400:
 *         description: Campos faltantes.
 *       409:
 *         description: Usuario ya existente.
 *       500:
 *         description: Error del servidor.
 */
router.post('/Perfiles/altaEstadisticas', require('./controllers/perfilesController').altaEstadisticas);

/**
 * @swagger
 * /Intranet/Perfiles/bajaEstadisticas:
 *   post:
 *     summary: Desactivar usuario en Estadisticas
 *     description: Desactiva un usuario en Estadisticas.
 *     tags:
 *       - Estadisticas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *             properties:
 *               usuario:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario dado de baja a Estadisticas exitosamente.
 *       400:
 *         description: Campos faltantes.
 *       409:
 *         description: Usuario ya existente.
 *       500:
 *         description: Error del servidor.
 */
router.post('/Perfiles/bajaEstadisticas', require('./controllers/perfilesController').bajaEstadisticas);

/**
 * @swagger
 * /Intranet/Perfiles/altaRadar:
 *   post:
 *     summary: Registrar usuario a Radar
 *     description: Registra usuario a Radar.
 *     tags:
 *       - Radar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *             properties:
 *               usuario:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado a Radar exitosamente.
 *       400:
 *         description: Campos faltantes.
 *       409:
 *         description: Usuario ya existente.
 *       500:
 *         description: Error del servidor.
 */
router.post('/Perfiles/altaRadar', require('./controllers/perfilesController').altaRadar);

/**
 * @swagger
 * /Intranet/Perfiles/bajaRadar:
 *   post:
 *     summary: Desactivar usuario en Radar
 *     description: Desactiva un usuario en Radar.
 *     tags:
 *       - Radar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *             properties:
 *               usuario:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario dado de baja a Radar exitosamente.
 *       400:
 *         description: Campos faltantes.
 *       409:
 *         description: Usuario ya existente.
 *       500:
 *         description: Error del servidor.
 */
router.post('/Perfiles/bajaRadar', require('./controllers/perfilesController').bajaRadar);

/**
 * @swagger
 * /Intranet/Perfiles/Radar/listaRadares:
 *   get:
 *     summary: Lista de radares
 *     description: Obtiene una lista de todos los radares registrados.
 *     tags:
 *       - Radar
 *     responses:
 *       200:
 *         description: Lista de radares.
 *       500:
 *         description: Error del servidor.
 */
router.get('/Perfiles/Radar/listaRadares', require('./controllers/perfilesController').listaRadares);

/**
 * @swagger
 * /Intranet/Perfiles/Radar/listaRadaresUsuario:
 *   get:
 *     summary: Lista de radares asignados a un usuario
 *     description: Obtiene una lista de todos los radares asignados a un usuario específico.
 *     tags:
 *       - Radar
 *     parameters:
 *       - in: query
 *         name: usuario
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de usuario del cual se desea obtener la lista de radares
 *     responses:
 *       200:
 *         description: Lista de radares del usuario.
 *       400:
 *         description: Parámetro usuario faltante
 *       500:
 *         description: Error del servidor.
 */
router.get('/Perfiles/Radar/listaRadaresUsuario', require('./controllers/perfilesController').listaRadaresUsuario);

/**
 * @swagger
 * /Intranet/Perfiles/Radar/registraRadarUsuario:
 *   post:
 *     summary: Asigna un radar (cliente) a un usuario
 *     description: Asocia un radar (cliente) al usuario para acceso a Radar.
 *     tags:
 *       - Radar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *               - clienteId
 *               - rfc
 *               - squema
 *             properties:
 *               usuario:
 *                 type: string
 *               clienteId:
 *                 type: string
 *               rfc:
 *                 type: string
 *               squema:
 *                 type: string
 *     responses:
 *       201:
 *         description: Radar asignado exitosamente.
 *       400:
 *         description: Campos faltantes.
 *       409:
 *         description: Relación ya existente.
 *       500:
 *         description: Error del servidor.
 */
router.post('/Perfiles/Radar/registraRadarUsuario', require('./controllers/perfilesController').registraRadarUsuario);

/**
 * @swagger
 * /Intranet/Perfiles/Radar/eliminaRadarUsuario:
 *   post:
 *     summary: Elimina la relación de un radar (cliente) con un usuario
 *     description: Elimina la relación de un radar (cliente) con el usuario para acceso a Radar.
 *     tags:
 *       - Radar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *               - clienteId
 *               - rfc
 *             properties:
 *               usuario:
 *                 type: string
 *               clienteId:
 *                 type: string
 *               rfc:
 *                 type: string
 *     responses:
 *       201:
 *         description: Radar eliminado exitosamente.
 *       400:
 *         description: Campos faltantes.
 *       404:
 *         description: Relación no encontrada.
 *       500:
 *         description: Error del servidor.
 */
router.post('/Perfiles/Radar/eliminaRadarUsuario', require('./controllers/perfilesController').eliminaRadarUsuario);

/**
 * @swagger
 * /Intranet/Perfiles/altaLinks:
 *   post:
 *     summary: Registrar usuario a Links
 *     description: Registra usuario a Links.
 *     tags:
 *       - Links
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *             properties:
 *               usuario:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado a Links exitosamente.
 *       400:
 *         description: Campos faltantes.
 *       409:
 *         description: Usuario ya existente.
 *       500:
 *         description: Error del servidor.
 */
router.post('/Perfiles/altaLinks', require('./controllers/perfilesController').altaLinks);

/**
 * @swagger
 * /Intranet/Perfiles/bajaLinks:
 *   post:
 *     summary: Desactivar usuario en Links
 *     description: Desactiva un usuario en Links.
 *     tags:
 *       - Links
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *             properties:
 *               usuario:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario dado de baja a Links exitosamente.
 *       400:
 *         description: Campos faltantes.
 *       409:
 *         description: Usuario ya existente.
 *       500:
 *         description: Error del servidor.
 */
router.post('/Perfiles/bajaLinks', require('./controllers/perfilesController').bajaLinks);

/**
 * @swagger
 * /Intranet/Perfiles/Estadisticas/usuarioClientesEstadisticas:
 *   get:
 *     summary: Obtener clientes asignados al usuario para Estadísticas
 *     description: Devuelve la lista de clientes asignados al usuario en Estadísticas.
 *     tags:
 *       - Estadisticas
 *     parameters:
 *       - in: query
 *         name: usuario
 *         required: true
 *         schema:
 *           type: string
 *         description: Usuario a consultar
 *     responses:
 *       200:
 *         description: Lista de clientes asignados al usuario.
 *       400:
 *         description: Parámetro faltante.
 *       500:
 *         description: Error del servidor.
 */
router.get('/Perfiles/Estadisticas/usuarioClientesEstadisticas', require('./controllers/perfilesController').usuarioClientesEstadisticas);

/**
 * @swagger
 * /Intranet/Perfiles/Estadisticas/listaClientesEstadisticas:
 *   get:
 *     summary: Obtener lista de todos los clientes para Estadísticas
 *     description: Devuelve la lista de todos los clientes disponibles en Estadísticas.
 *     tags:
 *       - Estadisticas
 *     responses:
 *       200:
 *         description: Lista de clientes.
 *       500:
 *         description: Error del servidor.
 */
router.get('/Perfiles/Estadisticas/listaClientesEstadisticas', require('./controllers/perfilesController').listaClientesEstadisticas);

/**
 * @swagger
 * /Intranet/Perfiles/Estadisticas/registraClienteUsuarioEstadisticas:
 *   post:
 *     summary: Asigna un cliente a un usuario para Estadísticas
 *     description: Asocia un cliente al usuario para acceso a Estadísticas.
 *     tags:
 *       - Estadisticas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *               - cliente
 *               - RFC
 *             properties:
 *               usuario:
 *                 type: string
 *               cliente:
 *                 type: string
 *               rfc:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cliente asignado exitosamente.
 *       400:
 *         description: Campos faltantes.
 *       409:
 *         description: Relación ya existente.
 *       500:
 *         description: Error del servidor.
 */
router.post('/Perfiles/Estadisticas/registraClienteUsuarioEstadisticas', require('./controllers/perfilesController').registraClienteUsuarioEstadisticas);

/**
 * @swagger
 * /Intranet/Perfiles/Estadisticas/eliminaClienteUsuarioEstadisticas:
 *   post:
 *     summary: Elimina un cliente de un usuario para Estadísticas
 *     description: Elimina la relación de un cliente con el usuario para acceso a Estadísticas.
 *     tags:
 *       - Estadisticas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *               - cliente
 *               - RFC
 *             properties:
 *               usuario:
 *                 type: string
 *               cliente:
 *                 type: string
 *               rfc:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cliente eliminado exitosamente.
 *       400:
 *         description: Campos faltantes.
 *       404:
 *         description: Relación no encontrada.
 *       500:
 *         description: Error del servidor.
 */
router.post('/Perfiles/Estadisticas/eliminaClienteUsuarioEstadisticas', require('./controllers/perfilesController').eliminaClienteUsuarioEstadisticas);

/**
 * @swagger
 * /Intranet/Resguardo/listaCategoriasResguardo:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Lista de categorías de resguardo
 *     description: Obtiene una lista de todas las categorías de resguardo.
 *     tags:
 *       - Resguardo
 *     responses:
 *       200:
 *         description: Lista de categorías de resguardo.
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Token inválido
 */
router.get('/Resguardo/listaCategoriasResguardo'/*, auth*/, require('./controllers/resguardoController').listaCategoriasResguardo);

/**
 * @swagger
 * /Intranet/Resguardo/listaArticulosResguardo:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Lista de artículos de resguardo
 *     description: Obtiene una lista de todos los artículos de resguardo.
 *     tags:
 *       - Resguardo
 *     responses:
 *       200:
 *         description: Lista de artículos de resguardo.
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Token inválido
 */
router.get('/Resguardo/listaArticulosResguardo'/*, auth*/, require('./controllers/resguardoController').listaArticulosResguardo);

/**
 * @swagger
 * /Intranet/Resguardo/registraSolicitudResguardo:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Registrar solicitud de resguardo
 *     description: Registra una nueva solicitud de resguardo.
 *     tags:
 *       - Resguardo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario resguardo
 *               - categoria
 *               - articulo
 *               - pdr
 *               - ciudad
 *               - usuario solicita
 *             properties:
 *               usuarioResguardo:
 *                 type: string
 *               categoria:
 *                 type: string
 *               articulo:
 *                 type: string
 *               pdr:
 *                 type: string
 *               ciudad:
 *                 type: string
 *               usuarioSolicita:
 *                 type: string
 *     responses:
 *       201:
 *         description: Solicitud de resguardo registrada exitosamente.
 *       400:
 *         description: Campos faltantes.
 *       500:
 *         description: Error del servidor.
 */
router.post('/Resguardo/registraSolicitudResguardo'/*, auth*/, require('./controllers/resguardoController').registraSolicitudResguardo);

/**
 * @swagger
 * /Intranet/Resguardo/listaResguardoUsuario:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Lista elementos de resguardo asignados al usuario
 *     description: Obtiene una lista de todos los elementos de resguardo asignados al usuario.
 *     tags:
 *       - Resguardo
 *     parameters:
 *       - in: query
 *         name: usuario
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de usuario
 *     responses:
 *       200:
 *         description: Lista de artículos de resguardo asignados al usuario.
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Token inválido
 */
router.get('/Resguardo/listaResguardoUsuario'/*, auth*/, require('./controllers/resguardoController').listaResguardoUsuario);


/**
 * @swagger
 * /Intranet/Perfiles/Links/catalogoOficinasLinks:
 *   get:
 *     summary: Obtener lista de todas las oficinas de Links
 *     description: Devuelve la lista de todas las oficinas de Links.
 *     tags:
 *       - Links
 *     responses:
 *       200:
 *         description: Lista de oficinas Links.
 *       500:
 *         description: Error del servidor.
 */
router.get('/Perfiles/Links/catalogoOficinasLinks', require('./controllers/perfilesController').catalogoOficinasLinks);

/**
 * @swagger
 * /Intranet/Perfiles/Links/catalogoModulosLinks:
 *   get:
 *     summary: Obtener lista de tods los modulos de Links
 *     description: Devuelve la lista de todas los modulos de Links.
 *     tags:
 *       - Links
 *     responses:
 *       200:
 *         description: Lista de modulos Links.
 *       500:
 *         description: Error del servidor.
 */
router.get('/Perfiles/Links/catalogoModulosLinks', require('./controllers/perfilesController').catalogoModulosLinks);

/**
 * @swagger
 * /Intranet/Perfiles/Links/oficinasUsuarioLinks:
 *   get:
 *     summary: Obtener oficinas asignadas al usuario para Links
 *     description: Devuelve la lista de oficinas asignadas al usuario en Links.
 *     tags:
 *       - Links
 *     parameters:
 *       - in: query
 *         name: usuario
 *         required: true
 *         schema:
 *           type: string
 *         description: Usuario a consultar
 *     responses:
 *       200:
 *         description: Lista de oficinas asignadas al usuario.
 *       400:
 *         description: Parámetro faltante.
 *       500:
 *         description: Error del servidor.
 */
router.get('/Perfiles/Links/oficinasUsuarioLinks', require('./controllers/perfilesController').oficinasUsuarioLinks);

/**
 * @swagger
 * /Intranet/Perfiles/Links/modulosOficinaUsuarioLinks:
 *   get:
 *     summary: Obtener los módulos asignados de la oficina al usuario para Links
 *     description: Devuelve los módulos asignados a la oficina al usuario en Links.
 *     tags:
 *       - Links
 *     parameters:
 *       - in: query
 *         name: usuario
 *         required: true
 *         schema:
 *           type: string
 *         description: Usuario a consultar
 *       - in: query
 *         name: oficina
 *         required: true
 *         schema:
 *           type: string
 *         description: Oficina a consultar
 *     responses:
 *       200:
 *         description: Lista de módulos asignados por oficina al usuario en Links.
 *       400:
 *         description: Parámetro faltante.
 *       500:
 *         description: Error del servidor.
 */
router.get('/Perfiles/Links/modulosOficinaUsuarioLinks', require('./controllers/perfilesController').modulosOficinaUsuarioLinks);

/**
 * @swagger
 * /Intranet/Perfiles/Links/altaModuloOficinaUsuarioLinks:
 *   post:
 *     summary: Activa modulo en la oficina del usuario.
 *     description: Activa modulo en la oficina del usuario.
 *     tags:
 *       - Links
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *               - oficina
 *               - moodulo
 *             properties:
 *               usuario:
 *                 type: string
 *               oficina:
 *                 type: string
 *               modulo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Modulo registrado en oficina exitosamente.
 *       400:
 *         description: Campos faltantes.
 *       409:
 *         description: Modulo ya existente.
 *       500:
 *         description: Error del servidor.
 */
router.post('/Perfiles/Links/altaModuloOficinaUsuarioLinks', require('./controllers/perfilesController').altaModuloOficinaUsuarioLinks);

/**
 * @swagger
 * /Intranet/Perfiles/Links/eliminaModuloOficinaUsuarioLinks:
 *   post:
 *     summary: Elimina modulo en la oficina del usuario.
 *     description: Elimina modulo en la oficina del usuario.
 *     tags:
 *       - Links
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *               - oficina
 *               - moodulo
 *             properties:
 *               usuario:
 *                 type: string
 *               oficina:
 *                 type: string
 *               modulo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Modulo eliminado en oficina exitosamente.
 *       400:
 *         description: Campos faltantes.
 *       409:
 *         description: Modulo ya existente.
 *       500:
 *         description: Error del servidor.
 */
router.post('/Perfiles/Links/eliminaModuloOficinaUsuarioLinks', require('./controllers/perfilesController').eliminaModuloOficinaUsuarioLinks);

/**
 * @swagger
 * /Intranet/Perfiles/altaSistemaExterno:
 *   post:
 *     summary: Registrar usuario un sistema externo
 *     description: Registra usuario a un sistema externo.
 *     tags:
 *       - Sistemas Externos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *               - usuarioSolicita
 *               - sistema
 *             properties:
 *               usuario:
 *                 type: string
 *               usuarioSolicita:
 *                 type: string
 *               sistema:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado a un sistema externo exitosamente.
 *       400:
 *         description: Campos faltantes.
 *       409:
 *         description: Usuario ya existente.
 *       500:
 *         description: Error del servidor.
 */
router.post('/Perfiles/altaSistemaExterno', require('./controllers/perfilesController').altaSistemaExterno);

/**
 * @swagger
 * /Intranet/Perfiles/bajaSistemaExterno:
 *   post:
 *     summary: Desactivar usuario en un sistema externo
 *     description: Desactiva un usuario en un sistema externo.
 *     tags:
 *       - Sistemas Externos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *               - usuarioSolicita
 *               - sistema
 *             properties:
 *               usuario:
 *                 type: string
 *               usuarioSolicita:
 *                 type: string
 *               sistema:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario desactivado exitosamente en un sistema externo.
 *       400:
 *         description: Campos faltantes.
 *       500:
 *         description: Error del servidor.
 */
router.post('/Perfiles/bajaSistemaExterno', require('./controllers/perfilesController').bajaSistemaExterno);

/**
 * @swagger
 * /Intranet/Perfiles/jefesDirectosPuesto:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Obtener jefes directos por puesto
 *     description: Puesto, ciudad y empresa para los cuales se desea obtener la lista de jefes directos
 *     tags:
 *       - Perfiles
 *     parameters:
 *       - in: query
 *         name: puesto
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: ciudad
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: empresa
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de jefes directos obtenida exitosamente.
 *       400:
 *         description: Campos faltantes.
 *       500:
 *         description: Error del servidor.
 */
router.get('/Perfiles/jefesDirectosPuesto', require('./controllers/perfilesController').jefesDirectosPuesto);

/**
 * @swagger
 * /Intranet/Perfiles/correoUsuario:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Obtener correo de un usuario
 *     description: Devuelve el correo electrónico asociado a un usuario específico.
 *     tags:
 *       - Perfiles
 *     parameters:
 *       - in: query
 *         name: usuario
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de usuario del cual se desea obtener el correo electrónico
 *     responses:
 *       200:
 *         description: Correo electrónico del usuario obtenido exitosamente.
 *       400:
 *         description: Parámetro usuario faltante
 *       500:
 *         description: Error del servidor.
 */
router.get('/Perfiles/correoUsuario', require('./controllers/perfilesController').correoUsuario);


module.exports = router;
