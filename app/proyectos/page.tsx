'use client';

import { useMemo, useState } from 'react';
import PageFrame from '@/components/PageFrame';
import { useData } from '@/components/DataProvider';
import { money } from '@/lib/store';
import {
  Building2,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  FolderKanban,
  History,
  ReceiptText,
  UserRound,
  WalletCards,
  X,
} from 'lucide-react';

type Partida = {
  id: string;
  descripcion: string;
  detalle?: string;
  cantidad: number;
  unidad: string;
  precio: number;
};

type CotizacionProyecto = {
  id: string;
  numero: string;
  clienteId: string;
  proyecto: string;
  monto: number;
  estado: string;
  descripcion?: string;
  fecha?: string;
  vendedor?: string;
  subtotal?: number;
  itbis?: number;
  total?: number;
  partidas?: Partida[];
};

type ProyectoVista = {
  id: string;
  cotizacionId: string;
  numero: string;
  clienteId: string;
  nombre: string;
  descripcion: string;
  fecha: string;
  monto: number;
  avance: number;
  cobrado: number;
  gastos: number;
  balance: number;
  estado: 'En ejecución' | 'Finalizado pendiente de saldo' | 'Finalizado y saldado';
  finalizado: boolean;
  partidas: Partida[];
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
      <Proyectos />
    </PageFrame>
  );
}

