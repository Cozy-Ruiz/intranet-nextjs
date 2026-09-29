import { NextRequest, NextResponse } from 'next/server';
import mysql from "mysql2/promise";

async function getConnection() {
    return await mysql.createConnection({
        host: "192.1.172.9",
        port: 3306,
        user: "GEA",
        password: "7b1QqK#m1F3m",
        database: "",
    });
}

export async function GET(request: NextRequest) {
    
    let connection;

    try {
        connection = await getConnection();

        const id = request.nextUrl.pathname.split("/").pop();

        if (!id) {
            return NextResponse.json({ error: "Parámetro 'id' requerido" }, { status: 400 });
        }

        console.log("id recibido:", id);

        // Obtener todos los transportes
        const [result]: [any[], any] = await connection.execute(`
            SELECT
                    tm.IDRELACION as xn_id,
                    (SELECT ct.xt_nombre FROM doda.catalogo_transportistas ct WHERE ct.xt_caat = tm.caat LIMIT 1) as xt_transportista,
                    (SELECT PLACAVM FROM cartaporte.cat_transportes WHERE IDTRANSPORTE = tm.TRANSPORTE) as xt_placa,
                    (SELECT NOMBREFIGURA FROM cartaporte.cat_operadores WHERE IDOPERADOR = tm.OPERADOR) as xt_operador,
                    DATE_FORMAT(tm.FECHA,'%e-%m-%Y %H:%i:%S') as xd_fecha,
                    tm.USUARIO as xt_usuarioRegistro,
					(SELECT m.REFERENCIA FROM cartaporte.mercancias m WHERE m.IDTRANSPORTEM = tm.IDRELACION AND m.REF_FACTURA = tm.IDRELACION LIMIT 1) as referencia_pivote
            FROM
                    cartaporte.transportemercancia tm 
            WHERE
                    tm.IDRELACION = ?
            AND tm.OFICINA = 'CDMX'
            ORDER BY tm.FECHA DESC   
        `, [id]);

        let transporte = result[0];
          
        // Obtener estatus
            const [estatus]: [any[], any] = await connection.execute(
                "SELECT et.* FROM transportes.estatus_transportes et WHERE et.xn_id = ? ",
                [transporte.xn_id]
            );
            transporte.estatus = estatus ?? null;
        
         // Obtener Origen
        
            const [origen]: [any[], any] = await connection.execute(
                "SELECT DATE_FORMAT(om.FECHA_SALIDA,'%e-%m-%Y %H:%i:%S') as FECHA_SALIDA, co.* FROM cartaporte.origenesmercancia om, cartaporte.cat_origenes co WHERE IDTRANSPORTE = ? AND co.IDORIGEN = om.ORIGEN",
                [transporte.xn_id]
            );
            transporte.origen = origen[0] ?? null; // Agregar pedimentos a cada transporte
        

         // Obtener destino
            const [destino]: [any[], any] = await connection.execute(
                "SELECT DATE_FORMAT(dm.FECHA_LLEGADA,'%e-%m-%Y %H:%i:%S') as FECHA_LLEGADA, cd.* FROM cartaporte.destinosmercancia dm, cartaporte.cat_destinos cd WHERE IDTRANSPORTE = ? AND cd.IDDESTINO = dm.DESTINO",
                [transporte.xn_id]
            );
            transporte.destino = destino[0] ?? null; // Agregar pedimentos a cada transporte
        

        // Obtener clientes que van en el transporte
        
            const [clientes]: [any[], any] = await connection.execute(
                "SELECT DISTINCT m.RFC as xt_rfc, (SELECT c.xt_nombre FROM master_ge.master_rfc_clienteid c WHERE c.xt_rfc = m.RFC LIMIT 1) as xt_nombre FROM cartaporte.mercancias m WHERE m.IDTRANSPORTEM = ?",
                [transporte.xn_id]
            );
            transporte.clientes = clientes; // Agregar pedimentos a cada transporte
        
        
        // Obtener pedimentos para cada cliente del transporte
        
            for (let cliente of transporte.clientes) {
                const [pedimentos]: [any[], any] = await connection.execute(
                    "SELECT DISTINCT REFERENCIA as xt_referencia, PEDIMENTO as xt_pedimento FROM cartaporte.mercancias WHERE IDTRANSPORTEM = ? AND RFC = ?",
                    [transporte.xn_id, cliente.xt_rfc]
                );
                cliente.pedimentos = pedimentos; // Agregar pedimentos a cada transporte
            }
        

        // Asignacion de semaforo
            /*
            console.log("Transporte obtenido:", {
                transporteId: transporte.xn_id,
                estatus: transporte.estatus,
                //placa: transporte.xt,
                //origen: transporte.origen,
                //destino: transporte.destino,
                //clientes: transporte.clientes?.length ?? 0
            });
            */

            if(transporte.estatus.find((e: any) => e.xt_estatus === "Entregado")){
                transporte.semaforo = "bg-green-300"; // Entregado => verde
            }else if(transporte.xt_placa !== null){
                transporte.semaforo = "bg-cyan-200";
            } else if (
                transporte.origen !== null &&
                transporte.destino !== null &&
                transporte.clientes.length > 0
            ) {
                transporte.semaforo = "bg-orange-300"; // completo => naranja
            } else if (
                transporte.origen === null && transporte.destino === null && transporte.clientes.length < 1
            ) {
                transporte.semaforo = "bg-red-300"; // origen y destino pero sin clientes => amarillo
            }else if (
                transporte.origen === null && transporte.destino === null || transporte.clientes.length < 1
            ) {
                transporte.semaforo = "bg-yellow-300"; // origen y destino pero sin clientes => amarillo
            } else {
                //transporte.semaforo = "bg-red-200"; // por defecto con placa => azul claro
            }
            
        
        return NextResponse.json(transporte);

    } catch (error) {
        console.error("Error al obtener transportes:", error);
        return NextResponse.json({ error: "Error al obtener transportes" }, { status: 500 });
    } finally {
        if (connection) await connection.end();
    }
}

