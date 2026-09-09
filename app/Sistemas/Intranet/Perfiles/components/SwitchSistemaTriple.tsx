type EstadoTriple = true | false | "pending";

type SwitchSistemaTripleProps = {
  nombre: string;
  estado: EstadoTriple;
  setEstado: (valor: EstadoTriple) => void;
  hasConfiguracion: boolean;
  estadoConfiguracion: boolean;
  setConfiguracion: (valor: boolean) => void;
};

const estadoLabel = (estado: EstadoTriple) => {
  if (estado === true) return { text: "Activo", color: "text-green-500" };
  if (estado === false) return { text: "Inactivo", color: "text-red-500" };
  return { text: "Pendiente", color: "text-yellow-500" };
};

const SwitchSistemaTriple = ({
  nombre,
  estado,
  setEstado,
  hasConfiguracion,
  estadoConfiguracion,
  setConfiguracion,
}: SwitchSistemaTripleProps) => {
  // Cambia el estado en orden: false -> pending -> true -> false ...
  const nextEstado = (actual: EstadoTriple): EstadoTriple =>
    actual === false ? "pending" : actual === "pending" ? true : false;

  return (
    <div className="m-5 flex items-center justify-between">
      <h3 className="text-2xl font-bold">{nombre}</h3>
      <div className="flex items-center space-x-3">
        {hasConfiguracion && estado === true && (
          <button
            onClick={() => setConfiguracion(!estadoConfiguracion)}
            className="px-3 py-1 text-white rounded hover:bg-blue-600 transition-colors duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={20}
              height={20}
              fill="none"
              viewBox="0 0 24 24"
              stroke="#007cbd"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.065z"
              />
              <circle cx={12} cy={12} r={3} />
            </svg>
          </button>
        )}
        <span className={`text-sm font-medium ${estadoLabel(estado).color}`}>
          {estadoLabel(estado).text}
        </span>
        <button
          onClick={() => setEstado(nextEstado(estado))}
          className={`
            w-11 h-6 rounded-full flex items-center transition-colors duration-300
            ${estado === true ? "bg-green-500" : estado === "pending" ? "bg-yellow-400" : "bg-red-500"}
            relative
          `}
          aria-label="Cambiar estado"
        >
          <div
            className={`
              absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300
              ${estado === true ? "translate-x-5" : estado === "pending" ? "translate-x-5" : ""}
            `}
            style={{
              transform:
                estado === true
                  ? "translateXX(5)"
                  : estado === "pending"
                  ? "translateX(0)"
                  : "translateX(0)",
            }}
          ></div>
        </button>
      </div>
    </div>
  );
};

export default SwitchSistemaTriple;