function Proyectos() {
  const { data } = useData();

  const [tab, setTab] = useState<'activos' | 'historial'>('activos');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const proyectos = useMemo<ProyectoVista[]>(() => {
    const cotizaciones = data.cotizaciones as CotizacionProyecto[];

    return cotizaciones
      .filter((cotizacion) => normalizar(cotizacion.estado) === 'aprobada')
      .map((cotizacion) => {
        const proyectoId = `pro-${cotizacion.id}`;

        const bitacoras = data.bitacoras
          .filter(
            (bitacora) =>
              bitacora.proyectoId === proyectoId ||
              bitacora.proyectoId === cotizacion.id
          )
          .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));

        const avance = bitacoras.length
          ? Number(bitacoras[0].avance || 0)
          : 0;

        const movimientos = data.movimientos.filter(
          (movimiento) =>
            movimiento.proyectoId === proyectoId ||
            movimiento.proyectoId === cotizacion.id
        );

        const cobrado = movimientos
          .filter((movimiento) => movimiento.tipo === 'cobro')
          .reduce(
            (total, movimiento) => total + Number(movimiento.monto || 0),
            0
          );

        const gastos = movimientos
          .filter((movimiento) => movimiento.tipo === 'gasto')
          .reduce(
            (total, movimiento) => total + Number(movimiento.monto || 0),
            0
          );

        const monto = Number(
          cotizacion.total ?? cotizacion.monto ?? cotizacion.subtotal ?? 0
        );

        const balance = Math.max(monto - cobrado, 0);
        const finalizado = avance >= 100 && balance <= 0;

        let estado: ProyectoVista['estado'] = 'En ejecución';

        if (avance >= 100 && balance > 0) {
          estado = 'Finalizado pendiente de saldo';
        }

        if (finalizado) {
          estado = 'Finalizado y saldado';
        }

        return {
          id: proyectoId,
          cotizacionId: cotizacion.id,
          numero: cotizacion.numero,
          clienteId: cotizacion.clienteId,
          nombre: cotizacion.proyecto,
          descripcion: cotizacion.descripcion || cotizacion.proyecto,
          fecha: cotizacion.fecha || '',
          monto,
          avance: Math.min(Math.max(avance, 0), 100),
          cobrado,
          gastos,
          balance,
          estado,
          finalizado,
          partidas: cotizacion.partidas || [],
        };
      });
  }, [data.cotizaciones, data.bitacoras, data.movimientos]);

  const activos = proyectos.filter((proyecto) => !proyecto.finalizado);
  const historial = proyectos.filter((proyecto) => proyecto.finalizado);
  const visibles = tab === 'activos' ? activos : historial;

  const selected =
    proyectos.find((proyecto) => proyecto.id === selectedId) || null;

  const totalActivo = activos.reduce(
    (total, proyecto) => total + proyecto.monto,
    0
  );

  const balanceActivo = activos.reduce(
    (total, proyecto) => total + proyecto.balance,
    0
  );

  return (
    <>
      <section className="projects-lock-banner">
        <div className="projects-lock-icon">
          <FolderKanban size={23} />
        </div>

        <div>
          <b>Los proyectos nacen de cotizaciones aprobadas</b>
          <span>
            Aquí no se crean ni modifican proyectos. Solo se consultan los
            detalles, avances, cobros, gastos y balance.
          </span>
        </div>
      </section>

      <section className="stats">
        <article className="stat">
          <Building2 size={21} />
          <span>Proyectos activos</span>
          <b>{activos.length}</b>
        </article>

        <article className="stat">
          <CheckCircle2 size={21} />
          <span>Finalizados y saldados</span>
          <b>{historial.length}</b>
        </article>

        <article className="stat">
          <FileText size={21} />
          <span>Monto activo</span>
          <b>{money(totalActivo)}</b>
        </article>

        <article className="stat">
          <WalletCards size={21} />
          <span>Balance pendiente</span>
          <b>{money(balanceActivo)}</b>
        </article>
      </section>

      <div className="projects-tabs">
        <button
          type="button"
          className={tab === 'activos' ? 'active' : ''}
          onClick={() => setTab('activos')}
        >
          <Clock3 size={17} />
          Activos
          <span>{activos.length}</span>
        </button>

        <button
          type="button"
          className={tab === 'historial' ? 'active' : ''}
          onClick={() => setTab('historial')}
        >
          <History size={17} />
          Historial
          <span>{historial.length}</span>
        </button>
      </div>

      <div className="projects-readonly-grid">
        {visibles.length ? (
          visibles.map((proyecto) => {
            const cliente = data.clientes.find(
              (item) => item.id === proyecto.clienteId
            );

            return (
              <article className="project-readonly-card" key={proyecto.id}>
                <div className="project-card-head">
                  <div>
                    <span
                      className={
                        proyecto.finalizado
                          ? 'project-status finished'
                          : proyecto.avance >= 100
                            ? 'project-status pending'
                            : 'project-status active'
                      }
                    >
                      {proyecto.estado}
                    </span>

                    <h3>{proyecto.nombre}</h3>
                    <p>
                      Cotización {proyecto.numero.replace('COT-', '#')} ·{' '}
                      {cliente?.nombre || 'Sin cliente'}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="project-view-button"
                    onClick={() => setSelectedId(proyecto.id)}
                    title="Ver detalles"
                  >
                    <Eye size={18} />
                  </button>
                </div>

                <div className="project-progress-copy">
                  <span>Avance registrado desde Bitácoras</span>
                  <b>{proyecto.avance}%</b>
                </div>

                <div className="progress large">
                  <i style={{ width: `${proyecto.avance}%` }} />
                </div>

                <div className="project-money-grid">
                  <div>
                    <span>Contratado</span>
                    <b>{money(proyecto.monto)}</b>
                  </div>

                  <div>
                    <span>Cobrado</span>
                    <b>{money(proyecto.cobrado)}</b>
                  </div>

                  <div>
                    <span>Pendiente</span>
                    <b>{money(proyecto.balance)}</b>
                  </div>

                  <div>
                    <span>Gastos</span>
                    <b>{money(proyecto.gastos)}</b>
                  </div>
                </div>

                {proyecto.avance >= 100 && proyecto.balance > 0 && (
                  <div className="project-alert">
                    El proyecto terminó físicamente, pero todavía tiene un
                    balance pendiente de {money(proyecto.balance)}.
                  </div>
                )}

                {proyecto.finalizado && (
                  <div className="project-complete">
                    <CheckCircle2 size={17} />
                    Cuenta saldada. Conservado en el historial.
                  </div>
                )}
              </article>
            );
          })
        ) : (
          <div className="projects-empty">
            <FolderKanban size={38} />
            <h3>
              {tab === 'activos'
                ? 'No hay proyectos activos'
                : 'El historial está vacío'}
            </h3>
            <p>
              {tab === 'activos'
                ? 'Los proyectos aparecerán cuando una cotización cambie a Aprobada.'
                : 'Un proyecto pasa al historial al alcanzar 100% de avance y RD$0.00 de balance.'}
            </p>
          </div>
        )}
      </div>

      {selected && (
        <div
          className="cp-modal-overlay"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="project-detail-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="project-detail-head">
              <div>
                <span className="eyebrow">Detalle de proyecto</span>
                <h2>{selected.nombre}</h2>
                <p>Información de consulta. No puede modificarse aquí.</p>
              </div>

              <button
                type="button"
                className="icon"
                onClick={() => setSelectedId(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="project-detail-stats">
              <div>
                <FileText size={18} />
                <span>Cotización</span>
                <b>{selected.numero.replace('COT-', '#')}</b>
              </div>

              <div>
                <Clock3 size={18} />
                <span>Avance</span>
                <b>{selected.avance}%</b>
              </div>

              <div>
                <WalletCards size={18} />
                <span>Balance</span>
                <b>{money(selected.balance)}</b>
              </div>

              <div>
                <ReceiptText size={18} />
                <span>Gastos</span>
                <b>{money(selected.gastos)}</b>
              </div>
            </div>

            <section className="project-detail-section">
              <h3>Información general</h3>

              <div className="project-info-grid">
                <div>
                  <span>Cliente</span>
                  <b>
                    {data.clientes.find(
                      (item) => item.id === selected.clienteId
                    )?.nombre || 'Sin cliente'}
                  </b>
                </div>

                <div>
                  <span>Fecha de aprobación</span>
                  <b>{fechaRD(selected.fecha)}</b>
                </div>

                <div>
                  <span>Monto contratado</span>
                  <b>{money(selected.monto)}</b>
                </div>

                <div>
                  <span>Estado</span>
                  <b>{selected.estado}</b>
                </div>

                <div className="wide">
                  <span>Descripción</span>
                  <b>{selected.descripcion || 'Sin descripción'}</b>
                </div>
              </div>
            </section>

            <section className="project-detail-section">
              <h3>Partidas aprobadas</h3>

              {selected.partidas.length ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Descripción</th>
                        <th>Cantidad</th>
                        <th>Precio</th>
                        <th>Total</th>
                      </tr>
                    </thead>

                    <tbody>
                      {selected.partidas.map((partida) => (
                        <tr key={partida.id}>
                          <td>
                            <b>{partida.descripcion}</b>
                            {partida.detalle && (
                              <small>{partida.detalle}</small>
                            )}
                          </td>
                          <td>
                            {partida.cantidad} {partida.unidad}
                          </td>
                          <td>{money(partida.precio)}</td>
                          <td>
                            {money(partida.cantidad * partida.precio)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty">
                  Esta cotización no tiene partidas detalladas.
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      <style jsx>{`
        .projects-lock-banner {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 20px;
          padding: 18px 20px;
          border: 1px solid var(--line);
          border-radius: 18px;
          background: rgba(23, 105, 224, 0.07);
        }

        .projects-lock-icon {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          border-radius: 15px;
          color: var(--blue);
          background: rgba(23, 105, 224, 0.12);
        }

        .projects-lock-banner b,
        .projects-lock-banner span {
          display: block;
        }

        .projects-lock-banner span {
          margin-top: 5px;
          color: var(--muted);
          font-size: 13px;
        }

        .projects-tabs {
          width: fit-content;
          margin: 22px 0;
          padding: 6px;
          display: flex;
          gap: 8px;
          border: 1px solid var(--line);
          border-radius: 16px;
          background: var(--card);
        }

        .projects-tabs button {
          min-height: 42px;
          padding: 9px 14px;
          border: 0;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--muted);
          background: transparent;
          font-weight: 800;
        }

        .projects-tabs button.active {
          color: #fff;
          background: linear-gradient(135deg, #1769e0, #168edc);
        }

        .projects-tabs button span {
          padding: 3px 7px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.13);
          font-size: 11px;
        }

        .projects-readonly-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .project-readonly-card {
          padding: 22px;
          border: 1px solid var(--line);
          border-radius: 22px;
          background: var(--card);
          box-shadow: var(--soft-shadow);
        }

        .project-card-head {
          display: flex;
          justify-content: space-between;
          gap: 16px;
        }

        .project-readonly-card h3 {
          margin: 12px 0 5px;
          font-size: 20px;
        }

        .project-readonly-card p {
          margin: 0;
          color: var(--muted);
          font-size: 12px;
        }

        .project-status {
          display: inline-flex;
          padding: 7px 10px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 900;
        }

        .project-status.active {
          color: #1769e0;
          background: rgba(23, 105, 224, 0.1);
        }

        .project-status.pending {
          color: #a56b00;
          background: rgba(230, 145, 20, 0.12);
        }

        .project-status.finished {
          color: #19885b;
          background: rgba(25, 136, 91, 0.12);
        }

        .project-view-button {
          width: 44px;
          height: 44px;
          border: 1px solid var(--line);
          border-radius: 14px;
          display: grid;
          place-items: center;
          color: var(--blue);
          background: rgba(23, 105, 224, 0.07);
        }

        .project-progress-copy {
          margin: 20px 0 8px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }

        .project-progress-copy span {
          color: var(--muted);
          font-size: 12px;
        }

        .project-money-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-top: 18px;
        }

        .project-money-grid > div {
          padding: 13px;
          border: 1px solid var(--line);
          border-radius: 14px;
        }

        .project-money-grid span,
        .project-money-grid b {
          display: block;
        }

        .project-money-grid span {
          color: var(--muted);
          font-size: 11px;
        }

        .project-money-grid b {
          margin-top: 5px;
          font-size: 14px;
        }

        .project-alert,
        .project-complete {
          margin-top: 15px;
          padding: 12px 14px;
          border-radius: 13px;
          font-size: 12px;
        }

        .project-alert {
          color: #955f00;
          background: rgba(230, 145, 20, 0.1);
        }

        .project-complete {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #19885b;
          background: rgba(25, 136, 91, 0.1);
        }

        .projects-empty {
          grid-column: 1 / -1;
          min-height: 260px;
          padding: 30px;
          display: grid;
          place-items: center;
          align-content: center;
          text-align: center;
          border: 1px dashed var(--line);
          border-radius: 22px;
          color: var(--muted);
        }

        .projects-empty h3 {
          margin: 15px 0 5px;
          color: var(--text);
        }

        .projects-empty p {
          max-width: 520px;
          margin: 0;
          line-height: 1.6;
        }

        .project-detail-modal {
          width: min(980px, 100%);
          max-height: calc(100vh - 48px);
          padding: 26px;
          overflow: auto;
          border: 1px solid var(--line);
          border-radius: 24px;
          background: var(--card);
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.3);
        }

        .project-detail-head {
          display: flex;
          justify-content: space-between;
          gap: 20px;
        }

        .project-detail-head h2 {
          margin: 7px 0;
          font-size: 28px;
        }

        .project-detail-head p {
          margin: 0;
          color: var(--muted);
        }

        .project-detail-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-top: 22px;
        }

        .project-detail-stats > div,
        .project-info-grid > div {
          padding: 14px;
          border: 1px solid var(--line);
          border-radius: 14px;
        }

        .project-detail-stats svg {
          color: var(--blue);
        }

        .project-detail-stats span,
        .project-detail-stats b,
        .project-info-grid span,
        .project-info-grid b {
          display: block;
        }

        .project-detail-stats span,
        .project-info-grid span {
          margin-top: 8px;
          color: var(--muted);
          font-size: 11px;
        }

        .project-detail-stats b,
        .project-info-grid b {
          margin-top: 5px;
        }

        .project-detail-section {
          margin-top: 22px;
          padding-top: 20px;
          border-top: 1px solid var(--line);
        }

        .project-detail-section h3 {
          margin: 0 0 14px;
        }

        .project-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .project-info-grid .wide {
          grid-column: 1 / -1;
        }

        .project-detail-section small {
          display: block;
          margin-top: 4px;
          color: var(--muted);
        }

        @media (max-width: 900px) {
          .projects-readonly-grid {
            grid-template-columns: 1fr;
          }

          .project-detail-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 620px) {
          .projects-tabs {
            width: 100%;
          }

          .projects-tabs button {
            flex: 1;
            justify-content: center;
          }

          .project-money-grid,
          .project-detail-stats,
          .project-info-grid {
            grid-template-columns: 1fr;
          }

          .project-info-grid .wide {
            grid-column: auto;
          }
        }
      `}</style>
    </>
  );
}
