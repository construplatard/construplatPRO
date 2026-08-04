'use client';

import { useMemo, useState } from 'react';
import PageFrame from '@/components/PageFrame';
import { useData } from '@/components/DataProvider';
import { today, uid } from '@/lib/store';
import {
  CalendarDays,
  CheckCircle2,
  CloudSun,
  Eye,
  FileText,
  FolderKanban,
  History,
  Plus,
  Printer,
  Save,
  UsersRound,
  Wrench,
  X,
} from 'lucide-react';

type CotizacionAprobada = {
  id: string;
  numero: string;
  clienteId: string;
  proyecto: string;
  monto: number;
  estado: string;
  total?: number;
};

type BitacoraExtendida = {
  id: string;
  fecha: string;
  proyectoId: string;
  clima: string;
  actividades: string;
  incidencias: string;
  avance: number;
  personal?: string;
  materiales?: string;
  observaciones?: string;
};

type ProyectoBitacora = {
  id: string;
  numero: string;
  nombre: string;
  avance: number;
  balance: number;
  finalizado: boolean;
};

const normalizar = (value: string | undefined) =>
  String(value || '').trim().toLowerCase();

const fechaRD = (value: string) => {
  if (!value) return '—';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
};

export default function Page() {
  return (
    <PageFrame>
      <Bitacoras />
    </PageFrame>
  );
}

