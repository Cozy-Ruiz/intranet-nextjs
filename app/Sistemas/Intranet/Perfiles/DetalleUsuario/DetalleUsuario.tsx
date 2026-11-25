'use client';

import { useEffect, useState } from 'react';
import { FaEdit } from 'react-icons/fa';
import { useSearchParams } from 'next/navigation';
import SwitchSistema from '../components/SwitchSistema';
import SwitchSistemaTriple from '../components/SwitchSistemaTriple';
import ConfiguracionExtractor from '../components/ConfiguracionExtractor';
import ConfiguracionEstadisticas from '../components/ConfiguracionEstadisticas';
import ConfiguracionLinks from '../components/ConfiguracionLinks';
import ConfiguracionRadar from '../components/ConfiguracionRadar';
import { useRouter } from 'next/navigation';
import { enviarCorreoSistemasAltaBaja } from '../utils/enviarCorreoSistemasAltaBaja';

type UsuarioDB = {
    xt_usuario: string;
    xt_nombre: string;
    xt_correo: string;
    xt_categoria: string;
    xt_rfc: string;
    xt_curp: string;
    xt_empresa: string;
    xt_tipo: string;
    xt_puesto: string;
    xt_puestoJefeDirecto: string;
    xt_estatus: string;
    xt_foto: string;
    xt_ciudad: string;

    xt_usuarioJefeDirecto: string;
    xt_nombreJefeDirecto: string;
    xt_correoJefeDirecto: string;
};

type SesionInnerData = {
    sesionUsuario: string;
    sesionCorreo: string;
    sesionPuesto: string;
    sesionPuestoCategoria: string;
};

type SesionResponse = {
    status: string;
    session: SesionInnerData;
};

type TripeEstadoSistemas = true | false | "pending" | "pending alta" | "pending baja";

