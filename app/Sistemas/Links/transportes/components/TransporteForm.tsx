import React from 'react'

const TransporteForm = ({
    unidades,
    operadores,
    pedimentos,
    setPedimento,
    pedimento,
    handleAddPedimento,
    handleRemovePedimento,
    handleAddTransporte,
    handleNewUnit,
    handleNewOperator,
    setPlaca,
    setOperador,
    placa,
    operador
}: any) => {
  return (
    <div>
        <h2 className="text-xl font-bold text-center mb-4">Agregar Transporte</h2>
        <div className="mb-4">
            <label className="block font-semibold">Unidad:</label>
            <div className="flex items-center space-x-2">
                <select 
                    className="w-full border px-3 py-2 rounded-lg"
                    onChange={(e) => setPlaca(e.target.value)} 
                >
                <option value="">Seleccionar unidad</option>
                {
                    unidades.map((unidad: any) => (
                        <option key={unidad.xt_placa} value={unidad.xt_placa}>{unidad.xt_placa} - {unidad.xt_unidad}</option>
                    ))
                }
                </select>
                <button onClick={handleNewUnit} className="bg-blue-500 text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-blue-600 transition">
                +
                </button>
            </div>
        </div>

        <div className="mb-4">
            <label className="block font-semibold">Operador:</label>
            <div className="flex items-center space-x-2">
                <select 
                    className="w-full border px-3 py-2 rounded-lg"
                    onChange={(e) => setOperador(e.target.value)} 
                >
                <option value="">Seleccionar operador</option>
                {
                    operadores.map((operador: any) => (
                        <option key={operador.xt_operador} value={operador.xt_operador}>{operador.xt_operador}</option>
                    ))
                }
                </select>
                <button onClick={handleNewOperator} className="bg-blue-500 text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-blue-600 transition">
                +
                </button>
            </div>
        </div>

        <div className="flex flex-col h-full">
            <label className="block font-semibold">Pedimentos:</label>

            {/* Input para ingresar pedimentos */}
            <input
                className="border px-3 py-2 rounded-lg"
                placeholder="Ingrese pedimento y presione Enter"
                value={pedimento}
                onChange={(e) => setPedimento(e.target.value)}
                onKeyDown={handleAddPedimento}
            />

            {/* Contenedor de los pedimentos con scroll si es necesario */}
            <div className="mt-2 flex-grow overflow-y-auto border p-2 rounded-lg">
                {pedimentos.length === 0 ? (
                    <p className="text-gray-400 text-sm">No hay pedimentos agregados.</p>
                ) : (
                    <ul>
                        {pedimentos.map((item: String, index: number) => (
                            <li key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded-lg mt-2">
                                <span>{item}</span>
                                <button
                                    className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600"
                                    onClick={() => handleRemovePedimento(index)}
                                >
                                    X
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Botón de guardar */}
            <button 
                onClick={() => handleAddTransporte(placa, operador, pedimentos)}  
                className="mt-4 w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
            >
                Guardar
            </button>
        </div>
    </div>
  )
}

export default TransporteForm