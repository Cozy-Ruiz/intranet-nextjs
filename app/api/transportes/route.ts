import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

async function getConnection() {
    return await mysql.createConnection({
        host: "192.1.172.9",
        port: 3306,
        user: "GEA",
        password: "7b1QqK#m1F3m",
        database: "transportes",
    });
}


export async function GET() {
    let connection;

    try {
        connection = await getConnection();
        let transportes;

        // Obtener todos los transportes
        const [result]: [any[], any] = await connection.execute("SELECT * FROM registro_unidades");
        transportes = result;

        // Obtener pedimentos para cada transporte
        for (let transporte of transportes) {
            const [pedimentos]: [any[], any] = await connection.execute(
                "SELECT * FROM unidades_pedimentos WHERE xn_id = ?",
                [transporte.xn_id]
            );
            transporte.pedimentos = pedimentos; // Agregar pedimentos a cada transporte
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