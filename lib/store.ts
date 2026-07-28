'use client';
import {AppData} from './types';
export const STORAGE_KEY='construplata-erp-v1';
export const seedData:AppData={
 clientes:[{id:'cli-1',nombre:'Cliente Demo',rnc:'001-0000000-1',telefono:'809-555-0101',email:'cliente@demo.com',direccion:'Santo Domingo',creado:'2026-07-28'}],
 proyectos:[{id:'pro-1',nombre:'Remodelación Terraza',clienteId:'cli-1',direccion:'Santo Domingo',estado:'En ejecución',monto:360000,avanceFisico:35,inicio:'2026-07-01',entrega:'2026-08-30'}],
 cotizaciones:[{id:'cot-1',numero:'COT-0001',fecha:'2026-07-28',clienteId:'cli-1',proyecto:'Remodelación Terraza',descripcion:'Demolición, estructura metálica, grama e iluminación.',subtotal:360000,itbis:false,estado:'Aprobada'}],
 movimientos:[{id:'mov-1',fecha:'2026-07-10',proyectoId:'pro-1',concepto:'Avance inicial del cliente',monto:150000,metodo:'Transferencia',tipo:'cobro'},{id:'mov-2',fecha:'2026-07-15',proyectoId:'pro-1',concepto:'Compra de materiales',monto:48000,metodo:'Transferencia',tipo:'gasto'}],
 facturas:[{id:'fac-1',numero:'FAC-0001',fecha:'2026-07-10',clienteId:'cli-1',proyectoId:'pro-1',concepto:'Avance inicial',monto:150000,pagado:150000,estado:'Pagada'}],
 bitacoras:[{id:'bit-1',fecha:'2026-07-28',proyectoId:'pro-1',clima:'Soleado',actividades:'Instalación de estructura metálica y preparación de superficie.',contratistas:'Equipo de herrería',equipos:'Soldadora y taladro',materiales:'Perfiles metálicos y electrodos',incidencias:'Sin incidencias',observaciones:'Trabajo ejecutado según planificación.',avance:5}],
 contratistas:[{id:'con-1',nombre:'Contratista Demo',especialidad:'Estructura metálica',telefono:'809-555-0202',rnc:'',montoContratado:205000,pagado:80000,proyectoId:'pro-1'}],
 cuentas:[{id:'cta-1',nombre:'Caja General',tipo:'Caja',saldoInicial:0},{id:'cta-2',nombre:'Cuenta Bancaria',tipo:'Banco',saldoInicial:50000}]
};
export function loadData():AppData{if(typeof window==='undefined')return seedData;try{const raw=localStorage.getItem(STORAGE_KEY);return raw?JSON.parse(raw):seedData}catch{return seedData}}
export function saveData(data:AppData){localStorage.setItem(STORAGE_KEY,JSON.stringify(data))}
