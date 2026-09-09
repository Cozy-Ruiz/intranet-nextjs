import React, { useState } from 'react'
import FiltroSemaforo from './ColorFilter'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ListaTransportes = ({ transportes, fecha, setFecha, handleRowClick, handleRelacionSalidaClick, handleNewTransport, fetchRelacionSalida }: any) => {

    const [busquedaReferencia, setBusquedaReferencia] = useState<string>("");
    const [busquedaCita, setBusquedaCita] = useState<string>("");
    const [coloresSeleccionados, setColoresSeleccionados] = useState<string[]>([]);
    const [[start, end], setRange] = useState<[Date | null, Date | null]>([null, null]);
    const [clientesSeleccionados, setClientesSeleccionados] = useState<string[]>([]);
    const [mostrarFiltroClientes, setMostrarFiltroClientes] = useState(false);
    const [transportistasSeleccionados, setTransportistasSeleccionados] = useState<string[]>([]);
    const [mostrarFiltroTransportistas, setMostrarFiltroTransportistas] = useState(false);

    const [mostrarFiltros, setMostrarFiltros] = useState(false);

    const [ordenFecha, setOrdenFecha] = useState<"asc" | "desc" | null>(null);

    const transportistasUnicos = Array.from(
        new Set(transportes.map((t: any) => t.xt_transportista))
    );
    
    const clientesUnicos = Array.from(new Set(
        transportes.flatMap((t: any) =>
            t.clientes?.map((c: any) => `${c.xt_rfc}|${c.xt_nombre}`) || []
        )
    ));

    function parseFecha(fechaStr: string): Date | null {
        if (!fechaStr) return null;
        
        const [fecha, hora] = fechaStr.split(" ");
        const [dia, mes, año] = fecha.split("-");

        // Formato ISO: YYYY-MM-DDTHH:mm
        const fechaISO = `${año}-${mes}-${dia}T${hora || "00:00"}`;

        return new Date(fechaISO);
    }


    const transportesFiltrados = transportes

        // 1. Filtro por referencia (pedimento)
        .filter((t: any) => {
            if (busquedaReferencia.trim() === "") return true;
            const q = busquedaReferencia.toLowerCase();

            const porReferencia = t.clientes?.some((cliente: any) =>
                cliente.pedimentos?.some((ped: any) =>
                ped.xt_referencia?.toLowerCase().includes(q)
                )
            );

            //const porPlaca = t.xt_placa?.toLowerCase().includes(q);

            const porPlaca = t.relacion_salida?.some((rel: any) =>
                rel.xt_placa?.toLowerCase().includes(q)
            );

            return Boolean(porReferencia || porPlaca);
        })

        // 2. Filtro por transportistas seleccionados
        .filter((t: any) =>
            transportistasSeleccionados.length === 0
            ? true
            : transportistasSeleccionados.includes(t.xt_transportista)
        )

        // 2. Filtro por cliente
        .filter((t: any) =>
            clientesSeleccionados.length === 0
                ? true
                : t.clientes?.some((cliente: any) =>
                    clientesSeleccionados.includes(cliente.xt_rfc)
                )
        )

        // 3. Filtro por fecha cita
        .filter((t: any) =>{
            if (busquedaCita.trim() === "") return true;

            if (!t.FECHA_SALIDA) return false; // si no tiene fecha, no lo incluimos

            // Convertir "27-05-2025 13:00:00" a "2025-05-27"
            const fechaRaw = t.FECHA_SALIDA.split(" ")[0]; // "27-05-2025"
            const [dia, mes, anio] = fechaRaw.split("-");

            const fechaFormateada = `${anio}-${mes}-${dia}`; // "2025-05-27"

            return fechaFormateada === busquedaCita;
        })

        // 4. Filtro por semáforo (color)                        
        .filter((t: any) =>
            coloresSeleccionados.length === 0 ? true : coloresSeleccionados.includes(t.semaforo)
        )

        // 5. Ordenamiento por fecha
        if (ordenFecha) {
            transportesFiltrados.sort((a: any, b: any) => {
                const fechaA = parseFecha(a.FECHA_SALIDA);
                const fechaB = parseFecha(b.FECHA_SALIDA);

                if (!fechaA && !fechaB) return 0;
                if (!fechaA) return 1;
                if (!fechaB) return -1;

                return ordenFecha === "asc"
                    ? fechaA.getTime() - fechaB.getTime()
                    : fechaB.getTime() - fechaA.getTime();
            });
        }

    return (
        //<div className="w-full max-w-4xl overflow-y-auto p-4 bg-white border border-gray-300 rounded-lg shadow-lg">
        <div className="w-full p-2 sm:p-4 overflow-y-auto bg-white border sm:border-gray-300 rounded-none sm:rounded-lg shadow-none sm:shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold text-center">Lista de solicitud de transportes</h1>
            </div>
            {/*
            <div className="flex justify-between items-center mb-4">
                
                <DatePicker
                    selectsRange
                    startDate={start}
                    endDate={end}
                    onChange={(update: [Date | null, Date | null]) => {
                        setRange(update);
                        
                        if (update[0] === null && update[1] === null) {
                            setFecha( "'" + (new Date().toISOString().split('T')[0]) + "' AND '" + (new Date().toISOString().split('T')[0]) + "'" ); // Si no hay rango, limpiar fecha
                        }else if(update[0] != null && update[1] != null){
                            setFecha("'" + (update[0] != null ? update[0].toISOString().split('T')[0] : new Date().toISOString().split('T')[0]) + "' AND '" + (update[1] != null ? update[1].toISOString().split('T')[0] : new Date().toISOString().split('T')[0]) + "'");
                        }
                    }}
                    isClearable
                    placeholderText={new Date().toISOString().split('T')[0]}
                    className="border px-3 py-2 rounded-lg w-full"
                    dateFormat="yyyy-MM-dd"
                />

                <input
                    className="border px-3 py-2 rounded-lg"
                    placeholder="Buscar referencia"
                    value={busquedaReferencia}
                    onChange={(e) => setBusquedaReferencia(e.target.value)}
                    title="Buscar por referencia"
                />

                <button
                    onClick={() => setMostrarFiltroTransportistas(!mostrarFiltroTransportistas)}
                    className={`flex items-center justify-center px-3 py-2 rounded-lg border font-medium transition ${
                    transportistasSeleccionados.length > 0 ? 'bg-green-500 text-white' : 'bg-gray-100'
                    }`}
                    title="Filtrar por transportista"
                >
                    🚚
                </button>

                <button
                    onClick={() => setMostrarFiltroClientes(!mostrarFiltroClientes)}
                    className={`flex items-center justify-center px-3 py-2 rounded-lg border font-medium transition ${
                        clientesSeleccionados.length > 0 ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-800'
                    }`}
                    title="Filtrar por cliente"
                    >
                    👥
                </button>

                <input 
                    type='date' 
                    className="border px-3 py-2 rounded-lg"
                    //value={fecha}
                    onChange={(e) => setBusquedaCita(e.target.value)}
                    title="Selecciona fecha de cita"
                />

                <FiltroSemaforo
                    coloresSeleccionados={coloresSeleccionados}
                    setColoresSeleccionados={setColoresSeleccionados}
                />
            </div>
            */}

            <div className="flex justify-between items-center mb-4">
                <DatePicker
                    selectsRange
                    startDate={start}
                    endDate={end}
                    onChange={(update: [Date | null, Date | null]) => {
                        setRange(update);
                        
                        if (update[0] === null && update[1] === null) {
                            setFecha( "'" + (new Date().toISOString().split('T')[0]) + "' AND '" + (new Date().toISOString().split('T')[0]) + "'" ); // Si no hay rango, limpiar fecha
                        }else if(update[0] != null && update[1] != null){
                            setFecha("'" + (update[0] != null ? update[0].toISOString().split('T')[0] : new Date().toISOString().split('T')[0]) + "' AND '" + (update[1] != null ? update[1].toISOString().split('T')[0] : new Date().toISOString().split('T')[0]) + "'");
                        }
                    }}
                    isClearable
                    placeholderText={new Date().toISOString().split('T')[0]}
                    className="border px-3 py-2 rounded-lg w-full"
                    dateFormat="yyyy-MM-dd"
                />

                <button
                    onClick={() => setMostrarFiltros(!mostrarFiltros)}
                    className={`flex items-center justify-center px-3 py-2 rounded-lg border font-medium transition `}
                    title="Filtros"
                    >
                    🔍                 
                </button>
            </div>
            
            {mostrarFiltros && (
                <>
                <div className="flex justify-between items-center mb-4">
                    <input
                        className="border px-3 py-2 rounded-lg"
                        placeholder="Buscar (referencia, placa)"
                        value={busquedaReferencia}
                        onChange={(e) => setBusquedaReferencia(e.target.value)}
                        title="Buscar por referencia o placa"
                    />

                    <input 
                        type='date' 
                        className="border px-3 py-2 rounded-lg"
                        //value={fecha}
                        onChange={(e) => setBusquedaCita(e.target.value)}
                        title="Selecciona fecha de cita"
                    />
                </div>

            
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={() => setMostrarFiltroTransportistas(!mostrarFiltroTransportistas)}
                        className={`flex items-center justify-center px-3 py-2 rounded-lg border font-medium transition ${
                        transportistasSeleccionados.length > 0 ? 'bg-green-500 text-white' : 'bg-gray-100'
                        }`}
                        title="Filtrar por transportista"
                    >
                        🚚
                    </button>

                    <button
                        onClick={() => setMostrarFiltroClientes(!mostrarFiltroClientes)}
                        className={`flex items-center justify-center px-3 py-2 rounded-lg border font-medium transition ${
                            clientesSeleccionados.length > 0 ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-800'
                        }`}
                        title="Filtrar por cliente"
                        >
                        👥
                    </button>

                    <button
                        onClick={() =>
                                    setOrdenFecha((prev) =>
                                        prev === "asc" ? "desc" : prev === "desc" ? null : "asc"
                                    )
                                }
                        className={`flex items-center justify-center px-3 py-2 rounded-lg border font-medium transition bg-gray-100 text-gray-800`}
                        title="Ordenar por fecha de cita"
                        >
                        {ordenFecha === "asc" && <span>🔼</span>}
                        {ordenFecha === "desc" && <span>🔽</span>}
                        {ordenFecha === null && <span>⬍</span>}
                    </button>

                    <FiltroSemaforo
                        coloresSeleccionados={coloresSeleccionados}
                        setColoresSeleccionados={setColoresSeleccionados}
                    />
                </div>
                </>
            )}

            {/* Checkbox de transportistas */}
            {mostrarFiltroTransportistas && (
                <div className="border rounded p-3 max-h-48 overflow-y-scroll mb-4 bg-gray-50">
                    <strong className="block mb-2">Filtrar por transportista:</strong>
                    {transportistasUnicos.map((nombre:any, index) => (
                        <label key={index} className="block text-sm mb-1">
                        <input
                            type="checkbox"
                            checked={transportistasSeleccionados.includes(nombre)}
                            onChange={(e) => {
                            if (e.target.checked) {
                                setTransportistasSeleccionados([...transportistasSeleccionados, nombre]);
                            } else {
                                setTransportistasSeleccionados(
                                transportistasSeleccionados.filter((n) => n !== nombre)
                                );
                            }
                            }}
                            className="mr-2"
                        />
                        {nombre}
                        </label>
                    ))}
                </div>
            )}

            {/* Checkbox de clientes */}
            {mostrarFiltroClientes && (
                <div className="border rounded p-3 max-h-48 overflow-y-scroll mb-4 bg-gray-50">
                    <strong className="block mb-2">Filtrar por cliente:</strong>
                    {clientesUnicos.map((clienteStr:any) => {
                    const [rfc, nombre] = clienteStr.split('|');
                    const seleccionado = clientesSeleccionados.includes(rfc);
                    return (
                        <label key={rfc} className="block text-sm mb-1">
                        <input
                            type="checkbox"
                            value={rfc}
                            checked={seleccionado}
                            onChange={(e) => {
                            if (e.target.checked) {
                                setClientesSeleccionados(prev => [...prev, rfc]);
                            } else {
                                setClientesSeleccionados(prev => prev.filter(c => c !== rfc));
                            }
                            }}
                        />
                        <span className="ml-2">{nombre}</span>
                        </label>
                    );
                    })}
                </div>
            )}
        
            {transportesFiltrados.length === 0 ? (
                <p>No hay transportes disponibles.</p>
            ) : (
                <>
                {/* Vista móvil */}
                <div className="block sm:hidden space-y-2 w-full">
                    {transportesFiltrados.map((transporte: any) => (
                        <div 
                        key={transporte.xn_id}
                        //onClick={() => handleRowClick(transporte)}
                        className={`border p-3 rounded-md cursor-pointer shadow-sm ${transporte.semaforo}`}
                        >
                            <div onClick={() => handleRowClick(transporte)} className="font-semibold text-sm">
                                Referencia: {transporte.referencias_pivote?.[0]?.REFERENCIA ?? transporte.clientes?.[0]?.pedimentos?.[0]?.xt_referencia ?? 'N/A'} {transporte.clientes?.flatMap((c: any) => c.pedimentos || []).length > 1 ? '*' : ''}{transporte.clientes.length > 1 ? '+' : ''}
                            </div>
                            <div className="text-xs">Transportista: {transporte.xt_transportista}</div>
                            <div className="text-xs">Placa: {transporte.xt_placa ?? transporte.relacion_salida?.[0]?.xt_placa ?? 'N/A'}</div>
                            <div className="text-xs">Cita: {transporte.origen?.FECHA_SALIDA ?? 'Sin fecha'}</div>
                            <div className="font-semibold text-xs" onClick={() => {fetchRelacionSalida(transporte.relacion_salida[0].xt_relacion_salida); handleRelacionSalidaClick();}}>Relacion salida: {transporte.relacion_salida.length > 0 ? transporte.relacion_salida[0].xt_relacion_salida : ''}</div>
                        </div>
                    ))}
                </div>

                {/* Vista escritorio */}
                <table className="hidden sm:table     min-w-full border-collapse border border-gray-300 mx-auto">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 border">Referencia</th>
                            <th className="px-4 py-2 border">Transportista</th>
                            <th className="px-4 py-2 border">Placa</th>
                            <th 
                                className="px-4 py-2 border cursor-pointer" 
                                onClick={() =>
                                    setOrdenFecha((prev) =>
                                        prev === "asc" ? "desc" : prev === "desc" ? null : "asc"
                                    )
                                }
                            >
                                Fecha cita&nbsp; 
                                {ordenFecha === "asc" && <span>🔼</span>}
                                {ordenFecha === "desc" && <span>🔽</span>}
                                {ordenFecha === null && <span>⬍</span>}
                            </th>
                            <th className="px-4 py-2 border">Relación de salida</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transportesFiltrados.map((transporte: any) => (
                            <tr key={transporte.xn_id}
                            className={`hover:bg-200 cursor-pointer ${transporte.semaforo}`}
                            >
                                <td onClick={() => handleRowClick(transporte)} className="px-4 py-2 border whitespace-nowrap">{transporte.referencias_pivote.length > 0 ? transporte.referencias_pivote[0].REFERENCIA + ' ' : (
                                    transporte.clientes.length > 0 && transporte.clientes[0].pedimentos.length > 0
                                    ? transporte.clientes[0].pedimentos[0].xt_referencia + ' '
                                    : ''
                                )}{transporte.clientes?.flatMap((c: any) => c.pedimentos || []).length > 1 ? '*' : ''}{transporte.clientes.length > 1 ? '+' : ''}</td>
                                <td onClick={() => handleRowClick(transporte)} className="px-4 py-2 border">{transporte.xt_transportista}</td>
                                <td onClick={() => handleRowClick(transporte)} className="px-4 py-2 border">{transporte.xt_placa != null ? transporte.xt_placa : (transporte.relacion_salida.length > 0 ? transporte.relacion_salida[0].xt_placa : '')}</td>
                                <td onClick={() => handleRowClick(transporte)}className="px-4 py-2 border">{transporte.origen?.FECHA_SALIDA ?? 'Sin fecha'}</td>
                                <td className="px-4 py-2 border" onClick={() => {fetchRelacionSalida(transporte.relacion_salida[0].xt_relacion_salida); handleRelacionSalidaClick();}}>{transporte.relacion_salida.length > 0 ? transporte.relacion_salida[0].xt_relacion_salida : ''}</td>
                            </tr>
                            
                        ))}
                    </tbody>
                </table>

                </>
            )}
        </div>
    )
}

export default ListaTransportes