import React from 'react'

const EditTransporteForm = ({ selectedTransporte, handleAddPedimentosTransporte, handleDeletePedimentoTransporte, pedimentos, setPedimento, pedimento, handleAddPedimento, handleRemovePedimento }: any) => {

  return (
    <div>
        <h2 className="text-xl font-bold text-center mb-4">Edita Transporte</h2>
        <table className="w-full border border-gray-300">
            <tbody>
                <tr className="bg-gray-100">
                    <td className="font-bold px-4 py-2 border">ID</td>
                    <td colSpan={2} className="px-4 py-2 border">{selectedTransporte.xn_id}</td>
                </tr>
                <tr>
                    <td className="font-bold px-4 py-2 border">Placa</td>
                    <td colSpan={2} className="px-4 py-2 border">{selectedTransporte.xt_placa}</td>
                </tr>
                <tr className="bg-gray-100">
                    <td className="font-bold px-4 py-2 border">Operador</td>
                    <td colSpan={2} className="px-4 py-2 border">{selectedTransporte.xt_operador}</td>
                </tr>
                <tr>
                    <td className="font-bold px-4 py-2 border">Fecha</td>
                    <td colSpan={2} className="px-4 py-2 border">{selectedTransporte.xd_fecha}</td>
                </tr>
                <tr className="bg-gray-100">
                    <td colSpan={3} className="font-bold text-center px-4 py-2">Pedimentos Actuales</td>
                </tr>
                <tr>
                    <td className="font-bold text-center px-4 py-2">Referencia</td>
                    <td className="font-bold text-center px-4 py-2">Pedimento</td>
                    <td></td>
                </tr>
                {selectedTransporte?.pedimentos?.map((pedimento: any, index: number) => (
                    <tr className="bg-gray-100" key={index}>
                        <td className="text-center px-4 py-2">{pedimento.xt_referencia}</td>
                        <td className="text-center px-4 py-2">{pedimento.xt_pedimento}</td>
                        <td>
                            <button
                                className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600"
                                onClick={() => handleDeletePedimentoTransporte(pedimento.xn_id, pedimento.xt_referencia, pedimento.xt_pedimento)}
                            >
                                X
                            </button>
                        </td>
                    </tr>
                ))}
                <tr >
                    <td colSpan={3} className="font-bold text-center px-4 py-2">Pedimentos Nuevos</td>
                </tr>
            </tbody>
        </table>

        <div className="flex flex-col h-full">
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
                onClick={() => handleAddPedimentosTransporte(selectedTransporte.xn_id, pedimentos)}  
                className="mt-4 w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
            >
                Guardar
            </button>
        </div>
    </div>
  )
}

export default EditTransporteForm