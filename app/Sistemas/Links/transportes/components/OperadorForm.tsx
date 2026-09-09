import React from 'react'

const OperadorForm = ({ operadores, handleAddOperador, handleDeleteOperador, setNombres, setApellidoPaterno, setApellidoMaterno, nombres, apellidoPaterno, apellidoMaterno }: any) => {
  return (
    <div>
        <h2 className="text-xl font-bold text-center mb-4">Agregar Operador</h2>
        <label className="block font-semibold">Nombre:</label>
        <input
            type="text"
            className="w-full border px-3 py-2 rounded-lg mb-4"
            placeholder="Ingrese nombres"
            onChange={(e) => setNombres(e.target.value)}
        />
        <label className="block font-semibold">Apellido Paterno:</label>
        <input
            type="text"
            className="w-full border px-3 py-2 rounded-lg mb-4"
            placeholder="Ingrese el apellido Paterno"
            onChange={(e) => setApellidoPaterno(e.target.value)}
        />
        <label className="block font-semibold">Apellido Materno:</label>
        <input
            type="text"
            className="w-full border px-3 py-2 rounded-lg mb-4"
            placeholder="Ingrese el apellido Materno"
            onChange={(e) => setApellidoMaterno(e.target.value)}
        />
        <button onClick={() => handleAddOperador(nombres, apellidoPaterno, apellidoMaterno)} className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition">
            Guardar
        </button>

        <h2 className="text-xl font-bold text-center mt-6">Operadores Actuales</h2>
        <ul className="mt-4">
            {operadores.map((operador: any) => (
                <li key={operador.xt_operador} className="flex justify-between items-center p-2 border-b">
                    <span>{operador.xt_operador}</span>
                    <button
                        className="bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600"
                        onClick={() => handleDeleteOperador(operador.xt_operador)}
                    >
                        X
                    </button>
                </li>
            ))}
        </ul>
    </div>
  )
}

export default OperadorForm