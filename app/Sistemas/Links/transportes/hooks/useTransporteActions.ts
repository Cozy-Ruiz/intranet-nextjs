import { format } from "path";


export function useTransporteActions(
    selectedTransporte: any,
    setSelectedTransporte: React.Dispatch<React.SetStateAction<any>>,
    setSelectedRelacionSalida: React.Dispatch<React.SetStateAction<any>>,
    setShowTransporteForm: React.Dispatch<React.SetStateAction<boolean>>,
    setPlaca: React.Dispatch<React.SetStateAction<string>>,
    setOperador: React.Dispatch<React.SetStateAction<string>>,
    setPedimento: React.Dispatch<React.SetStateAction<string>>,
    setPedimentos: React.Dispatch<React.SetStateAction<string[]>>,
    setShowDetalleTransporte: React.Dispatch<React.SetStateAction<boolean>>,
    setShowEditTransporteForm: React.Dispatch<React.SetStateAction<boolean>>,
    setShowUnidadForm: React.Dispatch<React.SetStateAction<boolean>>,
    setShowOperadorForm: React.Dispatch<React.SetStateAction<boolean>>,
    setUnidad: React.Dispatch<React.SetStateAction<string>>,
    setNombres: React.Dispatch<React.SetStateAction<string>>,
    setApellidoPaterno: React.Dispatch<React.SetStateAction<string>>,
    setApellidoMaterno: React.Dispatch<React.SetStateAction<string>>,
    fetchTransportes: (fecha: string) => Promise<void>,
    fetchOperadores: () => Promise<void>,
    fetchUnidades: () => Promise<void>,
    fecha: string,
) {
    

    const fetchRelacionSalida = async (relacionSalida: string) => {
        try {
            const res = await fetch(`/api/Doda/${relacionSalida}`);
            if (!res.ok) {
                throw new Error(`Error HTTP: ${res.status}`);
            }
            const data = await res.json();
            setSelectedRelacionSalida(data);
        } catch (err) {
            console.error(err);
        }
    };

    // Transportes
    const fetchTransporteById = async (id: any) => {
        const res = await fetch(`/api/CartaPorte/transportes/${id}`);
        const data = await res.json();
        //console.log(`Transporte ${id}:`, data);
        setSelectedTransporte(data);
        console.log(`selectedTransporte :`, selectedTransporte);
    };

    const handleAddEstatusTransporte = async (id: string, estatus: string, foto: File | null ) => {
        try {

            const formData = new FormData();
            formData.append("xn_id", id);
            formData.append("xt_estatus", estatus);
            formData.append("xt_usuario", "cozy");
            if (foto) {
                formData.append("foto", foto);
            }

            const res = await fetch("/api/estatus_transportes", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Error al agregar estatus de transporte " + res.status);
            
            fetchTransporteById(id);
            fetchTransportes(fecha);
        } catch (err) {
            console.error(err);
        }
    };
    
    
    const handleAddTransporte = async (placa: string, operador: string, pedimentos: string[]) => {
        try {
            const res = await fetch("/api/transportes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                xt_placa: placa,
                xt_operador: operador,
                pedimentos: pedimentos,
                xt_usuario: "cozy",
                }),
            });

            if (!res.ok) throw new Error("Error al agregar transporte " + res.status);
            const newTransporte = await res.json();

            setSelectedTransporte(newTransporte.transporte);
            setShowTransporteForm(false);
            //fetchTransportes();
            setPlaca("");
            setOperador("");
            setPedimento("");
            setPedimentos([]);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddPedimentosTransporte = async (xn_id: Number, pedimentos: string[]) => {
        try {
        const res = await fetch(`/api/transportes/${xn_id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ xn_id, pedimentos, xt_usuario: "cozy" }),
        });

        if (!res.ok) throw new Error("Error al registrar pedimentos al transporte " + res.status);
        const newTransporte = await res.json();

        fetchTransporteById(selectedTransporte?.xn_id);
        //fetchTransportes();
        setShowTransporteForm(false);
        setPlaca("");
        setOperador("");
        setPedimento("");
        setPedimentos([]);
        } catch (err) {
        console.error(err);
        }
    };
    

    const handleDeletePedimentoTransporte = async (
        xn_id: Number,
        xt_referencia: String,
        xt_pedimento: String
    ) => {
        const isConfirmed = window.confirm(`¿Estás seguro de que deseas eliminar el pedimento del transporte?`);
        if (!isConfirmed) return;

        try {
            const res = await fetch(
                `/api/pedimentos?xn_id=${xn_id}&xt_referencia=${xt_referencia}&xt_pedimento=${xt_pedimento}`,
                {
                method: "DELETE",
                }
            );

            if (!res.ok) throw new Error("Error al eliminar pedimento de transporte");

            console.log("pedimento eliminado correctamente de transporte");
            console.log(xn_id);

            fetchTransporteById(xn_id);

        } catch (err) {
            console.error(err);
        }
    };

    //Unidades
    const handleAddUnidad = async ( placa: string, unidad: string) => {
        try {
            const res = await fetch("/api/unidades", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ xt_placa: placa, xt_unidad: unidad, xt_usuario: 'cozy'/*userData.xt_usuario*/ }),
            });
    
            if (!res.ok) throw new Error("Error al agregar unidad");
            const newTransporte = await res.json();
            
            fetchUnidades();
            setPlaca("");
            setUnidad("");
            
        } catch (err) {
            console.error(err);
        }
    
    };
    
    const handleDeleteUnidad = async( placa: String ) => {
    
        const isConfirmed = window.confirm(`¿Estás seguro de que deseas eliminar la unidad con placa ${placa}?`);
    
        if (!isConfirmed) return; // Si el usuario cancela, no hace nada
    
        try {
            const res = await fetch(`/api/unidades?xt_placa=${placa}`, {
                method: "DELETE",
            });
    
            if (!res.ok) throw new Error("Error al eliminar unidad");
    
            console.log("Unidad eliminada correctamente");
            fetchUnidades();
    
        } catch (err) {
            console.error(err);
        }
    };

    //Operadores
    const handleAddOperador = async ( nombres: string, apellidoPaterno: string, apellidoMaterno: string) => {
        try {
            const res = await fetch("/api/operadores", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ xt_operador: `${nombres} ${apellidoPaterno} ${apellidoMaterno}`, xt_usuario: 'cozy'/*userData.xt_usuario*/ }),
            });
    
            if (!res.ok) throw new Error("Error al agregar operador");
            const newTransporte = await res.json();
            
            fetchOperadores();
            setOperador("");
            
        } catch (err) {
            console.error(err);
        }
    
    };
    
    const handleDeleteOperador = async( operador: String ) => {
    
        const isConfirmed = window.confirm(`¿Estás seguro que deseas eliminar el operador con el nombre ${operador}?`);
    
        if (!isConfirmed) return; // Si el usuario cancela, no hace nada
    
        try {
            const res = await fetch(`/api/operadores?xt_operador=${operador}`, {
                method: "DELETE",
            });
    
            if (!res.ok) throw new Error("Error al eliminar operador");
    
            console.log("Operador eliminado correctamente");
            fetchOperadores();
    
        } catch (err) {
            console.error(err);
        }
    };

    return {
        handleDeletePedimentoTransporte,
        handleAddTransporte,
        handleAddPedimentosTransporte,
        fetchTransporteById,
        fetchRelacionSalida,
        handleAddUnidad,
        handleDeleteUnidad,
        handleAddOperador,
        handleDeleteOperador,
        handleAddEstatusTransporte
    };
}
