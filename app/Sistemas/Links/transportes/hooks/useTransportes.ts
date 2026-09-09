// hooks/useTransportes.ts
import { useState } from "react";
import { Transporte, Operadores, Unidades } from "../types/transportes";

export function useTransportes() {

    const [transportes, setTransportes] = useState<Transporte[]>([]);
    const [unidades, setUnidades] = useState<Unidades[]>([]);
    const [operadores, setOperadores] = useState<Operadores[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fecha, setFecha] = useState<string>(() => {
        const hoy = new Date();
        return `'${hoy.toISOString().split('T')[0]}' AND '${hoy.toISOString().split('T')[0]}'`; // Formato yyyy-mm-dd
    });

    const fetchOperadores = async () => {
        try {
            const res = await fetch("/api/operadores");
            if (!res.ok) {
                throw new Error(`Error HTTP: ${res.status}`);
            }
            const data = await res.json();
            setOperadores(data);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchUnidades = async () => {
        try {
            const res = await fetch("/api/unidades");
            if (!res.ok) {
                throw new Error(`Error HTTP: ${res.status}`);
            }
            const data = await res.json();
            setUnidades(data);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchTransportes = async (fecha: string) => {
        try {
            const res = await fetch(`/api/CartaPorte/transportes?fecha=${fecha}`);
            if (!res.ok) {
                throw new Error(`Error HTTP: ${res.status}`);
            }
            const data = await res.json();
            setTransportes(data);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    return {    
        transportes,
        unidades,
        operadores,
        loading,
        error,
        fecha,
        
        fetchTransportes,
        fetchUnidades,
        fetchOperadores,
        
        setTransportes,
        setUnidades,
        setOperadores,
        setLoading,
        setError,
        setFecha
    };
}
