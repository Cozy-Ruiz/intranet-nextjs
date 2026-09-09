import { FaEdit } from "react-icons/fa";
import React, {useState} from "react";

import Modal from "./Modal"; // ajusta la ruta si es diferente

const DetalleRelacionSalida = ({selectedRelacionSalida}: any) => {

    const [modalVisible, setModalVisible] = useState(false);
        const [modalTitle, setModalTitle] = useState("");
        const [modalUrl, setModalUrl] = useState("");
    
        const openModal = (title: string, url: string) => {
            setModalTitle(title);
            setModalUrl(url);
            setModalVisible(true);
        };

    return (
        <>
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-center flex-grow">
                    Detalle Transporte
                </h2>
                {/*<FaEdit onClick={handleEditTransport} className="text-blue-500 text-xl cursor-pointer ml-4" />*/}
            </div>
            <table className="w-full border border-gray-300">
                <tbody>
                    
                    <tr className="bg-gray-100">
                        <td className="font-bold px-4 py-2 border">Relacion salida</td>
                        <td className="px-4 py-2 border">{selectedRelacionSalida.XT_RELACION_SALIDA}</td>
                    </tr>
                    {/*
                    <tr>
                        <td className="font-bold px-4 py-2 border">Transportista</td>
                        <td className="px-4 py-2 border">{selectedTransporte.xt_transportista}</td>
                    </tr>
                    <tr>
                        <td className="font-bold px-4 py-2 border">Placa</td>
                        <td className="px-4 py-2 border">{selectedTransporte.xt_placa}</td>
                    </tr>
                    <tr>
                        <td className="font-bold px-4 py-2 border">Operador</td>
                        <td className="px-4 py-2 border">{selectedTransporte.xt_operador}</td>
                    </tr>
                    <tr>
                        <td className="font-bold px-4 py-2 border">Fecha alta</td>
                        <td className="px-4 py-2 border">{selectedTransporte.xd_fecha}</td>
                    </tr>
                    <tr>
                        <td className="font-bold px-4 py-2 border">Registró</td>
                        <td className="px-4 py-2 border">{selectedTransporte.xt_usuarioRegistro}</td>
                    </tr>

                    <tr>
                        <td className="font-bold px-4 py-2 border">Solicitud</td>
                        <td className="px-4 py-2 border">
                            {(() => {

                                const aceptado = selectedTransporte.estatus.find((e: any) => e.xt_estatus === "Aceptado");
                                const rechazado = selectedTransporte.estatus.find((e: any) => e.xt_estatus === "Rechazado");

                                if (aceptado) {
                                    return (
                                        <div >
                                            Aceptado el {new Date(aceptado.xd_fecha).toLocaleString()}
                                        </div>
                                    );
                                } else if (rechazado) {
                                    return (
                                        <div className="text-red-600 font-semibold">
                                            Rechazado el {new Date(rechazado.xd_fecha).toLocaleString()}
                                        </div>
                                    );
                                } else {
                                    return (
                                        <div className="flex justify-between items-center">
                                            <button
                                            onClick={() =>
                                                handleAddEstatusTransporte(selectedTransporte.xn_id, "Aceptado")
                                            }
                                            className="bg-blue-500 text-white px-4 py-2 rounded w-full mr-2"
                                            >
                                            Aceptar
                                            </button>
                                            <button
                                            onClick={() =>
                                                handleAddEstatusTransporte(selectedTransporte.xn_id, "Rechazado")
                                            }
                                            className="bg-red-500 text-white px-4 py-2 rounded w-full ml-2"
                                            >
                                            Rechazar
                                            </button>
                                        </div>
                                    );
                                }
                            })()}
                        </td>
                    </tr>

                    <tr>
                        <td className="font-bold px-4 py-2 border">Origen</td>
                        <td className="px-4 py-2 border">
                            {selectedTransporte.origen?.NOMREMITENTE} <br />
                            {selectedTransporte.origen?.CALLE} <br />
                            {selectedTransporte.origen?.NUMEXT}
                        </td>
                    </tr>

                    <tr>
                        <td className="font-bold px-4 py-2 border">Destino</td>
                        <td className="px-4 py-2 border">
                            {selectedTransporte.destino?.NOMDESTINATARIO} <br />
                            {selectedTransporte.destino?.CALLE} <br />
                            {selectedTransporte.destino?.NUMEXT}
                        </td>
                    </tr>

                    <tr>
                        <td className="font-bold px-4 py-2 border">Entrega</td>
                        <td className="px-4 py-2 border">
                            {(() => {

                            const entregado = selectedTransporte.estatus.find((e: any) => e.xt_estatus === "Entregado");
                            
                            if (entregado) {
                                return (
                                <div>
                                    Entregado el {new Date(entregado.xd_fecha).toLocaleString()}
                                </div>
                                );
                            } else {
                                return (
                                    <div className="flex justify-center items-center">
                                        <button onClick={() => handleAddEstatusTransporte(selectedTransporte.xn_id, "Entregado")} className="bg-blue-500 text-white px-4 py-2 rounded">
                                            Registrar
                                        </button>
                                    </div>
                                );
                            }
                            })()}
                            
                        </td>
                    </tr>
                    */}

                    <tr>
                        <td colSpan={2} className="font-bold text-center px-4 py-2">Clientes</td>
                    </tr>
                    {selectedRelacionSalida?.clientes?.map((cliente: any, index: number) => (
                        <React.Fragment key={index}>
                            <tr className="bg-gray-300">
                                <td className="text-center px-4 py-2">{cliente.xt_rfc_cliente}</td>
                                <td className="text-center px-4 py-2">{cliente.xt_nombre_cliente}</td>
                            </tr>

                            <tr>
                                <td className="font-bold text-center px-4 py-2">Referencia</td>
                                <td className="font-bold text-center px-4 py-2">Pedimento</td>
                            </tr>

                            {cliente?.pedimentos?.map((pedimento: any, i: number) => {
                            const refPivot = selectedRelacionSalida?.referencias_pivote?.find(
                                (ref: any) => ref.REFERENCIA === pedimento.xt_referencia
                            );

                            const isPivot = Boolean(refPivot);

                            return (
                                <tr className={isPivot ? "bg-blue-200" : "bg-gray-100"} key={i}>
                                    <td className="text-center px-4 py-2">
                                        {pedimento.xt_referencia}
                                        {refPivot?.CARTAPORTE && (
                                        <button
                                            onClick={() => openModal("Carta Porte", refPivot.CARTAPORTE.substring(3) )}
                                            className="px-3 py-1 bg-green-500 text-black rounded hover:bg-green-600"
                                        >
                                            Carta Porte
                                        </button>
                                        )}
                                        
                                    </td>
                                    <td className="text-center px-4 py-2">
                                        {pedimento.xt_pedimento}
                                        {refPivot?.FACTURA && (
                                        <button
                                            onClick={() => openModal("Factura", refPivot.FACTURA.substring(3))}
                                            className="px-3 py-1 bg-green-500 text-black rounded hover:bg-green-600"
                                        >
                                            Ver Factura
                                        </button>
                                        )}
                                    </td>
                                </tr>
                            );
                            })}
                        </React.Fragment>
                    ))}
                    
                </tbody>
            </table>
        </div>


        {/* Modal de previsualización */}
        <Modal
            show={modalVisible}
            onClose={() => setModalVisible(false)}
            title={modalTitle}
            pdfUrl={modalUrl}
        />
        </>
    );
}

export default DetalleRelacionSalida;

