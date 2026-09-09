'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaFileImport } from "react-icons/fa";
import { useSearchParams } from 'next/navigation';

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

type CatalogoPuestos = {
    xt_puesto: string;
    xt_categoria: string;
    xt_perfil_puesto: string;
    xt_empresa: string;
}

type CatalogoJefesDirectos = {
    xt_usuario: string;
    xt_nombre: string;
    xt_correo: string;
}

// La API guarda el nombre completo en xt_nombre: "Nombres ApellidoPaterno ApellidoMaterno".
const separarNombreCompleto = (nombreCompleto: string) => {
    const partes = nombreCompleto.trim().split(/\s+/).filter(Boolean);

    if (partes.length < 3) {
        return {
            nombre: partes.join(' '),
            apellidoPaterno: '',
            apellidoMaterno: '',
        };
    }

    return {
        nombre: partes.slice(0, -2).join(' '),
        apellidoPaterno: partes[partes.length - 2] || '',
        apellidoMaterno: partes[partes.length - 1] || '',
    };
};

const ModificaUsuario = () => {

    const router = useRouter();

    const searchParams = useSearchParams();
    const usuarioModificar = searchParams.get('usuario'); 
    const [session, setSession] = useState<SesionResponse | null>(null);
    const [catalogoPuestos, setCatalogoPuestos] = useState<CatalogoPuestos[]>([]);
    const [jefesDirectosPuesto, setJefesDirectosPuesto] = useState<CatalogoJefesDirectos[]>([]);
    const [formData, setFormData] = useState({
        nombre: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        correo: '',
        rfc: '',
        curp: '',
        grupo: '',
        empresa: '',
        categoria: '',
        oficina: '',
        puesto: '',
        jefeDirecto: '',
        foto: null as File | null,
    });
    

    useEffect(() => {
        fetch('https://escalante.com.mx/Sistemas/session.php', {
            credentials: 'include'
        })
            .then(res => {
                if (!res.ok) throw new Error('Respuesta no válida');
                return res.json();
            })
            .then(data => {
                console.log('Sesión obtenida del backend:', data);

                // Verifica explícitamente que el status sea distinto de "success"
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
        if (usuarioModificar) {
            console.log('Obteniendo informacion de usuario a modificar:', usuarioModificar);
            cargarDetalle(usuarioModificar);
        }
    }, [usuarioModificar]);

    useEffect(() => {
        fetch('/backend/Intranet/Perfiles/catalogoPuestos')
            .then(res => {
                if (!res.ok) throw new Error('No se pudo obtener el catálogo de puestos');
                return res.json();
            })
            .then(data => {
                if (data && data.status === 'success' && Array.isArray(data.data)) {
                    setCatalogoPuestos(data.data);
                    console.log('Catálogo de puestos obtenido:', data.data);
                }
            })
            .catch(err => {
                console.error('Error al obtener el catálogo de puestos:', err);
            });
    }, []);

    const cargarDetalle = (usuario: string) => {
        if (!usuario) return;

        fetch(`/backend/Intranet/Perfiles/detalleUsuario?usuario=${usuario}`)
            .then(res => res.json())
            .then(data => {
                    const usuarioInfo = data.data;
                    const nombreSeparado = separarNombreCompleto(usuarioInfo.xt_nombre || '');
                    setFormData({
                        nombre: nombreSeparado.nombre,
                        apellidoPaterno: nombreSeparado.apellidoPaterno,
                        apellidoMaterno: nombreSeparado.apellidoMaterno,
                        correo: usuarioInfo.xt_correo || '',
                        rfc: usuarioInfo.xt_rfc || '',
                        curp: usuarioInfo.xt_curp || '',
                        grupo: usuarioInfo.xt_empresa || '',
                        empresa: usuarioInfo.xt_empresa || '',
                        categoria: usuarioInfo.xt_categoria || '',
                        oficina: usuarioInfo.xt_ciudad || '',
                        puesto: usuarioInfo.xt_puesto || '',
                        jefeDirecto: usuarioInfo.xt_jefeDirecto || '',
                        foto: usuarioInfo.xt_foto || '',
                    });

                    fetch(`/backend/Intranet/Perfiles/jefesDirectosPuesto?puesto=${encodeURIComponent(usuarioInfo.xt_puesto)}&empresa=${encodeURIComponent(usuarioInfo.xt_empresa)}&ciudad=${encodeURIComponent(usuarioInfo.xt_ciudad)}`)
                        .then(res => {
                            if (!res.ok) throw new Error('No se pudo obtener el catálogo de jefes directos');
                            return res.json();
                        })
                        .then(data => {
                            if (data && data.status === 'success' && Array.isArray(data.data)) {
                                // Aquí deberías actualizar el estado correspondiente a los jefes directos
                                setJefesDirectosPuesto(data.data);
                                console.log('Jefes directos obtenidos:', data.data);
                            }
                        })
                        .catch(err => {
                            console.error('Error al obtener el catálogo de jefes directos:', err);
                        });
                })
            .catch(err => console.error('Error al obtener detalle:', err));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'foto' && e.target instanceof HTMLInputElement && e.target.files) {
            setFormData({ ...formData, foto: e.target.files[0] });
            console.log('foto:', e.target.files[0]);

        } else {
            
            setFormData({ ...formData, [name]: value });

            if(name === 'puesto' || name === 'grupo' || name === 'oficina') {
                //Al cambiar de puesto debemos consultar los jefes directos posibles y mostrarlos en el select de jefes directos
                fetch(`/backend/Intranet/Perfiles/jefesDirectosPuesto?puesto=${encodeURIComponent(name == 'puesto' ? value : formData.puesto)}&empresa=${encodeURIComponent(name == 'grupo' ? value : formData.grupo)}&ciudad=${encodeURIComponent(name == 'oficina' ? value : formData.oficina)}`)
                .then(res => {
                    if (!res.ok) throw new Error('No se pudo obtener el catálogo de jefes directos');
                    return res.json();
                })
                .then(data => {
                    if (data && data.status === 'success' && Array.isArray(data.data)) {
                        // Aquí deberías actualizar el estado correspondiente a los jefes directos
                        setJefesDirectosPuesto(data.data);
                        console.log('Jefes directos obtenidos:', data.data);
                    }
                })
                .catch(err => {
                    console.error('Error al obtener el catálogo de jefes directos:', err);
                });
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        
        e.preventDefault();
        
        
        if(session?.session.sesionPuesto !== 'Gerente de Administración' && session?.session.sesionPuesto !== 'Auxiliar Administrativo B' && session?.session.sesionPuesto !== 'Coordinador Administrativo' && session?.session.sesionPuesto !== 'Gerente de Contabilidad' && session?.session.sesionPuesto !== 'Auxiliar Contable' && session?.session.sesionPuesto !== 'Auxiliar de Calidad' && session?.session.sesionPuestoCategoria !== 'Sistemas'){
            alert('No tienes permisos para modificar usuarios.');
            return;
        }
        
        
        if (!usuarioModificar) {
            alert('No se encontró el usuario a modificar.');
            return;
        }

        const form = new FormData();

        Object.entries(formData).forEach(([key, value]) => {
            if (key === 'foto') {
                if (value instanceof File) {
                    form.append(key, value);
                }
            } else {
                form.append(key, value as string);
            }
        });

        form.append('usuario', usuarioModificar);
        form.append('usuarioModifica', session?.session.sesionUsuario || '');

        try {
            const response = await fetch('/backend/Intranet/Perfiles/modificaUsuario', {
                method: 'PUT',
                body: form,
            });
            const data = await response.json().catch(() => null);

            if (!response.ok || data?.status !== 'success') {
                throw new Error(data?.message || 'No se pudo modificar el usuario.');
            }

            alert('Usuario modificado correctamente');
            router.push(`/Sistemas/Intranet/Perfiles/DetalleUsuario?usuario=${encodeURIComponent(data.usuario || usuarioModificar)}`);
        } catch (err) {
            console.error('Error al modificar usuario:', err);
            alert(err instanceof Error ? err.message : 'No se pudo modificar el usuario.');
        }
    };

    const handleImport = () => {
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) {
            fileInput.click(); // Abre el selector de archivos al hacer clic en el icono
        }
    };

    // Cambia la función onChange para manejar el archivo seleccionado
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileInput = e.target; // Obtener el input de archivo
        if (fileInput.files && fileInput.files.length > 0) {
            const file = fileInput.files[0];

            try {
                // Leer el contenido del archivo como un ArrayBuffer
                const arrayBuffer = await file.arrayBuffer();
                const decoder = new TextDecoder('ISO-8859-1', { fatal: true }); // Asegúrate de usar la codificación correcta
                const text = decoder.decode(arrayBuffer); // Decodifica el ArrayBuffer a texto

                const lines = text.split('\n');
                const newFormData: any = { ...formData };

                lines.forEach(line => {
                    const [key, ...rest] = line.split(':');
                    const value = rest.join(':').trim();
                    switch (key.trim().toLowerCase()) {
                        case 'nombres':
                            newFormData.nombre = value.trim();
                            break;
                        case 'apellido paterno':
                            newFormData.apellidoPaterno = value.trim();
                            break;
                        case 'apellido materno':
                            newFormData.apellidoMaterno = value.trim();
                            break;
                        case 'correo':
                            newFormData.correo = value.trim();
                            break;
                        case 'categoria':
                            newFormData.categoria = value.trim();
                            break;
                        case 'rfc':
                            newFormData.rfc = value.trim();
                            break;
                        case 'curp':
                            newFormData.curp = value.trim();
                            break;
                        case 'empresa':
                            newFormData.categoria === 'Empleado' ? newFormData.grupo = value.trim() : newFormData.empresa = value.trim();
                            break;
                        case 'oficina':
                            newFormData.oficina = value.trim();
                            break;
                        case 'puesto':
                            newFormData.puesto = value.trim();
                            break;
                        default:
                            break;
                    }
                });

                setFormData(newFormData);

                if (newFormData.puesto && newFormData.oficina) {
                    fetch(`/backend/Intranet/Perfiles/jefesDirectosPuesto?puesto=${encodeURIComponent(newFormData.puesto)}&ciudad=${encodeURIComponent(newFormData.oficina)}`)
                        .then(res => {
                            if (!res.ok) throw new Error('No se pudo obtener el catálogo de jefes directos');
                            return res.json();
                        })
                        .then(data => {
                            if (data && data.status === 'success' && Array.isArray(data.data)) {
                                setJefesDirectosPuesto(data.data);
                                console.log('Jefes directos obtenidos:', data.data);
                            }
                        })
                        .catch(err => {
                            console.error('Error al obtener el catálogo de jefes directos:', err);
                        });
                }
            } catch (error) {
                console.error('Error al leer el archivo:', error);
                alert('Error al leer el archivo. Asegúrate de que esté en formato UTF-8.');
            }
        }
    };

    return (

        <div className="min-h-screen flex items-center justify-center p-4 text-white" style={{ backgroundColor: '#2F2F2F' }}>

            <div className="w-full max-w-4xl bg-transparent p-8">

                <div className="text-sm" style={{ color: '#007cbd' }}>Usuario: {session?.session.sesionUsuario}</div>

                {/* TÍTULO */}
                <h3 className="text-center text-3xl font-bold mb-6 ">
                    Modifica Usuario
                </h3>

                {/* Breadcrumb */}
                <nav className="text-sm text-gray-600 mb-10 text-center" style={{ color: '#007cbd' }}>
                    <a
                        href="https://escalante.com.mx/Sistemas/seleccionaSistema.php"
                        className="hover:underline cursor-pointer"
                    >
                        Home
                    </a>
                    <span className="mx-2">/</span>
                    <a
                        href="https://escalante.com.mx/Sistemas/Configuraciones/configuraciones.php"
                        className="hover:underline cursor-pointer"
                    >
                        Configuraciones
                    </a>
                    <span className="mx-2">/</span>
                    <a
                        href="https://escalante.com.mx/Sistemas/Configuraciones/administradorPerfiles.php"
                        className="hover:underline cursor-pointer"
                    >
                        Administrador perfiles
                    </a>
                </nav>

                <div className="border-t border-[#007cbd] my-4"></div>

                {/* Icono de importación de archivo 
                <div className="flex flex-col items-end text-white m-4">
                    <label className="flex items-center cursor-pointer">
                        <input 
                            id="fileInput"
                            type="file" 
                            className="hidden" // Oculta el input
                            onChange={handleFileChange} // Cambia a handleFileChange
                        />
                        <FaFileImport className='text-[#007cbd] w-6 h-6' onClick={handleImport} />
                    </label>
                </div>
                */}
                
                <div className="flex flex-col col-span-1 md:col-span-2 items-center m-10">
                    <label className="font-medium mb-1">Foto</label>
                    {formData.foto ? (
                        <img src={`https://escalante.com.mx/Sistemas/INTRANET_GEA/ComunicacionInterna/Personal/${formData.foto}`} alt="Foto del usuario" className="w-32 h-32 rounded" />
                    ) : (
                        <span>No hay foto</span>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 p-4 md:grid-cols-2 gap-6" encType="multipart/form-data">
                    <div className="flex flex-col">
                        <label className="font-medium mb-1">Nombres</label>
                        <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="border rounded px-3 py-2 bg-gray-600 text-white" />
                    </div>

                    <div className="flex flex-col">
                        <label className="font-medium mb-1">Apellido Paterno</label>
                        <input type="text" name="apellidoPaterno" value={formData.apellidoPaterno} onChange={handleChange} required className="border rounded px-3 py-2 bg-gray-600 text-white" />
                    </div>

                    <div className="flex flex-col">
                        <label className="font-medium mb-1">Apellido Materno</label>
                        <input type="text" name="apellidoMaterno" value={formData.apellidoMaterno} onChange={handleChange} required className="border rounded px-3 py-2 bg-gray-600 text-white" />
                    </div>

                    <div className="flex flex-col">
                        <label className="font-medium mb-1">Correo</label>
                        <input type="email" name="correo" value={formData.correo} onChange={handleChange} required className="border rounded px-3 py-2 bg-gray-600 text-white" />
                    </div>

                    <div className="flex flex-col">
                        <label className="font-medium mb-1">Categoria</label>
                        <select name="categoria" value={formData.categoria} onChange={handleChange} required className="border rounded px-3 py-2 bg-gray-600 text-white">
                            <option value="">Selecciona un tipo</option>
                            <option value="Cliente">Cliente</option>
                            <option value="Empleado">Empleado</option>
                            <option value="Proveedor">Proveedor</option>
                        </select>
                    </div>

                    {formData.categoria !== 'Empleado' && (
                        <div className="flex flex-col">
                            <label className="font-medium mb-1">Empresa</label>
                            <input type="text" name="empresa" value={formData.empresa} onChange={handleChange} required className="border rounded px-3 py-2  bg-gray-600 text-white" />
                        </div>
                    )}

                    {formData.categoria === 'Empleado' && (
                        <div className="flex flex-col">
                            <label className="font-medium mb-1">Empresa</label>
                            <select name="grupo" value={formData.grupo} onChange={handleChange} required className="border rounded px-3 py-2 bg-gray-600 text-white">
                                <option value="">Selecciona un grupo</option>
                                <option value="Grupo Escalante">Grupo Escalante</option>
                                <option value="Nuñez y Escalante">Nuñez y Escalante</option>
                                <option value="Transportes de calidad">Transportes de calidad</option>
                                <option value="Montalvo y Montalvo">Montalvo y Montalvo</option>
                            </select>
                        </div>
                    )}

                    {formData.categoria === 'Empleado' && (
                        <>
                        <div className="flex flex-col">
                            <label className="font-medium mb-1">RFC</label>
                            <input type="text" name="rfc" value={formData.rfc} onChange={handleChange} required className="border rounded px-3 py-2  bg-gray-600 text-white" />
                        </div>

                        <div className="flex flex-col">
                            <label className="font-medium mb-1">CURP</label>
                            <input type="text" name="curp" value={formData.curp} onChange={handleChange} required className="border rounded px-3 py-2  bg-gray-600 text-white" />
                        </div>
                        </>
                    )}

                    <div className="flex flex-col">
                        <label className="font-medium mb-1">Oficina</label>
                        <select name="oficina" value={formData.oficina} onChange={handleChange} required className="border rounded px-3 py-2 bg-gray-600 text-white">
                            <option value="">Selecciona una oficina</option>
                            <option value="CDMX">Ciudad de México</option>
                            <option value="NLRD">Nuevo Laredo</option>
                            <option value="CUN">Cancún</option>
                            <option value="VER">Veracruz</option>
                            <option value="TOL">Toluca</option>
                        </select>
                    </div>

                    {formData.categoria === 'Empleado' && (
                        <>
                        <div className="flex flex-col">
                            <label className="font-medium mb-1">Puesto</label>
                            <select
                                name="puesto"
                                value={formData.puesto}
                                onChange={handleChange}
                                required
                                className="border rounded px-3 py-2 bg-gray-600 text-white"
                            >
                                <option value="">Selecciona un puesto</option>
                                {Array.from(
                                    catalogoPuestos
                                        .filter(p => p.xt_empresa === formData.grupo)
                                        .reduce((acc, puesto) => {
                                            if (!acc.has(puesto.xt_categoria)) acc.set(puesto.xt_categoria, []);
                                            acc.get(puesto.xt_categoria)!.push(puesto);
                                            return acc;
                                        }, new Map<string, CatalogoPuestos[]>())
                                ).map(([categoria, puestos]) => (
                                    <optgroup key={categoria} label={categoria}>
                                        {puestos.map((puesto) => (
                                            <option key={puesto.xt_puesto} value={puesto.xt_puesto}>
                                                {puesto.xt_puesto}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col">
                            <label className="font-medium mb-1">Jefe directo</label>
                            <select
                                name="jefeDirecto"
                                value={formData.jefeDirecto}
                                onChange={handleChange}
                                required
                                className="border rounded px-3 py-2 bg-gray-600 text-white"
                            >
                                <option value="">Selecciona jefe</option>
                                {jefesDirectosPuesto.map((jefe) => (
                                    <option key={jefe.xt_usuario} value={jefe.xt_usuario}>
                                        {jefe.xt_nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        </>
                    )}

                    <div className="flex flex-col col-span-1 md:col-span-2">
                        <label className="font-medium mb-1">Foto</label>
                        <input type="file" name="foto" accept="image/*" onChange={handleChange} className="border rounded px-3 py-2 bg-gray-600 text-white" />
                    </div>

                    <div className="col-span-1 md:col-span-2 flex justify-end">
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow">
                            Guardar Cambios
                        </button>
                    </div>
                </form>

                <div className="border-t border-[#007cbd] my-4"></div>
            </div>
        </div>
        
    );
};

export default ModificaUsuario;
