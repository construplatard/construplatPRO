export type EstadoProyecto='Planificación'|'En ejecución'|'Pausado'|'Terminado';
export interface Cliente{id:string;nombre:string;rnc:string;telefono:string;email:string;direccion:string;creado:string}
export interface Proyecto{id:string;nombre:string;clienteId:string;direccion:string;estado:EstadoProyecto;monto:number;avanceFisico:number;inicio:string;entrega:string}
export interface Cotizacion{id:string;numero:string;fecha:string;clienteId:string;proyecto:string;descripcion:string;subtotal:number;itbis:boolean;estado:'Borrador'|'Enviada'|'Aprobada'|'Rechazada'}
export interface Movimiento{id:string;fecha:string;proyectoId:string;concepto:string;monto:number;metodo:string;tipo:'cobro'|'gasto'}
export interface Factura{id:string;numero:string;fecha:string;clienteId:string;proyectoId:string;concepto:string;monto:number;pagado:number;estado:'Pendiente'|'Parcial'|'Pagada'}
export interface Bitacora{id:string;fecha:string;proyectoId:string;clima:string;actividades:string;contratistas:string;equipos:string;materiales:string;incidencias:string;observaciones:string;avance:number}
export interface Contratista{id:string;nombre:string;especialidad:string;telefono:string;rnc:string;montoContratado:number;pagado:number;proyectoId:string}
export interface Cuenta{id:string;nombre:string;tipo:'Caja'|'Banco';saldoInicial:number}
export interface AppData{clientes:Cliente[];proyectos:Proyecto[];cotizaciones:Cotizacion[];movimientos:Movimiento[];facturas:Factura[];bitacoras:Bitacora[];contratistas:Contratista[];cuentas:Cuenta[]}
