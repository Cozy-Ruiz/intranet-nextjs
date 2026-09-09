"use client"
import React, { useEffect, useState } from "react";

import DetalleRelacionSalida from "./components/DetalleRelacionSalida";
import DetalleTransporte from "./components/DetalleTransporte";
import EditTransporteForm from "./components/EditTransporteForm";
import TransporteForm from "./components/TransporteForm";
import UnidadForm from "./components/UnidadForm";
import OperadorForm from "./components/OperadorForm";
import ListaTransportes from "./components/ListaTransportes";
import ModalLoading from "./components/ModalLoading";

import { useTransportes } from "./hooks/useTransportes";
import { useTransporteUI } from "./hooks/useTransportesUI";
import { useTransporteActions } from "./hooks/useTransporteActions";


const Transportes = () => {
    
    const { transportes,
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
        setFecha} = useTransportes();
        
    const { selectedTransporte,
        selectedRelacionSalida,
        setSelectedTransporte,
        setSelectedRelacionSalida,
        setShowTransporteForm,
        setShowUnidadForm,
        setShowOperadorForm,
        setShowEditTransporteForm,
        setShowDetalleTransporte,
        showDetalleTransporte,
        showDetalleRelacionSalida,
        setShowDetalleRelacionSalida,
        showTransporteForm,
        showEditTransporteForm,
        showUnidadForm,
        showOperadorForm,
        handleRowClick,
        handleRelacionSalidaClick,
        handleNewTransport,
        handleEditTransport,
        handleNewUnit,
        handleNewOperator,
        placa,
        setPlaca,
        unidad,
        setUnidad,
        operador,
        setOperador,
        nombres,
        setNombres,
        apellidoPaterno,
        setApellidoPaterno,
        apellidoMaterno,
        setApellidoMaterno,
        pedimento,
        setPedimento,
        pedimentos,
        setPedimentos, 
        handleAddPedimento, 
        handleRemovePedimento} = useTransporteUI();

        
    const { fetchTransporteById, fetchRelacionSalida, handleDeletePedimentoTransporte, handleAddPedimentosTransporte, handleAddTransporte, handleAddUnidad, handleDeleteUnidad, handleAddOperador, handleDeleteOperador, handleAddEstatusTransporte} = useTransporteActions(selectedTransporte, setSelectedTransporte, setSelectedRelacionSalida, setShowTransporteForm, setPlaca, setOperador, setPedimento, setPedimentos, setShowDetalleTransporte, setShowEditTransporteForm, setShowUnidadForm, setShowOperadorForm, setUnidad, setNombres, setApellidoPaterno, setApellidoMaterno, fetchTransportes, fetchOperadores, fetchUnidades, fecha);

    
    useEffect(() => {

        setLoading(true);

        const fetchAllData = async () => {
            try {
                await Promise.all([
                    fetchTransportes(fecha)
                ]);
            } catch (err) {
                console.error("Error al cargar los datos inciales:", err);
            }
        };
    
        fetchAllData();

        // Intervalo para recargar datos cada 30 segundos
        
        const intervalId = setInterval(() => {
            fetchAllData();
            //fetchTransportes(fecha)
        }, 60000); // 30,000 ms = 30 segundos

        return () => clearInterval(intervalId); // 🔴 Limpieza importante
        
    }, [fecha]); 

    //if (loading) return <p>Cargando transportes...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <>
        {/*<div className="flex flex-row h-screen">*/}
        <div className="flex flex-col sm:flex-row h-screen">
            {/* Columna izquierda */}
            {/*<div className="w-3/5 flex justify-center h-full">*/}
            <div className="w-full sm:w-3/5 flex justify-center h-full sm:overflow-auto">
                <ListaTransportes 
                    transportes={transportes}
                    fecha={fecha}
                    setFecha={setFecha}
                    handleRowClick={handleRowClick}
                    handleRelacionSalidaClick={handleRelacionSalidaClick}
                    handleNewTransport={handleNewTransport}
                    fetchRelacionSalida={fetchRelacionSalida}
                />
            </div>

            {/* Agregar transporte y Detalles del Transporte seleccionado */}
            {/*<div className="w-2/5 flex justify-center h-full">*/}
            <div className="hidden sm:flex sm:w-2/5 justify-center h-full">
                <div className="w-full max-w-md p-4 bg-white border border-gray-300 rounded-lg shadow-lg overflow-y-auto">
                
                    {showDetalleTransporte && selectedTransporte && (
                        <DetalleTransporte selectedTransporte={selectedTransporte} handleAddEstatusTransporte={handleAddEstatusTransporte} />
                    )}
                    

                    {showDetalleRelacionSalida && selectedRelacionSalida && (
                        <DetalleRelacionSalida selectedRelacionSalida={selectedRelacionSalida}/>
                    )}

                </div>
            </div>

            {/* Modal centrado solo en móvil */}
            {showDetalleTransporte && selectedTransporte && (
                <div className="fixed inset-0 bg-gray-500/80 z-50 flex justify-center items-center sm:hidden">
                    <div className="bg-white w-[95%] max-h-[80vh] rounded-xl p-4 overflow-y-auto shadow-2xl relative">
                    {/*<div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-y-auto p-4 relative">*/}
                    {/* Botón cerrar */}
                    <button 
                        onClick={() => setShowDetalleTransporte(false)} 
                        className="absolute top-2 right-3 text-2xl font-bold text-gray-600 hover:text-black"
                    >
                        ×
                    </button>

                    <DetalleTransporte 
                        selectedTransporte={selectedTransporte} 
                        handleAddEstatusTransporte={handleAddEstatusTransporte} 
                    />
                    </div>
                </div>
            )}

            {showDetalleRelacionSalida && selectedRelacionSalida && (
                <div className="fixed inset-0 bg-gray-500/80 z-50 flex justify-center items-center sm:hidden">
                    <div className="bg-white w-[90%] max-h-[80vh] rounded-xl p-4 overflow-y-auto shadow-2xl relative">
                    {/*<div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-y-auto p-4 relative">*/}
                    {/* Botón cerrar */}
                    <button 
                        onClick={() => setShowDetalleRelacionSalida(false)} 
                        className="absolute top-2 right-3 text-2xl font-bold text-gray-600 hover:text-black"
                    >
                        ×
                    </button>

                    <DetalleRelacionSalida selectedRelacionSalida={selectedRelacionSalida}/>
                    </div>
                </div>
            )}

            <ModalLoading show={loading} />

        </div>

        </>
    );
};

export default Transportes;

                                    