'use client';

import { useMemo, useState } from 'react';
import PageFrame from '@/components/PageFrame';
import { useData } from '@/components/DataProvider';
import { money, today, uid } from '@/lib/store';
import {
  CheckCircle2,
  Eye,
  FileText,
  FolderKanban,
  Plus,
  Printer,
  ReceiptText,
  Save,
  TrendingUp,
  WalletCards,
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

type ProyectoCobro = {
  id: string;
  cotizacionId: string;
  numero: string;
  nombre: string;
  clienteId: string;
  monto: number;
  avanceFisico: number;
  cobrado: number;
  balance: number;
  avanceFinanciero: number;
  finalizado: boolean;
};

type MovimientoCobro = {
  id: string;
  tipo: 'cobro' | 'gasto';
  fecha: string;
  proyectoId: string;
  concepto: string;
  monto: number;
  metodo: string;
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
      <CobrosAvances />
    </PageFrame>
  );
}

function CobrosAvances() {
  const { data, setData } = useData();

  const movimientos = data.movimientos as MovimientoCobro[];

  const proyectos = useMemo<ProyectoCobro[]>(() => {
    const cotizaciones = data.cotizaciones as CotizacionAprobada[];

    return cotizaciones
      .filter((cotizacion) => normalizar(cotizacion.estado) === 'aprobada')
      .map((cotizacion) => {
        const proyectoId = `pro-${cotizacion.id}`;

        const bitacorasProyecto = data.bitacoras
          .filter(
            (bitacora) =>
              bitacora.proyectoId === proyectoId ||
              bitacora.proyectoId === cotizacion.id
          )
          .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));

        const avanceFisico = bitacorasProyecto.length
          ? Number(bitacorasProyecto[0].avance || 0)
          : 0;

        const cobrado = movimientos
          .filter(
            (movimiento) =>
              movimiento.tipo === 'cobro' &&
              (movimiento.proyectoId === proyectoId ||
                movimiento.proyectoId === cotizacion.id)
          )
          .reduce(
            (total, movimiento) => total + Number(movimiento.monto || 0),
            0
          );

        const monto = Number(cotizacion.total ?? cotizacion.monto ?? 0);
        const balance = Math.max(monto - cobrado, 0);
        const avanceFinanciero =
          monto > 0 ? Math.min((cobrado / monto) * 100, 100) : 0;

        return {
          id: proyectoId,
          cotizacionId: cotizacion.id,
          numero: cotizacion.numero,
          nombre: cotizacion.proyecto,
          clienteId: cotizacion.clienteId,
          monto,
          avanceFisico: Math.min(Math.max(avanceFisico, 0), 100),
          cobrado,
          balance,
          avanceFinanciero,
          finalizado: avanceFisico >= 100 && balance <= 0,
        };
      });
  }, [data.cotizaciones, data.bitacoras, movimientos]);

  const proyectosActivos = proyectos.filter((proyecto) => !proyecto.finalizado);

  const [showForm, setShowForm] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedCobroId, setSelectedCobroId] = useState<string | null>(null);

  const [form, setForm] = useState({
    proyectoId: proyectosActivos[0]?.id || '',
    fecha: today(),
    concepto: 'Abono a proyecto',
    monto: '',
    metodo: 'Transferencia',
  });

  const selectedProject =
    proyectos.find((proyecto) => proyecto.id === selectedProjectId) || null;

  const selectedCobro =
    movimientos.find(
      (movimiento) =>
        movimiento.id === selectedCobroId && movimiento.tipo === 'cobro'
    ) || null;

  const cobrosOrdenados = useMemo(() => {
    return movimientos
      .filter((movimiento) => movimiento.tipo === 'cobro')
      .slice()
      .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
  }, [movimientos]);

  const proyectoActual = proyectos.find(
    (proyecto) => proyecto.id === form.proyectoId
  );

  const openNew = () => {
    const primero = proyectosActivos[0];

    setForm({
      proyectoId: primero?.id || '',
      fecha: today(),
      concepto: 'Abono a proyecto',
      monto: '',
      metodo: 'Transferencia',
    });

    setShowForm(true);
  };

  const saveCobro = () => {
    if (!form.proyectoId) {
      window.alert('Selecciona un proyecto activo.');
      return;
    }

    const proyecto = proyectos.find(
      (item) => item.id === form.proyectoId
    );

    if (!proyecto) {
      window.alert('Proyecto no disponible.');
      return;
    }

    const monto = Number(form.monto || 0);

    if (monto <= 0) {
      window.alert('Escribe un monto válido.');
      return;
    }

    if (monto > proyecto.balance) {
      window.alert(
        `El cobro no puede superar el balance pendiente de ${money(
          proyecto.balance
        )}.`
      );
      return;
    }

    const nuevoCobro: MovimientoCobro = {
      id: uid('cobro'),
      tipo: 'cobro',
      fecha: form.fecha,
      proyectoId: form.proyectoId,
      concepto: form.concepto.trim() || 'Abono a proyecto',
      monto,
      metodo: form.metodo,
    };

    setData((current) => ({
      ...current,
      movimientos: [...current.movimientos, nuevoCobro] as any,
    }));

    setShowForm(false);
  };

  const printReceipt = (cobro: MovimientoCobro) => {
    const proyecto = proyectos.find(
      (item) => item.id === cobro.proyectoId
    );

    const cliente = data.clientes.find(
      (item) => item.id === proyecto?.clienteId
    );

    const printWindow = window.open('', '_blank', 'width=900,height=900');

    if (!printWindow) {
      window.alert('Habilita las ventanas emergentes para imprimir el recibo.');
      return;
    }

    printWindow.document.write(`
      <!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>Recibo de cobro</title>
          <style>
            @page { size: A4; margin: 16mm; }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              font-family: Arial, Helvetica, sans-serif;
              color: #17304d;
            }
            .header {
              padding: 24px;
              color: #fff;
              background: linear-gradient(135deg, #062a56, #07579b);
              border-radius: 14px;
            }
            .header h1 { margin: 0 0 6px; }
            .grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 12px;
              margin-top: 18px;
            }
            .box {
              padding: 14px;
              border: 1px solid #d8e0e8;
              border-radius: 10px;
            }
            .box span {
              display: block;
              color: #6f7f91;
              font-size: 11px;
              text-transform: uppercase;
            }
            .box b {
              display: block;
              margin-top: 6px;
            }
            .amount {
              margin-top: 18px;
              padding: 18px;
              color: #fff;
              background: #07579b;
              border-radius: 12px;
              text-align: center;
            }
            .amount span { display: block; font-size: 12px; }
            .amount b { display: block; margin-top: 6px; font-size: 28px; }
            .signatures {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 50px;
              margin-top: 70px;
              text-align: center;
            }
            .signatures div {
              padding-top: 8px;
              border-top: 1px solid #222;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #6f7f91;
              font-size: 11px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>RECIBO DE COBRO</h1>
            <p>CONSTRUPLATA SRL</p>
          </div>

          <div class="grid">
            <div class="box">
              <span>Proyecto</span>
              <b>${proyecto?.nombre || 'Proyecto'}</b>
            </div>

            <div class="box">
              <span>Cotización</span>
              <b>${proyecto?.numero?.replace('COT-', '#') || '—'}</b>
            </div>

            <div class="box">
              <span>Cliente</span>
              <b>${cliente?.nombre || 'Cliente'}</b>
            </div>

            <div class="box">
              <span>Fecha</span>
              <b>${fechaRD(cobro.fecha)}</b>
            </div>

            <div class="box">
              <span>Concepto</span>
              <b>${cobro.concepto}</b>
            </div>

            <div class="box">
              <span>Método de pago</span>
              <b>${cobro.metodo}</b>
            </div>
          </div>

          <div class="amount">
            <span>Monto recibido</span>
            <b>${money(cobro.monto)}</b>
          </div>

          <div class="signatures">
            <div>Firma del cliente</div>
            <div>Firma autorizada</div>
          </div>

          <div class="footer">
            Documento generado desde CONSTRUPLATA PRO
          </div>

          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const totalCobrado = proyectos.reduce(
    (total, proyecto) => total + proyecto.cobrado,
    0
  );

  const totalBalance = proyectosActivos.reduce(
    (total, proyecto) => total + proyecto.balance,
    0
  );

  return (
    <>
      <div className="cobros-top">
        <div className="cobros-banner">
          <TrendingUp size={22} />
          <div>
            <b>Avance físico y financiero en un solo lugar</b>
            <span>
              El avance físico viene de Bitácoras. El financiero se calcula con
              los cobros registrados.
            </span>
          </div>
        </div>

        <button
          type="button"
          className="primary"
          onClick={openNew}
          disabled={!proyectosActivos.length}
        >
          <Plus size={18} />
          Registrar cobro
        </button>
      </div>

      <section className="stats">
        <article className="stat">
          <FolderKanban size={21} />
          <span>Proyectos activos</span>
          <b>{proyectosActivos.length}</b>
        </article>

        <article className="stat">
          <WalletCards size={21} />
          <span>Total cobrado</span>
          <b>{money(totalCobrado)}</b>
        </article>

        <article className="stat">
          <ReceiptText size={21} />
          <span>Balance pendiente</span>
          <b>{money(totalBalance)}</b>
        </article>

        <article className="stat">
          <CheckCircle2 size={21} />
          <span>Proyectos saldados</span>
          <b>{proyectos.filter((proyecto) => proyecto.finalizado).length}</b>
        </article>
      </section>

      {showForm && (
        <section className="form-card cobro-form">
          <div className="cobro-form-head">
            <div>
              <span className="eyebrow">Nuevo cobro</span>
              <h3>Registrar pago de cliente</h3>
            </div>

            <button
              type="button"
              className="icon"
              onClick={() => setShowForm(false)}
            >
              <X size={18} />
            </button>
          </div>

          <div className="form-grid">
            <label>
              Proyecto activo
              <select
                value={form.proyectoId}
                onChange={(event) =>
                  setForm({
                    ...form,
                    proyectoId: event.target.value,
                    monto: '',
                  })
                }
              >
                <option value="">Seleccionar proyecto</option>

                {proyectosActivos.map((proyecto) => (
                  <option key={proyecto.id} value={proyecto.id}>
                    {proyecto.nombre} · {proyecto.numero.replace('COT-', '#')}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Fecha
              <input
                type="date"
                value={form.fecha}
                onChange={(event) =>
                  setForm({
                    ...form,
                    fecha: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Concepto
              <input
                value={form.concepto}
                onChange={(event) =>
                  setForm({
                    ...form,
                    concepto: event.target.value,
                  })
                }
                placeholder="Ej: Primer abono"
              />
            </label>

            <label>
              Método de pago
              <select
                value={form.metodo}
                onChange={(event) =>
                  setForm({
                    ...form,
                    metodo: event.target.value,
                  })
                }
              >
                <option>Transferencia</option>
                <option>Efectivo</option>
                <option>Cheque</option>
                <option>Tarjeta</option>
                <option>Depósito bancario</option>
              </select>
            </label>

            <label>
              Monto recibido
              <input
                type="number"
                min="0"
                max={proyectoActual?.balance || 0}
                step="0.01"
                value={form.monto}
                onChange={(event) =>
                  setForm({
                    ...form,
                    monto: event.target.value,
                  })
                }
                placeholder="0.00"
              />
              <small>
                Balance disponible: {money(proyectoActual?.balance || 0)}
              </small>
            </label>
          </div>

          <div className="cobro-form-actions">
            <button
              type="button"
              className="ghost-client-btn"
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </button>

            <button
              type="button"
              className="primary"
              onClick={saveCobro}
            >
              <Save size={17} />
              Guardar cobro
            </button>
          </div>
        </section>
      )}

      <div className="cobros-project-grid">
        {proyectos.length ? (
          proyectos.map((proyecto) => {
            const cliente = data.clientes.find(
              (item) => item.id === proyecto.clienteId
            );

            return (
              <article className="cobro-project-card" key={proyecto.id}>
                <div className="cobro-project-head">
                  <div>
                    <span
                      className={
                        proyecto.finalizado
                          ? 'cobro-status finished'
                          : 'cobro-status active'
                      }
                    >
                      {proyecto.finalizado
                        ? 'Finalizado y saldado'
                        : 'Proyecto activo'}
                    </span>

                    <h3>{proyecto.nombre}</h3>
                    <p>
                      {proyecto.numero.replace('COT-', '#')} ·{' '}
                      {cliente?.nombre || 'Sin cliente'}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="project-view-button"
                    title="Ver detalle"
                    onClick={() => setSelectedProjectId(proyecto.id)}
                  >
                    <Eye size={18} />
                  </button>
                </div>

                <div className="dual-progress">
                  <div>
                    <div className="progress-copy">
                      <span>Avance físico</span>
                      <b>{proyecto.avanceFisico.toFixed(0)}%</b>
                    </div>
                    <div className="progress large">
                      <i style={{ width: `${proyecto.avanceFisico}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="progress-copy">
                      <span>Avance financiero</span>
                      <b>{proyecto.avanceFinanciero.toFixed(0)}%</b>
                    </div>
                    <div className="progress large financial">
                      <i style={{ width: `${proyecto.avanceFinanciero}%` }} />
                    </div>
                  </div>
                </div>

                <div className="cobro-money-grid">
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
                </div>
              </article>
            );
          })
        ) : (
          <div className="cobros-empty">
            <FolderKanban size={38} />
            <h3>No hay proyectos disponibles</h3>
            <p>
              Los proyectos aparecerán cuando una cotización cambie a Aprobada.
            </p>
          </div>
        )}
      </div>

      <section className="cobros-history">
        <div className="cobros-history-head">
          <div>
            <span className="eyebrow">Historial</span>
            <h3>Cobros registrados</h3>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Proyecto</th>
                <th>Concepto</th>
                <th>Método</th>
                <th>Monto</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {cobrosOrdenados.length ? (
                cobrosOrdenados.map((cobro) => (
                  <tr key={cobro.id}>
                    <td>{fechaRD(cobro.fecha)}</td>
                    <td>
                      {proyectos.find(
                        (proyecto) => proyecto.id === cobro.proyectoId
                      )?.nombre || 'Proyecto'}
                    </td>
                    <td>{cobro.concepto}</td>
                    <td>{cobro.metodo}</td>
                    <td>
                      <b>{money(cobro.monto)}</b>
                    </td>
                    <td>
                      <div className="cliente-actions">
                        <button
                          type="button"
                          className="cliente-action-btn edit"
                          title="Ver recibo"
                          onClick={() => setSelectedCobroId(cobro.id)}
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          className="cliente-action-btn edit"
                          title="Imprimir recibo"
                          onClick={() => printReceipt(cobro)}
                        >
                          <Printer size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <div className="empty">
                      No hay cobros registrados.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedProject && (
        <div
          className="cp-modal-overlay"
          onClick={() => setSelectedProjectId(null)}
        >
          <div
            className="cobro-detail-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cobro-detail-head">
              <div>
                <span className="eyebrow">Detalle financiero</span>
                <h2>{selectedProject.nombre}</h2>
              </div>

              <button
                type="button"
                className="icon"
                onClick={() => setSelectedProjectId(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="cobro-detail-grid">
              <div>
                <FileText size={18} />
                <span>Contratado</span>
                <b>{money(selectedProject.monto)}</b>
              </div>

              <div>
                <WalletCards size={18} />
                <span>Cobrado</span>
                <b>{money(selectedProject.cobrado)}</b>
              </div>

              <div>
                <ReceiptText size={18} />
                <span>Pendiente</span>
                <b>{money(selectedProject.balance)}</b>
              </div>

              <div>
                <TrendingUp size={18} />
                <span>Avance físico</span>
                <b>{selectedProject.avanceFisico.toFixed(0)}%</b>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedCobro && (
        <div
          className="cp-modal-overlay"
          onClick={() => setSelectedCobroId(null)}
        >
          <div
            className="cobro-detail-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cobro-detail-head">
              <div>
                <span className="eyebrow">Recibo de cobro</span>
                <h2>{money(selectedCobro.monto)}</h2>
                <p>{fechaRD(selectedCobro.fecha)}</p>
              </div>

              <button
                type="button"
                className="icon"
                onClick={() => setSelectedCobroId(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="cobro-detail-grid">
              <div>
                <FileText size={18} />
                <span>Concepto</span>
                <b>{selectedCobro.concepto}</b>
              </div>

              <div>
                <WalletCards size={18} />
                <span>Método</span>
                <b>{selectedCobro.metodo}</b>
              </div>
            </div>

            <div className="cobro-detail-actions">
              <button
                type="button"
                className="primary"
                onClick={() => printReceipt(selectedCobro)}
              >
                <Printer size={17} />
                Imprimir recibo
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .cobros-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .cobros-banner {
          flex: 1;
          min-height: 62px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid var(--line);
          border-radius: 17px;
          color: var(--blue);
          background: rgba(23, 105, 224, 0.07);
        }

        .cobros-banner div,
        .cobros-banner b,
        .cobros-banner span {
          display: block;
        }

        .cobros-banner span {
          margin-top: 4px;
          color: var(--muted);
          font-size: 12px;
        }

        .cobro-form {
          margin-bottom: 22px;
        }

        .cobro-form-head {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 18px;
        }

        .cobro-form-head h3 {
          margin: 6px 0 0;
        }

        .cobro-form small {
          display: block;
          margin-top: 5px;
          color: var(--muted);
          font-size: 10px;
        }

        .cobro-form-actions {
          margin-top: 18px;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .cobros-project-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .cobro-project-card {
          padding: 22px;
          border: 1px solid var(--line);
          border-radius: 22px;
          background: var(--card);
          box-shadow: var(--soft-shadow);
        }

        .cobro-project-head {
          display: flex;
          justify-content: space-between;
          gap: 16px;
        }

        .cobro-project-card h3 {
          margin: 12px 0 5px;
          font-size: 20px;
        }

        .cobro-project-card p {
          margin: 0;
          color: var(--muted);
          font-size: 12px;
        }

        .cobro-status {
          display: inline-flex;
          padding: 7px 10px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 900;
        }

        .cobro-status.active {
          color: #1769e0;
          background: rgba(23, 105, 224, 0.1);
        }

        .cobro-status.finished {
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

        .dual-progress {
          display: grid;
          gap: 14px;
          margin-top: 20px;
        }

        .progress-copy {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 7px;
        }

        .progress-copy span {
          color: var(--muted);
          font-size: 11px;
        }

        .financial i {
          background: linear-gradient(90deg, #14946b, #35c38f);
        }

        .cobro-money-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 18px;
        }

        .cobro-money-grid > div {
          padding: 13px;
          border: 1px solid var(--line);
          border-radius: 14px;
        }

        .cobro-money-grid span,
        .cobro-money-grid b {
          display: block;
        }

        .cobro-money-grid span {
          color: var(--muted);
          font-size: 10px;
        }

        .cobro-money-grid b {
          margin-top: 5px;
          font-size: 13px;
        }

        .cobros-history {
          margin-top: 24px;
          padding: 20px;
          border: 1px solid var(--line);
          border-radius: 20px;
          background: var(--card);
        }

        .cobros-history-head h3 {
          margin: 6px 0 16px;
        }

        .cobros-empty {
          grid-column: 1 / -1;
          min-height: 250px;
          display: grid;
          place-items: center;
          align-content: center;
          text-align: center;
          border: 1px dashed var(--line);
          border-radius: 20px;
          color: var(--muted);
        }

        .cobros-empty h3 {
          margin: 14px 0 5px;
          color: var(--text);
        }

        .cobros-empty p {
          margin: 0;
        }

        .cobro-detail-modal {
          width: min(760px, 100%);
          padding: 26px;
          border: 1px solid var(--line);
          border-radius: 24px;
          background: var(--card);
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.3);
        }

        .cobro-detail-head {
          display: flex;
          justify-content: space-between;
          gap: 18px;
        }

        .cobro-detail-head h2 {
          margin: 7px 0;
        }

        .cobro-detail-head p {
          margin: 0;
          color: var(--muted);
        }

        .cobro-detail-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-top: 20px;
        }

        .cobro-detail-grid > div {
          padding: 14px;
          border: 1px solid var(--line);
          border-radius: 14px;
        }

        .cobro-detail-grid svg {
          color: var(--blue);
        }

        .cobro-detail-grid span,
        .cobro-detail-grid b {
          display: block;
        }

        .cobro-detail-grid span {
          margin-top: 8px;
          color: var(--muted);
          font-size: 10px;
        }

        .cobro-detail-grid b {
          margin-top: 5px;
        }

        .cobro-detail-actions {
          margin-top: 20px;
          display: flex;
          justify-content: flex-end;
        }

        @media (max-width: 850px) {
          .cobros-project-grid {
            grid-template-columns: 1fr;
          }

          .cobro-detail-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 620px) {
          .cobros-top {
            align-items: stretch;
            flex-direction: column;
          }

          .cobro-money-grid,
          .cobro-detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
