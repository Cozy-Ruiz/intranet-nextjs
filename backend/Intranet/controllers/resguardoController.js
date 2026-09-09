// backend/Intranet/controllers/perfilesController.js
const db = require('../../config/db').mysqlPool;

//Resguardo Links
exports.listaCategoriasResguardo = async (req, res) => {

  try {
    const [listaCategoriasResguardo] = await db.query('SELECT distinct xt_categoria FROM intranet2.sgi_catalogo_articulos_resguardo ORDER BY xt_categoria ASC');
    if (listaCategoriasResguardo.length === 0) {
      return res.status(404).json({ message: 'No se encontraron categorías de resguardo' });
    }

    res.status(200).json({ status: 'success', data: listaCategoriasResguardo });
  } catch (error) {
    console.error('Error al obtener categorías de resguardo:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}

exports.listaArticulosResguardo = async (req, res) => {

  try {
    const [listaArticulosResguardo] = await db.query('SELECT * FROM intranet2.sgi_catalogo_articulos_resguardo ORDER BY xt_categoria, xt_articulo');
    if (listaArticulosResguardo.length === 0) {
      return res.status(404).json({ message: 'No se encontraron artículos de resguardo' });
    }

    res.status(200).json({ status: 'success', data: listaArticulosResguardo });
  } catch (error) {
    console.error('Error al obtener artículos de resguardo:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}

exports.registraSolicitudResguardo = async (req, res) => {
  const { usuarioResguardo, categoria, articulo, pdr, ciudad, usuarioSolicita } = req.body;

  if (!usuarioResguardo || !categoria || !articulo || !ciudad || !usuarioSolicita) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }

  try {

    const [maxNumero] = await db.query(`SELECT MAX(xn_numero) FROM intranet2.SGI_Quejas_Solicitudesv2 WHERE YEAR(xd_fecha) = YEAR(NOW()) AND xt_tipo = 'B' AND xt_ciudad = ? AND xt_grupo = 'GE' `, [ciudad]);
    const codigo = maxNumero[0]['MAX(xn_numero)'] ? maxNumero[0]['MAX(xn_numero)'] + 1 : 1;
    const solicitud = `GE-B-${ciudad}-${new Date().getFullYear().toString().slice(-2)}-${codigo.toString().padStart(5, '0')}`;
    const titulo = `Solicitud de resguardo ${articulo}`;
    const descripcion = `Solicitud de resguardo para el artículo ${articulo} con categoría ${categoria} en la oficina ${ciudad} para el usuario ${usuarioResguardo}`;

    let usuarioPdr = pdr; 

    if (categoria === 'ADMINISTRACION') {
      const [usuarios] = await db.query(`SELECT xt_usuario FROM perfiles.usuarios WHERE xt_ciudad = ? AND FIND_IN_SET(xt_puesto, ?) > 0 LIMIT 1; `, [ciudad, pdr]);
      
      if (usuarios && usuarios.length > 0) {
        usuarioPdr = usuarios[0].xt_usuario;
      }
    }
    
    /*
    if (pdr !== '') {
      await db.query('INSERT INTO intranet2.SGI_Quejas_Solicitudesv2(xt_quejaSolicitud, xt_titulo, xt_tipo, xt_tipoSolicitud, xt_grupo, xt_ciudad, xd_fecha, xn_numero, xt_descripcion, kf_usuarioId, xt_status, xt_pdr) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [solicitud, titulo, 'B', 'AV', 'GE', ciudad, new Date(), codigo, descripcion, usuarioSolicita, 'ASIGNADA', usuarioPdr]);
      await db.query('INSERT INTO intranet2.SGI_Quejas_Solicitudes_Estatusv2 (xt_quejaSolicitud, xn_numero, xt_estatus, xd_fecha, kf_usuario) VALUES(?, ?, ?, ?, ?)', [solicitud, 1, 'SIN ASIGNAR', new Date(), usuarioSolicita]);
      await new Promise(resolve => setTimeout(resolve, 500));
      await db.query('INSERT INTO intranet2.SGI_Quejas_Solicitudes_Estatusv2 (xt_quejaSolicitud, xn_numero, xt_estatus, xd_fecha, kf_usuario) VALUES(?, ?, ?, ?, ?)', [solicitud, 2, 'ASIGNADA', new Date(), usuarioSolicita]);
    }else{
      await db.query('INSERT INTO intranet2.SGI_Quejas_Solicitudesv2(xt_quejaSolicitud, xt_titulo, xt_tipo, xt_tipoSolicitud, xt_grupo, xt_ciudad, xd_fecha, xn_numero, xt_descripcion, kf_usuarioId, xt_status, xt_pdr) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [solicitud, titulo, 'B', 'AV', 'GE', ciudad, new Date(), codigo, descripcion, usuarioSolicita, 'SIN ASIGNAR', usuarioPdr]);
      await db.query('INSERT INTO intranet2.SGI_Quejas_Solicitudes_Estatusv2 (xt_quejaSolicitud, xn_numero, xt_estatus, xd_fecha, kf_usuario) VALUES(?, ?, ?, ?, ?)', [solicitud, 1, 'SIN ASIGNAR', new Date(), usuarioSolicita]);
    }*/

    await db.query('INSERT INTO intranet2.sgi_resguardo_articulos (xt_usuario, xt_articulo, xd_fechaAsignacion, xt_codigoSolicitud) VALUES(?, ?, ?, ?)', [usuarioResguardo, articulo, new Date(), solicitud]);

    // Aquí podrías agregar lógica adicional para notificar al usuario o registrar el evento
    console.log(`Solicitud de resguardo registrada: ${solicitud}`);
    res.status(201).json({ status: 'success', message: 'Solicitud de resguardo registrada correctamente' });
  } catch (error) {
    console.error('Error al registrar solicitud de resguardo:', error);
    res.status(500).json({ status: 'error', message: 'Error del servidor' });
  }
}

exports.listaResguardoUsuario = async (req, res) => {
  const { usuario } = req.query;

  if (!usuario) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }

  try {

    const [resguardoUsuario] = await db.query('SELECT * FROM intranet2.sgi_resguardo_articulos WHERE xt_usuario = ? ORDER BY xd_fechaAsignacion DESC', [usuario]);
    if (resguardoUsuario.length === 0) {
      return res.status(404).json({ message: 'No se encontraron artículos de resguardo para este usuario' });
    }

    res.status(200).json({ status: 'success', data: resguardoUsuario });
  } catch (error) {
    console.error('Error al obtener artículos de resguardo del usuario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}