import { useState } from "react";
import { Transporte } from "../types/transportes";

export function useTransporteUI() {
    
    const [selectedTransporte, setSelectedTransporte] = useState<Transporte | null>(null);
    const [selectedRelacionSalida, setSelectedRelacionSalida] = useState<Transporte | null>(null);
    const [showDetalleTransporte, setShowDetalleTransporte] = useState(false);
    const [showDetalleRelacionSalida, setShowDetalleRelacionSalida] = useState(false);
    const [showTransporteForm, setShowTransporteForm] = useState(false);
    const [showEditTransporteForm, setShowEditTransporteForm] = useState(false);
    const [showUnidadForm, setShowUnidadForm] = useState(false);
    const [showOperadorForm, setShowOperadorForm] = useState(false);

    const [placa, setPlaca] = useState("");
    const [unidad, setUnidad] = useState("");
    const [operador, setOperador] = useState("");
    const [nombres, setNombres] = useState("");
    const [apellidoPaterno, setApellidoPaterno] = useState("");
    const [apellidoMaterno, setApellidoMaterno] = useState("");
    const [pedimento, setPedimento] = useState("");
    const [pedimentos, setPedimentos] = useState<string[]>([]);
  
    const handleRelacionSalidaClick = () => {
      setShowDetalleRelacionSalida(true);
      setShowDetalleTransporte(false);
      setShowEditTransporteForm(false);
      setShowTransporteForm(false);
      setShowUnidadForm(false);
      setShowOperadorForm(false);
    };
    
    const handleRowClick = (transporte: Transporte) => {
      setSelectedTransporte(transporte);
      setShowDetalleTransporte(true);
      setShowDetalleRelacionSalida(false);
      setShowEditTransporteForm(false);
      setShowTransporteForm(false);
      setShowUnidadForm(false);
      setShowOperadorForm(false);
      console.log(transporte);
    };
  
    const handleNewTransport = () => {
      setShowTransporteForm(true);
      setShowDetalleTransporte(true);
      setShowUnidadForm(false);
      setShowOperadorForm(false);
      setSelectedTransporte(null);
    };
  
    const handleEditTransport = () => {
      setShowEditTransporteForm(true);
      setShowDetalleTransporte(false);
      setShowTransporteForm(false);
      setShowUnidadForm(false);
      setShowOperadorForm(false);
    };
  
    const handleNewUnit = () => {
      setShowUnidadForm(true);
      setShowOperadorForm(false);
      setShowTransporteForm(false);
      setSelectedTransporte(null);
    };
  
    const handleNewOperator = () => {
      setShowOperadorForm(true);
      setShowUnidadForm(false);
      setShowTransporteForm(false);
      setSelectedTransporte(null);
    };

    const handleAddPedimento = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && pedimento.trim() !== "") {
            e.preventDefault(); // Evita que se envíe el formulario al presionar Enter
            // Verifica si el pedimento ya existe en la lista
            if (pedimentos.includes(pedimento.trim())) {
                alert("Este pedimento ya ha sido agregado.");
                setPedimento(""); // Limpia el campo
            } else {
                setPedimentos([...pedimentos, pedimento.trim()]); // Agrega el nuevo pedimento
                setPedimento(""); // Limpia el campo
            }
        }
    };

    const handleRemovePedimento = (index: number) => {
        setPedimentos(pedimentos.filter((_, i) => i !== index));
    };
  
    return {
      selectedTransporte,
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
      handleRemovePedimento,      
    };

  }
  