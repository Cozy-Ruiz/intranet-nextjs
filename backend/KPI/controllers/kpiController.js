const db = require('../../config/db').mysqlPool;
const oracleDB = require('../../config/db').oraclePool;
const ExcelJS = require('exceljs');

exports.getOracleTables = async (req, res) => {
try {
    const result = await oracleDB.execute(`SELECT DISTINCT 
            p.clavex, 
            TRIM(p.referencia) AS REFERENCIA, 
            c.nombre AS cliente, 
            pr.nombre AS proveedor,
            (SELECT clave || '-' || id_caso FROM pedimento.casos_g WHERE referencia = p.referencia AND clave = 'FR' AND id_caso = '1') AS clave,
            (SELECT DISTINCT PR.CLAVE FROM PEDIMENTO.PERMISOS PR WHERE PR.REFERENCIA = P.REFERENCIA AND PR.CLAVE = 'T9') AS T9,
            (SELECT DISTINCT PR.CLAVE FROM PEDIMENTO.PERMISOS PR WHERE PR.REFERENCIA = P.REFERENCIA AND PR.CLAVE = 'C1') AS C1,
            (SELECT DISTINCT (CLAVE) FROM PEDIMENTO.CASOS_P WHERE REFERENCIA = P.REFERENCIA AND CLAVE IN ('GA')) AS CLAVE_GA,
            mr.marcas AS bultos, 
            p.fecha_pago AS pago,
            tc.SEM_TRAFICOCRUCE AS semaforo
          FROM pedimento.pedimentos p
          INNER JOIN pedimento.cliente c ON p.cliente = c.cliente
          INNER JOIN pedimento.facturas f ON p.referencia = f.referencia AND p.clavex = f.clavex
          INNER JOIN pedimento.proveedor pr ON f.provee = pr.provee
          INNER JOIN pedimento.marcas mr ON p.referencia = mr.referencia AND p.clavex = mr.clavex
          INNER JOIN pedimento.nfirbank fb ON p.clavex = fb.clavex AND p.pedimento = fb.pedimento
          -- NUEVO: Traemos el sem·foro mediante un LEFT JOIN para que no excluya filas si no encuentra la referencia
          LEFT JOIN scia.T_TRAFICOCRUCE tc ON tc.NTR_TRAFICOCRUCE = trim(p.referencia)
          WHERE  c.rfc IN (
            'ZME920824KM3', 'BME0004112J6', 'P&B0108104K7', 'OME0107208X5', 'TME030710K69', 
            'ZHM040609ES5', 'MDM041221RJ3', 'UME091026UT6', 'SME111206QU5', 'NCG131029SK3', 
            'RME140210IY5', 'FGM150917IPA'
          )
          AND p.referencia = '26-402732'`);
    let datos = result.rows || [];

    if (result.metaData && Array.isArray(datos[0])) {
      datos = datos.map(row => {
        const obj = {};
        result.metaData.forEach((col, i) => { obj[col.name] = row[i]; });
        return obj;
      });
    }

    if (!Array.isArray(datos) || datos.length === 0) {
      return res.status(404).json({ message: 'No se encontraron datos' });
    }

    res.status(200).json({ status: 'success', data: datos });
  } catch (error) {
    console.error('Error al obtener tablas de Oracle:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}; 

// Obtener catálogo de incidencias de transporte
exports.getCatalogoIncidenciasTransporte = async (req, res) => {
  try {
    const [datos] = await db.query('SELECT id, codigo, incidencia FROM kpi.catalogo_incidencias_transporte ORDER BY codigo');
    if (datos.length === 0) {
      return res.status(404).json({ message: 'No se encontraron incidencias de transporte' });
    }
    res.status(200).json({ status: 'success', data: datos });
  } catch (error) {
    console.error('Error al obtener incidencias de transporte:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Obtener incidencias por transporte
exports.getTransporteIncidencias = async (req, res) => {
  const { transporteId } = req.query;
  if (!transporteId) return res.status(400).json({ message: 'Falta transporteId' });
  try {
    const [datos] = await db.query(
      `SELECT ti.incidencia_id as id, cat.codigo, cat.incidencia
       FROM kpi.transportes_incidencias ti
       JOIN kpi.catalogo_incidencias_transporte cat ON ti.incidencia_id = cat.id
       WHERE ti.transporte_id = ?`,
      [transporteId]
    );
    res.status(200).json({ status: 'success', data: datos });
  } catch (error) {
    console.error('Error al obtener incidencias del transporte:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Guardar incidencias para un transporte
exports.saveTransporteIncidencias = async (req, res) => {
  const { transporte_id, incidencias } = req.body;
  if (!transporte_id || !Array.isArray(incidencias)) {
    return res.status(400).json({ message: 'transporte_id e incidencias son requeridos' });
  }
  try {
    await db.query('DELETE FROM kpi.transportes_incidencias WHERE transporte_id = ?', [transporte_id]);
    if (incidencias.length > 0) {
      const values = incidencias.map((id) => `(${transporte_id}, ${id})`).join(',');
      await db.query(`INSERT INTO kpi.transportes_incidencias (transporte_id, incidencia_id) VALUES ${values}`);
    }
    res.status(200).json({ status: 'success', message: 'Incidencias de transporte actualizadas' });
  } catch (error) {
    console.error('Error al guardar incidencias del transporte:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};


// KPI Cargueros
exports.getCatalogoCargueros = async (req, res) => {
  try {
    const [datos] = await db.query('SELECT id, carguero FROM kpi.catalogo_carguero ORDER BY carguero');
    if (datos.length === 0) {
      return res.status(404).json({ message: 'No se encontraron cargueros' });
    }

    res.status(200).json({ status: 'success', data: datos });
  } catch (error) {
    console.error('Error al obtener cargueros:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.getCatalogoAduanas = async (req, res) => {
  try {
    const [datos] = await db.query('SELECT aduana FROM kpi.catalogo_aduanas ORDER BY aduana');
    if (datos.length === 0) {
      return res.status(404).json({ message: 'No se encontraron aduanas' });
    }
    res.status(200).json({ status: 'success', data: datos });
  } catch (error) {
    console.error('Error al obtener catálogo de aduanas:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.getCatalogoAlmacenes = async (req, res) => {
  try {
    const [datos] = await db.query('SELECT almacen FROM kpi.catalogo_almacenes ORDER BY almacen');
    if (datos.length === 0) {
      return res.status(404).json({ message: 'No se encontraron almacenes' });
    }
    res.status(200).json({ status: 'success', data: datos });
  } catch (error) {
    console.error('Error al obtener catálogo de almacenes:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.getCatalogoDestinos = async (req, res) => {
  try {
    const [datos] = await db.query('SELECT distinct destino, hora_limite FROM kpi.catalogo_destinos ORDER BY destino');
    const destinos = Array.isArray(datos) ? datos.map((row) => ({ destino: row.destino, hora_limite: row.hora_limite })) : [];
    if (destinos.length === 0) {
      return res.status(404).json({ message: 'No se encontraron destinos' });
    }
    res.status(200).json({ status: 'success', data: destinos });
  } catch (error) {
    console.error('Error al obtener catálogo de destinos:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.getRegistrosCargueros = async (req, res) => {
  try {
    const [datos] = await db.query(`
      SELECT c.id, c.carguero_id, cat.carguero, c.eta, c.llegada_real, c.ultima_charola, c.aduana, c.almacen,
        (SELECT count(t.doda) FROM kpi.transportes t WHERE t.carguero_id = c.id) as dodas_asignados
      FROM kpi.cargueros c
      JOIN kpi.catalogo_carguero cat ON c.carguero_id = cat.id
      ORDER BY c.id DESC
    `);

    res.status(200).json({ status: 'success', data: datos });
  } catch (error) {
    console.error('Error al obtener cargueros:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};


exports.getRegistrosCarguerosExcel = async (req, res) => {
  const { desde, hasta } = req.query;

  if (!desde || !hasta) {
    return res.status(400).json({ message: 'Parámetros desde y hasta son requeridos' });
  }

  console.log('Exportando cargueros desde:', desde, 'hasta:', hasta);
  
  const desdeDate = new Date(desde);
  const hastaDate = new Date(hasta);

  const parseExcelDate = (value) => {
    if (!value) return '';

    const toExcelSerial = (date) => {
      const excelBase = Date.UTC(1899, 11, 30);
      return (date.getTime() - excelBase) / 86400000;
    };

    if (value instanceof Date) {
      return toExcelSerial(value);
    }

    if (typeof value === 'string') {
      const trimmedValue = value.trim();
      const match = trimmedValue.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);

      if (match) {
        const [, year, month, day, hours, minutes, seconds = '00'] = match;
        const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes), Number(seconds)));
        return toExcelSerial(date);
      }

      return trimmedValue;
    }

    return value;
  };

  if (isNaN(desdeDate.getTime()) || isNaN(hastaDate.getTime())) {
    return res.status(400).json({ message: 'Fechas inválidas' });
  }

  try {
    const [datos] = await db.query(`
      SELECT c.id, c.carguero_id, cat.carguero,
        DATE_FORMAT(c.eta, '%Y-%m-%d %H:%i:%s') AS eta,
        DATE_FORMAT(c.llegada_real, '%Y-%m-%d %H:%i:%s') AS llegada_real,
        DATE_FORMAT(c.ultima_charola, '%Y-%m-%d %H:%i:%s') AS ultima_charola,
        c.aduana, c.almacen
      FROM kpi.cargueros c
      JOIN kpi.catalogo_carguero cat ON c.carguero_id = cat.id
      WHERE DATE(c.eta) >= ? AND DATE(c.eta) <= ?
      ORDER BY c.eta DESC
    `, [desde, hasta]);

    console.log('Datos obtenidos para exportación:', datos.length, 'registros');
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Cargueros');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Carguero', key: 'carguero', width: 32 },
      { header: 'Aduana', key: 'aduana', width: 18 },
      { header: 'Almacén', key: 'almacen', width: 18 },
      { header: 'ETA', key: 'eta', width: 22, style: { numFmt: 'dd/mm/yyyy hh:mm:ss' } },
      { header: 'Llegada Real', key: 'llegada_real', width: 22, style: { numFmt: 'dd/mm/yyyy hh:mm:ss' } },
      { header: 'Última Charola', key: 'ultima_charola', width: 22, style: { numFmt: 'dd/mm/yyyy hh:mm:ss' } },
    ];

    datos.forEach((row) => {
      worksheet.addRow({
        id: row.id,
        carguero: row.carguero,
        aduana: row.aduana || '',
        almacen: row.almacen || '',
        eta: parseExcelDate(row.eta),
        llegada_real: parseExcelDate(row.llegada_real),
        ultima_charola: parseExcelDate(row.ultima_charola),
      });
    });


    const [transportes] = await db.query(`
      SELECT 
        t.doda, 
        t.carguero_id,
        t.destino,
        (SELECT ct.xt_nombre FROM doda.catalogo_transportistas ct WHERE ct.xt_caat = (SELECT rs.xt_caat FROM doda.relacion_salida rs WHERE rs.xt_numero_integracion = t.doda) AND XT_OFICINA = 'CDMX' LIMIT 1) as transporte_nombre
      FROM kpi.transportes t
      WHERE t.carguero_id IN (
        SELECT c.id
        FROM kpi.cargueros c
        WHERE DATE(c.eta) >= ? AND DATE(c.eta) <= ?
      )
      ORDER BY t.transporte_id
    `, [desde, hasta]);

    console.log('Transportes obtenidos para exportación:', transportes.length, 'registros');
    
    const transportesSheet = workbook.addWorksheet('Transportes');
    transportesSheet.columns = [
      { header: 'DODA', key: 'doda', width: 24 },
      { header: 'Carguero_ID', key: 'carguero_id', width: 14 },
      { header: 'TRANSPORTE', key: 'transporte_nombre', width: 32 },
      { header: 'DESTINO', key: 'destino', width: 24 },
    ];

    transportes.forEach((row) => {
      transportesSheet.addRow({
        doda: row.doda ? row.doda.trim() : '',
        carguero_id: row.carguero_id,
        transporte_nombre: row.transporte_nombre || '',
        destino: row.destino || '',
      });
    });
    

    const [referencias] = await db.query(`
      SELECT 
        dp.xt_referencia as referencia, 
        t2.carguero_id,
        drs.xt_numero_integracion as doda, 	
        rsp.xt_pedimento as pedimento, 
        c2.aduana,
        p.xt_nombre as importador,
        
        CASE 
          WHEN p.xt_rfcCausante = 'FGM150917IPA' THEN 'SIN CADENA'
          WHEN p.xt_rfcCausante = 'ZHM040609ES5' THEN 'ZARA HOME'
          WHEN p.xt_rfcCausante = 'ZME920824KM3' THEN 'ZARA MEXICO'
          WHEN p.xt_rfcCausante = 'BME0004112J6' AND (SELECT GROUP_CONCAT(DISTINCT pc3.xt_nombre SEPARATOR ', ') FROM master_ge.master_coves pc3 WHERE pc3.xt_referencia = p.xt_referencia) like '%NIKOLE%' THEN 'LEFTIES'
          WHEN p.xt_rfcCausante = 'BME0004112J6' AND (SELECT GROUP_CONCAT(DISTINCT pc3.xt_nombre SEPARATOR ', ') FROM master_ge.master_coves pc3 WHERE pc3.xt_referencia = p.xt_referencia) like '%PULL & BEAR%' THEN 'PULL & BEAR'
          WHEN p.xt_rfcCausante = 'BME0004112J6' AND (SELECT GROUP_CONCAT(DISTINCT pc3.xt_nombre SEPARATOR ', ') FROM master_ge.master_coves pc3 WHERE pc3.xt_referencia = p.xt_referencia) like '%DUTTI%' THEN 'MASSIMO DUTTI'
          WHEN p.xt_rfcCausante = 'BME0004112J6' AND (SELECT GROUP_CONCAT(DISTINCT pc3.xt_nombre SEPARATOR ', ') FROM master_ge.master_coves pc3 WHERE pc3.xt_referencia = p.xt_referencia) like '%BERSHKA%' THEN 'BERSHKA '
          WHEN p.xt_rfcCausante = 'BME0004112J6' AND (SELECT GROUP_CONCAT(DISTINCT pc3.xt_nombre SEPARATOR ', ') FROM master_ge.master_coves pc3 WHERE pc3.xt_referencia = p.xt_referencia) like '%STRADIVARIUS%' THEN 'STRADIVARIUS '
          WHEN p.xt_rfcCausante = 'BME0004112J6' AND (SELECT GROUP_CONCAT(DISTINCT pc3.xt_nombre SEPARATOR ', ') FROM master_ge.master_coves pc3 WHERE pc3.xt_referencia = p.xt_referencia) like '%OYSHO%' THEN 'OYSHO'
          WHEN p.xt_rfcCausante = 'BME0004112J6' AND (SELECT GROUP_CONCAT(DISTINCT pc3.xt_nombre SEPARATOR ', ') FROM master_ge.master_coves pc3 WHERE pc3.xt_referencia = p.xt_referencia) like '%TEMPE%' THEN 'TEMPE'
          WHEN p.xt_rfcCausante = 'BME0004112J6' AND (SELECT GROUP_CONCAT(DISTINCT pc3.xt_nombre SEPARATOR ', ') FROM master_ge.master_coves pc3 WHERE pc3.xt_referencia = p.xt_referencia) like '%ITX MERKEN%' THEN 'BERSHKA'
          WHEN p.xt_rfcCausante = 'BME0004112J6' AND (SELECT GROUP_CONCAT(DISTINCT pc3.xt_nombre SEPARATOR ', ') FROM master_ge.master_coves pc3 WHERE pc3.xt_referencia = p.xt_referencia) like '%DISENO TEXTIL%' THEN 'BERSHKA'
          WHEN p.xt_rfcCausante = 'BME0004112J6' AND (SELECT GROUP_CONCAT(DISTINCT pc3.xt_nombre SEPARATOR ', ') FROM master_ge.master_coves pc3 WHERE pc3.xt_referencia = p.xt_referencia) like '%JOVENMODA%' THEN 'BERSHKA'
          ELSE 'OTRA CADENA' -- Es buena práctica poner un ELSE por si no cumple ninguna
      END AS cadena,
      
      DATE_FORMAT(p.xd_fechaPago, '%Y-%m-%d %H:%i:%s') as fecha_pago,
      DATE_FORMAT(p.xd_fechaCruce, '%Y-%m-%d %H:%i:%s') as fecha_cruce,

      CASE 
					WHEN SUBSTRING((SELECT GROUP_CONCAT(DISTINCT fc.xt_factura SEPARATOR ', ') FROM master_ge.master_facturas_cove fc WHERE fc.xt_referencia = p.xt_referencia), 1,2) = '07' THEN 'Cosméticos'
					WHEN SUBSTRING((SELECT GROUP_CONCAT(DISTINCT fc.xt_factura SEPARATOR ', ') FROM master_ge.master_facturas_cove fc WHERE fc.xt_referencia = p.xt_referencia), 1,2) = '03' THEN 'Cosméticos'
					WHEN SUBSTRING((SELECT GROUP_CONCAT(DISTINCT fc.xt_factura SEPARATOR ', ') FROM master_ge.master_facturas_cove fc WHERE fc.xt_referencia = p.xt_referencia), 1,2) = '61' THEN 'Material'
					ELSE 'Textil' -- Es buena pr·ctica poner un ELSE por si no cumple ninguna
			END AS material,
			
			(SELECT msc.xt_semaforo_1 FROM master_ge.master_semaforo_cruces msc WHERE msc.xt_referencia = dp.xt_referencia ) as semaforo_1
        
      FROM doda.pedimentos dp, doda.relacion_salida_pedimentos rsp, doda.relacion_salida drs, kpi.transportes t2, kpi.cargueros c2, master_ge.master_pedimentos p
      WHERE dp.xt_pedimento = rsp.xt_pedimento
      AND rsp.xt_relacion_salida in (
        SELECT rs.xt_relacion_salida FROM doda.relacion_salida rs WHERE rs.xt_numero_integracion in (
          SELECT 
            t.doda
          FROM kpi.transportes t
          WHERE t.carguero_id IN (
            SELECT c.id
            FROM kpi.cargueros c
            WHERE DATE(c.eta) >= ? AND DATE(c.eta) <= ?
          )
        )
      )
      AND drs.xt_relacion_salida = rsp.xt_relacion_salida
      AND t2.doda = drs.xt_numero_integracion
      AND c2.id = t2.carguero_id
      AND p.xt_referencia = dp.xt_referencia
    `, [desde, hasta]);

    console.log('Referencias obtenidas para exportación:', referencias.length, 'registros');
    
    const referenciasSheet = workbook.addWorksheet('Referencias');
    referenciasSheet.columns = [
      { header: 'Referencia', key: 'referencia', width: 30 },
      { header: 'Carguero_ID', key: 'carguero_id', width: 14 },
      { header: 'DODA', key: 'doda', width: 24 },
      { header: 'Pedimento', key: 'pedimento', width: 20 },
      { header: 'Aduana', key: 'aduana', width: 18 },
      { header: 'Importador', key: 'importador', width: 32 },
      { header: 'Cadena Comercial', key: 'cadena', width: 20 },
      { header: 'Fecha Pago', key: 'fecha_pago', width: 22, style: { numFmt: 'dd/mm/yyyy hh:mm:ss' } },
      { header: 'Fecha Cruce', key: 'fecha_cruce', width: 22, style: { numFmt: 'dd/mm/yyyy hh:mm:ss' } },
      { header: 'Bultos', key: 'bultos', width: 22 },
      { header: 'Semaforo', key: 'semaforo_1', width: 22 },
      { header: 'Pago Anticipado', key: 'fr', width: 22 },
      { header: 'Profepa', key: 't9', width: 22 },
      { header: 'Permiso automatico', key: 'c1', width: 22 },
      { header: 'Cuenta Aduanera', key: 'cuenta_aduanera', width: 22 },
      { header: 'Tipo Mercancia', key: 'material', width: 22 },
      { header: 'Control Calidad', key: 'control_calidad', width: 22 },
    ];

    for (const row of referencias) {
      const datosOracle = await oracleDB.execute(`
          SELECT DISTINCT 
            p.clavex, 
            TRIM(p.referencia) AS REFERENCIA, 
            c.nombre AS cliente, 
            pr.nombre AS proveedor,
            (SELECT clave || '-' || id_caso FROM pedimento.casos_g WHERE referencia = p.referencia AND clave = 'FR' AND id_caso = '1') AS clave,
            (SELECT DISTINCT PR.CLAVE FROM PEDIMENTO.PERMISOS PR WHERE PR.REFERENCIA = P.REFERENCIA AND PR.CLAVE = 'T9') AS T9,
            (SELECT DISTINCT PR.CLAVE FROM PEDIMENTO.PERMISOS PR WHERE PR.REFERENCIA = P.REFERENCIA AND PR.CLAVE = 'C1') AS C1,
            (SELECT DISTINCT (CLAVE) FROM PEDIMENTO.CASOS_P WHERE REFERENCIA = P.REFERENCIA AND CLAVE IN ('GA')) AS CLAVE_GA,
            mr.marcas AS bultos, 
            p.fecha_pago AS pago,
            tc.SEM_TRAFICOCRUCE AS semaforo
          FROM pedimento.pedimentos p
          INNER JOIN pedimento.cliente c ON p.cliente = c.cliente
          INNER JOIN pedimento.facturas f ON p.referencia = f.referencia AND p.clavex = f.clavex
          INNER JOIN pedimento.proveedor pr ON f.provee = pr.provee
          INNER JOIN pedimento.marcas mr ON p.referencia = mr.referencia AND p.clavex = mr.clavex
          INNER JOIN pedimento.nfirbank fb ON p.clavex = fb.clavex AND p.pedimento = fb.pedimento
          -- NUEVO: Traemos el sem·foro mediante un LEFT JOIN para que no excluya filas si no encuentra la referencia
          LEFT JOIN scia.T_TRAFICOCRUCE tc ON tc.NTR_TRAFICOCRUCE = trim(p.referencia)
          WHERE  c.rfc IN (
            'ZME920824KM3', 'BME0004112J6', 'P&B0108104K7', 'OME0107208X5', 'TME030710K69', 
            'ZHM040609ES5', 'MDM041221RJ3', 'UME091026UT6', 'SME111206QU5', 'NCG131029SK3', 
            'RME140210IY5', 'FGM150917IPA'
          )
          AND p.referencia = '${row.referencia}'
      `);

      let datosO = datosOracle.rows || [];

      if (datosOracle.metaData && Array.isArray(datosO[0])) {
        datosO = datosO.map(row => {
          const obj = {};
          datosOracle.metaData.forEach((col, i) => { obj[col.name] = row[i]; });
          return obj;
        });
      }

      console.log('Datos Oracle para referencia', row.referencia, ':', datosO);

      referenciasSheet.addRow({
        referencia: row.referencia,
        carguero_id: row.carguero_id,
        doda: row.doda ? row.doda.trim() : '',
        pedimento: row.pedimento,
        aduana: row.aduana || '',
        importador: row.importador || '',
        cadena: row.cadena || '',
        fecha_pago: parseExcelDate(row.fecha_pago),
        fecha_cruce: parseExcelDate(row.fecha_cruce),
        bultos: datosO[0]?.BULTOS || '',
        semaforo_1: row.semaforo_1 || '',
        fr: datosO[0]?.CLAVE || '',
        t9: datosO[0]?.T9 || '',
        c1: datosO[0]?.C1 || '',
        cuenta_aduanera: datosO[0]?.CLAVE_GA || '',
        material: row.material || '',
        control_calidad: '', // Aquí puedes agregar la lógica para obtener el control de calidad si es necesario
      });
    };

    const [incidencias_cargueros] = await db.query(`
      SELECT
        i.carguero_id,
        ci.incidencia
      FROM kpi.cargueros_incidencias i, kpi.catalogo_incidencias ci
      WHERE i.carguero_id IN (
        SELECT c.id
        FROM kpi.cargueros c
        WHERE DATE(c.eta) >= ? AND DATE(c.eta) <= ?
      )
      AND ci.id = i.incidencia_id 
    `, [desde, hasta]);

    const incidenciasSheet = workbook.addWorksheet('Incidencias Cargueros');
    incidenciasSheet.columns = [
      { header: 'Carguero_ID', key: 'carguero_id', width: 14 },
      { header: 'Incidencia', key: 'incidencia', width: 50 },
    ];

    incidencias_cargueros.forEach((row) => {
      incidenciasSheet.addRow({
        carguero_id: row.carguero_id,
        incidencia: row.incidencia
      });
    });

    
    const [incidencias_transportes] = await db.query(`
      	SELECT
          t2.carguero_id,
          t2.doda,
          cit.incidencia,
          ti.transporte_id
        FROM kpi.transportes_incidencias ti, kpi.catalogo_incidencias_transporte cit, kpi.transportes t2
        WHERE ti.transporte_id IN (
          SELECT 
              t.transporte_id
            FROM kpi.transportes t
            WHERE t.carguero_id IN (
              SELECT c.id
              FROM kpi.cargueros c
              WHERE DATE(c.eta) >= ? AND DATE(c.eta) <= ?
            )
        )
        AND cit.id = ti.incidencia_id
        AND t2.transporte_id = ti.transporte_id
    `, [desde, hasta]);

    const incidenciasTransportesSheet = workbook.addWorksheet('Incidencias Transportes');
    incidenciasTransportesSheet.columns = [
      { header: 'DODA', key: 'doda', width: 14 },
      { header: 'Incidencia', key: 'incidencia', width: 50 },
    ];

    incidencias_transportes.forEach((row) => {
      incidenciasTransportesSheet.addRow({
        doda: row.doda,
        incidencia: row.incidencia
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="cargueros_${desde}_${hasta}.xlsx"`);
    res.send(buffer);
    
  } catch (error) {
    console.error('Error al exportar cargueros:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
  
};

exports.getIncidenciasTransportesExcel = async (req, res) => {
  const { desde, hasta } = req.query;

  if (!desde || !hasta) {
    return res.status(400).json({ message: 'Parámetros desde y hasta son requeridos' });
  }

  console.log('Exportando incidencias de cargueros desde:', desde, 'hasta:', hasta);
  
  const desdeDate = new Date(desde);
  const hastaDate = new Date(hasta);

  if (isNaN(desdeDate.getTime()) || isNaN(hastaDate.getTime())) {
    return res.status(400).json({ message: 'Fechas inválidas' });
  }

  try {/*
    console.log(`
      	SELECT
          t2.carguero_id,
          t2.doda,
          cit.incidencia,
          ti.transporte_id
        FROM kpi.transportes_incidencias ti, kpi.catalogo_incidencias_transporte cit, kpi.transportes t2
        WHERE ti.transporte_id IN (
          SELECT 
              t.transporte_id
            FROM kpi.transportes t
            WHERE t.carguero_id IN (
              SELECT c.id
              FROM kpi.cargueros c
              WHERE DATE(c.eta) >= '${desde}' AND DATE(c.eta) <= '${hasta}'
            )
        )
        AND cit.id = ti.incidencia_id
        AND t2.transporte_id = ti.transporte_id
    `)*/
    const [incidencias_transportes] = await db.query(`
      	SELECT
          t2.carguero_id,
          t2.doda,
          cit.incidencia,
          ti.transporte_id
        FROM kpi.transportes_incidencias ti, kpi.catalogo_incidencias_transporte cit, kpi.transportes t2
        WHERE ti.transporte_id IN (
          SELECT 
              t.transporte_id
            FROM kpi.transportes t
            WHERE t.carguero_id IN (
              SELECT c.id
              FROM kpi.cargueros c
              WHERE DATE(c.eta) >= ? AND DATE(c.eta) <= ?
            )
        )
        AND cit.id = ti.incidencia_id
        AND t2.transporte_id = ti.transporte_id
    `, [desde, hasta]);

    console.log('Incidencias transportes obtenidas:', incidencias_transportes.length, 'registros');

    return res.status(200).json({ status: 'success', data: incidencias_transportes });
    
  } catch (error) {
    console.error('Error obtener incidencias transportes:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.getIncidenciasCargerosExcel = async (req, res) => {
  const { desde, hasta } = req.query;

  if (!desde || !hasta) {
    return res.status(400).json({ message: 'Parámetros desde y hasta son requeridos' });
  }

  console.log('Exportando incidencias de cargueros desde:', desde, 'hasta:', hasta);
  
  const desdeDate = new Date(desde);
  const hastaDate = new Date(hasta);

  if (isNaN(desdeDate.getTime()) || isNaN(hastaDate.getTime())) {
    return res.status(400).json({ message: 'Fechas inválidas' });
  }

  try {/*
    console.log(`
      SELECT
        i.carguero_id,
        ci.incidencia
      FROM kpi.cargueros_incidencias i, kpi.catalogo_incidencias ci
      WHERE i.carguero_id IN (
        SELECT c.id
        FROM kpi.cargueros c
        WHERE DATE(c.eta) >= '${desde}' AND DATE(c.eta) <= '${hasta}'
      )
      AND ci.id = i.incidencia_id 
    `)*/
    const [incidencias_cargueros] = await db.query(`
      SELECT
        i.carguero_id,
        ci.incidencia
      FROM kpi.cargueros_incidencias i, kpi.catalogo_incidencias ci
      WHERE i.carguero_id IN (
        SELECT c.id
        FROM kpi.cargueros c
        WHERE DATE(c.eta) >= ? AND DATE(c.eta) <= ?
      )
      AND ci.id = i.incidencia_id 
    `, [desde, hasta]);

    console.log('Incidencias cargueros obtenidas:', incidencias_cargueros.length, 'registros');

    return res.status(200).json({ status: 'success', data: incidencias_cargueros });
    
  } catch (error) {
    console.error('Error obtener incidencias cargueros:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.getReferenciaOracleExcel = async (req, res) => {
  const { referencia } = req.query;

  if (!referencia) {
    return res.status(400).json({ message: 'El parámetro de referencia es requerido' });
  }

  try {/*
    console.log(`
      SELECT DISTINCT 
        p.clavex, 
        TRIM(p.referencia) AS REFERENCIA, 
        c.nombre AS cliente, 
        pr.nombre AS proveedor,
        (SELECT clave || '-' || id_caso FROM pedimento.casos_g WHERE referencia = p.referencia AND clave = 'FR' AND id_caso = '1') AS clave,
        (SELECT DISTINCT PR.CLAVE FROM PEDIMENTO.PERMISOS PR WHERE PR.REFERENCIA = P.REFERENCIA AND PR.CLAVE = 'T9') AS T9,
        (SELECT DISTINCT PR.CLAVE FROM PEDIMENTO.PERMISOS PR WHERE PR.REFERENCIA = P.REFERENCIA AND PR.CLAVE = 'C1') AS C1,
        (SELECT DISTINCT (CLAVE) FROM PEDIMENTO.CASOS_P WHERE REFERENCIA = P.REFERENCIA AND CLAVE IN ('GA')) AS CLAVE_GA,
        mr.marcas AS bultos, 
        p.fecha_pago AS pago,
        tc.SEM_TRAFICOCRUCE AS semaforo
      FROM pedimento.pedimentos p
      INNER JOIN pedimento.cliente c ON p.cliente = c.cliente
      INNER JOIN pedimento.facturas f ON p.referencia = f.referencia AND p.clavex = f.clavex
      INNER JOIN pedimento.proveedor pr ON f.provee = pr.provee
      INNER JOIN pedimento.marcas mr ON p.referencia = mr.referencia AND p.clavex = mr.clavex
      INNER JOIN pedimento.nfirbank fb ON p.clavex = fb.clavex AND p.pedimento = fb.pedimento
      -- NUEVO: Traemos el sem·foro mediante un LEFT JOIN para que no excluya filas si no encuentra la referencia
      LEFT JOIN scia.T_TRAFICOCRUCE tc ON tc.NTR_TRAFICOCRUCE = trim(p.referencia)
      WHERE  c.rfc IN (
        'ZME920824KM3', 'BME0004112J6', 'P&B0108104K7', 'OME0107208X5', 'TME030710K69', 
        'ZHM040609ES5', 'MDM041221RJ3', 'UME091026UT6', 'SME111206QU5', 'NCG131029SK3', 
        'RME140210IY5', 'FGM150917IPA'
      )
      AND p.referencia = '${referencia}'
    `);*/
    const resultadoOracle = await oracleDB.execute(`
          SELECT DISTINCT 
            p.clavex, 
            TRIM(p.referencia) AS REFERENCIA, 
            c.nombre AS cliente, 
            pr.nombre AS proveedor,
            (SELECT clave || '-' || id_caso FROM pedimento.casos_g WHERE referencia = p.referencia AND clave = 'FR' AND id_caso = '1') AS clave,
            (SELECT DISTINCT PR.CLAVE FROM PEDIMENTO.PERMISOS PR WHERE PR.REFERENCIA = P.REFERENCIA AND PR.CLAVE = 'T9') AS T9,
            (SELECT DISTINCT PR.CLAVE FROM PEDIMENTO.PERMISOS PR WHERE PR.REFERENCIA = P.REFERENCIA AND PR.CLAVE = 'C1') AS C1,
            (SELECT DISTINCT (CLAVE) FROM PEDIMENTO.CASOS_P WHERE REFERENCIA = P.REFERENCIA AND CLAVE IN ('GA')) AS CLAVE_GA,
            mr.marcas AS bultos, 
            p.fecha_pago AS pago,
            tc.SEM_TRAFICOCRUCE AS semaforo
          FROM pedimento.pedimentos p
          INNER JOIN pedimento.cliente c ON p.cliente = c.cliente
          INNER JOIN pedimento.facturas f ON p.referencia = f.referencia AND p.clavex = f.clavex
          INNER JOIN pedimento.proveedor pr ON f.provee = pr.provee
          INNER JOIN pedimento.marcas mr ON p.referencia = mr.referencia AND p.clavex = mr.clavex
          INNER JOIN pedimento.nfirbank fb ON p.clavex = fb.clavex AND p.pedimento = fb.pedimento
          -- NUEVO: Traemos el sem·foro mediante un LEFT JOIN para que no excluya filas si no encuentra la referencia
          LEFT JOIN scia.T_TRAFICOCRUCE tc ON tc.NTR_TRAFICOCRUCE = trim(p.referencia)
          WHERE  c.rfc IN (
            'ZME920824KM3', 'BME0004112J6', 'P&B0108104K7', 'OME0107208X5', 'TME030710K69', 
            'ZHM040609ES5', 'MDM041221RJ3', 'UME091026UT6', 'SME111206QU5', 'NCG131029SK3', 
            'RME140210IY5', 'FGM150917IPA'
          )
          AND p.referencia = :referencia
      `, { referencia });

    let datosOracle = resultadoOracle.rows || [];

    // Si Oracle devuelve filas como arreglos, se convierten a objetos usando
    // los nombres de columna para que el frontend pueda leer BULTOS, CLAVE, etc.
    if (resultadoOracle.metaData && Array.isArray(datosOracle[0])) {
      datosOracle = datosOracle.map(fila => {
        const dato = {};
        resultadoOracle.metaData.forEach((columna, indice) => {
          dato[columna.name] = fila[indice];
        });
        return dato;
      });
    }


    console.log('Referencia oracle obtenida: ', referencia);

    return res.status(200).json({ status: 'success', data: datosOracle });
    
  } catch (error) {
    console.error('Error obtener referencia Oracle:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.getReferenciasExcel = async (req, res) => {
  const { desde, hasta } = req.query;

  if (!desde || !hasta) {
    return res.status(400).json({ message: 'Parámetros desde y hasta son requeridos' });
  }

  console.log('Exportando referencias desde:', desde, 'hasta:', hasta);
  
  const desdeDate = new Date(desde);
  const hastaDate = new Date(hasta);

  if (isNaN(desdeDate.getTime()) || isNaN(hastaDate.getTime())) {
    return res.status(400).json({ message: 'Fechas inválidas' });
  }

  try {/*
    console.log(`
      SELECT
        dp.xt_referencia,
        t.carguero_id,
        rs.xt_numero_integracion AS doda,
        rsp.xt_pedimento,
        c.aduana,
        p.xt_nombre as importador,
        
        CASE 
            WHEN p.xt_rfcCausante = 'FGM150917IPA' THEN 'SIN CADENA'
            WHEN p.xt_rfcCausante = 'ZHM040609ES5' THEN 'ZARA HOME'
            WHEN p.xt_rfcCausante = 'ZME920824KM3' THEN 'ZARA MEXICO'
            WHEN p.xt_rfcCausante = 'BME0004112J6' AND (SELECT GROUP_CONCAT(DISTINCT pc3.xt_nombre SEPARATOR ', ') FROM master_ge.master_coves pc3 WHERE pc3.xt_referencia = p.xt_referencia) like '%NIKOLE%' THEN 'LEFTIES'
            WHEN p.xt_rfcCausante = 'BME0004112J6' AND (SELECT GROUP_CONCAT(DISTINCT pc3.xt_nombre SEPARATOR ', ') FROM master_ge.master_coves pc3 WHERE pc3.xt_referencia = p.xt_referencia) like '%PULL & BEAR%' THEN 'PULL & BEAR'
            WHEN p.xt_rfcCausante = 'BME0004112J6' AND (SELECT GROUP_CONCAT(DISTINCT pc3.xt_nombre SEPARATOR ', ') FROM master_ge.master_coves pc3 WHERE pc3.xt_referencia = p.xt_referencia) like '%DUTTI%' THEN 'MASSIMO DUTTI'
            WHEN p.xt_rfcCausante = 'BME0004112J6' AND (SELECT GROUP_CONCAT(DISTINCT pc3.xt_nombre SEPARATOR ', ') FROM master_ge.master_coves pc3 WHERE pc3.xt_referencia = p.xt_referencia) like '%BERSHKA%' THEN 'BERSHKA '
            WHEN p.xt_rfcCausante = 'BME0004112J6' AND (SELECT GROUP_CONCAT(DISTINCT pc3.xt_nombre SEPARATOR ', ') FROM master_ge.master_coves pc3 WHERE pc3.xt_referencia = p.xt_referencia) like '%STRADIVARIUS%' THEN 'STRADIVARIUS '
            WHEN p.xt_rfcCausante = 'BME0004112J6' AND (SELECT GROUP_CONCAT(DISTINCT pc3.xt_nombre SEPARATOR ', ') FROM master_ge.master_coves pc3 WHERE pc3.xt_referencia = p.xt_referencia) like '%OYSHO%' THEN 'OYSHO'
            WHEN p.xt_rfcCausante = 'BME0004112J6' AND (SELECT GROUP_CONCAT(DISTINCT pc3.xt_nombre SEPARATOR ', ') FROM master_ge.master_coves pc3 WHERE pc3.xt_referencia = p.xt_referencia) like '%TEMPE%' THEN 'TEMPE'
            WHEN p.xt_rfcCausante = 'BME0004112J6' AND (SELECT GROUP_CONCAT(DISTINCT pc3.xt_nombre SEPARATOR ', ') FROM master_ge.master_coves pc3 WHERE pc3.xt_referencia = p.xt_referencia) like '%ITX MERKEN%' THEN 'BERSHKA'
            WHEN p.xt_rfcCausante = 'BME0004112J6' AND (SELECT GROUP_CONCAT(DISTINCT pc3.xt_nombre SEPARATOR ', ') FROM master_ge.master_coves pc3 WHERE pc3.xt_referencia = p.xt_referencia) like '%DISENO TEXTIL%' THEN 'BERSHKA'
            WHEN p.xt_rfcCausante = 'BME0004112J6' AND (SELECT GROUP_CONCAT(DISTINCT pc3.xt_nombre SEPARATOR ', ') FROM master_ge.master_coves pc3 WHERE pc3.xt_referencia = p.xt_referencia) like '%JOVENMODA%' THEN 'BERSHKA'
            ELSE 'OTRA CADENA' -- Es buena práctica poner un ELSE por si no cumple ninguna
        END AS cadena,
        
        DATE_FORMAT(p.xd_fechaPago, '%Y-%m-%d %H:%i:%s') as fecha_pago,
        DATE_FORMAT(p.xd_fechaCruce, '%Y-%m-%d %H:%i:%s') as fecha_cruce,
        
        CASE 
            WHEN SUBSTRING((SELECT GROUP_CONCAT(DISTINCT fc.xt_factura SEPARATOR ', ') FROM master_ge.master_facturas_cove fc WHERE fc.xt_referencia = p.xt_referencia), 1,2) = '07' THEN 'Cosméticos'
            WHEN SUBSTRING((SELECT GROUP_CONCAT(DISTINCT fc.xt_factura SEPARATOR ', ') FROM master_ge.master_facturas_cove fc WHERE fc.xt_referencia = p.xt_referencia), 1,2) = '03' THEN 'Cosméticos'
            WHEN SUBSTRING((SELECT GROUP_CONCAT(DISTINCT fc.xt_factura SEPARATOR ', ') FROM master_ge.master_facturas_cove fc WHERE fc.xt_referencia = p.xt_referencia), 1,2) = '61' THEN 'Material'
            ELSE 'Textil' -- Es buena pr·ctica poner un ELSE por si no cumple ninguna
        END AS material,
        
        sc.xt_semaforo_1
      FROM kpi.cargueros c
      INNER JOIN kpi.transportes t 
          ON t.carguero_id = c.id
      INNER JOIN doda.relacion_salida rs 
          ON rs.xt_numero_integracion = t.doda
      INNER JOIN doda.relacion_salida_pedimentos rsp 
          ON rsp.xt_relacion_salida = rs.xt_relacion_salida
      INNER JOIN doda.pedimentos dp 
          ON dp.xt_pedimento = rsp.xt_pedimento
      INNER JOIN master_ge.master_pedimentos p 
          ON p.xt_referencia = dp.xt_referencia
      LEFT JOIN master_ge.master_semaforo_cruces sc
          ON sc.xt_referencia = dp.xt_referencia 
      WHERE DATE(c.eta) >= '${desde}' AND DATE(c.eta) <= '${hasta}'
    `)*/
    const [referencias] = await db.query(`
      SELECT
        dp.xt_referencia as referencia,
        t.carguero_id,
        rs.xt_numero_integracion AS doda,
        rsp.xt_pedimento as pedimento,
        c.aduana,
        p.xt_nombre as importador,
        
        CASE 
            WHEN p.xt_rfcCausante = 'FGM150917IPA' THEN 'SIN CADENA'
            WHEN p.xt_rfcCausante = 'ZHM040609ES5' THEN 'ZARA HOME'
            WHEN p.xt_rfcCausante = 'ZME920824KM3' THEN 'ZARA MEXICO'
            WHEN p.xt_rfcCausante = 'BME0004112J6' AND (SELECT GROUP_CONCAT(DISTINCT pc3.xt_nombre SEPARATOR ', ') FROM master_ge.master_coves pc3 WHERE pc3.xt_referencia = p.xt_referencia) like '%NIKOLE%' THEN 'LEFTIES'
            WHEN p.xt_rfcCausante = 'BME0004112J6' AND (SELECT GROUP_CONCAT(DISTINCT pc3.xt_nombre SEPARATOR ', ') FROM master_ge.master_coves pc3 WHERE pc3.xt_referencia = p.xt_referencia) like '%PULL & BEAR%' THEN 'PULL & BEAR'
            WHEN p.xt_rfcCausante = 'BME0004112J6' AND (SELECT GROUP_CONCAT(DISTINCT pc3.xt_nombre SEPARATOR ', ') FROM master_ge.master_coves pc3 WHERE pc3.xt_referencia = p.xt_referencia) like '%DUTTI%' THEN 'MASSIMO DUTTI'
            WHEN p.xt_rfcCausante = 'BME0004112J6' AND (SELECT GROUP_CONCAT(DISTINCT pc3.xt_nombre SEPARATOR ', ') FROM master_ge.master_coves pc3 WHERE pc3.xt_referencia = p.xt_referencia) like '%BERSHKA%' THEN 'BERSHKA '
            WHEN p.xt_rfcCausante = 'BME0004112J6' AND (SELECT GROUP_CONCAT(DISTINCT pc3.xt_nombre SEPARATOR ', ') FROM master_ge.master_coves pc3 WHERE pc3.xt_referencia = p.xt_referencia) like '%STRADIVARIUS%' THEN 'STRADIVARIUS '
            WHEN p.xt_rfcCausante = 'BME0004112J6' AND (SELECT GROUP_CONCAT(DISTINCT pc3.xt_nombre SEPARATOR ', ') FROM master_ge.master_coves pc3 WHERE pc3.xt_referencia = p.xt_referencia) like '%OYSHO%' THEN 'OYSHO'
            WHEN p.xt_rfcCausante = 'BME0004112J6' AND (SELECT GROUP_CONCAT(DISTINCT pc3.xt_nombre SEPARATOR ', ') FROM master_ge.master_coves pc3 WHERE pc3.xt_referencia = p.xt_referencia) like '%TEMPE%' THEN 'TEMPE'
            WHEN p.xt_rfcCausante = 'BME0004112J6' AND (SELECT GROUP_CONCAT(DISTINCT pc3.xt_nombre SEPARATOR ', ') FROM master_ge.master_coves pc3 WHERE pc3.xt_referencia = p.xt_referencia) like '%ITX MERKEN%' THEN 'BERSHKA'
            WHEN p.xt_rfcCausante = 'BME0004112J6' AND (SELECT GROUP_CONCAT(DISTINCT pc3.xt_nombre SEPARATOR ', ') FROM master_ge.master_coves pc3 WHERE pc3.xt_referencia = p.xt_referencia) like '%DISENO TEXTIL%' THEN 'BERSHKA'
            WHEN p.xt_rfcCausante = 'BME0004112J6' AND (SELECT GROUP_CONCAT(DISTINCT pc3.xt_nombre SEPARATOR ', ') FROM master_ge.master_coves pc3 WHERE pc3.xt_referencia = p.xt_referencia) like '%JOVENMODA%' THEN 'BERSHKA'
            ELSE 'OTRA CADENA' -- Es buena práctica poner un ELSE por si no cumple ninguna
        END AS cadena,
        
        DATE_FORMAT(p.xd_fechaPago, '%Y-%m-%d %H:%i:%s') as fecha_pago,
        DATE_FORMAT(p.xd_fechaCruce, '%Y-%m-%d %H:%i:%s') as fecha_cruce,
        
        CASE 
            WHEN SUBSTRING((SELECT GROUP_CONCAT(DISTINCT fc.xt_factura SEPARATOR ', ') FROM master_ge.master_facturas_cove fc WHERE fc.xt_referencia = p.xt_referencia), 1,2) = '07' THEN 'Cosméticos'
            WHEN SUBSTRING((SELECT GROUP_CONCAT(DISTINCT fc.xt_factura SEPARATOR ', ') FROM master_ge.master_facturas_cove fc WHERE fc.xt_referencia = p.xt_referencia), 1,2) = '03' THEN 'Cosméticos'
            WHEN SUBSTRING((SELECT GROUP_CONCAT(DISTINCT fc.xt_factura SEPARATOR ', ') FROM master_ge.master_facturas_cove fc WHERE fc.xt_referencia = p.xt_referencia), 1,2) = '61' THEN 'Material'
            ELSE 'Textil' -- Es buena pr·ctica poner un ELSE por si no cumple ninguna
        END AS material,
        
        sc.xt_semaforo_1 AS semaforo_1
      FROM kpi.cargueros c
      INNER JOIN kpi.transportes t 
          ON t.carguero_id = c.id
      INNER JOIN doda.relacion_salida rs 
          ON rs.xt_numero_integracion = t.doda
      INNER JOIN doda.relacion_salida_pedimentos rsp 
          ON rsp.xt_relacion_salida = rs.xt_relacion_salida
      INNER JOIN doda.pedimentos dp 
          ON dp.xt_pedimento = rsp.xt_pedimento
      INNER JOIN master_ge.master_pedimentos p 
          ON p.xt_referencia = dp.xt_referencia
      LEFT JOIN master_ge.master_semaforo_cruces sc
          ON sc.xt_referencia = dp.xt_referencia 
      WHERE DATE(c.eta) >= ? AND DATE(c.eta) <= ?
    `, [desde, hasta]);

    console.log('Referencias obtenidas: ', referencias.length, 'registros');

    return res.status(200).json({ status: 'success', data: referencias });
    
  } catch (error) {
    console.error('Error obtener referencias:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.getTransportesExcel = async (req, res) => {
  const { desde, hasta } = req.query;

  if (!desde || !hasta) {
    return res.status(400).json({ message: 'Parámetros desde y hasta son requeridos' });
  }

  console.log('Exportando transportes desde:', desde, 'hasta:', hasta);
  
  const desdeDate = new Date(desde);
  const hastaDate = new Date(hasta);

  if (isNaN(desdeDate.getTime()) || isNaN(hastaDate.getTime())) {
    return res.status(400).json({ message: 'Fechas inválidas' });
  }

  try {/*
    console.log(`
      SELECT 
        t.doda, 
        t.carguero_id,
        t.destino,
        (SELECT ct.xt_nombre FROM doda.catalogo_transportistas ct WHERE ct.xt_caat = (SELECT rs.xt_caat FROM doda.relacion_salida rs WHERE rs.xt_numero_integracion = t.doda) AND XT_OFICINA = 'CDMX' LIMIT 1) as transporte_nombre
      FROM kpi.transportes t
      WHERE t.carguero_id IN (
        SELECT c.id
        FROM kpi.cargueros c
        WHERE DATE(c.eta) >= ${desde} AND DATE(c.eta) <= ${hasta}
      )
      ORDER BY t.transporte_id
    `);*/
    const [transportes] = await db.query(`
      SELECT 
        t.doda, 
        t.carguero_id,
        t.destino,
        (SELECT ct.xt_nombre FROM doda.catalogo_transportistas ct WHERE ct.xt_caat = (SELECT rs.xt_caat FROM doda.relacion_salida rs WHERE rs.xt_numero_integracion = t.doda) AND XT_OFICINA = 'CDMX' LIMIT 1) as transporte_nombre
      FROM kpi.transportes t
      WHERE t.carguero_id IN (
        SELECT c.id
        FROM kpi.cargueros c
        WHERE DATE(c.eta) >= ? AND DATE(c.eta) <= ?
      )
      ORDER BY t.transporte_id
    `, [desde, hasta]);

    console.log('Transportes obtenidos: ', transportes.length, 'registros');

    return res.status(200).json({ status: 'success', data: transportes });
    
  } catch (error) {
    console.error('Error obtener transportes:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.getCarguerosExcel = async (req, res) => {
  const { desde, hasta } = req.query;

  if (!desde || !hasta) {
    return res.status(400).json({ message: 'Parámetros desde y hasta son requeridos' });
  }

  console.log('Exportando cargueros desde:', desde, 'hasta:', hasta);
  
  const desdeDate = new Date(desde);
  const hastaDate = new Date(hasta);

  if (isNaN(desdeDate.getTime()) || isNaN(hastaDate.getTime())) {
    return res.status(400).json({ message: 'Fechas inválidas' });
  }

  try {/*
    console.log(`
      SELECT c.id, c.carguero_id, cat.carguero,
        DATE_FORMAT(c.eta, '%Y-%m-%d %H:%i:%s') AS eta,
        DATE_FORMAT(c.llegada_real, '%Y-%m-%d %H:%i:%s') AS llegada_real,
        DATE_FORMAT(c.ultima_charola, '%Y-%m-%d %H:%i:%s') AS ultima_charola,
        c.aduana, c.almacen
      FROM kpi.cargueros c
      JOIN kpi.catalogo_carguero cat ON c.carguero_id = cat.id
      WHERE DATE(c.eta) >= '${desde}' AND DATE(c.eta) <= '${hasta}'
      ORDER BY c.eta DESC
    `);*/
    const [datos] = await db.query(`
      SELECT c.id, c.carguero_id, cat.carguero,
        DATE_FORMAT(c.eta, '%Y-%m-%d %H:%i:%s') AS eta,
        DATE_FORMAT(c.llegada_real, '%Y-%m-%d %H:%i:%s') AS llegada_real,
        DATE_FORMAT(c.ultima_charola, '%Y-%m-%d %H:%i:%s') AS ultima_charola,
        c.aduana, c.almacen
      FROM kpi.cargueros c
      JOIN kpi.catalogo_carguero cat ON c.carguero_id = cat.id
      WHERE DATE(c.eta) >= ? AND DATE(c.eta) <= ?
      ORDER BY c.eta DESC
    `, [desde, hasta]);

    console.log('Cargueros obtenidos: ', datos.length, 'registros');

    return res.status(200).json({ status: 'success', data: datos });
    
  } catch (error) {
    console.error('Error obtener cargueros:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};


exports.createNewCarguero = async (req, res) => {
  const { carguero_id, eta, llegada_real, ultima_charola, aduana, almacen } = req.body;

  if (!carguero_id || !eta || !llegada_real || !ultima_charola || !aduana || !almacen) {
    return res.status(400).json({ message: 'Todos los campos son requeridos: carguero_id, eta, llegada_real, ultima_charola, aduana, almacen' });
  }

  // Validar que las fechas sean válidas y que ultima_charola no sea anterior a llegada_real
  const etaDate = new Date(eta);
  const llegadaDate = new Date(llegada_real);
  const ultimaCharolaDate = new Date(ultima_charola);
  if (isNaN(llegadaDate.getTime()) || isNaN(ultimaCharolaDate.getTime()) || isNaN(etaDate.getTime())) {
    return res.status(400).json({ message: 'Fechas inválidas' });
  }

  if (ultimaCharolaDate < llegadaDate) {
    return res.status(400).json({ message: 'La fecha de última charola no puede ser anterior a la fecha de llegada real' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO kpi.cargueros (carguero_id, eta, llegada_real, ultima_charola, aduana, almacen) VALUES (?, ?, ?, ?, ?, ?)',
      [carguero_id, eta, llegada_real, ultima_charola, aduana, almacen]
    );

    const [created] = await db.query(`
      SELECT c.id, c.carguero_id, cat.carguero, c.eta, c.llegada_real, c.ultima_charola, c.aduana, c.almacen
      FROM kpi.cargueros c
      JOIN kpi.catalogo_carguero cat ON c.carguero_id = cat.id
      WHERE c.id = ?
    `, [result.insertId]);

    if (created.length === 0) {
      return res.status(500).json({ message: 'No se pudo crear el carguero' });
    }

    if(llegadaDate > etaDate) {
      await db.query(
        'INSERT INTO kpi.cargueros_incidencias (carguero_id, incidencia_id) VALUES (?, ?)',
        [result.insertId, 5] // 5 = Incidencia Retraso llegada de vuelo
      );
    }

    res.status(201).json({ status: 'success', data: created[0] });
  } catch (error) {
    console.error('Error al crear carguero:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.updateCarguero = async (req, res) => {
  const { id, carguero_id, eta, llegada_real, ultima_charola, aduana, almacen } = req.body;

  if (!id || !carguero_id || !eta || !llegada_real || !ultima_charola || !aduana || !almacen) {
    return res.status(400).json({ message: 'Todos los campos son requeridos: id, carguero_id, eta, llegada_real, ultima_charola, aduana, almacen' });
  }

  const etaDate = new Date(eta);
  const llegadaDate = new Date(llegada_real);
  const ultimaCharolaDate = new Date(ultima_charola);
  if (isNaN(llegadaDate.getTime()) || isNaN(ultimaCharolaDate.getTime()) || isNaN(etaDate.getTime())) {
    return res.status(400).json({ message: 'Fechas inválidas' });
  }

  if (ultimaCharolaDate < llegadaDate) {
    return res.status(400).json({ message: 'La fecha de última charola no puede ser anterior a la fecha de llegada real' });
  }

  try {
    const [result] = await db.query(
      'UPDATE kpi.cargueros SET carguero_id = ?, eta = ?, llegada_real = ?, ultima_charola = ?, aduana = ?, almacen = ? WHERE id = ?',
      [carguero_id, eta, llegada_real, ultima_charola, aduana, almacen, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No se encontró el carguero a actualizar' });
    }

    const [updated] = await db.query(`
      SELECT c.id, c.carguero_id, cat.carguero, c.eta, c.llegada_real, c.ultima_charola, c.aduana, c.almacen,
        (SELECT count(t.doda) FROM kpi.transportes t WHERE t.carguero_id = c.id) as dodas_asignados
      FROM kpi.cargueros c
      JOIN kpi.catalogo_carguero cat ON c.carguero_id = cat.id
      WHERE c.id = ?
    `, [id]);

    if (updated.length === 0) {
      return res.status(500).json({ message: 'No se pudo recuperar el carguero actualizado' });
    }

    res.status(200).json({ status: 'success', data: updated[0] });
  } catch (error) {
    console.error('Error al actualizar carguero:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.getCatalogoIncidencias = async (req, res) => {
  try {
    const [datos] = await db.query('SELECT id, codigo, incidencia FROM kpi.catalogo_incidencias ORDER BY codigo');
    if (datos.length === 0) {
      return res.status(404).json({ message: 'No se encontraron incidencias' });
    }

    res.status(200).json({ status: 'success', data: datos });
  } catch (error) {
    console.error('Error al obtener incidencias:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.getIncidenciasPorCarguero = async (req, res) => {
  const { cargueroId } = req.query;
  if (!cargueroId) return res.status(400).json({ message: 'Falta cargueroId' });

  try {
    const [datos] = await db.query(
      `SELECT ci.incidencia_id as id, cat.codigo, cat.incidencia
       FROM kpi.cargueros_incidencias ci
       JOIN kpi.catalogo_incidencias cat ON ci.incidencia_id = cat.id
       WHERE ci.carguero_id = ?`,
      [cargueroId]
    );

    res.status(200).json({ status: 'success', data: datos });
  } catch (error) {
    console.error('Error al obtener incidencias del carguero:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.saveCargueroIncidencias = async (req, res) => {
  const { carguero_id, incidencias } = req.body;
  if (!carguero_id || !Array.isArray(incidencias)) {
    return res.status(400).json({ message: 'carguero_id e incidencias son requeridos' });
  }

  try {
    await db.query('DELETE FROM kpi.cargueros_incidencias WHERE carguero_id = ?', [carguero_id]);

    if (incidencias.length > 0) {
      // Insert batch
      const values = incidencias.map((id) => `(${carguero_id}, ${id})`).join(',');
      await db.query(`INSERT INTO kpi.cargueros_incidencias (carguero_id, incidencia_id) VALUES ${values}`);
    }

    res.status(200).json({ status: 'success', message: 'Incidencias actualizadas' });
  } catch (error) {
    console.error('Error al guardar incidencias del carguero:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.getTransportesCarguero = async (req, res) => {
  const { cargueroId } = req.query;
  if (!cargueroId) {
    return res.status(200).json({ status: 'success', data: [] });
  }

  try {
    const [datos] = await db.query(
      `SELECT
        t.transporte_id,
        t.carguero_id,
        t.doda,        
        t.destino,        
        (SELECT xt_caat FROM doda.relacion_salida WHERE xt_numero_integracion = t.doda) AS caat, 
        (SELECT xt_nombre FROM doda.catalogo_transportistas WHERE xt_caat = caat LIMIT 1) AS nombreTransportista,
				(
					SELECT GROUP_CONCAT(DISTINCT DATE_FORMAT(mp.xd_fechaCruce, '%Y-%m-%d %H:%i') ORDER BY mp.xd_fechaCruce ASC SEPARATOR ', ') 
					FROM master_ge.master_pedimentos mp
					INNER JOIN doda.pedimentos p 
							ON mp.xt_referencia = p.xt_referencia
					INNER JOIN doda.relacion_salida_pedimentos rsp 
							ON p.xt_pedimento = rsp.xt_pedimento
					INNER JOIN doda.relacion_salida rs 
							ON rsp.xt_relacion_salida = rs.xt_relacion_salida
					WHERE rs.xt_numero_integracion = t.doda
				) AS fecha_cruce,
				(SELECT cd.hora_limite FROM kpi.catalogo_destinos cd WHERE cd.destino = t.destino AND cd.aduana = (SELECT c.aduana FROM kpi.cargueros c WHERE c.id = t.carguero_id)) as hora_limite
      FROM kpi.transportes t
      WHERE t.carguero_id = ? 
      ORDER BY t.doda`,
      [cargueroId]
    );

    for (const transporte of datos) {
      if (transporte.doda) {
        transporte.doda = transporte.doda.trim();
        const [pedimentos] = await db.query(
          `SELECT 
            p.xt_pedimento as pedimento,
            (SELECT xt_referencia FROM doda.pedimentos WHERE xt_pedimento = p.xt_pedimento LIMIT 1) AS referencia,
            (SELECT DATE_FORMAT(xd_fechaCruce, '%d-%m-%Y %H:%i') FROM master_ge.master_pedimentos WHERE xt_referencia = referencia LIMIT 1) AS fechaCruce
          FROM doda.relacion_salida_pedimentos p
          WHERE p.xt_relacion_salida = (SELECT xt_relacion_salida FROM doda.relacion_salida WHERE xt_numero_integracion = ?)`,
          [transporte.doda]
        );
        transporte.pedimentos = pedimentos.map(p => p.pedimento + " - " + p.referencia + " - " + p.fechaCruce);
      }

      if (transporte.transporte_id) {
        const [transporte_incidencias] = await db.query(
          `SELECT 
            ti.incidencia_id,
            cit.codigo,
            cit.incidencia
          FROM kpi.transportes_incidencias ti, kpi.catalogo_incidencias_transporte cit
          WHERE ti.transporte_id = ?
          AND cit.id = ti.incidencia_id`,
          [transporte.transporte_id]
        );
        transporte.incidencias = transporte_incidencias.map(i => ({ id: i.incidencia_id, codigo: i.codigo, incidencia: i.incidencia }));
      }
    }

    res.status(200).json({ status: 'success', data: datos });
  } catch (error) {
    console.error('Error al obtener transportes del carguero:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.getDodasDisponibles = async (req, res) => {
  const { desde, hasta } = req.query;
  
  if (!desde || !hasta) {
    return res.status(400).json({ message: 'Parámetros desde y hasta son requeridos' });
  }

  try {

    let [datos] = new Array();

    if (desde == hasta) {
      [datos] = await db.query(
        `SELECT 
            rs.xt_relacion_salida AS relacionSalida,
            rs.xt_numero_integracion AS doda,
            rs.xt_caat AS caat,
            (SELECT ct.xt_nombre 
            FROM doda.catalogo_transportistas ct 
            WHERE ct.xt_caat = rs.xt_caat 
            LIMIT 1) AS nombreTransportista,
            -- Concatenamos las fechas directamente aprovechando los JOINs de abajo
            GROUP_CONCAT(DISTINCT DATE_FORMAT(mp.xd_fechaCruce, '%Y-%m-%d %H:%i') ORDER BY mp.xd_fechaCruce ASC SEPARATOR ', ') AS fecha_cruce
        FROM doda.relacion_salida rs
        -- 1. Conectamos la relación de salida con sus pedimentos
        INNER JOIN doda.relacion_salida_pedimentos rsp 
            ON rs.xt_relacion_salida = rsp.xt_relacion_salida
        -- 2. Conectamos con el catálogo de pedimentos para obtener la referencia (xt_referencia)
        INNER JOIN doda.pedimentos p 
            ON rsp.xt_pedimento = p.xt_pedimento
        -- 3. Conectamos con el máster de pedimentos para validar el RFC
        INNER JOIN master_ge.master_pedimentos mp 
            ON p.xt_referencia = mp.xt_referencia
        WHERE rs.xd_fecha_emision LIKE '${desde}%'
          -- Filtro por la lista de RFCs del causante
          AND mp.xt_rfcCausante IN (
              'BME0004112J6', 'IMV1402104L4', 'MDM041221RJ3', 'P&B0108104K7', 
              'TME030710K69', 'UME091026UT6', 'ZHM040609ES5', 'ZME920824KM3', 
              'SME111206QU5', 'OME0107208X5', 'FGM150917IPA'
          )
          -- Filtro por aduanas específicas
          AND mp.xn_aduana IN ('470', '850')
          -- Tu filtro original para excluir los ya registrados en el KPI
          AND rs.xt_numero_integracion NOT IN (
              SELECT kpi.doda FROM kpi.transportes kpi WHERE kpi.doda IS NOT NULL
          )
        -- Agrupamos por los datos únicos del DODA para que el GROUP_CONCAT funcione correctamente
        GROUP BY 
            rs.xt_relacion_salida, 
            rs.xt_numero_integracion, 
            rs.xt_caat
        ORDER BY rs.xt_numero_integracion`,
        [desde]
      );
    } else {
      [datos] = await db.query(
        `SELECT 
            rs.xt_relacion_salida AS relacionSalida,
            rs.xt_numero_integracion AS doda,
            rs.xt_caat AS caat,
            (SELECT ct.xt_nombre 
            FROM doda.catalogo_transportistas ct 
            WHERE ct.xt_caat = rs.xt_caat 
            LIMIT 1) AS nombreTransportista,
            -- Concatenamos las fechas directamente aprovechando los JOINs de abajo
            GROUP_CONCAT(DISTINCT DATE_FORMAT(mp.xd_fechaCruce, '%Y-%m-%d %H:%i') ORDER BY mp.xd_fechaCruce ASC SEPARATOR ', ') AS fecha_cruce
        FROM doda.relacion_salida rs
        -- 1. Conectamos la relación de salida con sus pedimentos
        INNER JOIN doda.relacion_salida_pedimentos rsp 
            ON rs.xt_relacion_salida = rsp.xt_relacion_salida
        -- 2. Conectamos con el catálogo de pedimentos para obtener la referencia (xt_referencia)
        INNER JOIN doda.pedimentos p 
            ON rsp.xt_pedimento = p.xt_pedimento
        -- 3. Conectamos con el máster de pedimentos para validar el RFC
        INNER JOIN master_ge.master_pedimentos mp 
            ON p.xt_referencia = mp.xt_referencia
        WHERE DATE(rs.xd_fecha_emision) >= ? AND DATE(rs.xd_fecha_emision) <= ?
          -- Filtro por la lista de RFCs del causante
          AND mp.xt_rfcCausante IN (
              'BME0004112J6', 'IMV1402104L4', 'MDM041221RJ3', 'P&B0108104K7', 
              'TME030710K69', 'UME091026UT6', 'ZHM040609ES5', 'ZME920824KM3', 
              'SME111206QU5', 'OME0107208X5', 'FGM150917IPA'
          )
          -- Filtro por aduanas específicas
          AND mp.xn_aduana IN ('470', '850')
          -- Tu filtro original para excluir los ya registrados en el KPI
          AND rs.xt_numero_integracion NOT IN (
              SELECT kpi.doda FROM kpi.transportes kpi WHERE kpi.doda IS NOT NULL
          )
        -- Agrupamos por los datos únicos del DODA para que el GROUP_CONCAT funcione correctamente
        GROUP BY 
            rs.xt_relacion_salida, 
            rs.xt_numero_integracion, 
            rs.xt_caat
        ORDER BY rs.xt_numero_integracion`,
        [desde, hasta]
      );
    }

    for (const doda of datos) {
      if (doda.doda) {
        doda.doda = doda.doda.trim();
        const [pedimentos] = await db.query(
          `SELECT 
            p.xt_pedimento as pedimento,
            (SELECT xt_referencia FROM doda.pedimentos WHERE xt_pedimento = p.xt_pedimento LIMIT 1) AS referencia,
            (SELECT DATE_FORMAT(xd_fechaCruce, '%d-%m-%Y %H:%i') FROM master_ge.master_pedimentos WHERE xt_referencia = referencia LIMIT 1) AS fechaCruce
          FROM doda.relacion_salida_pedimentos p
          WHERE p.xt_relacion_salida = ?`,
          [doda.relacionSalida]
        );
        doda.pedimentos = pedimentos.map(p => p.pedimento + " - " + p.referencia + " - " + p.fechaCruce);
      }
    }

    res.status(200).json({ status: 'success', data: datos });
  } catch (error) {
    console.error('Error al obtener DODAS disponibles:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.saveCargueroDodasFromSearch = async (req, res) => {
  const { carguero_id, transportes, dodas } = req.body;

  const transportesToSave = Array.isArray(transportes)
    ? transportes
    : Array.isArray(dodas)
    ? dodas.map((doda) => ({ doda, destino: '' }))
    : [];

  if (!carguero_id || transportesToSave.length === 0) {
    return res.status(400).json({ message: 'carguero_id y transportes son requeridos' });
  }

  const invalidItem = transportesToSave.find((item) => !item?.doda);
  if (invalidItem) {
    return res.status(400).json({ message: 'Cada transporte debe contener un campo doda válido' });
  }

  if (Array.isArray(transportes) && transportesToSave.some((item) => !item.destino)) {
    return res.status(400).json({ message: 'Cada transporte debe contener un destino' });
  }

  try {
    const values = transportesToSave
      .map((item) => {
        const doda = String(item.doda).replace(/'/g, "''");
        const destino = String(item.destino || '').replace(/'/g, "''");
        return `(${carguero_id}, '${doda}', '${destino}')`;
      })
      .join(',');

    
    await db.query(
      `INSERT IGNORE INTO kpi.transportes (carguero_id, doda, destino) VALUES ${values}`
    );

    
    const dodaValues = transportesToSave.map((item) => String(item.doda).trim());
    if (dodaValues.length > 0) {
      const placeholders = dodaValues.map(() => '?').join(',');
      const [transporteRows] = await db.query(
        `SELECT
          t.transporte_id,
          t.doda,
          t.destino,
          cd.hora_limite as hora_limite,
          (
            SELECT DATE_FORMAT(MAX(mp.xd_fechaCruce), '%H:%i')
            FROM master_ge.master_pedimentos mp
            INNER JOIN doda.pedimentos p ON p.xt_referencia = mp.xt_referencia
            INNER JOIN doda.relacion_salida_pedimentos rsp ON p.xt_pedimento = rsp.xt_pedimento
            INNER JOIN doda.relacion_salida rs ON rs.xt_relacion_salida = rsp.xt_relacion_salida
            WHERE rs.xt_numero_integracion = t.doda
          ) AS hora_cruce
        FROM kpi.transportes t
        LEFT JOIN kpi.cargueros c ON c.id = t.carguero_id
        LEFT JOIN kpi.catalogo_destinos cd ON cd.destino = t.destino AND cd.aduana = c.aduana
        WHERE t.carguero_id = ? AND t.doda IN (${placeholders})`,
        [carguero_id, ...dodaValues]
      );

      const timeToMinutes = (timeString) => {
        if (!timeString) return null;
        const match = String(timeString).trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
        if (!match) return null;
        const hours = Number(match[1]);
        const minutes = Number(match[2]);
        if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
        return hours * 60 + minutes;
      };

      for (const row of transporteRows) {
        const horaCruceMin = timeToMinutes(row.hora_cruce);
        const horaLimiteMin = timeToMinutes(row.hora_limite);
        if (horaCruceMin !== null && horaLimiteMin !== null && horaCruceMin > horaLimiteMin) {
          await db.query(
            `INSERT IGNORE INTO kpi.transportes_incidencias (transporte_id, incidencia_id) VALUES (?,?)`,
            [row.transporte_id, 3] // 3 = Incidencia Retraso llegada de transporte
          );
        }
      }
    }
    
    res.status(200).json({ status: 'success', message: 'DODAs guardadas correctamente' });
  } catch (error) {
    console.error('Error al guardar transportes del carguero:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.deleteCarguero = async (req, res) => {
  const { carguero_id } = req.body;
  if (!carguero_id) {
    return res.status(400).json({ message: 'carguero_id es requerido' });
  }

  try {
    await db.query(
      'DELETE FROM kpi.transportes_incidencias WHERE transporte_id IN (SELECT transporte_id FROM kpi.transportes WHERE carguero_id = ?)',
      [carguero_id]
    );

    await db.query('DELETE FROM kpi.transportes WHERE carguero_id = ?', [carguero_id]);
    await db.query('DELETE FROM kpi.cargueros_incidencias WHERE carguero_id = ?', [carguero_id]);

    const [result] = await db.query('DELETE FROM kpi.cargueros WHERE id = ?', [carguero_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Carguero no encontrado' });
    }

    res.status(200).json({ status: 'success', message: 'Carguero eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar carguero:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.deleteTransporteCarguero = async (req, res) => {
  const { carguero_id, doda } = req.body;
  if (!carguero_id || !doda) {
    return res.status(400).json({ message: 'carguero_id y doda son requeridos' });
  }

  try {
    const [result] = await db.query(
      'DELETE FROM kpi.transportes WHERE carguero_id = ? AND doda = ?',
      [carguero_id, doda]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Transporte no encontrada para este carguero' });
    }

    res.status(200).json({ status: 'success', message: 'Transporte eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar transporte del carguero:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
