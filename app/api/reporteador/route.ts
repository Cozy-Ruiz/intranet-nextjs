import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

async function getConnection() {
    return await mysql.createConnection({
        host: "192.1.172.9",
        port: 3306,
        user: "GEA",
        password: "7b1QqK#m1F3m",
        database: "master_ge",
    });
}   

export async function POST(request: Request) {
    try {
      const { sql } = await request.json();
  
      if (!sql) {
        return NextResponse.json({ error: "No SQL provided" }, { status: 400 });
      }
  
      const connection = await getConnection();
      const [rows] = await connection.execute(sql);
      await connection.end();
  
      return NextResponse.json({ data: rows });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
}