// backend/KPI/routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const { getOracleTables, getCatalogoDestinos, getCatalogoCargueros, getRegistrosCargueros, getRegistrosCarguerosExcel, createNewCarguero, updateCarguero, getCatalogoIncidencias, getIncidenciasPorCarguero, saveCargueroIncidencias, getTransportesCarguero, getDodasDisponibles, saveCargueroDodasFromSearch, deleteCarguero, deleteTransporteCarguero, getCatalogoAduanas, getCatalogoAlmacenes, getCatalogoIncidenciasTransporte, getTransporteIncidencias, saveTransporteIncidencias, getCarguerosExcel, getTransportesExcel, getReferenciasExcel, getIncidenciasCargerosExcel, getIncidenciasTransportesExcel, getReferenciaOracleExcel } = require('./controllers/kpiController');

/** 
 * @swagger
 * /kpi/referencia-oracle-excel:
 *   get:
 *     summary: Obtiene datos complementarios de referencia Oracle
 *     description: Obtiene datos complementarios de referencia Oracle.
 *     tags:
 *       - KPI
 *     parameters:
 *       - in: query
 *         name: referencia
 *         schema:
 *           type: string
 *       
 *         required: true
 *     responses:
 *       200:
 *         description: Referencias obtenidas correctamente.
 */
router.get('/referencia-oracle-excel', getReferenciaOracleExcel);

/** 
 * @swagger
 * /kpi/incidencias-transportes-excel:
 *   get:
 *     summary: Obtener incidencias de transportes en Excel
 *     description: Obtiene la lista de incidencias de transportes entre fechas.
 *     tags:
 *       - KPI
 *     parameters:
 *       - in: query
 *         name: desde
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *       - in: query
 *         name: hasta
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *     responses:
 *       200:
 *         description: Incidencias de transportes obtenidas correctamente.
 */
router.get('/incidencias-transportes-excel', getIncidenciasTransportesExcel);

/** 
 * @swagger
 * /kpi/incidencias-cargueros-excel:
 *   get:
 *     summary: Obtener incidencias de cargueros en Excel
 *     description: Obtiene la lista de incidencias de cargueros entre fechas.
 *     tags:
 *       - KPI
 *     parameters:
 *       - in: query
 *         name: desde
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *       - in: query
 *         name: hasta
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *     responses:
 *       200:
 *         description: Incidencias de cargueros obtenidas correctamente.
 */
router.get('/incidencias-cargueros-excel', getIncidenciasCargerosExcel);

/**
 * @swagger
 * /kpi/referencias-excel:
 *   get:
 *     summary: Obtener referencias en Excel
 *     description: Obtiene la lista de referencias entre fechas.
 *     tags:
 *       - KPI
 *     parameters:
 *       - in: query
 *         name: desde
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *       - in: query
 *         name: hasta
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *     responses:
 *       200:
 *         description: Referencias obtenidas correctamente.
 */
router.get('/referencias-excel', getReferenciasExcel);

/** 
 * @swagger
 * /kpi/transportes-excel:
 *   get:
 *     summary: Obtener transportes en Excel
 *     description: Obtiene la lista de transportes entre fechas.
 *     tags:
 *       - KPI
 *     parameters:
 *       - in: query
 *         name: desde
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *       - in: query
 *         name: hasta
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *     responses:
 *       200:
 *         description: Transportes obtenidos correctamente.
 */
router.get('/transportes-excel', getTransportesExcel);

/** 
 * @swagger
 * /kpi/cargueros-excel:
 *   get:
 *     summary: Obtener cargueros en Excel
 *     description: Obtiene la lista de cargueros entre fechas.
 *     tags:
 *       - KPI
 *     parameters:
 *       - in: query
 *         name: desde
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *       - in: query
 *         name: hasta
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *     responses:
 *       200:
 *         description: Cargueros obtenidos correctamente.
 */
router.get('/cargueros-excel', getCarguerosExcel);

/** 
 * @swagger
 * /kpi/oracle-tables:
 *   get:
 *     summary: Obtener tablas de Oracle
 *     description: Obtiene la lista de tablas disponibles en la base de datos Oracle.
 *     tags:
 *       - KPI
 *     responses:
 *       200:
 *         description: Tablas de Oracle obtenidas correctamente.
 */
router.get('/oracle-tables', getOracleTables);

/** 
 * @swagger
 * /kpi/catalogo-incidencias-transporte:
 *   get:
 *     summary: Obtener catálogo de incidencias de transporte
 *     description: Obtiene el catálogo de incidencias de transporte disponibles.
 *     tags:
 *       - KPI
 *     responses:
 *       200:
 *         description: Catálogo de incidencias de transporte obtenido correctamente.
 */ 
