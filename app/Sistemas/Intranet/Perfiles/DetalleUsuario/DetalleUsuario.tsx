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
    xt_correoJefeDirecto: String;
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

type TripeEstadoSistemas = true | false | "pending";

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

    const handleToggleIntranet = async () => {

        if(session?.session.sesionPuesto !== usuario?.xt_puestoJefeDirecto && session?.session.sesionPuesto !== 'Gerente de Administración' && session?.session.sesionPuesto !== 'Auxiliar Administrativo B' && session?.session.sesionPuesto !== 'Coordinador Administrativo' && session?.session.sesionPuesto !== 'Gerente de Contabilidad' && session?.session.sesionPuesto !== 'Auxiliar Contable' && session?.session.sesionPuesto !== 'Auxiliar de Calidad' && session?.session.sesionPuestoCategoria !== 'Sistemas'){
            alert('No tienes permisos para modificar este usuario.');
            return;
        }

        const confirmar = confirm("¿Estás seguro de que deseas cambiar el estado de Intranet?");
        if (!confirmar) return;

        try {

            if(!intranetStatus){
                const response = await fetch('/backend/Intranet/Perfiles/altaIntranet', {
                    method: 'POST',
                    body: JSON.stringify({ usuario: usuario?.xt_usuario }), // ajusta los datos según necesites
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (data.success || response.ok) {
                    setIntranetStatus(prev => !prev);
                } else {
                    alert('Error al activar Intranet');
                }
            } else {
                const response = await fetch('/backend/Intranet/Perfiles/bajaIntranet', {
                    method: 'POST',
                    body: JSON.stringify({ usuario: usuario?.xt_usuario }), // ajusta los datos según necesites
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (data.success || response.ok) {
                    setIntranetStatus(prev => !prev);
                } else {
                    alert('Error al desactivar Intranet');
                }
            }
        } catch (err) {
            console.error('Error al llamar al backend:', err);
            alert('Ocurrió un error al intentar cambiar el estado.');
        }
    };

    const handleToggleExtractor = async () => {

        if(session?.session.sesionPuesto !== usuario?.xt_puestoJefeDirecto && session?.session.sesionPuesto !== 'Gerente de Administración' && session?.session.sesionPuesto !== 'Auxiliar Administrativo B' && session?.session.sesionPuesto !== 'Coordinador Administrativo' && session?.session.sesionPuesto !== 'Gerente de Contabilidad' && session?.session.sesionPuesto !== 'Auxiliar Contable' && session?.session.sesionPuesto !== 'Auxiliar de Calidad' && session?.session.sesionPuestoCategoria !== 'Sistemas'){
            alert('No tienes permisos para modificar este usuario.');
            return;
        }

        const confirmar = confirm("¿Estás seguro de que deseas cambiar el estado de Extractor?");
        if (!confirmar) return;

        try {

            if(!extractorStatus){
                const response = await fetch('/backend/Intranet/Perfiles/altaExtractor', {
                    method: 'POST',
                    body: JSON.stringify({ usuario: usuario?.xt_usuario }), // ajusta los datos según necesites
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (data.success || response.ok) {
                    setExtractorStatus(prev => !prev);
                    //Mostrar el componente de configuración
                    setMostrarConfiguracionExtractor(true);
                } else {
                    alert('Error al activar Extractor');
                }
            } else {
                const response = await fetch('/backend/Intranet/Perfiles/bajaExtractor', {
                    method: 'POST',
                    body: JSON.stringify({ usuario: usuario?.xt_usuario }), // ajusta los datos según necesites
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (data.success || response.ok) {
                    setExtractorStatus(prev => !prev);
                } else {
                    alert('Error al desactivar Extractor');
                }
            }
        } catch (err) {
            console.error('Error al llamar al backend:', err);
            alert('Ocurrió un error al intentar cambiar el estado.');
        }

        
    };

    const handleToggleReportes = async () => {

        if(session?.session.sesionPuesto !== usuario?.xt_puestoJefeDirecto && session?.session.sesionPuesto !== 'Gerente de Administración' && session?.session.sesionPuesto !== 'Auxiliar Administrativo B' && session?.session.sesionPuesto !== 'Coordinador Administrativo' && session?.session.sesionPuesto !== 'Gerente de Contabilidad' && session?.session.sesionPuesto !== 'Auxiliar Contable' && session?.session.sesionPuesto !== 'Auxiliar de Calidad' && session?.session.sesionPuestoCategoria !== 'Sistemas'){
            alert('No tienes permisos para modificar este usuario.');
            return;
        }

        const confirmar = confirm("¿Estás seguro de que deseas cambiar el estado de Reportes?");
        if (!confirmar) return;

        try {
            if (!reportesStatus) {
                const response = await fetch('/backend/Intranet/Perfiles/altaReportes', {
                    method: 'POST',
                    body: JSON.stringify({ usuario: usuario?.xt_usuario }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (data.success || response.ok) {
                    setReportesStatus(true);
                } else {
                    alert('Error al activar Reportes');
                }
            } else {
                const response = await fetch('/backend/Intranet/Perfiles/bajaReportes', {
                    method: 'POST',
                    body: JSON.stringify({ usuario: usuario?.xt_usuario }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (data.success || response.ok) {
                    setReportesStatus(false);
                } else {
                    alert('Error al desactivar Reportes');
                }
            }
        } catch (err) {
            console.error('Error al llamar al backend:', err);
            alert('Ocurrió un error al intentar cambiar el estado.');
        }
    };

    const handleToggleAuditoriaDatos = async () => {

        if(session?.session.sesionPuesto !== usuario?.xt_puestoJefeDirecto && session?.session.sesionPuesto !== 'Gerente de Administración' && session?.session.sesionPuesto !== 'Auxiliar Administrativo B' && session?.session.sesionPuesto !== 'Coordinador Administrativo' && session?.session.sesionPuesto !== 'Gerente de Contabilidad' && session?.session.sesionPuesto !== 'Auxiliar Contable' && session?.session.sesionPuesto !== 'Auxiliar de Calidad' && session?.session.sesionPuestoCategoria !== 'Sistemas'){
            alert('No tienes permisos para modificar este usuario.');
            return;
        }

        const confirmar = confirm("¿Estás seguro de que deseas cambiar el estado de Auditoria Datos?");
        if (!confirmar) return;

        try {
            if (!auditoriaDatosStatus) {
                const response = await fetch('/backend/Intranet/Perfiles/altaAuditoriaDatos', {
                    method: 'POST',
                    body: JSON.stringify({ usuario: usuario?.xt_usuario }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (data.status === 'success' || response.ok) {
                    setAuditoriaDatosStatus(true);
                } else {
                    alert('Error al activar Auditoria Datos');
                }
            } else {
                const response = await fetch('/backend/Intranet/Perfiles/bajaAuditoriaDatos', {
                    method: 'POST',
                    body: JSON.stringify({ usuario: usuario?.xt_usuario }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (data.status === 'success' || response.ok) {
                    setAuditoriaDatosStatus(false);
                } else {
                    alert('Error al desactivar Auditoria Datos');
                }
            }
        } catch (err) {
            console.error('Error al llamar al backend:', err);
            alert('Ocurrió un error al intentar cambiar el estado.');
        }
    };

    const handleToggleBacklog = async () => {

        if(session?.session.sesionPuesto !== usuario?.xt_puestoJefeDirecto && session?.session.sesionPuesto !== 'Gerente de Administración' && session?.session.sesionPuesto !== 'Auxiliar Administrativo B' && session?.session.sesionPuesto !== 'Coordinador Administrativo' && session?.session.sesionPuesto !== 'Gerente de Contabilidad' && session?.session.sesionPuesto !== 'Auxiliar Contable' && session?.session.sesionPuesto !== 'Auxiliar de Calidad' && session?.session.sesionPuestoCategoria !== 'Sistemas'){
            alert('No tienes permisos para modificar este usuario.');
            return;
        }

        const confirmar = confirm("¿Estás seguro de que deseas cambiar el estado de Backlog?");
        if (!confirmar) return;

        try {
            if (!backlogStatus) {
                const response = await fetch('/backend/Intranet/Perfiles/altaBacklog', {
                    method: 'POST',
                    body: JSON.stringify({ usuario: usuario?.xt_usuario }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (data.status === 'success' || response.ok) {
                    setBacklogStatus(true);
                } else {
                    alert('Error al activar Backlog');
                }
            } else {
                const response = await fetch('/backend/Intranet/Perfiles/bajaBacklog', {
                    method: 'POST',
                    body: JSON.stringify({ usuario: usuario?.xt_usuario }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (data.status === 'success' || response.ok) {
                    setBacklogStatus(false);
                } else {
                    alert('Error al desactivar Backlog');
                }
            }
        } catch (err) {
            console.error('Error al llamar al backend:', err);
            alert('Ocurrió un error al intentar cambiar el estado.');
        }
    };

    const handleToggleEstadisticas = async () => {

        if(session?.session.sesionPuesto !== usuario?.xt_puestoJefeDirecto && session?.session.sesionPuesto !== 'Gerente de Administración' && session?.session.sesionPuesto !== 'Auxiliar Administrativo B' && session?.session.sesionPuesto !== 'Coordinador Administrativo' && session?.session.sesionPuesto !== 'Gerente de Contabilidad' && session?.session.sesionPuesto !== 'Auxiliar Contable' && session?.session.sesionPuesto !== 'Auxiliar de Calidad' && session?.session.sesionPuestoCategoria !== 'Sistemas'){
            alert('No tienes permisos para modificar este usuario.');
            return;
        }

        const confirmar = confirm("¿Estás seguro de que deseas cambiar el estado de Estadísticas?");
        if (!confirmar) return;

        try {
            if (!estadisticasEstatus) {
                const response = await fetch('/backend/Intranet/Perfiles/altaEstadisticas', {
                    method: 'POST',
                    body: JSON.stringify({ usuario: usuario?.xt_usuario }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (data.status === 'success' || response.ok) {
                    setEstadisticasStatus(true);
                    setMostrarConfiguracionEstadisticas(true);
                } else {
                    alert('Error al activar Estadísticas');
                }
            } else {
                const response = await fetch('/backend/Intranet/Perfiles/bajaEstadisticas', {
                    method: 'POST',
                    body: JSON.stringify({ usuario: usuario?.xt_usuario }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (data.status === 'success' || response.ok) {
                    setEstadisticasStatus(false);
                } else {
                    alert('Error al desactivar Estadísticas');
                }
            }
        } catch (err) {
            console.error('Error al llamar al backend:', err);
            alert('Ocurrió un error al intentar cambiar el estado.');
        }
    };

    const handleToggleRadar = async () => {

        if(session?.session.sesionPuesto !== usuario?.xt_puestoJefeDirecto && session?.session.sesionPuesto !== 'Gerente de Administración' && session?.session.sesionPuesto !== 'Auxiliar Administrativo B' && session?.session.sesionPuesto !== 'Coordinador Administrativo' && session?.session.sesionPuesto !== 'Gerente de Contabilidad' && session?.session.sesionPuesto !== 'Auxiliar Contable' && session?.session.sesionPuesto !== 'Auxiliar de Calidad' && session?.session.sesionPuestoCategoria !== 'Sistemas'){
            alert('No tienes permisos para modificar este usuario.');
            return;
        }

        const confirmar = confirm("¿Estás seguro de que deseas cambiar el estado de Radar?");
        if (!confirmar) return;

        try {
            if (!radarStatus) {
                const response = await fetch('/backend/Intranet/Perfiles/altaRadar', {
                    method: 'POST',
                    body: JSON.stringify({ usuario: usuario?.xt_usuario }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (data.status === 'success' || response.ok) {
                    setRadarStatus(true);
                } else {
                    alert('Error al activar Radar');
                }
            } else {
                const response = await fetch('/backend/Intranet/Perfiles/bajaRadar', {
                    method: 'POST',
                    body: JSON.stringify({ usuario: usuario?.xt_usuario }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (data.status === 'success' || response.ok) {
                    setRadarStatus(false);
                } else {
                    alert('Error al desactivar Radar');
                }
            }
        } catch (err) {
            console.error('Error al llamar al backend:', err);
            alert('Ocurrió un error al intentar cambiar el estado.');
        }
    };

    const handleToggleLinks = async () => {

        if(session?.session.sesionPuesto !== usuario?.xt_puestoJefeDirecto && session?.session.sesionPuesto !== 'Gerente de Administración' && session?.session.sesionPuesto !== 'Auxiliar Administrativo B' && session?.session.sesionPuesto !== 'Coordinador Administrativo' && session?.session.sesionPuesto !== 'Gerente de Contabilidad' && session?.session.sesionPuesto !== 'Auxiliar Contable' && session?.session.sesionPuesto !== 'Auxiliar de Calidad' && session?.session.sesionPuestoCategoria !== 'Sistemas'){
            alert('No tienes permisos para modificar este usuario.');
            return;
        }

        const confirmar = confirm("¿Estás seguro de que deseas cambiar el estado de Links?");
        if (!confirmar) return;

        try {
            if (!linksStatus) {
                const response = await fetch('/backend/Intranet/Perfiles/altaLinks', {
                    method: 'POST',
                    body: JSON.stringify({ usuario: usuario?.xt_usuario }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (data.status === 'success' || response.ok) {
                    setLinksStatus(true);
                } else {
                    alert('Error al activar Links');
                }
            } else {
                const response = await fetch('/backend/Intranet/Perfiles/bajaLinks', {
                    method: 'POST',
                    body: JSON.stringify({ usuario: usuario?.xt_usuario }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (data.status === 'success' || response.ok) {
                    setLinksStatus(false);
                } else {
                    alert('Error al desactivar Links');
                }
            }
        } catch (err) {
            console.error('Error al llamar al backend:', err);
            alert('Ocurrió un error al intentar cambiar el estado.');
        }
    };

    const handleToggleELearning = async () => {

        if(session?.session.sesionPuesto !== usuario?.xt_puestoJefeDirecto && session?.session.sesionPuesto !== 'Gerente de Administración' && session?.session.sesionPuesto !== 'Auxiliar Administrativo B' && session?.session.sesionPuesto !== 'Coordinador Administrativo' && session?.session.sesionPuesto !== 'Gerente de Contabilidad' && session?.session.sesionPuesto !== 'Auxiliar Contable' && session?.session.sesionPuesto !== 'Auxiliar de Calidad' && session?.session.sesionPuestoCategoria !== 'Sistemas'){
            alert('No tienes permisos para modificar este usuario.');
            return;
        }

        const confirmar = confirm("¿Estás seguro de que deseas cambiar el estado de MGS-E-LEARNING?");
        if (!confirmar) return;

        try {
            
            if (!eLearningStatus) {

                const response = await fetch('/backend/Intranet/Perfiles/altaSistemaExterno', {
                    method: 'POST',
                    body: JSON.stringify({ usuario: usuario?.xt_usuario, usuarioSolicita: session?.session.sesionUsuario || 'cozy', sistema: 'MGS-E-LEARNING' }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (data.status === 'success' || response.ok) {
                    cargarDetalle(usuario?.xt_usuario || '');
                    //setLinksStatus(true);
                } else {
                    alert('Error al activar MGS-E-Learning');
                }
                
                //setELearningStatus('pending');
            } else if (eLearningStatus) {

                const response = await fetch('/backend/Intranet/Perfiles/bajaSistemaExterno', {
                    method: 'POST',
                    body: JSON.stringify({ usuario: usuario?.xt_usuario, usuarioSolicita: session?.session.sesionUsuario || 'cozy', sistema: 'MGS-E-LEARNING' }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (data.status === 'success' || response.ok) {
                    setELearningStatus(false);
                } else {
                    alert('Error al desactivar MGS-E-Learning');
                }
            }

            //setELearningStatus(prev => !prev);
            
        } catch (err) {
            console.error('Error al llamar al backend:', err);
            alert('Ocurrió un error al intentar cambiar el estado.');
        }
    };

    const handleToggleAxapta = async () => {

        if(session?.session.sesionPuesto !== usuario?.xt_puestoJefeDirecto && session?.session.sesionPuesto !== 'Gerente de Administración' && session?.session.sesionPuesto !== 'Auxiliar Administrativo B' && session?.session.sesionPuesto !== 'Coordinador Administrativo' && session?.session.sesionPuesto !== 'Gerente de Contabilidad' && session?.session.sesionPuesto !== 'Auxiliar Contable' && session?.session.sesionPuesto !== 'Auxiliar de Calidad' && session?.session.sesionPuestoCategoria !== 'Sistemas'){
            alert('No tienes permisos para modificar este usuario.');
            return;
        }

        const confirmar = confirm("¿Estás seguro de que deseas cambiar el estado de Axapta?");
        if (!confirmar) return;

        try {
            
            if (!axaptaStatus) {

                const response = await fetch('/backend/Intranet/Perfiles/altaSistemaExterno', {
                    method: 'POST',
                    body: JSON.stringify({ usuario: usuario?.xt_usuario, usuarioSolicita: session?.session.sesionUsuario || 'cozy', sistema: 'AXAPTA' }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (data.status === 'success' || response.ok) {
                    cargarDetalle(usuario?.xt_usuario || '');
                    //setLinksStatus(true);
                } else {
                    alert('Error al activar AXAPTA');
                }
                
                //setELearningStatus('pending');
            } else if (axaptaStatus) {

                const response = await fetch('/backend/Intranet/Perfiles/bajaSistemaExterno', {
                    method: 'POST',
                    body: JSON.stringify({ usuario: usuario?.xt_usuario, usuarioSolicita: session?.session.sesionUsuario || 'cozy', sistema: 'AXAPTA' }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (data.status === 'success' || response.ok) {
                    setAxaptaStatus(false);
                } else {
                    alert('Error al desactivar AXAPTA');
                }
            }

            //setELearningStatus(prev => !prev);
            
        } catch (err) {
            console.error('Error al llamar al backend:', err);
            alert('Ocurrió un error al intentar cambiar el estado.');
        }
    };

    const handleToggleBodega = async () => {

        if(session?.session.sesionPuesto !== usuario?.xt_puestoJefeDirecto && session?.session.sesionPuesto !== 'Gerente de Administración' && session?.session.sesionPuesto !== 'Auxiliar Administrativo B' && session?.session.sesionPuesto !== 'Coordinador Administrativo' && session?.session.sesionPuesto !== 'Gerente de Contabilidad' && session?.session.sesionPuesto !== 'Auxiliar Contable' && session?.session.sesionPuesto !== 'Auxiliar de Calidad' && session?.session.sesionPuestoCategoria !== 'Sistemas'){
            alert('No tienes permisos para modificar este usuario.');
            return;
        }

        const confirmar = confirm("¿Estás seguro de que deseas cambiar el estado de BODEGA?");
        if (!confirmar) return;

        try {
            
            if (!bodegaStatus) {

                const response = await fetch('/backend/Intranet/Perfiles/altaSistemaExterno', {
                    method: 'POST',
                    body: JSON.stringify({ usuario: usuario?.xt_usuario, usuarioSolicita: session?.session.sesionUsuario || 'cozy', sistema: 'BODEGA' }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (data.status === 'success' || response.ok) {
                    cargarDetalle(usuario?.xt_usuario || '');
                    //setLinksStatus(true);
                } else {
                    alert('Error al activar BODEGA');
                }
                
                //setELearningStatus('pending');
            } else if (bodegaStatus) {

                const response = await fetch('/backend/Intranet/Perfiles/bajaSistemaExterno', {
                    method: 'POST',
                    body: JSON.stringify({ usuario: usuario?.xt_usuario, usuarioSolicita: session?.session.sesionUsuario || 'cozy', sistema: 'BODEGA' }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (data.status === 'success' || response.ok) {
                    setBodegaStatus(false);
                } else {
                    alert('Error al desactivar BODEGA');
                }
            }

            //setELearningStatus(prev => !prev);
            
        } catch (err) {
            console.error('Error al llamar al backend:', err);
            alert('Ocurrió un error al intentar cambiar el estado.');
        }
    };

    const handleTogglePedimento = async () => {

        if(session?.session.sesionPuesto !== usuario?.xt_puestoJefeDirecto && session?.session.sesionPuesto !== 'Gerente de Administración' && session?.session.sesionPuesto !== 'Auxiliar Administrativo B' && session?.session.sesionPuesto !== 'Coordinador Administrativo' && session?.session.sesionPuesto !== 'Gerente de Contabilidad' && session?.session.sesionPuesto !== 'Auxiliar Contable' && session?.session.sesionPuesto !== 'Auxiliar de Calidad' && session?.session.sesionPuestoCategoria !== 'Sistemas'){
            alert('No tienes permisos para modificar este usuario.');
            return;
        }

        const confirmar = confirm("¿Estás seguro de que deseas cambiar el estado de PEDIMENTO?");
        if (!confirmar) return;

        try {
            
            if (!pedimentoStatus) {

                const response = await fetch('/backend/Intranet/Perfiles/altaSistemaExterno', {
                    method: 'POST',
                    body: JSON.stringify({ usuario: usuario?.xt_usuario, usuarioSolicita: session?.session.sesionUsuario || 'cozy', sistema: 'PEDIMENTO' }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (data.status === 'success' || response.ok) {
                    cargarDetalle(usuario?.xt_usuario || '');
                    //setLinksStatus(true);
                } else {
                    alert('Error al activar PEDIMENTO');
                }
                
                //setELearningStatus('pending');
            } else if (pedimentoStatus) {

                const response = await fetch('/backend/Intranet/Perfiles/bajaSistemaExterno', {
                    method: 'POST',
                    body: JSON.stringify({ usuario: usuario?.xt_usuario, usuarioSolicita: session?.session.sesionUsuario || 'cozy', sistema: 'PEDIMENTO' }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (data.status === 'success' || response.ok) {
                    setPedimentoStatus(false);
                } else {
                    alert('Error al desactivar PEDIMENTO');
                }
            }

            //setELearningStatus(prev => !prev);
            
        } catch (err) {
            console.error('Error al llamar al backend:', err);
            alert('Ocurrió un error al intentar cambiar el estado.');
        }
    };

    const handleToggleSCIA = async () => {

        if(session?.session.sesionPuesto !== usuario?.xt_puestoJefeDirecto && session?.session.sesionPuesto !== 'Gerente de Administración' && session?.session.sesionPuesto !== 'Auxiliar Administrativo B' && session?.session.sesionPuesto !== 'Coordinador Administrativo' && session?.session.sesionPuesto !== 'Gerente de Contabilidad' && session?.session.sesionPuesto !== 'Auxiliar Contable' && session?.session.sesionPuesto !== 'Auxiliar de Calidad' && session?.session.sesionPuestoCategoria !== 'Sistemas'){
            alert('No tienes permisos para modificar este usuario.');
            return;
        }

        const confirmar = confirm("¿Estás seguro de que deseas cambiar el estado de SCIA?");
        if (!confirmar) return;

        try {
            
            if (!sciaStatus) {

                const response = await fetch('/backend/Intranet/Perfiles/altaSistemaExterno', {
                    method: 'POST',
                    body: JSON.stringify({ usuario: usuario?.xt_usuario, usuarioSolicita: session?.session.sesionUsuario || 'cozy', sistema: 'SCIA' }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (data.status === 'success' || response.ok) {
                    cargarDetalle(usuario?.xt_usuario || '');
                    //setLinksStatus(true);
                } else {
                    alert('Error al activar SCIA');
                }
                
                //setELearningStatus('pending');
            } else if (sciaStatus) {

                const response = await fetch('/backend/Intranet/Perfiles/bajaSistemaExterno', {
                    method: 'POST',
                    body: JSON.stringify({ usuario: usuario?.xt_usuario, usuarioSolicita: session?.session.sesionUsuario || 'cozy', sistema: 'SCIA' }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (data.status === 'success' || response.ok) {
                    setSciaStatus(false);
                } else {
                    alert('Error al desactivar SCIA');
                }
            }

            //setELearningStatus(prev => !prev);
            
        } catch (err) {
            console.error('Error al llamar al backend:', err);
            alert('Ocurrió un error al intentar cambiar el estado.');
        }
    };

    const handleToggleCorreoElectronico = async () => {

        if(session?.session.sesionPuesto !== usuario?.xt_puestoJefeDirecto && session?.session.sesionPuesto !== 'Gerente de Administración' && session?.session.sesionPuesto !== 'Auxiliar Administrativo B' && session?.session.sesionPuesto !== 'Coordinador Administrativo' && session?.session.sesionPuesto !== 'Gerente de Contabilidad' && session?.session.sesionPuesto !== 'Auxiliar Contable' && session?.session.sesionPuesto !== 'Auxiliar de Calidad' && session?.session.sesionPuestoCategoria !== 'Sistemas'){
            alert('No tienes permisos para modificar este usuario.');
            return;
        }

        const confirmar = confirm("¿Estás seguro de que deseas cambiar el estado de Correo Electrónico?");
        if (!confirmar) return;

        try {

            if (!correoElectronicoStatus) {

                const response = await fetch('/backend/Intranet/Perfiles/altaSistemaExterno', {
                    method: 'POST',
                    body: JSON.stringify({ usuario: usuario?.xt_usuario, usuarioSolicita: session?.session.sesionUsuario || 'cozy', sistema: 'CORREO ELECTRONICO' }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (data.status === 'success' || response.ok) {
                    setCorreoElectronicoStatus(true);
                } else {
                    alert('Error al activar Correo Electrónico');
                }
            } else if (correoElectronicoStatus) {

                const response = await fetch('/backend/Intranet/Perfiles/bajaSistemaExterno', {
                    method: 'POST',
                    body: JSON.stringify({ usuario: usuario?.xt_usuario, usuarioSolicita: session?.session.sesionUsuario || 'cozy', sistema: 'CORREO ELECTRONICO' }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (data.status === 'success' || response.ok) {
                    setCorreoElectronicoStatus(false);
                } else {
                    alert('Error al desactivar Correo Electrónico');
                }
            }

        } catch (err) {
            console.error('Error al llamar al backend:', err);
            alert('Ocurrió un error al intentar cambiar el estado.');
        }
    };

    const handleToggleStatus = async () => {
        
        if(session?.session.sesionPuesto !== usuario?.xt_puestoJefeDirecto && session?.session.sesionPuesto !== 'Gerente de Administración' && session?.session.sesionPuestoCategoria !== 'Auxiliar Administrativo B' && session?.session.sesionPuestoCategoria !== 'Coordinador Administrativo' && session?.session.sesionPuestoCategoria !== 'Gerente de Contabilidad' && session?.session.sesionPuestoCategoria !== 'Auxiliar Contable' && session?.session.sesionPuestoCategoria !== 'Auxiliar de Calidad' && session?.session.sesionPuestoCategoria !== 'Sistemas'){
            alert('No tienes permisos para modificar este usuario.');
            return;
        }
        
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
                body: JSON.stringify({ usuario: usuario?.xt_usuario }),
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

                    // Envía el correo antes de redirigir
                    console.log('Enviando correo de confirmación...');
                    fetch('/backend/Intranet/Perfiles/enviaCorreo', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            destinatarios: ['${usuario?.xt_correoJefeDirecto}'],
                            copias: ['cruiz@escalante.com.mx','ealdana@multiglobalservicios.com', 'sdelap@escalante.com.mx'/*, 'pmoyotl@escalante.com.mx'*/],
                            asunto: `Baja usuario ${usuario?.xt_nombre}`,
                            perfil_puesto: ``,
                            mensaje: [
                            `Se confirma la baja del usuario:`,
                            ``,
                            `Nombre: ${usuario?.xt_nombre}`,
                            `RFC: ${usuario?.xt_rfc}`,
                            `CURP: ${usuario?.xt_curp}`,
                            `Puesto: ${usuario?.xt_puesto}`,
                            ``,
                            `Resguardo:`,
                            `${articulosResguardo.length > 0 ? articulosResguardo.map((art: any) => `- ${art.xt_articulo}  (${art.xd_fechaAceptacion ? art.xd_fechaAceptacion : 'Pendiente'})`).join('<br>') : 'No tiene artículos en resguardo.'}`,
                            ``,
                            `Saludos cordiales.`,
                            ].join('<br>')
                        }),
                    })//destinatarios, copias, asunto, mensaje, perfil_puesto
                    .then(() => {
                        console.log('Correo de Baja enviado');
                    })
                    .catch(err => {
                        console.error('Error al enviar correo de Baja:', err);
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
                    setELearningStatus(eLearning?.xt_estatus === 'ACTIVO' && (eLearning?.xt_estatus_entregable === 'TERMINADA' || eLearning?.xt_estatus_solicitud === 'TERMINADA') ? true : eLearning?.xt_estatus === 'ACTIVO' && (eLearning?.xt_estatus_entregable !== 'TERMINADA' && eLearning?.xt_estatus_solicitud !== 'TERMINADA') ? 'pending' : eLearning?.xt_estatus === 'INACTIVO' ? false : false);
                    setAxaptaStatus(axapta?.xt_estatus === 'ACTIVO' && (axapta?.xt_estatus_entregable === 'TERMINADA' || axapta?.xt_estatus_solicitud === 'TERMINADA') ? true : axapta?.xt_estatus === 'ACTIVO' && (axapta?.xt_estatus_entregable !== 'TERMINADA' && axapta?.xt_estatus_solicitud !== 'TERMINADA') ? 'pending' : axapta?.xt_estatus === 'INACTIVO' ? false : false);
                    setBodegaStatus(bodega?.xt_estatus === 'ACTIVO' && (bodega?.xt_estatus_entregable === 'TERMINADA' || bodega?.xt_estatus_solicitud === 'TERMINADA') ? true : bodega?.xt_estatus === 'ACTIVO' && (bodega?.xt_estatus_entregable !== 'TERMINADA' && bodega?.xt_estatus_solicitud !== 'TERMINADA') ? 'pending' : bodega?.xt_estatus === 'INACTIVO' ? false : false);
                    setPedimentoStatus(pedimento?.xt_estatus === 'ACTIVO' && (pedimento?.xt_estatus_entregable === 'TERMINADA' || pedimento?.xt_estatus_solicitud === 'TERMINADA') ? true : pedimento?.xt_estatus === 'ACTIVO' && (pedimento?.xt_estatus_entregable !== 'TERMINADA' && pedimento?.xt_estatus_solicitud !== 'TERMINADA') ? 'pending' : pedimento?.xt_estatus === 'INACTIVO' ? false : false);
                    setSciaStatus(scia?.xt_estatus === 'ACTIVO' && (scia?.xt_estatus_entregable === 'TERMINADA' || scia?.xt_estatus_solicitud === 'TERMINADA') ? true : scia?.xt_estatus === 'ACTIVO' && (scia?.xt_estatus_entregable !== 'TERMINADA' && scia?.xt_estatus_solicitud !== 'TERMINADA') ? 'pending' : scia?.xt_estatus === 'INACTIVO' ? false : false);
                    setCorreoElectronicoStatus(correoElectronico?.xt_estatus === 'ACTIVO' && (correoElectronico?.xt_estatus_entregable === 'TERMINADA' || correoElectronico?.xt_estatus_solicitud === 'TERMINADA') ? true : correoElectronico?.xt_estatus === 'ACTIVO' && (correoElectronico?.xt_estatus_entregable !== 'TERMINADA' && correoElectronico?.xt_estatus_solicitud !== 'TERMINADA') ? 'pending' : correoElectronico?.xt_estatus === 'INACTIVO' ? false : false);

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
                    setEstado={handleToggleAuditoriaDatos}
                    hasConfiguracion={false}
                    estadoConfiguracion={false}
                    setConfiguracion={() => {}}
                />

                <SwitchSistemaTriple
                    nombre="Axapta"
                    estado={axaptaStatus}
                    setEstado={handleToggleAxapta}
                    hasConfiguracion={false}
                    estadoConfiguracion={false}
                    setConfiguracion={() => {}}
                />

                <SwitchSistema
                    nombre="Backlog"
                    estado={backlogStatus}
                    setEstado={handleToggleBacklog}
                    hasConfiguracion={false}
                    estadoConfiguracion={false}
                    setConfiguracion={() => {}}
                />

                <SwitchSistemaTriple
                    nombre="Bodega"
                    estado={bodegaStatus}
                    setEstado={handleToggleBodega}
                    hasConfiguracion={false}
                    estadoConfiguracion={false}
                    setConfiguracion={() => {}}
                />

                <SwitchSistemaTriple
                    nombre="Correo Electrónico"
                    estado={correoElectronicoStatus}
                    setEstado={handleToggleCorreoElectronico}
                    hasConfiguracion={false}
                    estadoConfiguracion={false}
                    setConfiguracion={() => {}}
                />

                <SwitchSistema
                    nombre="Estadísticas"
                    estado={estadisticasEstatus}
                    setEstado={handleToggleEstadisticas}
                    hasConfiguracion={true}
                    estadoConfiguracion={mostrarConfiguracionEstadisticas}
                    setConfiguracion={setMostrarConfiguracionEstadisticas}
                />

                <SwitchSistema
                    nombre="Extractor"
                    estado={extractorStatus}
                    setEstado={handleToggleExtractor}
                    hasConfiguracion={true}
                    estadoConfiguracion={mostrarConfiguracionExtractor}
                    setConfiguracion={setMostrarConfiguracionExtractor}
                />

                <SwitchSistema
                    nombre="Intranet"
                    estado={intranetStatus}
                    setEstado={handleToggleIntranet}
                    hasConfiguracion={false}
                    estadoConfiguracion={false}
                    setConfiguracion={() => {}}
                />

                <SwitchSistema
                    nombre="Links"
                    estado={linksStatus}
                    setEstado={handleToggleLinks}
                    hasConfiguracion={true}
                    estadoConfiguracion={mostrarConfiguracionLinks}
                    setConfiguracion={setMostrarConfiguracionLinks}
                />

                <SwitchSistemaTriple
                    nombre="MGS-E-Learning"
                    estado={eLearningStatus}
                    setEstado={handleToggleELearning}
                    hasConfiguracion={false}
                    estadoConfiguracion={false}
                    setConfiguracion={() => {}}
                />

                <SwitchSistemaTriple
                    nombre="Pedimento"
                    estado={pedimentoStatus}
                    setEstado={handleTogglePedimento}
                    hasConfiguracion={false}
                    estadoConfiguracion={false}
                    setConfiguracion={() => {}}
                />

                <SwitchSistema
                    nombre="Radar"
                    estado={radarStatus}
                    setEstado={handleToggleRadar}
                    hasConfiguracion={true}
                    estadoConfiguracion={mostrarConfiguracionRadar}
                    setConfiguracion={setMostrarConfiguracionRadar}
                />

                <SwitchSistema
                    nombre="Reportes"
                    estado={reportesStatus}
                    setEstado={handleToggleReportes}
                    hasConfiguracion={false}
                    estadoConfiguracion={false}
                    setConfiguracion={() => {}}
                />

                <SwitchSistemaTriple
                    nombre="Scia"
                    estado={sciaStatus}
                    setEstado={handleToggleSCIA}
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
