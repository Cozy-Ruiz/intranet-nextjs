"use client"
import React, { use, useState } from 'react';

const TripticoDELL = () => {
  const [transportista, setTransportista] = useState('');
  const [placa, setPlaca] = useState('');
  const [operador, setOperador] = useState('');
  const [error, setError] = useState('');

  const handleVisualizar = async (transportista: string, placa: string, operador: string) => {
    if (!transportista || !placa || !operador) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    
    setError('');

    try {
      const res = await fetch("/api/TripticoDELL", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transportista,
          placa,
          operador,
        }),
      });

      if (!res.ok) throw new Error("Error al generar el tríptico " + res.status);
      
      window.location.href = "/api/TripticoDELL";

    } catch (err) {
      console.error(err);
      setError("Error al generar el tríptico. Inténtalo de nuevo.");
    }
  };

  return (
    <div className='flex flex-col items-center justify-center px-2 min-h-screen bg-gray-100'>

        <div className='w-full max-w-md'>
          <h1 className='text-xl font-semibold mb-4 text-center'>Tríptico DELL</h1>

          <label className='block mb-1'>Transportista</label>
          <select
            value={transportista}
            onChange={(e) => setTransportista(e.target.value)}
            className="border rounded p-2 mb-4 w-full"
          >
            <option value="" disabled>Seleccione un transportista</option>
            <option value="Ontime Forwarding">Ontime Forwarding</option>
            <option value="Tosca">Tosca</option>
          </select>

          <label className='block mb-1'>Placa</label>
          <input
            type="text"
            value={placa}
            onChange={(e) => setPlaca(e.target.value)}
            placeholder="Ingrese la placa"
            className="border rounded p-2 mb-4 w-full"
          />

          <label className='block mb-1'>Operador</label>
          <input
            type="text"
            value={operador}
            onChange={(e) => setOperador(e.target.value)}
            placeholder="Ingrese nombre del operador"
            className="border rounded p-2 mb-4 w-full"
          />

          {error && <p className="text-red-500 mb-2">{error}</p>}

          <button
            onClick={() => handleVisualizar(transportista, placa, operador)}
            className="bg-blue-500 text-white rounded p-2 w-full hover:bg-blue-600"
          >
            Visualizar Tríptico
          </button>
        </div>
      
    </div>
  );
};

export default TripticoDELL;