router.get('/catalogo-incidencias-transporte', getCatalogoIncidenciasTransporte);

/** 
 * @swagger
 * /kpi/incidencias-transporte:
 *   get:
 *     summary: Obtener incidencias de transporte
 *     description: Obtiene las incidencias de transporte registradas.
 *     tags:
 *       - KPI
 *     parameters:
 *       - in: query
 *         name: transporteId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Incidencias de transporte obtenidas correctamente.
*/
router.get('/incidencias-transporte', getTransporteIncidencias);

/** 
 * @swagger
 * /kpi/transporte-incidencias:
 *   post:
 *     summary: Guardar incidencias de transporte
 *     description: Guarda las incidencias de transporte registradas.
 *     tags:
 *       - KPI
 *     responses:
 *       200:
 *         description: Incidencias de transporte guardadas correctamente.
 */
router.post('/transporte-incidencias', saveTransporteIncidencias);

/** 
 * @swagger
 * /kpi/catalogo-destinos:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Obtener catálogo de destinos
 *     description: Obtiene el catálogo de destinos disponibles.
 *     tags:
 *       - KPI
 *     responses:
 *       200:
 *         description: Catálogo de destinos obtenido correctamente.
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Token inválido
 */
router.get('/catalogo-destinos'/*, auth*/, getCatalogoDestinos);

/**
 * @swagger
 * /kpi/catalogo-cargueros:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Obtener catálogo de cargueros
 *     description: Obtiene el catálogo de cargueros disponibles.
 *     tags:
 *       - KPI
 *     responses:
 *       200:
 *         description: Catálogo de cargueros obtenido correctamente.
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Token inválido
 */
router.get('/catalogo-cargueros'/*, auth*/, getCatalogoCargueros);

/**
 * @swagger
 * /kpi/catalogo-aduanas:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Obtener catálogo de aduanas
 *     description: Obtiene el catálogo de aduanas disponibles.
 *     tags:
 *       - KPI
 *     responses:
 *       200:
 *         description: Catálogo de aduanas obtenido correctamente.
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Token inválido
 */
router.get('/catalogo-aduanas'/*, auth*/, getCatalogoAduanas);

/**
 * @swagger
 * /kpi/catalogo-almacenes:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Obtener catálogo de almacenes
 *     description: Obtiene el catálogo de almacenes disponibles.
 *     tags:
 *       - KPI
 *     responses:
 *       200:
 *         description: Catálogo de almacenes obtenido correctamente.
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Token inválido
 */
router.get('/catalogo-almacenes'/*, auth*/, getCatalogoAlmacenes);

/**
 * @swagger
 * /kpi/registros-cargueros:
 *   get:
 *     summary: Obtener todos los registros de cargueros
 *     security:
 *       - bearerAuth: []
 *     description: Obtiene la lista de todos los registros de cargueros con su información detallada.
 *     tags:
 *       - KPI
 *     responses:
 *       200:
 *         description: Registros de cargueros obtenidos correctamente.
 */
router.get('/registros-cargueros'/*, auth*/, getRegistrosCargueros);

/**
 * @swagger
 * /kpi/registros-cargueros-excel:
 *   get:
 *     summary: Descargar registros de cargueros en Excel
 *     parameters:
 *       - in: query
 *         name: desde
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: hasta
 *         schema:
 *           type: string
 *           format: date
 *     tags:
 *       - KPI
 *     responses:
 *       200:
 *         description: Archivo XLSX generado correctamente.
 */
router.get('/registros-cargueros-excel'/*, auth*/, getRegistrosCarguerosExcel);

/**
 * @swagger
 * /kpi/catalogo-incidencias:
 *   get:
 *     summary: Obtener catálogo de incidencias
 *     tags:
 *       - KPI
 *     responses:
 *       200:
 *         description: Catálogo de incidencias
 */
router.get('/catalogo-incidencias'/*, auth*/, getCatalogoIncidencias);

/**
 * @swagger
 * /kpi/incidencias:
 *   get:
 *     summary: Obtener incidencias registradas para un carguero
 *     parameters:
 *       - in: query
 *         name: cargueroId
 *         schema:
 *           type: integer
 *     tags:
 *       - KPI
 *     responses:
 *       200:
 *         description: Incidencias del carguero
 */
router.get('/incidencias'/*, auth*/, getIncidenciasPorCarguero);

/**
 * @swagger
 * /kpi/carguero-incidencias:
 *   post:
 *     summary: Guardar incidencias de un carguero
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               carguero_id:
 *                 type: integer
 *               incidencias:
 *                 type: array
 *                 items:
 *                   type: integer
 *     tags:
 *       - KPI
 *     responses:
 *       200:
 *         description: Incidencias guardadas
 */
