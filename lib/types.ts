export type Cliente={id:string;nombre:string;rnc:string;telefono:string;email:string;direccion:string};
export type Proyecto={id:string;nombre:string;clienteId:string;direccion:string;monto:number;avance:number;estado:string};
export type Cotizacion={id:string;numero:string;clienteId:string;proyecto:string;monto:number;estado:string};
export type Bitacora={id:string;fecha:string;proyectoId:string;clima:string;actividades:string;incidencias:string;avance:number};
export type Movimiento={id:string;tipo:'cobro'|'gasto';fecha:string;proyectoId:string;concepto:string;monto:number;metodo:string};
export type Factura={id:string;numero:string;clienteId:string;proyectoId:string;concepto:string;monto:number;pagado:number;estado:string};
export type Contratista={id:string;nombre:string;especialidad:string;telefono:string;proyectoId:string;monto:number;pagado:number};
export type AppData={clientes:Cliente[];proyectos:Proyecto[];cotizaciones:Cotizacion[];bitacoras:Bitacora[];movimientos:Movimiento[];facturas:Factura[];contratistas:Contratista[]};
