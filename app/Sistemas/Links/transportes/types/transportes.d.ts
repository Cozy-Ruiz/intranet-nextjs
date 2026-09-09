export interface Pedimento {
    xn_referencia: string;
    xn_pedimento: string;
}

export interface Transporte {
    xn_id: number;
    xt_placa: string;
    xt_operador: string;
    xd_fecha: string;
    pedimentos: Pedimento[];
}

export interface Unidades {
    xt_placa: string;
    xt_unidad: string;
}

export interface Operadores {
    xt_operador: string;
}