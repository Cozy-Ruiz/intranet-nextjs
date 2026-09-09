import { useEffect, useState } from "react";

type Cliente = {
    kp_clienteId: string;
    xt_nombre: string;
    xt_rfc: string;
};

type UsuarioDB = {
    xt_usuario: string;
    // ...otros campos si necesitas
};

type ConfiguracionEstadisticasProps = {
    usuario: UsuarioDB | null;
    onClose: () => void;
};

const ConfiguracionEstadisticas = ({ usuario, onClose }: ConfiguracionEstadisticasProps) => {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
    const [clientesUsuario, setClientesUsuario] = useState<Cliente[]>([]);
    const [mostrarAgregar, setMostrarAgregar] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!usuario) return;
        setLoading(true);

        // Descarga la lista de todos los clientes
        const fetchClientes = fetch("/backend/Intranet/Perfiles/listaClientes")
            .then(res => res.json())
            .then(data => {
                setClientes(data.data || []);
            })
            .catch(err => {
                console.error("Error al cargar clientes:", err);
            });

        // Descarga los clientes actuales del usuario
        const fetchClientesUsuario = fetch(`/backend/Intranet/Perfiles/Estadisticas/usuarioClientesEstadisticas?usuario=${usuario.xt_usuario}`)
            .then(res => res.json())
            .then(data => {
                console.log("Clientes del usuario:", data);
                setClientesUsuario(data.data || []);
            })
            .catch(err => {
                console.error("Error al cargar clientes del usuario:", err);
            });

        Promise.all([fetchClientes, fetchClientesUsuario])
            .finally(() => setLoading(false));
    }, [usuario]);

    const handleGuardar = async () => {
        console.log("cliente seleccionado:" + clienteSeleccionado)
        if (!usuario) return;
        setLoading(true);
        try {
            const response = await fetch("/backend/Intranet/Perfiles/Estadisticas/registraClienteUsuarioEstadisticas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usuario: usuario.xt_usuario,
                    cliente: clienteSeleccionado?.kp_clienteId,
                    rfc: clienteSeleccionado?.xt_rfc,
                }),
            });
            const data = await response.json();
            if (data.success || response.ok) {
                const clientesUsuarioRes = await fetch(`/backend/Intranet/Perfiles/Estadisticas/usuarioClientesEstadisticas?usuario=${usuario.xt_usuario}`);
                const clientesUsuarioData = await clientesUsuarioRes.json();
                setClientesUsuario(clientesUsuarioData.data || []);
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

    const handleEliminar = async (clienteId: string, rfc: string) => {
        if (!usuario) return;
        const confirmar = confirm("¿Seguro que deseas eliminar el acceso de este cliente para el usuario?");
        if (!confirmar) return;
        setLoading(true);
        try {
            const response = await fetch("/backend/Intranet/Perfiles/Estadisticas/eliminaClienteUsuarioEstadisticas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usuario: usuario.xt_usuario,
                    cliente: String(clienteId),
                    rfc: rfc,
                }),
            });
            const data = await response.json();
            if (data.success || response.ok) {
                setClientesUsuario(prev => prev.filter(c => c.kp_clienteId !== clienteId));
                alert("Cliente eliminado correctamente.");
            } else {
                alert("Error al eliminar el cliente.");
            }
        } catch (err) {
            console.error("Error al eliminar cliente:", err);
            alert("Ocurrió un error al eliminar el cliente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-500/80 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-lg text-black">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Clientes Estadisticas</h2>
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
                {loading && <div className="mb-2 text-blue-600">Cargando...</div>}

                <div className="border-t border-[#007cbd] my-4"></div>

                {mostrarAgregar && (
                    <div className="mb-4">
                        <select
                            className="w-full border rounded px-3 py-2 mb-2"
                            onChange={e => {
                                const seleccionado = clientes.find(
                                    c => String(c.kp_clienteId) === String(e.target.value)
                                );
                                setClienteSeleccionado(seleccionado || null);
                            }}
                            disabled={clientes.length === 0}
                        >
                            <option value="">Selecciona un cliente</option>
                            {clientes.map(cliente => (
                                <option key={cliente.kp_clienteId} value={cliente.kp_clienteId}>
                                    {cliente.xt_nombre} - {cliente.xt_rfc}
                                </option>
                            ))}
                        </select>
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

                        <div className="border-t border-[#007cbd] my-4"></div>
                    </div>
                )}
                
                <div className="overflow-y-auto mb-4 max-h-[300px]">
                    <table className="min-w-full border border-gray-300 rounded text-sm">
                        <thead>
                            <tr className="bg-[#f3f6fa] text-[#007cbd]">
                                <th className="px-3 py-2 border-b text-left">#</th>
                                <th className="px-3 py-2 border-b text-left">Nombre</th>
                                <th className="px-3 py-2 border-b text-left">RFC</th>
                                <th className="px-3 py-2 border-b text-left"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {clientesUsuario.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-3 py-2 text-gray-500 text-center">
                                        No hay clientes asignados actualmente.
                                    </td>
                                </tr>
                            ) : (
                                clientesUsuario.map((cliente, index) => (
                                    <tr key={cliente.kp_clienteId} className="hover:bg-gray-100">
                                        <td className="px-3 py-2 border-b">{index + 1}</td>
                                        <td className="px-3 py-2 border-b">{cliente.xt_nombre}</td>
                                        <td className="px-3 py-2 border-b">{cliente.xt_rfc}</td>
                                        <td className="px-3 py-2 border-b">
                                            <button
                                                className="text-red-600 hover:text-red-800"
                                                onClick={() => handleEliminar(cliente.kp_clienteId, cliente.xt_rfc)}
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

export default ConfiguracionEstadisticas;