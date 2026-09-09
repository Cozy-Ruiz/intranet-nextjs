'use client'
import React, { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';

type Categoria = {
    xt_categoria: string;
};

type Articulo = {
    xn_index: number;
    xt_articulo: string;
    xt_categoria: string;
    xt_pdr: string;
};

type SesionInnerData = {
    sesionUsuario: string;
};

type SesionResponse = {
    status: string;
    session: SesionInnerData;
};

const SolicitudResguardo = () => {

    const searchParams = useSearchParams();
    const usuarioResguardo = searchParams.get('usuario');

    const [session, setSession] = useState<SesionResponse | null>(null);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [articulos, setArticulos] = useState<Articulo[]>([]);
    const [articulosFiltrados, setArticulosFiltrados] = useState<Articulo[]>([]);
    const [selectedCategoria, setSelectedCategoria] = useState<string>('');
    const [selectedArticulo, setSelectedArticulo] = useState<Articulo | null>(null);
    const [selectedCiudad, setSelectedCiudad] = useState<string>('');


    useEffect(() => {
        fetch('https://escalante.com.mx/Sistemas/session.php', {
            credentials: 'include'
        })
            .then(res => {
                if (!res.ok) throw new Error('Respuesta no válida');
                return res.json();
            })
            .then(data => {
                if (!data || data.status !== 'success') {
                    window.location.href = 'https://escalante.com.mx/Sistemas';
                    return;
                }
                setSession(data);
            })
            .catch(err => {
                console.error('Error al obtener la sesión:', err);
            });
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const categoriasResponse = await fetch("/backend/Intranet/Resguardo/listaCategoriasResguardo");
                const articulosResponse = await fetch("/backend/Intranet/Resguardo/listaArticulosResguardo");
                const categoriasData = await categoriasResponse.json();
                const articulosData = await articulosResponse.json();
                setCategorias(categoriasData.data || []);
                setArticulos(articulosData.data || []);
            } catch (error) {
                console.error("Error al obtener los datos:", error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedCategoria) {
            setArticulosFiltrados(articulos.filter(a => a.xt_categoria === selectedCategoria));
        } else {
            setArticulosFiltrados([]);
        }
        setSelectedArticulo(null);
    }, [selectedCategoria, articulos]);

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (!selectedCategoria || !selectedArticulo || !selectedCiudad) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        try {
            const response = await fetch("/backend/Intranet/Resguardo/registraSolicitudResguardo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    usuarioResguardo: usuarioResguardo,
                    categoria: selectedArticulo.xt_categoria,
                    articulo: selectedArticulo.xt_articulo,
                    pdr: selectedArticulo.xt_pdr,
                    ciudad: selectedCiudad,
                    usuarioSolicita: session?.session.sesionUsuario || 'prueba',
                }),
            });

            const data = await response.json();

            if (response.ok && data.status === "success") {
                alert("Solicitud registrada exitosamente.");
                // Limpia los campos si lo deseas
                setSelectedCategoria('');
                setSelectedArticulo(null);
                setSelectedCiudad('');

                if (window.opener) {
                    window.opener.postMessage("recargar", "https://escalante.com.mx");
                    window.close();
                } else {
                    window.location.reload();
                }

            } else {
                alert(data.message || "Error al registrar la solicitud.");
            }
        } catch (error) {
            console.error("Error al registrar la solicitud:", error);
            alert("Ocurrió un error al registrar la solicitud.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 text-white" style={{ backgroundColor: '#2F2F2F' }}>
            <div className="w-full max-w-2xl bg-[#232323] rounded-lg p-8 shadow-lg">
                <h1 className="text-2xl font-bold mb-8 text-center text-[#007cbd]">Solicitud de Resguardo</h1>

                <div className="border-t border-[#007cbd] my-4"></div>

                <div className="mb-6">
                    <label htmlFor="categorias" className="block mb-2 font-medium">Categoría</label>
                    <select
                        name="categorias"
                        id="categorias"
                        className="w-full border rounded px-3 py-2 text-white bg-black"
                        value={selectedCategoria}
                        onChange={e => setSelectedCategoria(e.target.value)}
                    >
                        <option value="">Seleccione una categoría</option>
                        {categorias.map((categoria, index) => (
                            <option key={index} value={categoria.xt_categoria}>
                                {categoria.xt_categoria}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-6">
                    <label htmlFor="articulos" className="block mb-2 font-medium">Artículo</label>
                    <select
                        name="articulos"
                        id="articulos"
                        className="w-full border rounded px-3 py-2 text-white bg-black"
                        value={selectedArticulo?.xt_articulo || ''}
                        onChange={e => setSelectedArticulo(articulosFiltrados.find(articulo => articulo.xt_articulo === e.target.value) || null)}
                        disabled={!selectedCategoria}
                    >
                        <option value="">Seleccione un artículo</option>
                        {articulosFiltrados.map((articulo, index) => (
                            <option key={index} value={articulo.xt_articulo}>
                                {articulo.xt_articulo}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-6">
                    <label htmlFor="Ciudad" className="block mb-2 font-medium">Ciudad</label>
                    <select
                        name="Ciudad"
                        id="Ciudad"
                        className="w-full border rounded px-3 py-2 text-white bg-black"
                        value={selectedCiudad}
                        onChange={e => setSelectedCiudad(e.target.value)}
                    >
                        <option value="">Seleccione una ciudad</option>
                        <option value="CMX">Ciudad de México</option>
                        <option value="CUN">Cancun</option>
                        <option value="NLRD">Nuevo Laredo</option>
                        <option value="TOL">Toluca</option>
                        <option value="VER">Veracruz</option>
                    </select>
                </div>

                <div className="mb-6">
                    <button
                        className="w-full bg-[#007cbd] hover:bg-[#005f8a] text-white font-bold py-2 px-4 rounded"
                        onClick={handleSubmit}
                    >
                        Registrar
                    </button>
                </div>

                <div className="border-t border-[#007cbd] my-4"></div>
            </div>
        </div>
    );
};

export default SolicitudResguardo;

