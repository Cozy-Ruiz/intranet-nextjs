import { NextRequest, NextResponse } from "next/server";
import { Client } from "basic-ftp";
import { Writable } from "stream";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const file = url.searchParams.get("file");

  if (!file) {
    return new NextResponse("Falta el parámetro 'file'", { status: 400 });
  }

  const client = new Client();
  const chunks: Buffer[] = [];

  const writableStream = new Writable({
    write(chunk: Buffer, _encoding, callback) {
      chunks.push(chunk);
      callback();
    },
  });

  try {
    await client.access({
      //host: "71.144.19.155",
      host: "escalanterca.com.mx",
      user: "Imagenes",
      password: "Img2012Server",
      secure: false,
    });

    await client.downloadTo(writableStream, file);

    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${file}"`,
      },
    });
  } catch (error) {
    console.error("Error al descargar desde FTP:", error);
    return new NextResponse("Error al obtener el archivo", { status: 500 });
  } finally {
    client.close();
  }
}

