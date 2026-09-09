import { useState } from "react";
import { ChevronDown } from "lucide-react";

const colores = [
  { texto: "Solicitados", clase: "bg-pink-300" },
  { texto: "Rechazados", clase: "bg-red-500" },
  { texto: "Aceptados", clase: "bg-orange-300" },
  { texto: "Para asignar", clase: "bg-yellow-300" },
  { texto: "Asignados", clase: "bg-blue-200" },
  { texto: "Carta Porte", clase: "bg-cyan-300"},
  { texto: "Entregados", clase: "bg-green-300" },
  { texto: "Facturados", clase: "bg-purple-300" },
];

export default function FiltroSemaforo({ coloresSeleccionados, setColoresSeleccionados }: any) {
  const [mostrarMenu, setMostrarMenu] = useState(false);

  const toggleColor = (clase: string) => {
    setColoresSeleccionados((prev: string[]) =>
      prev.includes(clase) ? prev.filter(c => c !== clase) : [...prev, clase]
    );
  };

  const limpiarFiltro = () => {
    setColoresSeleccionados([]);
    setMostrarMenu(false);
  };

  return (
    <div className="relative inline-block">
      {/* Botón que abre el menú */}
      <div
        className={`w-8 h-8 rounded-full border cursor-pointer flex items-center justify-center 
          ${coloresSeleccionados.length === 0 ? 'bg-gradient-to-r from-cyan-200 via-orange-300 to-red-500' : 'ring-2 ring-green-500'}
        `}
        onClick={() => setMostrarMenu(!mostrarMenu)}
        title="Filtrar por estado"
      >
        <ChevronDown className="w-4 h-4 text-gray-600" />
      </div>

      {/* Menú desplegable */}
      {mostrarMenu && (
        <div className="absolute mt-2 bg-white border rounded shadow-md z-50 w-48 right-0">
          {colores.map((color, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => toggleColor(color.clase)}
            >
              <span className="flex items-center">
                <input
                  type="checkbox"
                  checked={coloresSeleccionados.includes(color.clase)}
                  readOnly
                  className="mr-2"
                />
                {color.texto}
              </span>
              <div className={`w-5 h-5 rounded-full ${color.clase} ml-2`} />
            </div>
          ))}
          <div
            className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm font-medium text-red-600"
            onClick={limpiarFiltro}
          >
            Limpiar filtros
          </div>
        </div>
      )}
    </div>
  );
}