import { NextResponse } from "next/server";
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

export async function GET(req: Request) {
    
    let connection;

    try {
        connection = await getConnection();
        let transportes;

        // Obtener fecha del query string
        const { searchParams } = new URL(req.url);
        const fecha = searchParams.get("fecha"); // Esperamos formato yyyy-mm-dd

        if (!fecha) {
            return NextResponse.json({ error: "Parámetro 'fecha' requerido" }, { status: 400 });
        }

        console.log("Fecha recibida:", fecha);

        // Obtener todas las solicitudes de transportes
        const [result]: [any[], any] = await connection.execute(`
            SELECT
                    tm.IDRELACION as xn_id,
                    (SELECT ct.xt_nombre FROM doda.catalogo_transportistas ct WHERE ct.xt_caat = tm.caat LIMIT 1) as xt_transportista,
                    (SELECT PLACAVM FROM cartaporte.cat_transportes WHERE IDTRANSPORTE = tm.TRANSPORTE) as xt_placa,
                    (SELECT NOMBREFIGURA FROM cartaporte.cat_operadores WHERE IDOPERADOR = tm.OPERADOR) as xt_operador,
                    DATE_FORMAT(tm.FECHA,'%d-%m-%Y %H:%i') as xd_fecha,
                    tm.USUARIO as xt_usuarioRegistro,
					(SELECT m.REFERENCIA FROM cartaporte.mercancias m WHERE m.IDTRANSPORTEM = tm.IDRELACION AND m.REF_FACTURA = tm.IDRELACION LIMIT 1) as referencia_pivote,
		            (SELECT DATE_FORMAT(om.FECHA_SALIDA,'%d-%m-%Y %H:%i') as FECHA_SALIDA FROM cartaporte.origenesmercancia om, cartaporte.cat_origenes co WHERE IDTRANSPORTE = tm.IDRELACION AND co.IDORIGEN = om.ORIGEN LIMIT 1) as FECHA_SALIDA,
		            (SELECT DATE_FORMAT(dm.FECHA_LLEGADA,'%d-%m-%Y %H:%i') as FECHA_LLEGADA FROM cartaporte.destinosmercancia dm, cartaporte.cat_destinos cd WHERE IDTRANSPORTE = tm.IDRELACION AND cd.IDDESTINO = dm.DESTINO LIMIT 1) as FECHA_LLEGADA
            FROM
                    cartaporte.transportemercancia tm 
            WHERE
                    DATE( tm.fecha ) BETWEEN ${fecha}
            AND tm.OFICINA = 'CDMX'
            ORDER BY tm.FECHA DESC   
        `/*, [fecha]*/);

        transportes = result;

        // Obtener estatus
        for (let transporte of transportes) {
            const [estatus]: [any[], any] = await connection.execute(
                "SELECT et.* FROM transportes.estatus_transportes et WHERE et.xn_id = ? ",
                [transporte.xn_id]
            );
            transporte.estatus = estatus ?? null;
        }

        // Obtener referencias pivote
        for (let transporte of transportes) {
            const [referencias_pivote]: [any[], any] = await connection.execute(
                "SELECT distinct m.REFERENCIA FROM cartaporte.mercancias m WHERE m.IDTRANSPORTEM = ? AND m.REF_FACTURA = ? ",
                [transporte.xn_id, transporte.xn_id]
            );

            transporte.referencias_pivote = [];

            for (const row of referencias_pivote) {
                const referencia = row.REFERENCIA;

                const [cartaResult]: [any[], any] = await connection.execute(
                    `SELECT xt_ruta as CARTAPORTE FROM imagenes.imagenes_facturacion WHERE xt_referencia = ? AND xt_tipoDocumento = 'pdf' AND xt_cliente = 'GEA990415MQ5' `,
                    [referencia]
                );

                const [facturaResult]: [any[], any] = await connection.execute(
                    `SELECT xt_ruta as FACTURA FROM imagenes.imagenes_facturacion WHERE xt_referencia = ? AND xt_tipoDocumento = 'pdf' AND xt_cliente != 'GEA990415MQ5' `,
                    [referencia]
                );

                transporte.referencias_pivote.push({
                    REFERENCIA: referencia,
                    CARTAPORTE: cartaResult.length > 0 ? cartaResult[0].CARTAPORTE : null,
                    FACTURA: facturaResult.length > 0 ? facturaResult[0].FACTURA : null
                });
            }
        }

        // Obtener Origen
        for (let transporte of transportes) {
            const [origen]: [any[], any] = await connection.execute(
                "SELECT DATE_FORMAT(om.FECHA_SALIDA,'%d-%m-%Y %H:%i') as FECHA_SALIDA, co.* FROM cartaporte.origenesmercancia om, cartaporte.cat_origenes co WHERE IDTRANSPORTE = ? AND co.IDORIGEN = om.ORIGEN",
                [transporte.xn_id]
            );
            transporte.origen = origen[0] ?? null; // Agregar pedimentos a cada transporte
        }

        // Obtener destino
        for (let transporte of transportes) {
            const [destino]: [any[], any] = await connection.execute(
                "SELECT DATE_FORMAT(dm.FECHA_LLEGADA,'%d-%m-%Y %H:%i') as FECHA_LLEGADA, cd.* FROM cartaporte.destinosmercancia dm, cartaporte.cat_destinos cd WHERE IDTRANSPORTE = ? AND cd.IDDESTINO = dm.DESTINO",
                [transporte.xn_id]
            );
            transporte.destino = destino[0] ?? null; // Agregar pedimentos a cada transporte
        }

        // Obtener clientes que van en el transporte
        for (let transporte of transportes) {
            const [clientes]: [any[], any] = await connection.execute(
                "SELECT DISTINCT m.RFC as xt_rfc, (SELECT c.xt_nombre FROM master_ge.master_rfc_clienteid c WHERE c.xt_rfc = m.RFC LIMIT 1) as xt_nombre FROM cartaporte.mercancias m WHERE m.IDTRANSPORTEM = ?",
                [transporte.xn_id]
            );
            transporte.clientes = clientes; // Agregar pedimentos a cada transporte
        }
        
        // Obtener pedimentos para cada cliente del transporte
        for (let transporte of transportes) {
            for (let cliente of transporte.clientes) {
                const [pedimentos]: [any[], any] = await connection.execute(
                    "SELECT DISTINCT REFERENCIA as xt_referencia, PEDIMENTO as xt_pedimento FROM cartaporte.mercancias WHERE IDTRANSPORTEM = ? AND RFC = ?",
                    [transporte.xn_id, cliente.xt_rfc]
                );
                cliente.pedimentos = pedimentos; // Agregar pedimentos a cada transporte
            }
        }

        // Obtener relacion de salida DODA
        for (let transporte of transportes) {
                // Obtener los pedimentos del transporte
                const concatenatedPedimentos = transporte.clientes.map((c: any) => c.pedimentos.map((p: any) => p.xt_pedimento)).flat().join(",")

                if(concatenatedPedimentos != ""){
                    const [relacion_salida]: [any[], any] = await connection.execute(
                        `SELECT distinct rsp.xt_relacion_salida, (SELECT rs.XT_PLACA FROM doda.relacion_salida rs WHERE rs.xt_relacion_salida = rsp.xt_relacion_salida) as xt_placa FROM doda.relacion_salida_pedimentos rsp WHERE REPLACE(rsp.XT_PEDIMENTO, ' ', '') in (${concatenatedPedimentos})`
                    );

                    transporte.relacion_salida = relacion_salida;
                }else{
                    transporte.relacion_salida = [];
                }     
        }

        // Asignacion de semaforo
        for (let transporte of transportes) {
            
            
            console.log("Transporte obtenido:", {
                transporteId: transporte.xn_id,
                fecha_salida: transporte.FECHA_SALIDA,
                //relacion_salida: transporte.relacion_salida,
                //referencias_pivote: transporte.referencias_pivote,
                //estatus: transporte.estatus,
                //placa: transporte.xt_placa,
                //origen: transporte.origen,
                //destino: transporte.destino,
                //clientes: transporte.clientes?.length ?? 0
            });
            

            if(transporte.referencias_pivote.find((e: any) => e.FACTURA !== null)){
                transporte.semaforo = "bg-purple-300"; // Factura => morado
            }else if(transporte.estatus.find((e: any) => e.xt_estatus === "Entregado")){
                transporte.semaforo = "bg-green-300"; // Entregado => verde
            }else if(transporte.referencias_pivote.find((e: any) => e.CARTAPORTE !== null)){
                transporte.semaforo = "bg-cyan-300"; // Cartaporte => cyan
            }else if(transporte.xt_placa !== null){
                transporte.semaforo = "bg-blue-200";
            } else if (transporte.estatus.find((e: any) => e.xt_estatus === "Aceptado") && transporte.clientes.length > 0) {
                transporte.semaforo = "bg-yellow-300"; // origen y destino pero sin clientes => amarillo
            }else if (transporte.estatus.find((e: any) => e.xt_estatus === "Aceptado")) {
                transporte.semaforo = "bg-orange-300";
            } else if (transporte.estatus.find((e: any) => e.xt_estatus === "Rechazado")) {
                transporte.semaforo = "bg-red-500";
            } else {
                transporte.semaforo = "bg-pink-300"; // por defecto con placa => azul claro
            }
        }
        
        return NextResponse.json(transportes);

    } catch (error) {
        console.error("Error al obtener transportes:", error);
        return NextResponse.json({ error: "Error al obtener transportes" }, { status: 500 });
    } finally {
        if (connection) await connection.end();
    }
}