router.post('/carguero-incidencias'/*, auth*/, saveCargueroIncidencias);

/**
 * @swagger
 * /kpi/carguero-dodas:
 *   post:
 *     summary: Guardar DODAs de un carguero
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               carguero_id:
 *                 type: integer
 *               transportes:
 *                 type: array
 *                 items:
 *                   type: string
 *     tags:
 *       - KPI
 *     responses:
 *       200:
 *         description: DODAs guardadas
 */
router.post('/carguero-dodas'/*, auth*/, saveCargueroDodasFromSearch);

/**
 * @swagger
 * /kpi/carguero:
 *   delete:
 *     summary: Eliminar un carguero y sus registros asociados
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               carguero_id:
 *                 type: integer
 *     tags:
 *       - KPI
 *     responses:
 *       200:
 *         description: Carguero eliminado correctamente.
 *       404:
 *         description: Carguero no encontrado.
 */
router.delete('/carguero'/*, auth*/, deleteCarguero);

/**
 * @swagger
 * /kpi/transporte-carguero:
 *   delete:
 *     summary: Eliminar un transporte vinculado a un carguero
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               carguero_id:
 *                 type: integer
 *               doda:
 *                 type: string
 *     tags:
 *       - KPI
 *     responses:
 *       200:
 *         description: Transporte eliminado correctamente.
 *       404:
 *         description: Transporte no encontrado.
 */
router.delete('/transporte-carguero'/*, auth*/, deleteTransporteCarguero);

/**
 * @swagger
 * /kpi/transportes-carguero:
 *   get:
 *     summary: Obtener listado de transportes de un carguero
 *     parameters:
 *       - in: query
 *         name: cargueroId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: desde
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: hasta
 *         schema:
 *           type: string
 *           format: date
 *     tags:
 *       - KPI
 *     responses:
 *       200:
 *         description: Lista de DODAS obtenida correctamente.
 */
router.get('/transportes-carguero'/*, auth*/, getTransportesCarguero);

/**
 * @swagger
 * /kpi/dodas-disponibles:
 *   get:
 *     summary: Obtener DODAS disponibles por rango de fechas
 *     parameters:
 *       - in: query
 *         name: desde
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: hasta
 *         schema:
 *           type: string
 *           format: date
 *     tags:
 *       - KPI
 *     responses:
 *       200:
 *         description: Lista de DODAS disponibles obtenida correctamente.
 */
router.get('/dodas-disponibles'/*, auth*/, getDodasDisponibles);

/**
 * @swagger
 * /kpi/catalogo-incidencias:
 *   get:
 *     summary: Obtener catálogo de incidencias
 *     description: Obtiene el catálogo de incidencias disponible en la base de datos.
 *     tags:
 *       - KPI
 *     responses:
 *       200:
 *         description: Catálogo de incidencias obtenido correctamente.
 */
router.get('/catalogo-incidencias'/*, auth*/, getCatalogoIncidencias);

/**
 * @swagger
 * /kpi/nuevo-carguero:
 *   post:
 *     summary: Registrar una nuevo carguero
 *     security:
 *       - bearerAuth: []
 *     description: Da de alta un nuevo carguero.
 *     tags:
 *       - KPI
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - carguero_id
 *               - eta
 *               - llegada_real
 *               - ultima_charola
 *             properties:
 *               carguero_id:
 *                 type: integer
 *                 description: ID del carguero.
 *               eta:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha ETA.
 *               llegada_real:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de llegada real.
 *               ultima_charola:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de última charola.
 *     responses:
 *       201:
 *         description: Carguero creado correctamente.
 *       400:
 *         description: Campos requeridos faltantes.
 */
router.post('/nuevo-carguero'/*, auth*/, createNewCarguero);

/**
 * @swagger
 * /kpi/carguero:
 *   put:
 *     summary: Actualizar un carguero existente
 *     security:
 *       - bearerAuth: []
 *     description: Actualiza la información de un carguero existente.
 *     tags:
 *       - KPI
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - carguero_id
 *               - eta
 *               - llegada_real
 *               - ultima_charola
 *             properties:
 *               carguero_id:
 *                 type: integer
 *                 description: ID del carguero.
 *               eta:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha ETA.
 *               llegada_real:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de llegada real.
 *               ultima_charola:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de última charola.
 *     responses:
 *       200:
 *         description: Carguero actualizado correctamente.
 *       400:
 *         description: Campos requeridos faltantes.
 */
router.put('/carguero'/*, auth*/, updateCarguero);

module.exports = router;