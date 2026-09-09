import { useEffect, useState } from "react";

type Oficina = {
    xt_oficina : string;
    xt_descripcion: string;
}

type Modulo = {
    xt_modulo: string;
    xt_descripcion: string;
}

type Cliente = {
    kp_clienteId: string;
    xt_nombre: string;
    xt_rfc: string;
};

type UsuarioDB = {
    xt_usuario: string;
    // ...otros campos si necesitas
};

type ConfiguracionLinksProps = {
    usuario: UsuarioDB | null;
    onClose: () => void;
};

const ConfiguracionLinks = ({ usuario, onClose }: ConfiguracionLinksProps) => {
    const [oficinas, setOficinas] = useState<Oficina[]>([]);
    const[modulos, setModulos] = useState<Modulo[]>([]);
    const [oficinasUsuario, setOficinasUsuario] = useState<Oficina[]>([]);
    const[modulosOficinaUsuario, setModulosOficinaUsuario] = useState<Modulo[]>([]);
    const[oficinaSelected, setOficinaSelected] = useState<string | null>(null);
    const [moduloSelected, setModuloSelected] = useState<string| null>(null);
    /*
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [clienteSeleccionado, setClienteSeleccionado] = useState<string | null>(null);
    const [clientesUsuario, setClientesUsuario] = useState<Cliente[]>([]);
    */
    const [mostrarAgregar, setMostrarAgregar] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!usuario) return;
        setLoading(true);

        // Descarga la lista de todos los clientes
        const fetchCatalogoOficinas = fetch("/backend/Intranet/Perfiles/Links/catalogoOficinasLinks")
            .then(res => res.json())
            .then(data => {
                setOficinas(data.data || []);
            })
            .catch(err => {
                console.error("Error al cargar oficinas:", err);
            });

        // Descarga los clientes actuales del usuario
        const fetchCatalogoModulos = fetch(`/backend/Intranet/Perfiles/Links/catalogoModulosLinks`)
            .then(res => res.json())
            .then(data => {
                setModulos(data.data || []);
            })
            .catch(err => {
                console.error("Error al cargar modulos:", err);
            });

        Promise.all([fetchCatalogoOficinas, fetchCatalogoModulos])
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!usuario) return;
        setLoading(true);

        // Descarga la lista de todos los clientes
        const fetchOficinasUsuario = fetch(`/backend/Intranet/Perfiles/Links/oficinasUsuarioLinks?usuario=${usuario.xt_usuario}`)
            .then(res => res.json())
            .then(data => {
                setOficinasUsuario(data.data || []);
            })
            .catch(err => {
                console.error("Error al cargar oficinas:", err);
            });

        /*
        // Descarga los clientes actuales del usuario
        const fetchModulosOficinaUsuario = fetch(`/backend/Intranet/Perfiles/Links/catalogoModulosLinks`)
            .then(res => res.json())
            .then(data => {
                setModulos(data.data || []);
            })
            .catch(err => {
                console.error("Error al cargar modulos:", err);
            });
        */
        Promise.all([fetchOficinasUsuario/*, fetchModulosOficinaUsuario*/])
            .finally(() => setLoading(false));
    }, [usuario]);

    useEffect(() => {
        if (!usuario) return;
        setLoading(true);

        // Descarga los modulos actuales del usuario
        const fetchModulosOficinaUsuario = fetch(`/backend/Intranet/Perfiles/Links/modulosOficinaUsuarioLinks?usuario=${usuario.xt_usuario}&oficina=${oficinaSelected}`)
            .then(res => res.json())
            .then(data => {
                setModulosOficinaUsuario(data.data || []);
            })
            .catch(err => {
                console.error("Error al cargar modulos:", err);
            });
        
        Promise.all([fetchModulosOficinaUsuario])
            .finally(() => setLoading(false));
    }, [oficinaSelected]);

    
    const handleGuardar = async () => {
        if (!usuario) return;
        setLoading(true);
        try {
            const response = await fetch("/backend/Intranet/Perfiles/Links/altaModuloOficinaUsuarioLinks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usuario: usuario.xt_usuario,
                    oficina: oficinaSelected,
                    modulo: moduloSelected
                }),
            });
            const data = await response.json();
            if (data.success || response.ok) {
                const modulosUsuarioRes = await fetch(`/backend/Intranet/Perfiles/Links/modulosOficinaUsuarioLinks?usuario=${usuario.xt_usuario}&oficina=${oficinaSelected}`);
                const modulosUsuarioData = await modulosUsuarioRes.json();
                setModulosOficinaUsuario(modulosUsuarioData.data || []);
                setMostrarAgregar(false);
                alert("Configuración guardada correctamente.");
            } else {
                alert("Error al guardar configuración.");
            }
        } catch (err) {
            console.error("Error al guardar configuración:", err);
            alert("Ocurrió un error al guardar la configuración.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleEliminar = async (modulo: string) => {
        if (!usuario) return;
        const confirmar = confirm("¿Seguro que deseas eliminar el acceso de este modulo para el usuario?");
        if (!confirmar) return;
        setLoading(true);
        try {
            const response = await fetch("/backend/Intranet/Perfiles/Links/eliminaModuloOficinaUsuarioLinks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usuario: usuario.xt_usuario,
                    oficina: oficinaSelected,
                    modulo: modulo
                }),
            });
            const data = await response.json();
            if (data.success || response.ok) {
                const modulosUsuarioRes = await fetch(`/backend/Intranet/Perfiles/Links/modulosOficinaUsuarioLinks?usuario=${usuario.xt_usuario}&oficina=${oficinaSelected}`);
                const modulosUsuarioData = await modulosUsuarioRes.json();
                setModulosOficinaUsuario(modulosUsuarioData.data || []);
                setMostrarAgregar(false);
                alert("Modulo eliminado correctamente.");
            } else {
                alert("Error al eliminar el modulo.");
            }
        } catch (err) {
            console.error("Error al eliminar modulo:", err);
            alert("Ocurrió un error al eliminar el modulo.");
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-gray-500/80 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-lg text-black">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Configurador Links</h2>
                </div>
                {loading && <div className="mb-2 text-blue-600">Cargando...</div>}

                <div className="border-t border-[#007cbd] my-4"></div>

                <div className="mb-4">
                    <select
                        className="w-full border rounded px-3 py-2 mb-2"
                        onChange={e => setOficinaSelected(e.target.value)}
                        disabled={oficinas.length === 0}
                    >
                        <option value="">Selecciona una oficina</option>
                        {oficinas.map(oficina => (
                            <option key={oficina.xt_oficina} value={oficina.xt_oficina}>
                                {oficina.xt_oficina}
                            </option>
                        ))}
                    </select>
                    {/*}
                    {clientes.length === 0 && !loading && (
                        <div className="text-gray-500">No hay clientes disponibles.</div>
                    )}

                    <div className="flex justify-end">
                        <button
                            className="px-4 py-2 bg-[#007cbd] text-white rounded hover:bg-[#005a8c]"
                            onClick={handleGuardar}
                            disabled={loading || (clienteSeleccionado ?? (clientes[0]?.kp_clienteId ?? "")) === ""}
                        >
                            Agregar
                        </button>
                    </div>
                    */}
                    <div className="border-t border-[#007cbd] my-4"></div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-l font-bold">Modulos {oficinaSelected}</h2>
                    <button
                        className="ml-2 p-2 rounded-full bg-[#007cbd] hover:bg-[#005a8c] text-white"
                        title={mostrarAgregar ? "Ocultar" : "Agregar cliente"}
                        onClick={() => setMostrarAgregar(v => !v)}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={10}
                            height={10}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>

                
                {mostrarAgregar && (
                    <div className="mb-4">
                        <select
                            className="w-full border rounded px-3 py-2 mb-2"
                            onChange={e => setModuloSelected(e.target.value)}
                            disabled={modulos.length === 0}
                        >
                            <option value="">Selecciona un modulo</option>
                            {modulos.map(modulo => (
                                <option key={modulo.xt_modulo} value={modulo.xt_modulo}>
                                    {modulo.xt_modulo}
                                </option>
                            ))}
                        </select>

                        <div className="flex justify-end">
                            <button
                                className="px-4 py-2 bg-[#007cbd] text-white rounded hover:bg-[#005a8c]"
                                onClick={handleGuardar}
                                //disabled={loading || (clienteSeleccionado ?? (clientes[0]?.kp_clienteId ?? "")) === ""}
                            >
                                Agregar
                            </button>
                        </div>

                        <div className="border-t border-[#007cbd] my-4"></div>
                    </div>
                )}
                

                <div className="overflow-y-auto mb-4 max-h-[300px]">

                    <table className="min-w-full border border-gray-300 rounded text-sm">
                        <thead>
                            <tr className="bg-[#f3f6fa] text-[#007cbd]">
                                <th className="px-3 py-2 border-b text-left">#</th>
                                <th className="px-3 py-2 border-b text-left">Modulo</th>
                                <th className="px-3 py-2 border-b text-left">Oficina</th>
                                <th className="px-3 py-2 border-b text-left"></th>
                            </tr>
                        </thead>
                        
                        <tbody>
                            {modulosOficinaUsuario.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-3 py-2 text-gray-500 text-center">
                                        No hay modulos asignados actualmente.
                                    </td>
                                </tr>
                            ) : (
                                modulosOficinaUsuario.map((modulo, index) => (
                                    <tr key={modulo.xt_modulo} className="hover:bg-gray-100">
                                        <td className="px-3 py-2 border-b">{index + 1}</td>
                                        <td className="px-3 py-2 border-b">{modulo.xt_modulo}</td>
                                        <td className="px-3 py-2 border-b">{oficinaSelected}</td>
                                        <td className="px-3 py-2 border-b">
                                            <button
                                                className="text-red-600 hover:text-red-800"
                                                onClick={() => handleEliminar(modulo.xt_modulo)}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width={20}
                                                    height={20}
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="#dc2626"
                                                    strokeWidth={2}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M6 7h12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3m2 0v13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7h12z"
                                                    />
                                                    <line x1="10" y1="11" x2="10" y2="17" stroke="#dc2626" strokeWidth={2} />
                                                    <line x1="14" y1="11" x2="14" y2="17" stroke="#dc2626" strokeWidth={2} />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        
                    </table>
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                </div>

                <div className="border-t border-[#007cbd] my-4"></div>

            </div>
        </div>
    );
};

export default ConfiguracionLinks;