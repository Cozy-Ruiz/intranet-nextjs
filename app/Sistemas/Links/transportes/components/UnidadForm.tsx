import React from 'react'

const UnidadForm = ({ unidades, handleAddUnidad, handleDeleteUnidad, setPlaca, setUnidad, placa, unidad }: any) => {
  return (
    <div>
        <h2 className="text-xl font-bold text-center mb-4">Agregar Unidad</h2>
        <label className="block font-semibold">Placa:</label>
        <input
            type="text"
            className="w-full border px-3 py-2 rounded-lg mb-4"
            placeholder="Ingrese la placa"
            value={placa}
            onChange={(e) => setPlaca(e.target.value)}
        />
        <label className="block font-semibold">Descripción:</label>
        <input
            type="text"
            className="w-full border px-3 py-2 rounded-lg mb-4"
            placeholder="Ingrese la descripción"
            value={unidad}
            onChange={(e) => setUnidad(e.target.value)}
        />
        <button onClick={() => handleAddUnidad(placa, unidad)} className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition">
            Guardar
        </button>

        <h2 className="text-xl font-bold text-center mt-6">Unidades Actuales</h2>
        <ul className="mt-4">
            {unidades.map((unidad: any) => (
                <li key={unidad.xt_placa} className="flex justify-between items-center p-2 border-b">
                    <span>{unidad.xt_placa} - {unidad.xt_unidad}</span>
                    <button
                        className="bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600"
                        onClick={() => handleDeleteUnidad(unidad.xt_placa)}
                    >
                        X
                    </button>
                </li>
            ))}
        </ul>
    </div>
  )
}

export default UnidadForm