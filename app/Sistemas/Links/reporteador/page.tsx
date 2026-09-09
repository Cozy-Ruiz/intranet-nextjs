'use client';
import { useState } from "react";

export default function NLPToSQLPage() {
  const [text, setText] = useState("");
  const [sql, setSQL] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dbData, setDbData] = useState<any[]>([]);

  const handleGenerate = async () => {
    setLoading(true);
    setSQL("");
    setDbData([]);
    setError("");

    try {
      // 1. Llama a Django para convertir el texto a SQL
      const response = await fetch("https://python.cozy-corporation.com/apiClient/ia/NLPtoSQL/", {
      //const response = await fetch("http://localhost:8000/apiClient/ia/NLPtoSQL/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error generando SQL");
      }

      setSQL(data.sql);

      // 2. Llama al backend de Next.js para consultar la base de datos
      const dbResponse = await fetch("/api/reporteador", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql: data.sql }),
      });

      const dbResult = await dbResponse.json();
      if (!dbResponse.ok) {
        throw new Error(dbResult.error || "Error al consultar la base de datos");
      }

      setDbData(dbResult.data);
    } catch (err: any) {
      setError(err.message || "Error de red o del servidor");
    } finally {
      setLoading(false);
    }
  };

  const renderTable = () => {
    if (!dbData.length) return null;

    const headers = Object.keys(dbData[0]);

    return (
        <div className="w-full overflow-x-auto mt-4 flex">
            <table className="mt-4 w-full max-w-4xl border border-gray-300 text-sm">
                <thead className="bg-gray-200">
                <tr>
                    {headers.map((header) => (
                    <th key={header} className="border p-2">{header}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {dbData.map((row, idx) => (
                    <tr key={idx} className="even:bg-gray-50">
                    {headers.map((key) => (
                        <td key={key} className="border p-2">{row[key]}</td>
                    ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Reporteador</h1>
      <textarea
        className="w-full max-w-md h-32 p-2 border rounded mb-4"
        placeholder="Escribe tu consulta en lenguaje natural..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        onClick={handleGenerate}
        disabled={loading || !text}
      >
        {loading ? "Generando..." : "Generar SQL"}
      </button>

      {sql && (
        <div className="mt-6 w-full max-w-2xl p-4 bg-white border rounded shadow">
          <h2 className="font-semibold mb-2">SQL generado:</h2>
          <pre className="whitespace-pre-wrap text-sm text-gray-800">{sql}</pre>
        </div>
      )}

      {renderTable()}

      {error && (
        <div className="mt-4 text-red-600">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}
