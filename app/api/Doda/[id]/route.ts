import { NextRequest, NextResponse } from "next/server";
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
        let transporte;

        //Obtener fecha del query string
        //const { searchParams } = new URL(req.url);
        //const relacionSalida = searchParams.get("relacion_salida"); // Esperamos formato yyyy-mm-dd
        const relacionSalida = request.nextUrl.pathname.split("/").pop();

        if (!relacionSalida) {
            return NextResponse.json({ error: "Parámetro 'relacion_salida' requerido" }, { status: 400 });
        }

        console.log("Relacion salida recibida:", relacionSalida);

        // Obtener datos del transporte
        const [result]: [any[], any] = await connection.execute(`
            SELECT * FROM doda.relacion_salida WHERE xt_relacion_salida = ?
        `, [relacionSalida]); 

        transporte = result[0];

        //obtengo pedimentos de la relacion de salida
        const [pedimentos]: [any[], any] = await connection.execute(`
            SELECT xt_pedimento FROM doda.relacion_salida_pedimentos WHERE xt_relacion_Salida = ?
        `, [relacionSalida]);

        const concatenatedPedimentos = "'" + pedimentos.map((p: any) => p.xt_pedimento).join("', '") + "'";
       
        // Obtener clientes que van en el transporte
        const [clientes]: [any[], any] = await connection.execute(
            `SELECT distinct xt_rfc_cliente, xt_nombre_cliente from doda.pedimentos WHERE xt_pedimento in (${concatenatedPedimentos})`
        );
        transporte.clientes = clientes; // Agregar pedimentos a cada transporte
        
        
        // Obtener pedimentos para cada cliente del transporte
        for (let cliente of transporte.clientes) {
            const [pedimentos]: [any[], any] = await connection.execute(
                "SELECT p.xt_pedimento, p.xt_referencia FROM doda.pedimentos p, doda.relacion_salida_pedimentos rsp WHERE p.xt_rfc_cliente = ? AND rsp.xt_relacion_Salida = ? AND p.xt_pedimento = rsp.xt_pedimento",
                [cliente.xt_rfc_cliente, relacionSalida]
            );
            cliente.pedimentos = pedimentos; // Agregar pedimentos a cada transporte
        }
        
        return NextResponse.json(transporte);

    } catch (error) {
        console.error("Error al obtener relacion de salida:", error);
        return NextResponse.json({ error: "Error al obtener relacion de salida" }, { status: 500 });
    } finally {
        if (connection) await connection.end();
    }
}

/*
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
*/