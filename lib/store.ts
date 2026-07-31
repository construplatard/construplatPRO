'use client';
import type {AppData} from './types';
export const seedData:AppData={clientes:[{id:'c1',nombre:'Cliente demostración',rnc:'',telefono:'',email:'',direccion:'Santo Domingo'}],proyectos:[{id:'p1',nombre:'Remodelación demostración',clienteId:'c1',direccion:'Santo Domingo',monto:650000,avance:25,estado:'En ejecución'}],cotizaciones:[],bitacoras:[],movimientos:[],facturas:[],contratistas:[]};
const KEY='construplata-data-v2';
export function loadData():AppData{if(typeof window==='undefined')return seedData;try{return JSON.parse(localStorage.getItem(KEY)||'null')||seedData}catch{return seedData}}
export function saveData(data:AppData){localStorage.setItem(KEY,JSON.stringify(data))}
export const uid=(p:string)=>`${p}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
export const money=(n:number)=>new Intl.NumberFormat('es-DO',{style:'currency',currency:'DOP'}).format(n);
export const today=()=>new Date().toISOString().slice(0,10);