export async function POST(req: Request) {
    let connection;

    try {
        const body = await req.json();
        console.log(body);
        const { xt_placa, xt_operador, pedimentos, xt_usuario } = body;

        if (!xt_placa || !xt_operador || !pedimentos || !xt_usuario) {
            return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
        }

        connection = await getConnection();
        
        const [result]: any = await connection.execute(
            "INSERT INTO registro_unidades (xt_placa, xt_operador, xt_usuario) VALUES (?, ?, ?)",
            [xt_placa, xt_operador, xt_usuario]
        );

        const transporteId = result.insertId;
        console.log("Transporte insertado con ID:", transporteId);
        
        // Insertar pedimentos si existen
        if (pedimentos.length > 0) {
            for (const pedimento of pedimentos) {

                const lineaCaptura = pedimento.split(" ")[0];

                const [resultReferencia]: any = await connection.execute(
                    "SELECT r.xt_referencia, p.kp_pedimento FROM validacion_pago_pece.referencias r, master_ge.master_pedimentos p WHERE r.XT_LINEA_CAPTURA = ? AND p.xt_referencia = r.XT_REFERENCIA",
                    [lineaCaptura]
                );
                
                await connection.execute(
                    "INSERT INTO unidades_pedimentos (xn_id, xt_referencia, xt_pedimento, xt_usuario) VALUES (?, ?, ?, ?)",
                    [transporteId, resultReferencia[0].xt_referencia, resultReferencia[0].kp_pedimento, xt_usuario]
                );
            }
        }

        // Recuperar el transporte insertado
        const [newTransporte]: any = await connection.execute(
            "SELECT xn_id, xt_placa, xt_operador, xd_fecha FROM registro_unidades WHERE xn_id = ?",
            [transporteId]
        );

        // Recuperar los pedimentos asociados al transporte
        const [pedimentosAsociados]: any = await connection.execute(
            "SELECT xt_pedimento, xt_referencia FROM unidades_pedimentos WHERE xn_id = ?",
            [transporteId]
        );

        // Construir el objeto en la estructura requerida
        const transporte = {
            xn_id: newTransporte[0].xn_id,
            xt_placa: newTransporte[0].xt_placa,
            xt_operador: newTransporte[0].xt_operador,
            xd_fecha: newTransporte[0].xd_fecha,
            pedimentos: pedimentosAsociados.map((p: any) => ({
                xt_pedimento: p.xt_pedimento,
                xt_referencia: p.xt_referencia,
            })),
        };

        console.log(transporte)

        // Retornar el transporte con sus pedimentos
        return NextResponse.json({
            message: "Unidad registrada correctamente",
            transporte
        });

    } catch (error) {
        console.error("Error al agregar transporte", error);
        return NextResponse.json({ error: "Error al agregar transporte" }, { status: 500 });
    }finally {
        if (connection) await connection.end();
    }
}