function Bitacoras() {
  const { data, setData } = useData();
  const bitacoras = data.bitacoras as BitacoraExtendida[];

  const proyectos = useMemo<ProyectoBitacora[]>(() => {
    const cotizaciones = data.cotizaciones as CotizacionAprobada[];

    return cotizaciones
      .filter((cotizacion) => normalizar(cotizacion.estado) === 'aprobada')
      .map((cotizacion) => {
        const proyectoId = `pro-${cotizacion.id}`;
        const registros = bitacoras
          .filter((b) => b.proyectoId === proyectoId)
          .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));

        const avance = registros.length ? Number(registros[0].avance || 0) : 0;
        const cobrado = data.movimientos
          .filter(
            (m) => m.proyectoId === proyectoId && m.tipo === 'cobro'
          )
          .reduce((sum, m) => sum + Number(m.monto || 0), 0);

        const monto = Number(cotizacion.total ?? cotizacion.monto ?? 0);
        const balance = Math.max(monto - cobrado, 0);
        const finalizado = avance >= 100 && balance <= 0;

        return {
          id: proyectoId,
          numero: cotizacion.numero,
          nombre: cotizacion.proyecto,
          avance,
          balance,
          finalizado,
        };
      });
  }, [data.cotizaciones, data.movimientos, bitacoras]);

  const proyectosActivos = proyectos.filter((p) => !p.finalizado);

  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterProjectId, setFilterProjectId] = useState('todos');
  const [form, setForm] = useState({
    fecha: today(),
    proyectoId: proyectosActivos[0]?.id || '',
    clima: 'Soleado',
    actividades: '',
    incidencias: '',
    avance: proyectosActivos[0]?.avance || 0,
    personal: '',
    materiales: '',
    observaciones: '',
  });

  const selected = bitacoras.find((b) => b.id === selectedId) || null;

  const bitacorasOrdenadas = useMemo(
    () =>
      [...bitacoras]
        .filter((b) =>
          filterProjectId === 'todos' ? true : b.proyectoId === filterProjectId
        )
        .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha))),
    [bitacoras, filterProjectId]
  );

  const ultimoAvance = (proyectoId: string) =>
    Number(proyectos.find((p) => p.id === proyectoId)?.avance || 0);

  const nombreProyecto = (proyectoId: string) =>
    proyectos.find((p) => p.id === proyectoId)?.nombre || 'Proyecto no disponible';

  const numeroProyecto = (proyectoId: string) =>
    proyectos.find((p) => p.id === proyectoId)?.numero || '';

  const openNew = () => {
    const proyecto = proyectosActivos[0];
    setForm({
      fecha: today(),
      proyectoId: proyecto?.id || '',
      clima: 'Soleado',
      actividades: '',
      incidencias: '',
      avance: proyecto?.avance || 0,
      personal: '',
      materiales: '',
      observaciones: '',
    });
    setShowForm(true);
  };

  const saveBitacora = () => {
    if (!form.proyectoId) {
      window.alert('Selecciona un proyecto activo.');
      return;
    }
    if (!form.actividades.trim()) {
      window.alert('Describe las actividades realizadas.');
      return;
    }

    const anterior = ultimoAvance(form.proyectoId);
    const nuevo = Number(form.avance || 0);

    if (nuevo < anterior) {
      window.alert(`El avance no puede ser menor al último registrado (${anterior}%).`);
      return;
    }
    if (nuevo < 0 || nuevo > 100) {
      window.alert('El avance debe estar entre 0% y 100%.');
      return;
    }

    const registro: BitacoraExtendida = {
      id: uid('bit'),
      fecha: form.fecha,
      proyectoId: form.proyectoId,
      clima: form.clima,
      actividades: form.actividades.trim(),
      incidencias: form.incidencias.trim(),
      avance: nuevo,
      personal: form.personal.trim(),
      materiales: form.materiales.trim(),
      observaciones: form.observaciones.trim(),
    };

    setData((current) => ({
      ...current,
      bitacoras: [...current.bitacoras, registro] as any,
    }));
    setShowForm(false);
  };

  const printBitacora = (id: string) => {
    const b = bitacoras.find((item) => item.id === id);
    if (!b) return;

    const w = window.open('', '_blank', 'width=900,height=900');
    if (!w) {
      window.alert('Permite las ventanas emergentes para imprimir.');
      return;
    }

    w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Bitácora</title><style>@page{size:A4;margin:14mm}body{font-family:Arial;color:#17304d}.h{padding:22px;color:#fff;background:#07579b;border-radius:14px}.g{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:18px 0}.b,.s{padding:12px;border:1px solid #d7e0ea;border-radius:10px}.b span{display:block;color:#718096;font-size:11px}.s{margin-top:12px}.s h3{margin:0 0 8px;color:#07579b}.s p{white-space:pre-wrap;line-height:1.5}</style></head><body><div class="h"><h1>BITÁCORA DE OBRA</h1><p>CONSTRUPLATA SRL</p></div><div class="g"><div class="b"><span>Proyecto</span><b>${nombreProyecto(b.proyectoId)}</b></div><div class="b"><span>Cotización</span><b>${numeroProyecto(b.proyectoId).replace('COT-','#')}</b></div><div class="b"><span>Fecha</span><b>${fechaRD(b.fecha)}</b></div><div class="b"><span>Clima</span><b>${b.clima}</b></div><div class="b"><span>Avance</span><b>${b.avance}%</b></div></div><div class="s"><h3>ACTIVIDADES</h3><p>${b.actividades}</p></div><div class="s"><h3>INCIDENCIAS</h3><p>${b.incidencias || 'Sin incidencias.'}</p></div><div class="s"><h3>PERSONAL / CONTRATISTAS</h3><p>${b.personal || 'No especificado.'}</p></div><div class="s"><h3>MATERIALES Y EQUIPOS</h3><p>${b.materiales || 'No especificado.'}</p></div><div class="s"><h3>OBSERVACIONES</h3><p>${b.observaciones || 'Sin observaciones.'}</p></div><script>window.onload=()=>{window.print();window.onafterprint=()=>window.close()}</script></body></html>`);
    w.document.close();
  };

  return (
    <>
      <div className="bitacora-actions-top">
        <div className="bitacora-banner">
          <History size={22} />
          <div>
            <b>El avance de Proyectos se actualiza desde Bitácoras</b>
            <span>No se permite reducir el último porcentaje registrado.</span>
          </div>
        </div>
        <button className="primary" onClick={openNew} disabled={!proyectosActivos.length}>
          <Plus size={18} /> Nueva bitácora
        </button>
      </div>

      <section className="stats">
        <article className="stat"><FileText size={21}/><span>Bitácoras</span><b>{bitacoras.length}</b></article>
        <article className="stat"><FolderKanban size={21}/><span>Proyectos activos</span><b>{proyectosActivos.length}</b></article>
        <article className="stat"><CalendarDays size={21}/><span>Registros de hoy</span><b>{bitacoras.filter((b)=>b.fecha===today()).length}</b></article>
        <article className="stat"><CheckCircle2 size={21}/><span>Avances al 100%</span><b>{proyectos.filter((p)=>p.avance>=100).length}</b></article>
      </section>

      <div className="bitacora-filter">
        <label>Filtrar por proyecto
          <select value={filterProjectId} onChange={(e)=>setFilterProjectId(e.target.value)}>
            <option value="todos">Todos los proyectos</option>
            {proyectos.map((p)=><option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </label>
      </div>

      {showForm && (
        <section className="form-card">
          <div className="bitacora-form-head"><div><span className="eyebrow">Nueva bitácora</span><h3>Registrar avance diario</h3></div><button className="icon" onClick={()=>setShowForm(false)}><X size={18}/></button></div>
          <div className="form-grid">
            <label>Proyecto activo<select value={form.proyectoId} onChange={(e)=>setForm({...form,proyectoId:e.target.value,avance:ultimoAvance(e.target.value)})}><option value="">Seleccionar</option>{proyectosActivos.map((p)=><option key={p.id} value={p.id}>{p.nombre} · {p.numero.replace('COT-','#')}</option>)}</select></label>
            <label>Fecha<input type="date" value={form.fecha} onChange={(e)=>setForm({...form,fecha:e.target.value})}/></label>
            <label>Clima<select value={form.clima} onChange={(e)=>setForm({...form,clima:e.target.value})}><option>Soleado</option><option>Parcialmente nublado</option><option>Nublado</option><option>Lluvioso</option><option>Tormenta</option></select></label>
            <label>Avance acumulado (%)<input type="number" min={ultimoAvance(form.proyectoId)} max="100" value={form.avance} onChange={(e)=>setForm({...form,avance:Number(e.target.value)})}/><small>Último avance: {ultimoAvance(form.proyectoId)}%</small></label>
            <label className="wide">Actividades realizadas<textarea value={form.actividades} onChange={(e)=>setForm({...form,actividades:e.target.value})}/></label>
            <label className="wide">Incidencias<textarea value={form.incidencias} onChange={(e)=>setForm({...form,incidencias:e.target.value})}/></label>
            <label className="wide">Personal o contratistas presentes<textarea value={form.personal} onChange={(e)=>setForm({...form,personal:e.target.value})}/></label>
            <label className="wide">Materiales y equipos<textarea value={form.materiales} onChange={(e)=>setForm({...form,materiales:e.target.value})}/></label>
            <label className="wide">Observaciones<textarea value={form.observaciones} onChange={(e)=>setForm({...form,observaciones:e.target.value})}/></label>
          </div>
          <div className="bitacora-form-actions"><button className="ghost-client-btn" onClick={()=>setShowForm(false)}>Cancelar</button><button className="primary" onClick={saveBitacora}><Save size={17}/>Guardar bitácora</button></div>
        </section>
      )}

      <div className="bitacora-list">
        {bitacorasOrdenadas.length ? bitacorasOrdenadas.map((b)=>(
          <article className="bitacora-card" key={b.id}>
            <div className="bitacora-date"><b>{b.fecha.slice(8)}</b><span>{b.fecha.slice(5,7)}/{b.fecha.slice(0,4)}</span></div>
            <div className="bitacora-body">
              <div className="bitacora-head"><div><span className="pill">{numeroProyecto(b.proyectoId).replace('COT-','#')}</span><h3>{nombreProyecto(b.proyectoId)}</h3><p><CloudSun size={14}/> {b.clima} · Avance <b>{b.avance}%</b></p></div><div className="cliente-actions"><button className="cliente-action-btn edit" onClick={()=>setSelectedId(b.id)}><Eye size={16}/></button><button className="cliente-action-btn edit" onClick={()=>printBitacora(b.id)}><Printer size={16}/></button></div></div>
              <div className="progress large"><i style={{width:`${b.avance}%`}}/></div>
              <p><b>Actividades:</b> {b.actividades}</p>{b.incidencias && <p><b>Incidencias:</b> {b.incidencias}</p>}
            </div>
          </article>
        )) : <div className="empty">No hay bitácoras registradas.</div>}
      </div>

      {selected && (
        <div className="cp-modal-overlay" onClick={()=>setSelectedId(null)}>
          <div className="bitacora-modal" onClick={(e)=>e.stopPropagation()}>
            <div className="bitacora-form-head"><div><span className="eyebrow">Detalle de bitácora</span><h2>{nombreProyecto(selected.proyectoId)}</h2><p>{fechaRD(selected.fecha)} · {numeroProyecto(selected.proyectoId).replace('COT-','#')}</p></div><button className="icon" onClick={()=>setSelectedId(null)}><X size={18}/></button></div>
            <div className="bitacora-detail-grid"><div><CalendarDays size={18}/><span>Fecha</span><b>{fechaRD(selected.fecha)}</b></div><div><CloudSun size={18}/><span>Clima</span><b>{selected.clima}</b></div><div><CheckCircle2 size={18}/><span>Avance</span><b>{selected.avance}%</b></div></div>
            <section><h3>Actividades realizadas</h3><p>{selected.actividades}</p></section>
            <section><h3>Incidencias</h3><p>{selected.incidencias || 'Sin incidencias.'}</p></section>
            <section><h3><UsersRound size={18}/> Personal o contratistas</h3><p>{selected.personal || 'No especificado.'}</p></section>
            <section><h3><Wrench size={18}/> Materiales y equipos</h3><p>{selected.materiales || 'No especificado.'}</p></section>
            <section><h3>Observaciones</h3><p>{selected.observaciones || 'Sin observaciones.'}</p></section>
            <div className="bitacora-form-actions"><button className="primary" onClick={()=>printBitacora(selected.id)}><Printer size={17}/>Imprimir bitácora</button></div>
          </div>
        </div>
      )}

      <style jsx>{`
        .bitacora-actions-top{display:flex;justify-content:space-between;gap:16px;align-items:center;margin-bottom:20px}.bitacora-banner{flex:1;display:flex;gap:12px;align-items:center;padding:16px;border:1px solid var(--line);border-radius:17px;background:rgba(23,105,224,.07)}.bitacora-banner svg{color:var(--blue)}.bitacora-banner b,.bitacora-banner span{display:block}.bitacora-banner span{margin-top:4px;color:var(--muted);font-size:12px}.bitacora-filter{display:flex;justify-content:flex-end;margin:22px 0}.bitacora-filter label{width:min(360px,100%);display:grid;gap:7px;color:var(--muted);font-size:11px;font-weight:800}.bitacora-filter select{min-height:44px;padding:0 12px;border:1px solid var(--line);border-radius:12px;background:var(--card);color:var(--text)}.bitacora-form-head{display:flex;justify-content:space-between;gap:18px;margin-bottom:18px}.bitacora-form-head h3,.bitacora-form-head h2{margin:6px 0}.bitacora-form-head p{margin:0;color:var(--muted)}.bitacora-form-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:18px}.bitacora-list{display:grid;gap:15px}.bitacora-card{display:grid;grid-template-columns:74px 1fr;gap:16px}.bitacora-date{min-height:76px;padding:12px 8px;display:grid;place-items:center;align-content:center;border-radius:17px;color:#fff;background:linear-gradient(135deg,#1769e0,#168edc)}.bitacora-date b{font-size:24px}.bitacora-date span{font-size:10px}.bitacora-body{padding:19px;border:1px solid var(--line);border-radius:20px;background:var(--card)}.bitacora-head{display:flex;justify-content:space-between;gap:16px}.bitacora-head h3{margin:8px 0 5px}.bitacora-head p{display:flex;align-items:center;gap:5px;margin:0;color:var(--muted);font-size:12px}.bitacora-body>p{color:var(--muted);line-height:1.5;white-space:pre-wrap}.bitacora-modal{width:min(860px,100%);max-height:calc(100vh - 48px);overflow:auto;padding:26px;border:1px solid var(--line);border-radius:24px;background:var(--card)}.bitacora-detail-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.bitacora-detail-grid>div,.bitacora-modal section{padding:14px;border:1px solid var(--line);border-radius:14px}.bitacora-detail-grid span,.bitacora-detail-grid b{display:block}.bitacora-detail-grid span{margin-top:8px;color:var(--muted);font-size:10px}.bitacora-modal section{margin-top:16px}.bitacora-modal section h3{display:flex;gap:8px;align-items:center;margin:0 0 8px;color:var(--blue);font-size:14px}.bitacora-modal section p{margin:0;color:var(--muted);line-height:1.6;white-space:pre-wrap}@media(max-width:760px){.bitacora-actions-top{align-items:stretch;flex-direction:column}.bitacora-card{grid-template-columns:1fr}.bitacora-date{width:90px}.bitacora-detail-grid{grid-template-columns:1fr}}
      `}</style>
    </>
  );
}
