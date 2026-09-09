// backend/Intranet/controllers/perfilesController.js
const db = require('../../config/db').mysqlPool;
const SftpClient = require('ssh2-sftp-client');
const { status } = require('./statusController');
const nodemailer = require('nodemailer');
const path = require('path');

function decodeLatin1(str) {
    try {
        return decodeURIComponent(escape(str));
    } catch {
        return str;
    }
}

// --- Perfiles ---

exports.correoUsuario = async (req, res) => {
  try {
    const { usuario } = req.query;

    if (!usuario) {
      return res.status(400).json({ message: 'Falta el parámetro usuario' });
    }

    const [rows] = await db.query(
      `SELECT xt_correo FROM perfiles.usuarios WHERE xt_usuario = ?`,
      [usuario]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({ status: 'success', data: rows[0].xt_correo });
  } catch (error) {
    console.error('Error al obtener el correo del usuario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.jefesDirectosPuesto = async (req, res) => {
  try {
    const { puesto, ciudad, empresa } = req.query;

    if (!puesto || !ciudad) {
      return res.status(400).json({ message: 'Falta el puesto o ciudad' });
    }

    const [rows] = await db.query(
      `SELECT xt_usuario, xt_nombre, xt_correo FROM perfiles.usuarios WHERE FIND_IN_SET(xt_puesto, (SELECT xt_puestoJefeDirecto FROM perfiles.catalogo_puestos WHERE xt_puesto = ? AND xt_empresa = ?)) AND xt_ciudad = ?`,
      [puesto, empresa, ciudad]
    );

    res.status(200).json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error al obtener la lista de jefes directos:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.enviaCorreo = async (req, res) => {
  const { destinatarios, copias, asunto, mensaje, perfil_puesto } = req.body;

  if (!destinatarios || !copias || !asunto || !mensaje) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    // Aquí iría la lógica para enviar el correo
    console.log(`Enviando correo a ${destinatarios} con copia a ${copias} con asunto "${asunto}" y mensaje "${mensaje}"`);

    // Configura el transporter (ajusta los datos a tu servidor SMTP)
    const transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
      auth: {
        user: 'calidad@escalante.com.mx',
        pass: 'C4l1d4d1234'
        //user: 'backlog@escalante.com.mx',
        //pass: 'B4ckl0g1234'
        //user: 'archivos@escalante.com.mx',
        //pass: 'Esc4l4nt3123'
      }
    });

    // Prepara los destinatarios y copias
    const to = Array.isArray(destinatarios) ? destinatarios.join(',') : destinatarios;
    const cc = copias && copias.length > 0 ? (Array.isArray(copias) ? copias.join(',') : copias) : undefined;

    // Construye la ruta absoluta al PDF
    const pdfPath = path.join(__dirname, '../perfiles_puestos', perfil_puesto);

    // Envía el correo
    await transporter.sendMail({
      from: '"Grupo Escalante" <calidad@escalante.com.mx>',
      to,
      cc,
      subject: asunto,
      html: mensaje,
      ...(perfil_puesto && {
      attachments: [
        {
          filename: perfil_puesto,
          path: pdfPath // o usa content: fs.readFileSync('./bienvenida.pdf')
        }
      ]
      })
    });

    res.status(200).json({ status: 'success', message: 'Correo enviado correctamente' });
  } catch (error) {
    console.error('Error al enviar correo:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.listaUsuarios = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT u.xt_usuario, u.xt_nombre, u.xt_correo, u.xt_categoria, u.xt_rfc, u.xt_empresa, u.xt_tipo, u.xt_puesto, (SELECT cp.xt_puestoJefeDirecto FROM perfiles.catalogo_puestos cp WHERE cp.xt_puesto = u.xt_puesto AND cp.xt_empresa = u.xt_empresa) as xt_puestoJefeDirecto, u.xt_estatus, u.xt_foto, ( SELECT u2.xt_correo FROM perfiles.usuarios u2 WHERE u2.xt_usuario = u.xt_jefeDirecto ) AS xt_correoJefeDirecto FROM perfiles.usuarios u ORDER BY u.xt_nombre ASC'
    );

    res.status(200).json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error al obtener la lista de usuarios:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.detalleUsuario = async (req, res) => {
  const { usuario } = req.query;

  if (!usuario) {
    return res.status(400).json({ message: 'El parámetro "usuario" es obligatorio' });
  }

  try {
    const [rows] = await db.query(
      'SELECT u.xt_usuario, u.xt_nombre, u.xt_correo, u.xt_categoria, u.xt_rfc, u.xt_curp, u.xt_empresa, u.xt_tipo, u.xt_puesto, (SELECT cp.xt_puestoJefeDirecto FROM perfiles.catalogo_puestos cp WHERE cp.xt_puesto = u.xt_puesto AND cp.xt_empresa = u.xt_empresa) as xt_puestoJefeDirecto, u.xt_estatus, u.xt_foto, u.xt_ciudad, u.xt_jefeDirecto, (SELECT u2.xt_nombre FROM perfiles.usuarios u2 WHERE u2.xt_usuario = u.xt_jefeDirecto) as xt_nombreJefeDirecto, ( SELECT u2.xt_correo FROM perfiles.usuarios u2 WHERE u2.xt_usuario = u.xt_jefeDirecto ) AS xt_correoJefeDirecto FROM perfiles.usuarios u WHERE xt_usuario = ?',
      [usuario]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const usuarioData = rows[0];

    const [sistemas] = await db.query(
      "SELECT s.xt_sistema, s.xt_estatus, (SELECT ss.xt_codigoSolicitud FROM perfiles.solicitud_sistemas ss WHERE ss.xt_sistema = s.xt_sistema AND ss.xt_tipo = 'ALTA' AND ss.xt_usuario = s.xt_usuario ORDER BY xd_fecha DESC LIMIT 1) AS xt_codigoSolicitud, ( SELECT qs.xt_estatus FROM intranet2.sgi_quejas_solicitudes_estatusv2 qs WHERE qs.xt_quejaSolicitud = xt_codigoSolicitud ORDER BY qs.xn_numero DESC LIMIT 1 ) AS xt_estatus_solicitud, ( SELECT sst.xt_codigoEntregable FROM intranet2.sgi_backlog_solicitud_sistemas_temporal sst WHERE sst.xt_quejaSolicitud = xt_codigoSolicitud AND sst.xt_sistema = s.xt_sistema ) AS codigoEntregable, ( SELECT e.xt_etapa FROM backlog.etapas e WHERE e.xt_codigoEntregable = codigoEntregable ORDER BY xn_numero DESC LIMIT 1 ) AS xt_estatus_entregable FROM perfiles.sistemas s WHERE s.xt_usuario = ? ",
      [usuario]
    );
    usuarioData["sistemas"] = sistemas;

    res.status(200).json({ status: 'success', data: usuarioData });

  } catch (error) {
    console.error('Error al obtener el detalle del usuario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.registroUsuario = async (req, res) => {

  console.log('BODY:', req.body);
  console.log('FILE:', req.file);

  const { nombre, apellidoPaterno, apellidoMaterno, correo, categoria, rfc, curp, grupo, empresa, oficina, puesto, jefeDirecto, usuarioAlta, /*, foto*/ } = req.body;

  // La foto es opcional
  let nombreFoto = '';
  if (req.file) {
    nombreFoto = `FILES/${req.file.filename}`;
  }

  if (categoria === 'Empleado') {
    if (!nombre || !apellidoPaterno || !apellidoMaterno || !correo || !categoria || !rfc || !curp || !grupo || !oficina || !puesto || !jefeDirecto/* || !foto*/) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }
  } else {
    if (!nombre || !apellidoPaterno || !apellidoMaterno || !correo || !categoria || !empresa || !oficina) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }
  }

  let usuario = `${nombre.split(' ')[0]}_${apellidoPaterno}`;

  try {
    // Verificar si el usuario ya existe
    let [usuarios] = await db.query('SELECT xt_usuario FROM perfiles.usuarios WHERE xt_usuario = ?', [usuario]);
    if (usuarios.length > 0) {
      usuario = `${nombre.split(' ')[0]}_${apellidoPaterno}_${apellidoMaterno}`;

      [usuarios] = await db.query('SELECT xt_usuario FROM perfiles.usuarios WHERE xt_usuario = ?', [usuario]);
      if (usuarios.length > 0) {
        return res.status(409).json({ status: 'error', message: 'El usuario ya está registrado', usuario: usuario });
      }
    }

    // Hashear contraseña
    //const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario
    if (categoria === 'Empleado') {
      await db.query(
        'INSERT INTO perfiles.usuarios (xt_usuario, xt_password, xt_nombre, xt_correo, xt_categoria, xt_rfc, xt_curp, xt_empresa, xt_puesto, xt_estatus, xt_ciudad, xt_usuarioAlta, xt_foto, xt_jefeDirecto, xd_fechaAlta) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
        [ usuario, 'escalante123', `${nombre} ${apellidoPaterno} ${apellidoMaterno}`, correo, categoria, rfc, curp, grupo, puesto, 'Activo', oficina, usuarioAlta, nombreFoto, jefeDirecto]
      );
    } else {
      await db.query(
        'INSERT INTO perfiles.usuarios (xt_usuario, xt_password, xt_nombre, xt_correo, xt_categoria, xt_rfc, xt_curp, xt_empresa, xt_puesto, xt_estatus, xt_ciudad, xt_usuarioAlta, xt_foto, xt_jefeDirecto, xd_fechaAlta) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
        [ usuario, 'escalante123', `${nombre} ${apellidoPaterno} ${apellidoMaterno}`, correo, categoria, rfc, curp, empresa, puesto, 'Activo', oficina, usuarioAlta, nombreFoto, jefeDirecto]
      );
    }

    // Insertar en oficinas
    await db.query(
      'INSERT INTO perfiles.oficinas (xt_usuario, xt_oficina) VALUES (?, ?)',
      [ usuario, oficina]
    );

    // Insertar en roles
    await db.query(
      'INSERT INTO perfiles.roles (xt_usuario, xt_oficina, xt_rol) VALUES (?, ?, ?)',
      [ usuario, oficina, categoria]
    );

    // Insertar en modulos
    await db.query(
      'INSERT INTO perfiles.modulos (xt_usuario, xt_oficina, xt_rol, xt_modulo) VALUES (?, ?, ?, ?)',
      [ usuario, oficina, categoria, 'Login']
    );

    // Insertar en procesos
    await db.query(
      'INSERT INTO perfiles.procesos (xt_usuario, xt_oficina, xt_rol, xt_modulo, xt_proceso) VALUES (?, ?, ?, ?, ?)',
      [ usuario, oficina, categoria, 'Login', 'Entrada al sistema']
    );

    // Insertar en actividades
    await db.query(
      'INSERT INTO perfiles.actividades (xt_usuario, xt_oficina, xt_rol, xt_modulo, xt_proceso, xt_actividad) VALUES (?, ?, ?, ?, ?, ?)',
      [ usuario, oficina, categoria, 'Login', 'Entrada al sistema', 'Logeo']
    );

    // Insertar en funcionalidades
    await db.query(
      'INSERT INTO perfiles.funcionalidades (xt_usuario, xt_oficina, xt_rol, xt_modulo, xt_proceso, xt_actividad, xt_funcionalidad) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [ usuario, oficina, categoria, 'Login', 'Entrada al sistema', 'Logeo', 'seleccionaSistema']
    );
    
    res.status(201).json({ status: 'success', message: 'Usuario registrado exitosamente', usuario: usuario });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ status: 'error', message: 'Error del servidor' });
  }
};

exports.modificaUsuario = async (req, res) => {
  const { usuario, nombre, apellidoPaterno, apellidoMaterno, correo, categoria, rfc, curp, grupo, empresa, oficina, puesto, jefeDirecto } = req.body;

  if (categoria === 'Empleado') {
    if (!usuario || !nombre || !apellidoPaterno || !apellidoMaterno || !correo || !categoria || !rfc || !curp || !grupo || !oficina || !puesto || !jefeDirecto) {
      return res.status(400).json({ status: 'error', message: 'Todos los campos del empleado son obligatorios' });
    }
  } else if (!usuario || !nombre || !apellidoPaterno || !apellidoMaterno || !correo || !categoria || !empresa || !oficina) {
    return res.status(400).json({ status: 'error', message: 'Todos los campos obligatorios deben completarse' });
  }

  const empresaUsuario = categoria === 'Empleado' ? grupo : empresa;
  const campos = [
    'xt_nombre = ?',
    'xt_correo = ?',
    'xt_categoria = ?',
    'xt_rfc = ?',
    'xt_curp = ?',
    'xt_empresa = ?',
    'xt_puesto = ?',
    'xt_ciudad = ?',
    'xt_jefeDirecto = ?'
  ];
  const valores = [
    `${nombre} ${apellidoPaterno} ${apellidoMaterno}`,
    correo,
    categoria,
    rfc || '',
    curp || '',
    empresaUsuario,
    puesto || '',
    oficina,
    jefeDirecto || ''
  ];

  if (req.file) {
    campos.push('xt_foto = ?');
    valores.push(`FILES/${req.file.filename}`);
  }

  valores.push(usuario);

  try {
    const [resultado] = await db.query(
      `UPDATE perfiles.usuarios SET ${campos.join(', ')} WHERE xt_usuario = ?`,
      valores
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
    }

    res.status(200).json({ status: 'success', message: 'Usuario modificado correctamente', usuario });
  } catch (error) {
    console.error('Error al modificar usuario:', error);
    res.status(500).json({ status: 'error', message: 'Error del servidor' });
  }
};

exports.actualizaDatosToUTF8 = async (req, res) => {
  try {

    const [rows] = await db.query(
      'SELECT * FROM intranetgea.sgi_empleados'
    );
    
    for (const row of rows) {
      const { kp_personalId, xt_Nombre, xt_ApellidoPaterno, xt_ApellidoMaterno, xt_Empresa, xt_nombreCorto } = row;

      // Insertar usuario
      await db.query(
        'UPDATE intranetgea.sgi_empleados set xt_Nombre = ?, xt_ApellidoPaterno = ?, xt_ApellidoMaterno = ?, xt_Empresa = ?, xt_nombreCorto = ? WHERE kp_personalId = ?',
        [ decodeLatin1(xt_Nombre), decodeLatin1(xt_ApellidoPaterno), decodeLatin1(xt_ApellidoMaterno), decodeLatin1(xt_Empresa), decodeLatin1(xt_nombreCorto), kp_personalId]
      );
    }
      
    res.status(201).json({ status: 'success', message: 'Datos actualizados exitosamente' });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.altaUsuario = async (req, res) => {

  //console.log('BODY:', req.body);
  //console.log('FILE:', req.file);

  const { usuario } = req.body;

  if (!usuario) {
    return res.status(400).json({ message: 'El usuario es obligatorio' });
  }

  try {

    // Update usuario
    await db.query(
      'UPDATE perfiles.usuarios SET xt_estatus = ? WHERE xt_usuario = ?',
      ['Activo', usuario]
    );

    // Update empleados
    await db.query(
      'UPDATE IGNORE intranetgea.sgi_empleados SET xt_estatus = ? WHERE kf_usuario = ?',
      ['1', usuario]
    );

    res.status(201).json({ status: 'success', message: 'Usuario activado exitosamente' });
  } catch (error) {
    console.error('Error al activar usuario:', error);
    res.status(500).json({ status: 'error', message: 'Error del servidor' });
  }
};

exports.bajaUsuario = async (req, res) => {

  //console.log('BODY:', req.body);
  //console.log('FILE:', req.file);

  const { usuario } = req.body;

  if (!usuario) {
    return res.status(400).json({ message: 'El usuario es obligatorio' });
  }

  try {

    // Update usuario
    await db.query(
      'UPDATE perfiles.usuarios SET xt_estatus = ? WHERE xt_usuario = ?',
      ['Inactivo', usuario]
    );

    // Update empleados
    await db.query(
      'UPDATE IGNORE intranetgea.sgi_empleados SET xt_estatus = ? WHERE kf_usuario = ?',
      ['2', usuario]
    );

    // Baja Sistemas
    await db.query(
      'UPDATE perfiles.sistemas SET xt_estatus = ? WHERE xt_usuario = ?',
      ['INACTIVO', usuario]
    );

    res.status(201).json({ status: 'success', message: 'Usuario desactivado exitosamente' });
  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    res.status(500).json({ status: 'error', message: 'Error del servidor' });
  }
};

exports.listaClientes = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT kp_clienteId, xt_nombre, xt_rfc FROM master_ge.master_rfc_clienteId ORDER BY xt_nombre ASC'
    );

    res.status(200).json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error al obtener la lista de clientes:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.altaSistemaExterno = async (req, res) => {

  const { usuario, usuarioSolicita, sistema } = req.body;

  if (!usuario || !sistema) {
    return res.status(400).json({ message: 'El usuario y el sistema son obligatorios' });
  }

  try {
    const [usuarioDetalles] = await db.query('SELECT * FROM perfiles.usuarios WHERE xt_usuario = ?', [usuario]);
    if (usuarioDetalles.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const ciudad = usuarioDetalles[0].xt_ciudad == 'CDMX' ? 'CMX' : usuarioDetalles[0].xt_ciudad == 'NLRD' ? 'NLR' : usuarioDetalles[0].xt_ciudad;

    // Verificar si ya existe una solicitud previa de alta para el mismo usuario y sistema
    const [solicitudAnterior] = await db.query("SELECT ss.xt_codigoSolicitud FROM perfiles.solicitud_sistemas ss WHERE ss.xt_sistema = ? AND ss.xt_tipo = 'ALTA' AND ss.xt_usuario = ? ORDER BY xd_fecha DESC LIMIT 1", [sistema, usuario]);
    if (solicitudAnterior.length < 1) {
      // Obtener datos para la solicitud
      const [maxNumero] = await db.query(`SELECT MAX(xn_numero) FROM intranet2.SGI_Quejas_Solicitudesv2 WHERE YEAR(xd_fecha) = YEAR(NOW()) AND xt_tipo = 'B' AND xt_ciudad = ? AND xt_grupo = 'GE' `, [ciudad]);
      const codigo = maxNumero[0]['MAX(xn_numero)'] ? maxNumero[0]['MAX(xn_numero)'] + 1 : 1;
      const solicitud = `GE-B-${ciudad}-${new Date().getFullYear().toString().slice(-2)}-${codigo.toString().padStart(5, '0')}`;
      const titulo = `Solicitud de alta de Sistema ${sistema}`;
      const descripcion = `Solicitud de alta de Sistema ${sistema} para el usuario ${usuarioDetalles[0].xt_nombre} de la oficina ${usuarioDetalles[0].xt_ciudad}`;

      // Insertar en la tabla de Solicitudes Intranet
      await db.query('INSERT INTO intranet2.SGI_Quejas_Solicitudesv2(xt_quejaSolicitud, xt_titulo, xt_tipo, xt_tipoSolicitud, xt_grupo, xt_ciudad, xd_fecha, xn_numero, xt_descripcion, kf_usuarioId, xt_status, xt_pdr) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [solicitud, titulo, 'B', 'AB', 'GE', ciudad, new Date(), codigo, descripcion, usuarioSolicita, 'ASIGNADA', 'Gerente_Sistemas']);
      // Insertar en la tabla de Quejas_Solicitudes_Estatusv2
      await db.query('INSERT INTO intranet2.SGI_Quejas_Solicitudes_Estatusv2 (xt_quejaSolicitud, xn_numero, xt_estatus, xd_fecha, kf_usuario) VALUES(?, ?, ?, ?, ?)', [solicitud, 1, 'SIN ASIGNAR', new Date(), usuarioSolicita]);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await db.query('INSERT INTO intranet2.SGI_Quejas_Solicitudes_Estatusv2 (xt_quejaSolicitud, xn_numero, xt_estatus, xd_fecha, kf_usuario) VALUES(?, ?, ?, ?, ?)', [solicitud, 2, 'ASIGNADA', new Date(), usuarioSolicita]);

      // Insertar en Solicitud Sistemas
      await db.query(
        'INSERT IGNORE INTO perfiles.solicitud_sistemas (xt_usuario, xt_sistema, xt_codigoSolicitud, xt_tipo, xd_fecha) VALUES (?, ?, ?, ?, CURRENT_DATE)',
        [usuario, sistema, solicitud, 'ALTA']
      );
    }

    // Insertar a Sistemas
    await db.query(
      'INSERT INTO perfiles.sistemas (xt_usuario, xt_sistema, xt_estatus) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE xt_estatus = VALUES(xt_estatus)',
      [usuario, sistema, 'ACTIVO']
    );

    // Aquí podrías agregar lógica adicional para notificar al usuario o registrar el evento
    res.status(201).json({ status: 'success', message: `Solicitud de alta de Sistema ${sistema} registrada correctamente` });
  } catch (error) {
    console.error(`Error al registrar alta de Sistema ${sistema} registrada:`, error);
    res.status(500).json({ status: 'error', message: 'Error del servidor' });
  }
};

exports.bajaSistemaExterno = async (req, res) => {
  const { usuario, usuarioSolicita, sistema } = req.body;

  if (!usuario || !sistema) {
    return res.status(400).json({ message: 'El usuario y el sistema son obligatorios' });
  }

  try {
    // Desactivar Sistemas
    await db.query(
      'UPDATE perfiles.sistemas SET xt_estatus = ? WHERE xt_usuario = ? AND xt_sistema = ?',
      ['INACTIVO', usuario, sistema]
    );

    res.status(201).json({ status: 'success', message: `Usuario desactivado exitosamente en ${sistema}` });
  } catch (error) {
    console.error(`Error al desactivar usuario en ${sistema}:`, error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};


// --- Intranet ---
exports.altaIntranet = async (req, res) => {
  
  const { usuario } = req.body;

  if (!usuario) {
    return res.status(400).json({ message: 'El usuario es obligatorio' });
  }
  
  try {

    const [usuarioDetalles] = await db.query('SELECT * FROM perfiles.usuarios WHERE xt_usuario = ?', [usuario]);
    if (usuarioDetalles.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Insertar en Solicitud Sistemas
    await db.query(
      'INSERT IGNORE INTO perfiles.solicitud_sistemas (xt_usuario, xt_sistema, xt_codigoSolicitud, xt_tipo, xd_fecha) VALUES (?, ?, ?, ?, CURRENT_DATE)',
      [usuario, 'INTRANET', 'SISTEMA', 'ALTA']
    );

    // Insertar a Sistemas
    await db.query(
      'INSERT INTO perfiles.sistemas (xt_usuario, xt_sistema, xt_estatus) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE xt_estatus = VALUES(xt_estatus)',
      [usuario, 'INTRANET', 'ACTIVO']
    );
    
    // Insertar Intranet usuarios
    await db.query(
      'INSERT IGNORE INTO intranetgea.intranetgea_usuarios (kp_usuario, xt_password, xt_nombre, kf_categoria, xt_correo, xt_ciudad, xn_estilo) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [usuario, usuarioDetalles[0].xt_password, usuarioDetalles[0].xt_nombre, usuarioDetalles[0].xt_categoria, usuarioDetalles[0].xt_correo, usuarioDetalles[0].xt_ciudad, usuarioDetalles[0].xn_estilo]
    );

    // Insertar Intranet2 usuarios
    await db.query(
      'INSERT IGNORE INTO intranet2.intranetgea_usuarios (kp_usuario, xt_password, xt_nombre, kf_categoria, xt_correo, xt_ciudad, xn_estilo) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [usuario, usuarioDetalles[0].xt_password, usuarioDetalles[0].xt_nombre, usuarioDetalles[0].xt_categoria, usuarioDetalles[0].xt_correo, usuarioDetalles[0].xt_ciudad, usuarioDetalles[0].xn_estilo]
    );

    const [usuarioIntranet] = await db.query(
      'SELECT * FROM intranetgea.sgi_empleados WHERE kf_usuario = ?',
      [usuario]
    );
    if (usuarioIntranet.length === 0) {
      // Insertar Intranet empleados
      const nombres = usuarioDetalles[0].xt_nombre.split(' ').length > 3 ? `${usuarioDetalles[0].xt_nombre.split(' ')[0]} ${usuarioDetalles[0].xt_nombre.split(' ')[1]}` : `${usuarioDetalles[0].xt_nombre.split(' ')[0]}`
      const apellidoPaterno = usuarioDetalles[0].xt_nombre.split(' ').length > 3 ? `${usuarioDetalles[0].xt_nombre.split(' ')[2]}` : `${usuarioDetalles[0].xt_nombre.split(' ')[1]}`
      const apellidoMaterno = usuarioDetalles[0].xt_nombre.split(' ').length > 3 ? `${usuarioDetalles[0].xt_nombre.split(' ')[3]}` : `${usuarioDetalles[0].xt_nombre.split(' ')[2]}`
      await db.query(
      'INSERT INTO intranetgea.sgi_empleados (xt_Nombre, xt_ApellidoPaterno, xt_ApellidoMaterno, xt_Estatus, xt_Empresa, xn_Foto, xt_tipo, kf_usuario, xt_puesto, xt_ciudad) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nombres, apellidoPaterno, apellidoMaterno, usuarioDetalles[0].xt_estatus === 'Activo' ? 1 : 2, usuarioDetalles[0].xt_empresa, usuarioDetalles[0].xt_foto, usuarioDetalles[0].xt_categoria[0], usuario, usuarioDetalles[0].xt_puesto, usuarioDetalles[0].xt_ciudad]
      );
    }

    // Insertar Intranet usuarios oficina
    await db.query(
      'INSERT IGNORE INTO intranetgea.intranetgea_usuarios_oficina (kf_usuarioId, xt_codigoCiudad) VALUES (?, ?)',
      [usuario, usuarioDetalles[0].xt_ciudad]
    );

    const [scriptsIntranet] = await db.query('SELECT * FROM intranetgea.intranetgea_usuarios_catalogo_php WHERE kf_usuarioId = ?', ['Abel_Castillo']);

    scriptsIntranet.map(async (script) => {
      await db.query(
        'INSERT IGNORE INTO intranetgea.intranetgea_usuarios_catalogo_php (kf_phpId, kf_usuarioId) VALUES (?, ?)',
        [script.kf_phpId, usuario]
      );
    });
    
    res.status(201).json({ status: 'success', message: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.bajaIntranet = async (req, res) => {
  
  const { usuario } = req.body;

  if (!usuario) {
    return res.status(400).json({ message: 'El usuario es obligatorio' });
  }
  
  try {

    // Desactivar Sistemas
    await db.query(
      'UPDATE perfiles.sistemas SET xt_estatus = ? WHERE xt_usuario = ? AND xt_sistema = ?',
      ['INACTIVO', usuario, 'INTRANET']
    );

    res.status(201).json({ status: 'success', message: 'Usuario desactivado exitosamente' });
  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.catalogoPuestos = async (req, res) => {

  try {
    const [rows] = await db.query(
      'SELECT * FROM perfiles.catalogo_puestos order by xt_categoria, xt_puesto'
    );
    
    res.status(200).json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error al obtener catalogo de puestos:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};


// --- Extractor ---
exports.altaExtractor = async (req, res) => {

  const { usuario } = req.body;

  if (!usuario) {
    return res.status(400).json({ message: 'El usuario es obligatorio' });
  }
  
  try {

    const [usuarioDetalles] = await db.query('SELECT * FROM perfiles.usuarios WHERE xt_usuario = ?', [usuario]);
    if (usuarioDetalles.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Insertar en Solicitud Sistemas
    await db.query(
      'INSERT IGNORE INTO perfiles.solicitud_sistemas (xt_usuario, xt_sistema, xt_codigoSolicitud, xt_tipo, xd_fecha) VALUES (?, ?, ?, ?, CURRENT_DATE)',
      [usuario, 'EXTRACTOR', 'SISTEMA', 'ALTA']
    );

    // Insertar a Sistemas
    await db.query(
      'INSERT INTO perfiles.sistemas (xt_usuario, xt_sistema, xt_estatus) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE xt_estatus = VALUES(xt_estatus)',
      [usuario, 'EXTRACTOR', 'ACTIVO']
    );
    

    // Insertar Imagenes usuarios
    await db.query(
      'INSERT IGNORE INTO imagenes.radar_usuarios (kp_usuario, xt_password, xt_nombre, kf_categoria) VALUES (?, ?, ?, ?)',
      [usuario, usuarioDetalles[0].xt_password, usuarioDetalles[0].xt_nombre, usuarioDetalles[0].xt_categoria]
    );

    const [scriptsExtractor] = await db.query('SELECT * FROM imagenes.radar_catalogo_php WHERE kf_categoria in (?, ?)', ['Busquedas', 'Extracción de archivos']);

    scriptsExtractor.map(async (script) => {
      await db.query(
        'INSERT IGNORE INTO imagenes.radar_usuarios_catalogo_php (kf_phpId, kf_usuarioId) VALUES (?, ?)',
        [script.kp_nombre, usuario]
      );
    });
    
    res.status(201).json({ status: 'success', message: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.bajaExtractor = async (req, res) => {
  
  const { usuario } = req.body;

  if (!usuario) {
    return res.status(400).json({ message: 'El usuario es obligatorio' });
  }
  
  try {

    // Desactivar Sistemas
    await db.query(
      'UPDATE perfiles.sistemas SET xt_estatus = ? WHERE xt_usuario = ? AND xt_sistema = ?',
      ['INACTIVO', usuario, 'EXTRACTOR']
    );

    res.status(201).json({ status: 'success', message: 'Usuario desactivado exitosamente' });
  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.usuarioClientesExtractor = async (req, res) => {

  const { usuario } = req.query;

  if (!usuario) {
    return res.status(400).json({ message: 'El parámetro "usuario" es obligatorio' });
  }

  try {
    const [rows] = await db.query(
      'SELECT uc.kf_cliente, c.kp_clienteId, c.xt_nombre, c.xt_rfc FROM imagenes.radar_usuario_clientes uc, master_ge.master_rfc_clienteId c WHERE uc.kf_cliente = c.kp_clienteId AND uc.kf_usuario = ? ORDER BY xt_nombre ASC',
      [usuario]
    );

    res.status(200).json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error al obtener la lista de clientes:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.listaClientesExtractor = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT kp_clienteId, xt_nombre, xt_rfc FROM master_ge.master_rfc_clienteId ORDER BY xt_nombre ASC'
    );

    res.status(200).json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error al obtener la lista de clientes:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.registraClienteUsuario = async (req, res) => {
  const { usuario, cliente } = req.body;

  if (!usuario || !cliente) {
    return res.status(400).json({ message: 'Los campos "usuario" y "cliente" son obligatorios' });
  }

  try {
    // Verificar si el cliente ya está registrado para el usuario
    const [rows] = await db.query(
      'SELECT * FROM imagenes.radar_usuario_clientes WHERE kf_usuario = ? AND kf_cliente = ?',
      [usuario, cliente]
    );

    if (rows.length > 0) {
      return res.status(409).json({ message: 'El cliente ya está registrado para este usuario' });
    }

    // Registrar el cliente para el usuario
    await db.query(
      'INSERT INTO imagenes.radar_usuario_clientes (kf_usuario, kf_cliente) VALUES (?, ?)',
      [usuario, cliente]
    );

    res.status(201).json({ status: 'success', message: 'Cliente registrado exitosamente para el usuario' });
  } catch (error) {
    console.error('Error al registrar cliente para el usuario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}

exports.eliminaClienteUsuario = async (req, res) => {
  const { usuario, cliente } = req.body;

  if (!usuario || !cliente) {
    return res.status(400).json({ message: 'Los campos "usuario" y "cliente" son obligatorios' });
  }

  try {
    // Verificar si el cliente está registrado para el usuario
    const [rows] = await db.query(
      'SELECT * FROM imagenes.radar_usuario_clientes WHERE kf_usuario = ? AND kf_cliente = ?',
      [usuario, cliente]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'El cliente no está registrado para este usuario' });
    }

    // Eliminar el cliente del usuario
    await db.query(
      'DELETE FROM imagenes.radar_usuario_clientes WHERE kf_usuario = ? AND kf_cliente = ?',
      [usuario, cliente]
    );

    res.status(200).json({ status: 'success', message: 'Cliente eliminado exitosamente del usuario' });
  } catch (error) {
    console.error('Error al eliminar cliente del usuario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}


// --- Reportes ---
exports.altaReportes = async (req, res) => {
  
  const { usuario } = req.body;

  if (!usuario) {
    return res.status(400).json({ message: 'El usuario es obligatorio' });
  }
  
  try {

    const [usuarioDetalles] = await db.query('SELECT * FROM perfiles.usuarios WHERE xt_usuario = ?', [usuario]);
    if (usuarioDetalles.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Insertar en Solicitud Sistemas
    await db.query(
      'INSERT IGNORE INTO perfiles.solicitud_sistemas (xt_usuario, xt_sistema, xt_codigoSolicitud, xt_tipo, xd_fecha) VALUES (?, ?, ?, ?, CURRENT_DATE)',
      [usuario, 'REPORTES', 'SISTEMA', 'ALTA']
    );

    // Insertar a Sistemas
    await db.query(
      'INSERT INTO perfiles.sistemas (xt_usuario, xt_sistema, xt_estatus) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE xt_estatus = VALUES(xt_estatus)',
      [usuario, 'REPORTES', 'ACTIVO']
    );
    
    res.status(201).json({ status: 'success', message: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.bajaReportes = async (req, res) => {
  
  const { usuario } = req.body;

  if (!usuario) {
    return res.status(400).json({ message: 'El usuario es obligatorio' });
  }
  
  try {

    // Desactivar Sistemas
    await db.query(
      'UPDATE perfiles.sistemas SET xt_estatus = ? WHERE xt_usuario = ? AND xt_sistema = ?',
      ['INACTIVO', usuario, 'REPORTES']
    );

    res.status(201).json({ status: 'success', message: 'Usuario desactivado exitosamente' });
  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};


// --- Auditoria Datos ---
exports.altaAuditoriaDatos = async (req, res) => {
  const { usuario } = req.body;

  if (!usuario) {
    return res.status(400).json({ message: 'El usuario es obligatorio' });
  }

  try {
    const [usuarioDetalles] = await db.query('SELECT * FROM perfiles.usuarios WHERE xt_usuario = ?', [usuario]);
    if (usuarioDetalles.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Insertar en Solicitud Sistemas
    await db.query(
      'INSERT IGNORE INTO perfiles.solicitud_sistemas (xt_usuario, xt_sistema, xt_codigoSolicitud, xt_tipo, xd_fecha) VALUES (?, ?, ?, ?, CURRENT_DATE)',
      [usuario, 'AUDITORIA DATOS', 'SISTEMA', 'ALTA']
    );

    // Insertar a Sistemas
    await db.query(
      'INSERT INTO perfiles.sistemas (xt_usuario, xt_sistema, xt_estatus) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE xt_estatus = VALUES(xt_estatus)',
      [usuario, 'AUDITORIA DATOS', 'ACTIVO']
    );

    res.status(201).json({ status: 'success', message: 'Usuario registrado exitosamente en Auditoria Datos' });
  } catch (error) {
    console.error('Error al registrar usuario en Auditoria Datos:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.bajaAuditoriaDatos = async (req, res) => {
  const { usuario } = req.body;

  if (!usuario) {
    return res.status(400).json({ message: 'El usuario es obligatorio' });
  }

  try {
    // Desactivar Sistemas
    await db.query(
      'UPDATE perfiles.sistemas SET xt_estatus = ? WHERE xt_usuario = ? AND xt_sistema = ?',
      ['INACTIVO', usuario, 'AUDITORIA DATOS']
    );

    res.status(201).json({ status: 'success', message: 'Usuario desactivado exitosamente en Auditoria Datos' });
  } catch (error) {
    console.error('Error al desactivar usuario en Auditoria Datos:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};


// --- Backlog ---
exports.altaBacklog = async (req, res) => {
  const { usuario } = req.body;

  if (!usuario) {
    return res.status(400).json({ message: 'El usuario es obligatorio' });
  }

  try {
    const [usuarioDetalles] = await db.query('SELECT * FROM perfiles.usuarios WHERE xt_usuario = ?', [usuario]);
    if (usuarioDetalles.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Insertar en Solicitud Sistemas
    await db.query(
      'INSERT IGNORE INTO perfiles.solicitud_sistemas (xt_usuario, xt_sistema, xt_codigoSolicitud, xt_tipo, xd_fecha) VALUES (?, ?, ?, ?, CURRENT_DATE)',
      [usuario, 'BACKLOG', 'SISTEMA', 'ALTA']
    );

    // Insertar a Sistemas
    await db.query(
      'INSERT INTO perfiles.sistemas (xt_usuario, xt_sistema, xt_estatus) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE xt_estatus = VALUES(xt_estatus)',
      [usuario, 'BACKLOG', 'ACTIVO']
    );

    // Insertar backlog usuarios
    await db.query(
      'INSERT IGNORE INTO backlog.radar_usuarios (kp_usuario, xt_password, xt_nombre, kf_categoria) VALUES (?, ?, ?, ?)',
      [usuario, usuarioDetalles[0].xt_password, usuarioDetalles[0].xt_nombre, usuarioDetalles[0].xt_categoria]
    );

    const [scripts] = await db.query('SELECT * FROM backlog.radar_catalogo_php WHERE kf_categoria in (?, ?)', ['Fichas generales', 'Login e Inicio']);

    scripts.map(async (script) => {
      await db.query(
        'INSERT IGNORE INTO backlog.radar_usuarios_catalogo_php (kf_phpId, kf_usuarioId) VALUES (?, ?)',
        [script.kp_nombre, usuario]
      );
    });

    res.status(201).json({ status: 'success', message: 'Usuario registrado exitosamente en Backlog' });
  } catch (error) {
    console.error('Error al registrar usuario en Backlog:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.bajaBacklog = async (req, res) => {
  const { usuario } = req.body;

  if (!usuario) {
    return res.status(400).json({ message: 'El usuario es obligatorio' });
  }

  try {
    // Desactivar Sistemas
    await db.query(
      'UPDATE perfiles.sistemas SET xt_estatus = ? WHERE xt_usuario = ? AND xt_sistema = ?',
      ['INACTIVO', usuario, 'BACKLOG']
    );

    res.status(201).json({ status: 'success', message: 'Usuario desactivado exitosamente en Backlog' });
  } catch (error) {
    console.error('Error al desactivar usuario en Backlog:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};


// --- Estadisticas ---
exports.altaEstadisticas = async (req, res) => {
  const { usuario } = req.body;

  if (!usuario) {
    return res.status(400).json({ message: 'El usuario es obligatorio' });
  }

  try {
    const [usuarioDetalles] = await db.query('SELECT * FROM perfiles.usuarios WHERE xt_usuario = ?', [usuario]);
    if (usuarioDetalles.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Insertar en Solicitud Sistemas
    await db.query(
      'INSERT IGNORE INTO perfiles.solicitud_sistemas (xt_usuario, xt_sistema, xt_codigoSolicitud, xt_tipo, xd_fecha) VALUES (?, ?, ?, ?, CURRENT_DATE)',
      [usuario, 'ESTADISTICAS', 'SISTEMA', 'ALTA']
    );

    // Insertar a Sistemas
    await db.query(
      'INSERT INTO perfiles.sistemas (xt_usuario, xt_sistema, xt_estatus) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE xt_estatus = VALUES(xt_estatus)',
      [usuario, 'ESTADISTICAS', 'ACTIVO']
    );

    // Insertar estadisticas usuarios
    await db.query(
      'INSERT IGNORE INTO graphics.usuarios (xt_usuario, xt_password, xt_nombre, xt_estatus) VALUES (?, ?, ?, ?)',
      [usuario, usuarioDetalles[0].xt_password, usuarioDetalles[0].xt_nombre, 'ACTIVO']
    );

    await db.query(
      'INSERT IGNORE INTO graphics.graphics_user (xt_userName, xt_password, xt_nombre, xn_numGraphics, kf_categoriaId) VALUES (?, ?, ?, ?, ?)',
      [usuario, usuarioDetalles[0].xt_password, usuarioDetalles[0].xt_nombre, 6, 1]
    );

    res.status(201).json({ status: 'success', message: 'Usuario registrado exitosamente en Estadisticas' });
  } catch (error) {
    console.error('Error al registrar usuario en Estadisticas:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.bajaEstadisticas = async (req, res) => {
  const { usuario } = req.body;

  if (!usuario) {
    return res.status(400).json({ message: 'El usuario es obligatorio' });
  }

  try {
    // Desactivar Sistemas
    await db.query(
      'UPDATE perfiles.sistemas SET xt_estatus = ? WHERE xt_usuario = ? AND xt_sistema = ?',
      ['INACTIVO', usuario, 'ESTADISTICAS']
    );

    res.status(201).json({ status: 'success', message: 'Usuario desactivado exitosamente en Estadisticas' });
  } catch (error) {
    console.error('Error al desactivar usuario en Estadisticas:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.usuarioClientesEstadisticas= async (req, res) => {

  const { usuario } = req.query;

  if (!usuario) {
    return res.status(400).json({ message: 'El parámetro "usuario" es obligatorio' });
  }

  try {
    const [rows] = await db.query(
      'SELECT uc.xn_cliente, c.kp_clienteId, c.xt_nombre, c.xt_rfc FROM graphics.usuario_cliente uc, master_ge.master_rfc_clienteId c WHERE uc.xn_cliente = c.kp_clienteId AND uc.xt_usuario = ? ORDER BY xt_nombre ASC',
      [usuario]
    );

    res.status(200).json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error al obtener la lista de clientes:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.listaClientesEstadisticas = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT kp_clienteId, xt_nombre, xt_rfc FROM master_ge.master_rfc_clienteId ORDER BY xt_nombre ASC'
    );

    res.status(200).json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error al obtener la lista de clientes:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.registraClienteUsuarioEstadisticas = async (req, res) => {
  const { usuario, cliente, rfc } = req.body;

  if (!usuario || !cliente || !rfc) {
    return res.status(400).json({ message: 'Los campos "usuario" , "cliente" y "rfc" son obligatorios' });
  }

  try {
    // Verificar si el cliente ya está registrado para el usuario
    const [rows] = await db.query(
      'SELECT * FROM graphics.usuario_cliente WHERE xt_usuario = ? AND xt_rfc = ?',
      [usuario, rfc]
    );

    if (rows.length > 0) {
      return res.status(409).json({ message: 'El cliente ya está registrado para este usuario' });
    }

    // Registrar el cliente para el usuario
    await db.query(
      'INSERT IGNORE INTO graphics.usuario_cliente (xt_usuario, xn_cliente, xt_rfc) VALUES (?, ?, ?)',
      [usuario, cliente, rfc]
    );

    res.status(201).json({ status: 'success', message: 'Cliente registrado exitosamente para el usuario' });
  } catch (error) {
    console.error('Error al registrar cliente para el usuario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}

exports.eliminaClienteUsuarioEstadisticas = async (req, res) => {
  const { usuario, cliente, rfc } = req.body;

  if (!usuario || !cliente || !rfc) {
    return res.status(400).json({ message: 'Los campos "usuario", "cliente" y "rfc" son obligatorios' });
  }

  try {
    // Verificar si el cliente está registrado para el usuario
    const [rows] = await db.query(
      'SELECT * FROM  graphics.usuario_cliente WHERE xt_usuario = ? AND xt_rfc = ?',
      [usuario, rfc]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'El cliente no está registrado para este usuario' });
    }

    // Eliminar el cliente del usuario
    await db.query(
      'DELETE FROM graphics.usuario_cliente WHERE xt_usuario = ? AND xt_rfc = ?',
      [usuario, rfc]
    );

    res.status(200).json({ status: 'success', message: 'Cliente eliminado exitosamente del usuario' });
  } catch (error) {
    console.error('Error al eliminar cliente del usuario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}


// --- Radar ---
exports.altaRadar = async (req, res) => {
  const { usuario } = req.body;

  if (!usuario) {
    return res.status(400).json({ message: 'El usuario es obligatorio' });
  }

  try {
    const [usuarioDetalles] = await db.query('SELECT * FROM perfiles.usuarios WHERE xt_usuario = ?', [usuario]);
    if (usuarioDetalles.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Insertar en Solicitud Sistemas
    await db.query(
      'INSERT IGNORE INTO perfiles.solicitud_sistemas (xt_usuario, xt_sistema, xt_codigoSolicitud, xt_tipo, xd_fecha) VALUES (?, ?, ?, ?, CURRENT_DATE)',
      [usuario, 'RADAR', 'SISTEMA', 'ALTA']
    );

    // Insertar a Sistemas
    await db.query(
      'INSERT INTO perfiles.sistemas (xt_usuario, xt_sistema, xt_estatus) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE xt_estatus = VALUES(xt_estatus)',
      [usuario, 'RADAR', 'ACTIVO']
    );

    res.status(201).json({ status: 'success', message: 'Usuario registrado exitosamente en Radar' });
  } catch (error) {
    console.error('Error al registrar usuario en Radar:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.bajaRadar = async (req, res) => {
  const { usuario } = req.body;

  if (!usuario) {
    return res.status(400).json({ message: 'El usuario es obligatorio' });
  }

  try {
    // Desactivar Sistemas
    await db.query(
      'UPDATE perfiles.sistemas SET xt_estatus = ? WHERE xt_usuario = ? AND xt_sistema = ?',
      ['INACTIVO', usuario, 'RADAR']
    );

    res.status(201).json({ status: 'success', message: 'Usuario desactivado exitosamente en Radar' });
  } catch (error) {
    console.error('Error al desactivar usuario en Radar:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.listaRadares = async (req, res) => {
  // Configuración SFTP (ajusta estos valores a tu entorno)
  const sftpConfig = {
    host: '192.1.172.1',
    port: 22,
    username: 'gea',
    password: 'HEykFWYjbgeI2022*',
    // privateKey: require('fs').readFileSync('/ruta/a/llave_privada'), // Si usas autenticación por llave
  };
  
  const directorio = '../var/www/html/Sistemas/radar'; // Cambia esto por el directorio que deseas leer

  
  const sftp = new SftpClient();
  let fileList = [];
  let listadoRadares = [];

  try {
    // Conexión y lectura del directorio SFTP
    await sftp.connect(sftpConfig);
    fileList = await sftp.list(directorio);
    listadoRadares = fileList
      .filter(item => item.type === 'd' && /^\d+$/.test(item.name))
      .map(item => item.name);
  } catch (sftpError) {
    console.error('Error al conectar o leer el SFTP:', sftpError);
  } finally {
    await sftp.end();
  }

  try {
    
    const [rows] = await db.query(
      'SELECT * FROM master_ge.master_rfc_clienteid WHERE kp_clienteId in (?) order by xt_nombre',
      [listadoRadares]
    );
    
    res.status(200).json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error al obtener la lista de radares:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.listaRadaresUsuario = async (req, res) => {

  const { usuario } = req.query;

  if (!usuario) {
    return res.status(400).json({ message: 'El parámetro "usuario" es obligatorio' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM master_ge.master_rfc_clienteid WHERE xt_rfc in ( SELECT distinct xt_rfc FROM perfiles.clientes WHERE xt_usuario = ? ) order by xt_nombre',
      [usuario]
    );
    
    res.status(200).json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error al obtener la lista de radares:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.registraRadarUsuario = async (req, res) => {

  const { usuario, clienteId, rfc, squema } = req.body;

  if (!usuario || !clienteId || !rfc || !squema) {
    return res.status(400).json({ message: 'Todos los parámetros son obligatorios' });
  }

  try {
    const [datosUsuario] = await db.query(
      'SELECT * FROM perfiles.usuarios WHERE xt_usuario = ?',
      [usuario]
    );

    await db.query(
      'INSERT IGNORE INTO perfiles.clientes (xt_usuario, xt_oficina, xn_clienteId, xt_rfc) VALUES (?, ?, ?, ?)',
      [usuario, datosUsuario[0].xt_ciudad, clienteId, rfc]
    );
    
    await db.query(
      `INSERT IGNORE INTO ${squema}.radar_usuarios (kp_usuario, xt_password, xt_nombre, kf_categoria) VALUES (?, ?, ?, ?)`,
      [usuario, datosUsuario[0].xt_password, datosUsuario[0].xt_nombre, 'Inhouse']
    );

    /*
    const [categorias] = await db.query(
      `SELECT distinct kp_categoria from ${squema}.radar_categorias_php WHERE kp_categoria not in ('Sesiones y Perfiles')`
    );
    */
    const categorias = ['Busquedas', 'Extracción de archivos', 'Fichas cliente', 'Fichas generales', 'Login e Inicio', 'Pop Up', 'Reportes', 'Tableros Cliente', 'Tableros generales', 'Uploads'];

    const [listaScripts] = await db.query(
      `SELECT kp_nombre FROM ${squema}.radar_catalogo_php WHERE kf_categoria in (?)`,
      [categorias]
    );

    listaScripts.map(async (script) => {
      await db.query(
        `INSERT IGNORE INTO ${squema}.radar_usuarios_catalogo_php (kf_phpId, kf_usuarioId) VALUES (?, ?)`,
        [script.kp_nombre, usuario]
      );
    });

    res.status(200).json({ status: 'success', data: categorias });;
  } catch (error) {
    console.error('Error al registrar radar:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.eliminaRadarUsuario = async (req, res) => {

  const { usuario, clienteId, rfc } = req.body;

  if (!usuario || !clienteId || !rfc) {
    return res.status(400).json({ message: 'Todos los parámetros son obligatorios' });
  }

  try {
    const [datosUsuario] = await db.query(
      'SELECT * FROM perfiles.usuarios WHERE xt_usuario = ?',
      [usuario]
    );

    await db.query(
      'DELETE FROM perfiles.clientes WHERE xt_usuario = ? AND xt_oficina = ? AND xn_clienteId = ? AND xt_rfc = ?',
      [usuario, datosUsuario[0].xt_ciudad, clienteId, rfc]
    );

    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Error al eliminar radar:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// --- Links ---
exports.catalogoOficinasLinks = async (req, res) =>{
  try {
    const [rows] = await db.query('SELECT xt_oficina, xt_descripcion FROM links.catalogo_oficinas');

    res.status(201).json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error al obtener catalgo de oficinas en Links:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}

exports.catalogoModulosLinks = async (req, res) =>{
  try {
    const [rows] = await db.query('SELECT xt_modulo, xt_descripcion FROM links.catalogo_modulos');

    res.status(201).json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error al obtener catalgo de modulos en Links:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}

exports.oficinasUsuarioLinks= async (req, res) => {

  const { usuario } = req.query;

  if (!usuario) {
    return res.status(400).json({ message: 'El parámetro "usuario" es obligatorio' });
  }

  try {
    const [rows] = await db.query(
      'SELECT xt_oficina, xt_status FROM links.oficinas WHERE xt_usuario = ? ORDER BY xt_oficina ASC',
      [usuario]
    );

    res.status(200).json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error al obtener la lista de oficinas del usuario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.modulosOficinaUsuarioLinks= async (req, res) => {

  const { usuario, oficina } = req.query;

  if (!usuario | !oficina) {
    return res.status(400).json({ message: 'Los parametros son obligatorios' });
  }

  try {
    const [rows] = await db.query(
      'SELECT xt_modulo FROM links.modulos WHERE xt_usuario = ? AND xt_oficina = ? ORDER BY xt_modulo',
      [usuario, oficina]
    );

    res.status(200).json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error al obtener los modulos de la oficina del usuario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.altaModuloOficinaUsuarioLinks = async (req, res) => {
  const { usuario, oficina, modulo } = req.body;

  if (!usuario) {
    return res.status(400).json({ message: 'El usuario es obligatorio' });
  }

  try {
    const [oficinasusuario] = await db.query('SELECT * FROM links.oficinas WHERE xt_usuario = ?', [usuario]);
    if (oficinasusuario.length === 0) {
      await db.query(
        'INSERT IGNORE INTO links.oficinas (xt_usuario, xt_oficina, xt_status) VALUES (?, ?, ?)',
        [usuario, oficina, 'Default']
      );
    }else{
      await db.query(
        'INSERT IGNORE INTO links.oficinas (xt_usuario, xt_oficina) VALUES (?, ?)',
        [usuario, oficina]
      );
    }

    // Insertar en modulos
    await db.query(
      'INSERT IGNORE INTO links.modulos (xt_usuario, xt_oficina, xt_modulo) VALUES (?, ?, ?)',
      [usuario, oficina, modulo]
    );

    res.status(201).json({ status: 'success', message: 'Modulo registrado exitosamente en Links' });
  } catch (error) {
    console.error('Error al registrar usuario en Links:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.eliminaModuloOficinaUsuarioLinks = async (req, res) => {
  const { usuario, oficina, modulo } = req.body;

  if (!usuario) {
    return res.status(400).json({ message: 'El usuario es obligatorio' });
  }

  try {

    // Insertar en modulos
    await db.query(
      'DELETE FROM links.modulos WHERE xt_usuario = ? AND xt_oficina = ? AND xt_modulo = ?',
      [usuario, oficina, modulo]
    );

    const [modulosOficinaUsuario] = await db.query('SELECT * FROM links.modulos WHERE xt_usuario = ? AND xt_oficina = ?', [usuario, oficina]);
    if (modulosOficinaUsuario.length === 0) {
      await db.query(
        'DELETE FROM links.oficinas WHERE xt_usuario = ? AND xt_oficina = ?',
        [usuario, oficina]
      );
    }

    res.status(201).json({ status: 'success', message: 'Modulo eliminado exitosamente en Links' });
  } catch (error) {
    console.error('Error al eliminar modulo en Links:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.altaLinks = async (req, res) => {
  const { usuario } = req.body;

  if (!usuario) {
    return res.status(400).json({ message: 'El usuario es obligatorio' });
  }

  try {
    const [usuarioDetalles] = await db.query('SELECT * FROM perfiles.usuarios WHERE xt_usuario = ?', [usuario]);
    if (usuarioDetalles.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Insertar en Solicitud Sistemas
    await db.query(
      'INSERT IGNORE INTO perfiles.solicitud_sistemas (xt_usuario, xt_sistema, xt_codigoSolicitud, xt_tipo, xd_fecha) VALUES (?, ?, ?, ?, CURRENT_DATE)',
      [usuario, 'LINKS', 'SISTEMA', 'ALTA']
    );

    // Insertar a Sistemas
    await db.query(
      'INSERT INTO perfiles.sistemas (xt_usuario, xt_sistema, xt_estatus) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE xt_estatus = VALUES(xt_estatus)',
      [usuario, 'LINKS', 'ACTIVO']
    );

    await db.query(
      'INSERT IGNORE INTO links.usuarios (xt_usuario, xt_password, xt_nombre, xt_correo, xn_estilo, xt_estatus, xt_empresa, xt_foto, xt_puesto, xt_tipo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [usuario, usuarioDetalles[0].xt_password, usuarioDetalles[0].xt_nombre, usuarioDetalles[0].xt_correo, '1', 'Activo', usuarioDetalles[0].xt_empresa, ''/*usuarioDetalles[0].xt_foto*/, usuarioDetalles[0].xt_puesto, usuarioDetalles[0].xt_categoria[0] ]
    );

    await db.query(
      'INSERT IGNORE INTO links.oficinas (xt_usuario, xt_oficina, xt_status) VALUES (?, ?, ?)',
      [usuario, usuarioDetalles[0].xt_ciudad, 'Default']
    );

    res.status(201).json({ status: 'success', message: 'Usuario registrado exitosamente en Links' });
  } catch (error) {
    console.error('Error al registrar usuario en Links:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.bajaLinks = async (req, res) => {
  const { usuario } = req.body;

  if (!usuario) {
    return res.status(400).json({ message: 'El usuario es obligatorio' });
  }

  try {
    // Desactivar Sistemas
    await db.query(
      'UPDATE perfiles.sistemas SET xt_estatus = ? WHERE xt_usuario = ? AND xt_sistema = ?',
      ['INACTIVO', usuario, 'LINKS']
    );

    res.status(201).json({ status: 'success', message: 'Usuario desactivado exitosamente en Links' });
  } catch (error) {
    console.error('Error al desactivar usuario en Links:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
