
export interface Registro {
    id:string;
    fecha: string;
    fechaCreacion: Date;
    categoria: string;
    subcategoria: string;
    concepto: string;
    monto: number;
    mes: string;
    dia: string;
    anio: string;
    

}
export interface Deuda {
    id:string;
    fecha: string;
    fechaPago: string;
    TipoPrestamo: string;
    acreedor: string;
    concepto: string;
    status: string;
    monto: number;
    mes: string;
    dia: string;
    anio: string;
    

}

export interface Pago {
    id:string;
    acreedor: string;
    fechaPago: string;
    TipoPago: string;
    pago: number;
    montoAdeudado: number;
    mes: string;
    dia: string;
    anio: string;
    

}
export interface Usuario{
    uid: string;
    nombre: string;
    contacto: string;
    email: string;
    password: string;
    fecha: Date;
  
  }
  export interface GraficoTransacciones{
    mes: string;
    capital: number;
    venta: number;
    compra: number;
    gasto: number;
    
    }
    
    export interface Messes{
    january: number;
    february: number;
    march: number;
    april: number;
    may: number;
    june: number;
    july: number;
    august: number;
    september: number;
    october: number;
    november: number;
    december: number;
    
    }

    export interface Tarea{
        id: string;
        descripcion: string;
        tipoGasto: string;
        subcategoria: string;
        monto: number;
        fecha: string;
        status: string

    }

    export interface Datos {
        mes: Array<string>;
        ingresos:Array<any>;
        gastos:Array<any>;
      };