const DetalleUsuario = () => {

    const router = useRouter();

    const searchParams = useSearchParams();
    const usuarioDetalle = searchParams.get('usuario'); // 👈 Aquí obtienes ?usuario=cozy

    const [session, setSession] = useState<SesionResponse | null>(null);
    const [usuario, setUsuario] = useState<UsuarioDB | null>(null);
    const [usuariosLista, setUsuariosLista] = useState<UsuarioDB[]>([]);

    const [intranetStatus, setIntranetStatus] = useState(false);
    const [extractorStatus, setExtractorStatus] = useState(false);
    const [linksStatus, setLinksStatus] = useState(false);
    const [reportesStatus, setReportesStatus] = useState(false);
    const [auditoriaDatosStatus, setAuditoriaDatosStatus] = useState(false);
    const [backlogStatus, setBacklogStatus] = useState(false);
    const [estadisticasEstatus, setEstadisticasStatus] = useState(false);
    const [radarStatus, setRadarStatus] = useState(false);
    const [eLearningStatus, setELearningStatus] = useState<TripeEstadoSistemas>(false);
    const [axaptaStatus, setAxaptaStatus] = useState<TripeEstadoSistemas>(false);
    const [bodegaStatus, setBodegaStatus] = useState<TripeEstadoSistemas>(false);
    const [pedimentoStatus, setPedimentoStatus] = useState<TripeEstadoSistemas>(false);
    const [sciaStatus, setSciaStatus] = useState<TripeEstadoSistemas>(false);
    const [correoElectronicoStatus, setCorreoElectronicoStatus] = useState<TripeEstadoSistemas>(false);

    const [mostrarConfiguracionExtractor, setMostrarConfiguracionExtractor] = useState(false);
    const [mostrarConfiguracionEstadisticas, setMostrarConfiguracionEstadisticas] = useState(false);
    const [mostrarConfiguracionLinks, setMostrarConfiguracionLinks] = useState(false)
    const [mostrarConfiguracionRadar, setMostrarConfiguracionRadar] = useState(false)

    
    useEffect(() => {
        fetch('https://escalante.com.mx/Sistemas/session.php', {
            credentials: 'include'
        })
            .then(res => {
                if (!res.ok) throw new Error('Respuesta no válida');
                return res.json();
            })
            .then(data => {
                if (!data || data.status !== 'success') {
                    window.location.href = 'https://escalante.com.mx/Sistemas';
                    return;
                }
                setSession(data);
            })
            .catch(err => {
                console.error('Error al obtener la sesión:', err);
            });
    }, []);
    

    useEffect(() => {
        if (usuarioDetalle) {
            console.log('Entrando a detalle de usuario');
            cargarDetalle(usuarioDetalle);
        } else {
            console.log('Entrando a listado de usuarios');
            fetch('/backend/Intranet/Perfiles/listaUsuarios')
                .then(res => res.json())
                .then(data => setUsuariosLista(data.data || []))
                .catch(err => console.error('Error al cargar usuarios:', err));
        }
    }, [usuarioDetalle]);



    const verificarPermisos = () => {
        
        if(session?.session.sesionPuesto !== usuario?.xt_puestoJefeDirecto && session?.session.sesionPuesto !== 'Gerente de Administración' && session?.session.sesionPuesto !== 'Auxiliar Administrativo B' && session?.session.sesionPuesto !== 'Coordinador Administrativo' && session?.session.sesionPuesto !== 'Gerente de Contabilidad' && session?.session.sesionPuesto !== 'Auxiliar Contable' && session?.session.sesionPuesto !== 'Auxiliar de Calidad' && session?.session.sesionPuestoCategoria !== 'Sistemas'){
            alert('No tienes permisos para modificar este usuario.');
            return false;
        }
        
        return true;
    }

    const handleToggleSistemasInternos = async (sistema: string) => {
        const sistemas: Record<string, {
            nombre: string;
            endpoint: string;
            estado: boolean;
            setEstado: (estado: boolean) => void;
            alActivar?: () => void;
        }> = {
            INTRANET: {
                nombre: 'Intranet',
                endpoint: 'Intranet',
                estado: intranetStatus,
                setEstado: setIntranetStatus,
            },
            EXTRACTOR: {
                nombre: 'Extractor',
                endpoint: 'Extractor',
                estado: extractorStatus,
                setEstado: setExtractorStatus,
                alActivar: () => setMostrarConfiguracionExtractor(true),
            },
            REPORTES: {
                nombre: 'Reportes',
                endpoint: 'Reportes',
                estado: reportesStatus,
                setEstado: setReportesStatus,
            },
            'AUDITORIA DATOS': {
                nombre: 'Auditoria Datos',
                endpoint: 'AuditoriaDatos',
                estado: auditoriaDatosStatus,
                setEstado: setAuditoriaDatosStatus,
            },
            BACKLOG: {
                nombre: 'Backlog',
                endpoint: 'Backlog',
                estado: backlogStatus,
                setEstado: setBacklogStatus,
            },
            ESTADISTICAS: {
                nombre: 'Estadísticas',
                endpoint: 'Estadisticas',
                estado: estadisticasEstatus,
                setEstado: setEstadisticasStatus,
                alActivar: () => setMostrarConfiguracionEstadisticas(true),
            },
            RADAR: {
                nombre: 'Radar',
                endpoint: 'Radar',
                estado: radarStatus,
                setEstado: setRadarStatus,
            },
            LINKS: {
                nombre: 'Links',
                endpoint: 'Links',
                estado: linksStatus,
                setEstado: setLinksStatus,
            },
        };
        const sistemaConfig = sistemas[sistema];

        if (!sistemaConfig) {
            console.error(`Sistema interno no reconocido: ${sistema}`);
            return;
        }

        if (!verificarPermisos()) return;

        const accion = sistemaConfig.estado ? 'baja' : 'alta';

        if (usuario?.xt_estatus === 'Inactivo') {
            alert(`El usuario está inactivo, no se puede ${accion === 'alta' ? 'activar' : 'desactivar'} ${sistemaConfig.nombre}.`);
            return;
        }

        const confirmar = confirm(`¿Estás seguro de que deseas cambiar el estado de ${sistemaConfig.nombre}?`);
        if (!confirmar) return;

        try {
            const response = await fetch(`/backend/Intranet/Perfiles/${accion}${sistemaConfig.endpoint}`, {
                method: 'POST',
                body: JSON.stringify({ usuario: usuario?.xt_usuario }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data.success || data.status === 'success' || response.ok) {
                sistemaConfig.setEstado(!sistemaConfig.estado);
                if (accion === 'alta') sistemaConfig.alActivar?.();

                const usuarioSolicitaResponse = await fetch(`/backend/Intranet/Perfiles/detalleUsuario?usuario=${session?.session.sesionUsuario || 'cozy'}`);
                const usuarioSolicitaData = await usuarioSolicitaResponse.json();
                const usuarioSolicitaDetalles = usuarioSolicitaData.data || [];

                await enviarCorreoSistemasAltaBaja({
                    accion,
                    sistema,
                    usuario,
                    solicitante: usuarioSolicitaDetalles,
                });
            } else {
                alert(`Error al ${accion === 'alta' ? 'activar' : 'desactivar'} ${sistemaConfig.nombre}`);
            }
        } catch (err) {
            console.error('Error al llamar al backend:', err);
            alert('Ocurrió un error al intentar cambiar el estado.');
        }
    };

    const handleToggleSistemasExternos = async (sistema: string, estado: TripeEstadoSistemas) => {

        if (!verificarPermisos()) return;

        const accion = !estado || estado === 'pending baja' ? 'alta' : 'baja';
        const accionCapitalizada = accion === 'alta' ? 'activar' : 'desactivar';

        const confirmar = confirm(`¿Estás seguro que deseas cambiar el estado de ${sistema}?`);
        if (!confirmar) return;

        if (usuario?.xt_estatus === 'Inactivo') {
            alert(`El usuario está inactivo, no se puede ${accionCapitalizada} ${sistema}.`);
            return;
        }

        try {
            const response = await fetch(`/backend/Intranet/Perfiles/${accion}SistemaExterno`, {
                method: 'POST',
                body: JSON.stringify({
                    usuario: usuario?.xt_usuario,
                    usuarioSolicita: session?.session.sesionUsuario || 'cozy',
                    sistema,
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data.status === 'success' || response.ok) {
                const usuarioSolicitaResponse = await fetch(`/backend/Intranet/Perfiles/detalleUsuario?usuario=${session?.session.sesionUsuario || 'cozy'}`);
                const usuarioSolicitaData = await usuarioSolicitaResponse.json();
                const usuarioSolicitaDetalles = usuarioSolicitaData.data || [];

                await enviarCorreoSistemasAltaBaja({
                    accion,
                    sistema,
                    usuario,
                    solicitante: usuarioSolicitaDetalles,
                });

                cargarDetalle(usuario?.xt_usuario || '');
            } else {
                alert(`Error al ${accionCapitalizada} ${sistema}`);
            }
        } catch (err) {
            console.error('Error al llamar al backend:', err);
            alert(`Ocurrió un error al intentar cambiar el estado a ${sistema}.`);
        }
    };

    const handleToggleStatus = async () => {
        
        if (!verificarPermisos()) return;
        
        if (usuario && usuario.xt_estatus === 'Activo') {
            const confirmar = confirm("¿Estás seguro de que deseas desactivar el usuario?");
            if (!confirmar) return;
        }

        if (usuario && usuario.xt_estatus === 'Inactivo') {
            const confirmar = confirm("¿Estás seguro de que deseas activar el usuario?");
            if (!confirmar) return;
        }

        const endpoint = usuario && usuario.xt_estatus === 'Activo' ? '/backend/Intranet/Perfiles/bajaUsuario' : '/backend/Intranet/Perfiles/altaUsuario';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                body: JSON.stringify({ usuario: usuario?.xt_usuario, usuarioSolicita: session?.session.sesionUsuario || 'cozy' }), // ajusta los datos según necesites
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data.status === 'success' || response.ok) {

                setUsuario(prev => prev ? { ...prev, xt_estatus: prev.xt_estatus === 'Activo' ? 'Inactivo' : 'Activo' } : prev);
                
                if (endpoint === '/backend/Intranet/Perfiles/bajaUsuario') {

                    //Obtengo lista de de articulos de resguado del usuario
                    const resguardoResponse = await fetch(`/backend/Intranet/Resguardo/listaResguardoUsuario?usuario=${usuario?.xt_usuario}`);
                    const resguardoData = await resguardoResponse.json();
                    const articulosResguardo = resguardoData.data || [];

                    const sistemasResponse = await fetch(`/backend/Intranet/Perfiles/detalleUsuario?usuario=${usuario?.xt_usuario}`);
                    const sistemasData = await sistemasResponse.json();
                    const sistemasUsuario = sistemasData.data?.sistemas || [];

                    const usuarioSolicitaResponse = await fetch(`/backend/Intranet/Perfiles/detalleUsuario?usuario=${session?.session.sesionUsuario || 'cozy'}`);
                    const usuarioSolicitaData = await usuarioSolicitaResponse.json();
                    const usuarioSolicitaDetalles = usuarioSolicitaData.data || [];

                    const sistemasConEstatusEntregable = new Set([
                        'AXAPTA',
                        'BODEGA',
                        'CORREO ELECTRONICO',
                        'MGS-E-LEARNING',
                        'PEDIMENTO',
                        'SCIA',
                    ]);

                    //Envio correo de confirmacion de baja
                    await fetch('/backend/Intranet/Perfiles/enviaCorreo', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            destinatarios: [`${usuario?.xt_correoJefeDirecto}`, `${usuarioSolicitaDetalles?.xt_correo}`],
                            copias: ['cruiz@escalante.com.mx','ealdana@multiglobalservicios.com', 'sdelap@escalante.com.mx', 'gsistemas@escalante.com.mx'/*, 'pmoyotl@escalante.com.mx'*/],
                            asunto: `Baja usuario ${usuario?.xt_nombre}`,
                            perfil_puesto: `${usuario?.xt_puesto}`,
                            mensaje: [
                            `Se confirma la baja del usuario:`,
                            ``,
                            `Nombre: ${usuario?.xt_nombre}`,
                            `RFC: ${usuario?.xt_rfc}`,
                            `CURP: ${usuario?.xt_curp}`,
                            `Puesto: ${usuario?.xt_puesto}`,
                            ``,
                            `Solicitado por: ${usuarioSolicitaDetalles?.xt_nombre}`,
                            ``,
                            `Resguardo:`,
                            `${articulosResguardo.length > 0 ? articulosResguardo.map((art: any) => ` - ${art.xt_articulo}  (${art.xd_fechaAceptacion ? art.xd_fechaAceptacion : 'Pendiente'})`).join('<br>') : 'No tiene artículos en resguardo.'}`,
                            ``,
                            `Sistemas dados de baja:`,
                            `${sistemasUsuario.length > 0 ? sistemasUsuario.map((s: any) => {
                                const estatus = sistemasConEstatusEntregable.has(s.xt_sistema)
                                    ? s.xt_estatus_entregable || '(PENDIENTE)'
                                    : '(INACTIVO)';
                                return ` - ${s.xt_sistema} ${estatus ?? ''}`;
                            }).join('<br>') : 'No tiene sistemas activos.'}`,
                            ``,
                            `Saludos cordiales.`,
                            ].join('<br>')
                        }),
                    }).then(() => {
                        console.log('Correo de Baja enviado');
                    })
                    .catch(err => {
                        console.error('Error al enviar correo de Baja:', err);
                    });
                }else if (endpoint === '/backend/Intranet/Perfiles/altaUsuario') {
                    const usuarioSolicitaResponse = await fetch(`/backend/Intranet/Perfiles/detalleUsuario?usuario=${session?.session.sesionUsuario || 'cozy'}`);
                    const usuarioSolicitaData = await usuarioSolicitaResponse.json();
                    const usuarioSolicitaDetalles = usuarioSolicitaData.data || [];

                    //Envio correo de confirmacion de alta de moódulo
                    await fetch('/backend/Intranet/Perfiles/enviaCorreo', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            destinatarios: [`${usuario?.xt_correo}`, `${usuario?.xt_correoJefeDirecto}`, `${usuarioSolicitaDetalles?.xt_correo}`],
                            copias: ['cruiz@escalante.com.mx','ealdana@multiglobalservicios.com', 'sdelap@escalante.com.mx', 'gsistemas@escalante.com.mx'/*, 'pmoyotl@escalante.com.mx'*/],
                            asunto: `Reactivación usuario ${usuario?.xt_nombre}`,
                            perfil_puesto: `${usuario?.xt_puesto}`,
                            mensaje: [
                            `Se confirma reactivación para el usuario:`,
                            ``,
                            `Nombre: ${usuario?.xt_nombre}`,
                            `RFC: ${usuario?.xt_rfc}`,
                            `CURP: ${usuario?.xt_curp}`,
                            `Puesto: ${usuario?.xt_puesto}`,
                            ``,
                            `Solicitado por: ${usuarioSolicitaDetalles?.xt_nombre}`,
                            ``,
                            `Saludos cordiales.`,
                            ].join('<br>')
                        }),
                    }).then(() => {
                        console.log('Correo de reactivación enviado.');
                    })
                    .catch(err => {
                        console.error('Error al enviar correo de reactivación:', err);
                    });
                }

                if (usuario?.xt_usuario) {
                    cargarDetalle(usuario?.xt_usuario);
                }
            } else {
                alert('Error al cambiar el estado del usuario');
            }
        } catch (err) {
            console.error('Error al llamar al backend:', err);
            alert('Ocurrió un error al intentar cambiar el estado.');
        }
    };

    const cargarDetalle = (usuario: string) => {
        if (!usuario) return;

        fetch(`/backend/Intranet/Perfiles/detalleUsuario?usuario=${usuario}`)
            .then(res => res.json())
            .then(data => {
                    const usuarioInfo = data.data;
                    setUsuario(usuarioInfo);

                    // Extraer sistemas
                    const sistemas = usuarioInfo.sistemas || [];

                    const intranet = sistemas.find((s: any) => s.xt_sistema === 'INTRANET');
                    const extractor = sistemas.find((s: any) => s.xt_sistema === 'EXTRACTOR');
                    const reportes = sistemas.find((s: any) => s.xt_sistema === 'REPORTES');
                    const auditoriaDatos = sistemas.find((s: any) => s.xt_sistema === 'AUDITORIA DATOS');
                    const backlog = sistemas.find((s: any) => s.xt_sistema === 'BACKLOG');
                    const links = sistemas.find((s: any) => s.xt_sistema === 'LINKS');
                    const estadisticas = sistemas.find((s: any) => s.xt_sistema === 'ESTADISTICAS');
                    const radar = sistemas.find((s: any) => s.xt_sistema === 'RADAR');
                    const eLearning = sistemas.find((s: any) => s.xt_sistema === 'MGS-E-LEARNING');
                    const axapta = sistemas.find((s: any) => s.xt_sistema === 'AXAPTA');
                    const bodega = sistemas.find((s: any) => s.xt_sistema === 'BODEGA');
                    const pedimento = sistemas.find((s: any) => s.xt_sistema === 'PEDIMENTO');
                    const scia = sistemas.find((s: any) => s.xt_sistema === 'SCIA');
                    const correoElectronico = sistemas.find((s: any) => s.xt_sistema === 'CORREO ELECTRONICO');

                    setIntranetStatus(intranet?.xt_estatus === 'ACTIVO');
                    setExtractorStatus(extractor?.xt_estatus === 'ACTIVO');
                    setReportesStatus(reportes?.xt_estatus === 'ACTIVO');
                    setAuditoriaDatosStatus(auditoriaDatos?.xt_estatus === 'ACTIVO');
                    setBacklogStatus(backlog?.xt_estatus === 'ACTIVO');
                    setLinksStatus(links?.xt_estatus === 'ACTIVO');
                    setEstadisticasStatus(estadisticas?.xt_estatus === 'ACTIVO');
                    setRadarStatus(radar?.xt_estatus === 'ACTIVO');
                    setELearningStatus(eLearning?.xt_estatus === 'ACTIVO' && (eLearning?.xt_estatus_entregable === 'TERMINADA') ? true : eLearning?.xt_estatus === 'ACTIVO' && (eLearning?.xt_estatus_entregable !== 'TERMINADA') ? 'pending alta' : eLearning?.xt_estatus === 'INACTIVO' && (eLearning?.xt_estatus_entregable !== 'TERMINADA') ? 'pending baja' : false);
                    setAxaptaStatus(axapta?.xt_estatus === 'ACTIVO' && (axapta?.xt_estatus_entregable === 'TERMINADA') ? true : axapta?.xt_estatus === 'ACTIVO' && (axapta?.xt_estatus_entregable !== 'TERMINADA') ? 'pending alta' : axapta?.xt_estatus === 'INACTIVO' && (axapta?.xt_estatus_entregable !== 'TERMINADA') ? 'pending baja': false);
                    setBodegaStatus(bodega?.xt_estatus === 'ACTIVO' && (bodega?.xt_estatus_entregable === 'TERMINADA') ? true : bodega?.xt_estatus === 'ACTIVO' && (bodega?.xt_estatus_entregable !== 'TERMINADA') ? 'pending alta' : bodega?.xt_estatus === 'INACTIVO' && (bodega?.xt_estatus_entregable !== 'TERMINADA') ? 'pending baja' : false);
                    setPedimentoStatus(pedimento?.xt_estatus === 'ACTIVO' && (pedimento?.xt_estatus_entregable === 'TERMINADA') ? true : pedimento?.xt_estatus === 'ACTIVO' && (pedimento?.xt_estatus_entregable !== 'TERMINADA') ? 'pending alta' : pedimento?.xt_estatus === 'INACTIVO' && (pedimento?.xt_estatus_entregable !== 'TERMINADA') ? 'pending baja'  : false);
                    setSciaStatus(scia?.xt_estatus === 'ACTIVO' && (scia?.xt_estatus_entregable === 'TERMINADA') ? true : scia?.xt_estatus === 'ACTIVO' && (scia?.xt_estatus_entregable !== 'TERMINADA') ? 'pending alta' : scia?.xt_estatus === 'INACTIVO' && (scia?.xt_estatus_entregable !== 'TERMINADA') ? 'pending baja' : false);
                    setCorreoElectronicoStatus(correoElectronico?.xt_estatus === 'ACTIVO' && (correoElectronico?.xt_estatus_entregable === 'TERMINADA') ? true : correoElectronico?.xt_estATUS === 'ACTIVO' && (correoElectronico?.xt_ESTADO_ENTREGABLE !== 'TERMINADA') ? 'pending alta' : correoElectronico?. xt_ESTADO === 'INACTIVO' && (correoElectronico?. xt_ESTADO_ENTREGABLE !== 'TERMINADA') ? 'pending baja' : false);

                })
            .catch(err => console.error('Error al obtener detalle:', err));
    };

    const handleSeleccion = (e: React.ChangeEvent<HTMLSelectElement>) => {
        console.log('Usuario seleccionado:', e.target.value); 
        const selected = usuariosLista.find(u => u.xt_usuario === e.target.value) || null;
        console.log('Usuario encontrado:', selected);
        setUsuario(selected);
        cargarDetalle(selected?.xt_usuario || '');
    };

    const fotoURL = usuario?.xt_foto ;

    return (
        
        <div className="min-h-screen flex items-center justify-center p-4 text-white" style={{ backgroundColor: '#2F2F2F' }}>
            <div className="w-full max-w-4xl bg-transparent p-8">
                <div className="text-sm mb-4" style={{ color: '#007cbd' }}>
                    Usuario actual: {session?.session.sesionUsuario || 'No identificado'}
                </div>

                <h3 className="text-center text-3xl font-bold mb-6">Detalle de Usuario</h3>

                <nav className="text-sm text-gray-600 mb-10 text-center" style={{ color: '#007cbd' }}>
                    <a href="https://escalante.com.mx/Sistemas/seleccionaSistema.php" className="hover:underline">Home</a>
                    <span className="mx-2">/</span>
                    <a href="https://escalante.com.mx/Sistemas/Configuraciones/configuraciones.php" className="hover:underline">Configuraciones</a>
                    <span className="mx-2">/</span>
                    <a href="https://escalante.com.mx/Sistemas/Configuraciones/administradorPerfiles.php" className="hover:underline">Administrador perfiles</a>
                </nav>

                <div className="border-t border-[#007cbd] my-4"></div>

                {!usuarioDetalle && (
                    <div className="m-4">
                        <label className="block mb-2 text-sm font-medium">Seleccionar usuario:</label>
                        <select
                            value={usuario?.xt_usuario || ''}
                            onChange={handleSeleccion}
                            className="text-white bg-gray-800 w-full border rounded px-3 py-2"
                        >
                            <option value="">-- Selecciona un usuario --</option>
                            {usuariosLista.map(usuario => (
                                <option key={usuario.xt_usuario} value={usuario.xt_usuario}>
                                    {usuario.xt_nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {usuario ? (
                    <div className="m-4">

                        <div className="flex flex-col items-end text-white m-4">
                            <FaEdit className='text-[#007cbd] w-6 h-6 cursor-pointer' onClick={() => {router.push(`/Sistemas/Intranet/Perfiles/ModificaUsuario?usuario=${usuario.xt_usuario}`);}} />
                        </div>

                        <div className="flex flex-col col-span-1 md:col-span-2 items-center m-10">
                            <label className="font-medium mb-1">Foto</label>
                            {usuario.xt_foto ? (
                                <img src={`https://escalante.com.mx/Sistemas/INTRANET_GEA/ComunicacionInterna/Personal/${usuario.xt_foto}`} alt="Foto del usuario" className="w-32 h-32 rounded" />
                            ) : (
                                <span>No hay foto</span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Item label="Nombre" value={usuario?.xt_nombre || ''} />
                            <Item label="Correo" value={usuario?.xt_correo || ''} />
                            <Item label="Categoría" value={usuario?.xt_categoria || ''} />
                            <Item label="Empresa" value={usuario?.xt_empresa || ''} />
                            <Item label="RFC" value={usuario?.xt_rfc || ''} />
                            <Item label="CURP" value={usuario?.xt_curp || ''} />
                            <Item label="Oficina" value={usuario?.xt_ciudad || ''} />
                            <Item label="Puesto" value={usuario?.xt_puesto || ''} />
                            <Item label="Jefe Directo" value={usuario?.xt_nombreJefeDirecto || ''} />
                            <ItemStatus label="Estatus" value={usuario?.xt_estatus || ''} setEstado={handleToggleStatus} />
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-300 mt-10">
                        {usuarioDetalle ? 'Cargando información...' : 'Selecciona un usuario para ver su información'}
                    </div>
                )}


            
                <div className='mt-10 mb-6 flex items-center justify-between'>
                    <h3 className="text-2xl font-bold"><span className="text-[#007cbd]">Acceso a Sistemas</span></h3>
                    {/*<button className="px-4 py-2 bg-[#007cbd] text-white rounded">+</button>*/}
                </div>
                <div className="border-t border-[#007cbd] my-4"></div>

                <SwitchSistema
                    nombre="Auditoría de Datos"
                    estado={auditoriaDatosStatus}
                    setEstado={() => { void handleToggleSistemasInternos('AUDITORIA DATOS'); }}
                    hasConfiguracion={false}
                    estadoConfiguracion={false}
                    setConfiguracion={() => {}}
                />

                <SwitchSistemaTriple
                    nombre="Axapta"
                    estado={axaptaStatus}
                    setEstado={() => { void handleToggleSistemasExternos('AXAPTA', axaptaStatus); }}
                    hasConfiguracion={false}
                    estadoConfiguracion={false}
                    setConfiguracion={() => {}}
                />

                <SwitchSistema
                    nombre="Backlog"
                    estado={backlogStatus}
                    setEstado={() => { void handleToggleSistemasInternos('BACKLOG'); }}
                    hasConfiguracion={false}
                    estadoConfiguracion={false}
                    setConfiguracion={() => {}}
                />

                <SwitchSistemaTriple
                    nombre="Bodega"
                    estado={bodegaStatus}
                    setEstado={() => { void handleToggleSistemasExternos('BODEGA', bodegaStatus); }}
                    hasConfiguracion={false}
                    estadoConfiguracion={false}
                    setConfiguracion={() => {}}
                />

                <SwitchSistemaTriple
                    nombre="Correo Electrónico"
                    estado={correoElectronicoStatus}
                    setEstado={() => { void handleToggleSistemasExternos('CORREO ELECTRONICO', correoElectronicoStatus); }}
                    hasConfiguracion={false}
                    estadoConfiguracion={false}
                    setConfiguracion={() => {}}
                />

                <SwitchSistema
                    nombre="Estadísticas"
                    estado={estadisticasEstatus}
                    setEstado={() => { void handleToggleSistemasInternos('ESTADISTICAS'); }}
                    hasConfiguracion={true}
                    estadoConfiguracion={mostrarConfiguracionEstadisticas}
                    setConfiguracion={setMostrarConfiguracionEstadisticas}
                />

                <SwitchSistema
                    nombre="Extractor"
                    estado={extractorStatus}
                    setEstado={() => { void handleToggleSistemasInternos('EXTRACTOR'); }}
                    hasConfiguracion={true}
                    estadoConfiguracion={mostrarConfiguracionExtractor}
                    setConfiguracion={setMostrarConfiguracionExtractor}
                />

                <SwitchSistema
                    nombre="Intranet"
                    estado={intranetStatus}
                    setEstado={() => { void handleToggleSistemasInternos('INTRANET'); }}
                    hasConfiguracion={false}
                    estadoConfiguracion={false}
                    setConfiguracion={() => {}}
                />

                <SwitchSistema
                    nombre="Links"
                    estado={linksStatus}
                    setEstado={() => { void handleToggleSistemasInternos('LINKS'); }}
                    hasConfiguracion={true}
                    estadoConfiguracion={mostrarConfiguracionLinks}
                    setConfiguracion={setMostrarConfiguracionLinks}
                />

                <SwitchSistemaTriple
                    nombre="MGS-E-Learning"
                    estado={eLearningStatus}
                    setEstado={() => { void handleToggleSistemasExternos('MGS-E-LEARNING', eLearningStatus); }}
                    hasConfiguracion={false}
                    estadoConfiguracion={false}
                    setConfiguracion={() => {}}
                />

                <SwitchSistemaTriple
                    nombre="Pedimento"
                    estado={pedimentoStatus}
                    setEstado={() => { void handleToggleSistemasExternos('PEDIMENTO', pedimentoStatus); }}
                    hasConfiguracion={false}
                    estadoConfiguracion={false}
                    setConfiguracion={() => {}}
                />

                <SwitchSistema
                    nombre="Radar"
                    estado={radarStatus}
                    setEstado={() => { void handleToggleSistemasInternos('RADAR'); }}
                    hasConfiguracion={true}
                    estadoConfiguracion={mostrarConfiguracionRadar}
                    setConfiguracion={setMostrarConfiguracionRadar}
                />

                <SwitchSistema
                    nombre="Reportes"
                    estado={reportesStatus}
                    setEstado={() => { void handleToggleSistemasInternos('REPORTES'); }}
                    hasConfiguracion={false}
                    estadoConfiguracion={false}
                    setConfiguracion={() => {}}
                />

                <SwitchSistemaTriple
                    nombre="Scia"
                    estado={sciaStatus}
                    setEstado={() => { void handleToggleSistemasExternos('SCIA', sciaStatus); }}
                    hasConfiguracion={false}
                    estadoConfiguracion={false}
                    setConfiguracion={() => {}}
                />

                {/* Mostrar configuración si se requiere */}
                {mostrarConfiguracionExtractor && (
                    <ConfiguracionExtractor
                        usuario={usuario}
                        onClose={() => setMostrarConfiguracionExtractor(false)}
                    />
                )}

                {mostrarConfiguracionEstadisticas && (
                    <ConfiguracionEstadisticas
                        usuario={usuario}
                        onClose={() => setMostrarConfiguracionEstadisticas(false)}
                    />
                )}

                {mostrarConfiguracionLinks && (
                    <ConfiguracionLinks
                        usuario={usuario}
                        onClose={() => setMostrarConfiguracionLinks(false)}
                    />
                )}

                {mostrarConfiguracionRadar && (
                    <ConfiguracionRadar
                        usuario={usuario}
                        onClose={() => setMostrarConfiguracionRadar(false)}
                    />
                )}
                
            </div>
        </div>
    );
};

const Item = ({ label, value }: { label: string; value: string }) => (
    <div className="flex flex-col">
        <label className="font-medium mb-1">{label}</label>
        <div className="border rounded px-3 py-2 min-h-[40px] bg-gray-700 text-white">
            {value?.trim() !== '' ? value : ''}
        </div>
    </div>
);

const ItemStatus = ({ label, value, setEstado }: { label: string; value: string; setEstado: (estado: boolean) => void }) => (
    <div className="flex flex-col">
        <SwitchSistema
            nombre={label}
            estado={value === 'Activo' ? true : false}
            setEstado={setEstado}
            hasConfiguracion={false}
            estadoConfiguracion={false}
            setConfiguracion={() => {}}
        />
    </div>
);

export default DetalleUsuario;
