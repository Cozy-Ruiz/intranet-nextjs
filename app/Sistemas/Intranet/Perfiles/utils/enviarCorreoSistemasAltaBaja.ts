type DatosUsuarioCorreo = {
    xt_nombre?: string | null;
    xt_rfc?: string | null;
    xt_curp?: string | null;
    xt_puesto?: string | null;
    xt_correo?: string | null;
} | null;

type EnviarCorreoSistemasAltaBajaParams = {
    accion: 'alta' | 'baja';
    sistema: string;
    usuario: DatosUsuarioCorreo;
    solicitante: DatosUsuarioCorreo;
};

export async function enviarCorreoSistemasAltaBaja({
    accion,
    sistema,
    usuario,
    solicitante,
}: EnviarCorreoSistemasAltaBajaParams): Promise<void> {
    const accionCapitalizada = accion === 'alta' ? 'Alta' : 'Baja';
    const nombreSistema = sistema;

    try {
        const response = await fetch('/backend/Intranet/Perfiles/enviaCorreo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                destinatarios: [solicitante?.xt_correo ?? ''],
                copias: ['cruiz@escalante.com.mx'],
                asunto: `${accionCapitalizada} acceso modulo ${nombreSistema} al usuario ${usuario?.xt_nombre ?? ''}`,
                perfil_puesto: usuario?.xt_puesto ?? '',
                mensaje: [
                    `Se confirma ${accion} de acceso al modulo ${nombreSistema} para el usuario:`,
                    ``,
                    `Nombre: ${usuario?.xt_nombre ?? ''}`,
                    `RFC: ${usuario?.xt_rfc ?? ''}`,
                    `CURP: ${usuario?.xt_curp ?? ''}`,
                    `Puesto: ${usuario?.xt_puesto ?? ''}`,
                    ``,
                    `Solicitado por: ${solicitante?.xt_nombre ?? ''}`,
                    ``,
                    `Saludos cordiales.`,
                ].join('<br>'),
            }),
        });

        if (!response.ok) {
            throw new Error(`El servidor respondió con estado ${response.status}`);
        }

        console.log(`Correo de ${accion} de acceso a modulo ${nombreSistema} enviado.`);
    } catch (error) {
        console.error(`Error al enviar correo de ${accion} de acceso a modulo ${nombreSistema}.`, error);
    }
}
