'use client';

import { useMemo, useState } from 'react';
import PageFrame from '@/components/PageFrame';
import { useData } from '@/components/DataProvider';
import { money, today, uid } from '@/lib/store';
import {
  Eye,
  FileText,
  Plus,
  Printer,
  ReceiptText,
  Save,
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

type FacturaExtendida = {
  id: string;
  numero: string;
  clienteId: string;
  proyectoId: string;
  concepto: string;
  monto: number;
  pagado: number;
  estado: string;
  fecha?: string;
  vencimiento?: string;
  subtotal?: number;
  itbis?: number;
  requiereComprobante?: boolean;
};

type ProyectoFactura = {
  id: string;
  cotizacionId: string;
  numeroCotizacion: string;
  nombre: string;
  clienteId: string;
  monto: number;
  facturado: number;
  disponible: number;
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
      <Facturacion />
    </PageFrame>
  );
}

function Facturacion() {
  const { data, setData } = useData();

  const facturas = data.facturas as FacturaExtendida[];

  const proyectos = useMemo<ProyectoFactura[]>(() => {
    const cotizaciones = data.cotizaciones as CotizacionAprobada[];

    return cotizaciones
      .filter((cotizacion) => normalizar(cotizacion.estado) === 'aprobada')
      .map((cotizacion) => {
        const proyectoId = `pro-${cotizacion.id}`;

        const facturado = facturas
          .filter(
            (factura) =>
              factura.proyectoId === proyectoId ||
              factura.proyectoId === cotizacion.id
          )
          .reduce(
            (total, factura) => total + Number(factura.monto || 0),
            0
          );

        const monto = Number(cotizacion.total ?? cotizacion.monto ?? 0);

        return {
          id: proyectoId,
          cotizacionId: cotizacion.id,
          numeroCotizacion: cotizacion.numero,
          nombre: cotizacion.proyecto,
          clienteId: cotizacion.clienteId,
          monto,
          facturado,
          disponible: Math.max(monto - facturado, 0),
        };
      });
  }, [data.cotizaciones, facturas]);

  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [form, setForm] = useState({
    proyectoId: proyectos[0]?.id || '',
    fecha: today(),
    vencimiento: today(),
    concepto: 'Factura por avance de proyecto',
    subtotal: '',
    requiereComprobante: false,
  });

  const nextNumber = useMemo(() => {
    const max = facturas.reduce((highest, factura) => {
      const match = String(factura.numero || '').match(/(\d+)/);
      return Math.max(highest, match ? Number(match[1]) : 0);
    }, 0);

    return `FAC-${String(max + 1).padStart(4, '0')}`;
  }, [facturas]);

  const selected =
    facturas.find((factura) => factura.id === selectedId) || null;

  const proyectoActual = proyectos.find(
    (proyecto) => proyecto.id === form.proyectoId
  );

  const subtotal = Number(form.subtotal || 0);
  const itbis = form.requiereComprobante ? subtotal * 0.18 : 0;
  const total = subtotal + itbis;

  const estadoFactura = (factura: FacturaExtendida) => {
    const balance = Math.max(
      Number(factura.monto || 0) - Number(factura.pagado || 0),
      0
    );

    if (balance <= 0) return 'Pagada';
    if (Number(factura.pagado || 0) > 0) return 'Parcial';

    const vencimiento = factura.vencimiento || '';

    if (vencimiento && vencimiento < today()) return 'Vencida';

    return 'Pendiente';
  };

  const saveFactura = () => {
    if (!form.proyectoId) {
      window.alert('Selecciona un proyecto.');
      return;
    }

    if (!proyectoActual) {
      window.alert('Proyecto no disponible.');
      return;
    }

    if (subtotal <= 0) {
      window.alert('Escribe un subtotal válido.');
      return;
    }

    if (total > proyectoActual.disponible) {
      window.alert(
        `La factura no puede superar el monto disponible de ${money(
          proyectoActual.disponible
        )}.`
      );
      return;
    }

    const nuevaFactura: FacturaExtendida = {
      id: uid('fac'),
      numero: nextNumber,
      clienteId: proyectoActual.clienteId,
      proyectoId: proyectoActual.id,
      concepto: form.concepto.trim() || 'Factura de proyecto',
      monto: total,
      pagado: 0,
      estado: 'Pendiente',
      fecha: form.fecha,
      vencimiento: form.vencimiento,
      subtotal,
      itbis,
      requiereComprobante: form.requiereComprobante,
    };

    setData((current) => ({
      ...current,
      facturas: [...current.facturas, nuevaFactura] as any,
    }));

    setShowForm(false);
  };

  const printFactura = (factura: FacturaExtendida) => {
    const proyecto = proyectos.find(
      (item) => item.id === factura.proyectoId
    );

    const cliente = data.clientes.find(
      (item) => item.id === factura.clienteId
    );

    const balance = Math.max(
      Number(factura.monto || 0) - Number(factura.pagado || 0),
      0
    );

    const printWindow = window.open('', '_blank', 'width=900,height=900');

    if (!printWindow) {
      window.alert('Habilita las ventanas emergentes para imprimir.');
      return;
    }

    printWindow.document.write(`
      <!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>${factura.numero}</title>
          <style>
            @page { size: A4; margin: 16mm; }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              font-family: Arial, Helvetica, sans-serif;
              color: #17304d;
            }
            .header {
              display: flex;
              justify-content: space-between;
              gap: 20px;
              padding: 24px;
              color: #fff;
              background: linear-gradient(135deg, #062a56, #07579b);
              border-radius: 14px;
            }
            .header h1 { margin: 0 0 8px; }
            .header p { margin: 0; }
            .grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 12px;
              margin-top: 18px;
            }
            .box {
              padding: 14px;
              border: 1px solid #d7e0e9;
              border-radius: 10px;
            }
            .box span {
              display: block;
              color: #6e7d8d;
              font-size: 11px;
              text-transform: uppercase;
            }
            .box b {
              display: block;
              margin-top: 6px;
            }
            table {
              width: 100%;
              margin-top: 20px;
              border-collapse: collapse;
            }
            th, td {
              padding: 12px;
              border: 1px solid #d7e0e9;
              text-align: left;
            }
            th {
              color: #fff;
              background: #07579b;
            }
            .totals {
              width: 340px;
              margin: 18px 0 0 auto;
              border: 1px solid #d7e0e9;
              border-radius: 10px;
              overflow: hidden;
            }
            .totals div {
              display: flex;
              justify-content: space-between;
              padding: 12px;
              border-bottom: 1px solid #d7e0e9;
            }
            .totals div:last-child {
              color: #fff;
              background: #07579b;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #6e7d8d;
              font-size: 11px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>FACTURA</h1>
              <p>CONSTRUPLATA SRL</p>
            </div>
            <div>
              <h2>${factura.numero}</h2>
              <p>Estado: ${estadoFactura(factura)}</p>
            </div>
          </div>

          <div class="grid">
            <div class="box">
              <span>Cliente</span>
              <b>${cliente?.nombre || 'Cliente'}</b>
            </div>
            <div class="box">
              <span>Proyecto</span>
              <b>${proyecto?.nombre || 'Proyecto'}</b>
            </div>
            <div class="box">
              <span>Fecha</span>
              <b>${fechaRD(factura.fecha || '')}</b>
            </div>
            <div class="box">
              <span>Vencimiento</span>
              <b>${fechaRD(factura.vencimiento || '')}</b>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${factura.concepto}</td>
                <td>${money(Number(factura.subtotal ?? factura.monto))}</td>
              </tr>
            </tbody>
          </table>

          <div class="totals">
            <div><span>Subtotal</span><b>${money(
              Number(factura.subtotal ?? factura.monto)
            )}</b></div>
            ${
              factura.requiereComprobante
                ? `<div><span>ITBIS (18%)</span><b>${money(
                    Number(factura.itbis || 0)
                  )}</b></div>`
                : ''
            }
            <div><span>Total</span><b>${money(factura.monto)}</b></div>
            <div><span>Pagado</span><b>${money(factura.pagado)}</b></div>
            <div><span>Balance</span><b>${money(balance)}</b></div>
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

  const totalFacturado = facturas.reduce(
    (total, factura) => total + Number(factura.monto || 0),
    0
  );

  const totalPagado = facturas.reduce(
    (total, factura) => total + Number(factura.pagado || 0),
    0
  );

  const totalPendiente = Math.max(totalFacturado - totalPagado, 0);

  return (
    <>
      <div className="facturas-top">
        <div className="facturas-banner">
          <FileText size={22} />
          <div>
            <b>Facturación conectada con proyectos aprobados</b>
            <span>
              Solo se factura sobre proyectos provenientes de cotizaciones
              aprobadas.
            </span>
          </div>
        </div>

        <button
          type="button"
          className="primary"
          onClick={() => setShowForm(true)}
          disabled={!proyectos.length}
        >
          <Plus size={18} />
          Nueva factura
        </button>
      </div>

      <section className="stats">
        <article className="stat">
          <FileText size={21} />
          <span>Total facturado</span>
          <b>{money(totalFacturado)}</b>
        </article>

        <article className="stat">
          <WalletCards size={21} />
          <span>Total pagado</span>
          <b>{money(totalPagado)}</b>
        </article>

        <article className="stat">
          <ReceiptText size={21} />
          <span>Balance pendiente</span>
          <b>{money(totalPendiente)}</b>
        </article>

        <article className="stat">
          <FileText size={21} />
          <span>Próxima factura</span>
          <b>{nextNumber}</b>
        </article>
      </section>

      {showForm && (
        <section className="form-card factura-form">
          <div className="factura-form-head">
            <div>
              <span className="eyebrow">Nueva factura</span>
              <h3>{nextNumber}</h3>
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
              Proyecto
              <select
                value={form.proyectoId}
                onChange={(event) =>
                  setForm({
                    ...form,
                    proyectoId: event.target.value,
                    subtotal: '',
                  })
                }
              >
                <option value="">Seleccionar proyecto</option>

                {proyectos.map((proyecto) => (
                  <option key={proyecto.id} value={proyecto.id}>
                    {proyecto.nombre} · Disponible {money(proyecto.disponible)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Fecha de emisión
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
              Fecha de vencimiento
              <input
                type="date"
                value={form.vencimiento}
                onChange={(event) =>
                  setForm({
                    ...form,
                    vencimiento: event.target.value,
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
              />
            </label>

            <label>
              Subtotal
              <input
                type="number"
                min="0"
                max={proyectoActual?.disponible || 0}
                step="0.01"
                value={form.subtotal}
                onChange={(event) =>
                  setForm({
                    ...form,
                    subtotal: event.target.value,
                  })
                }
              />
              <small>
                Disponible: {money(proyectoActual?.disponible || 0)}
              </small>
            </label>

            <label className="wide fiscal-check">
              <input
                type="checkbox"
                checked={form.requiereComprobante}
                onChange={(event) =>
                  setForm({
                    ...form,
                    requiereComprobante: event.target.checked,
                  })
                }
              />
              <span>Agregar ITBIS de 18%</span>
            </label>
          </div>

          <div className="factura-totals">
            <div>
              <span>Subtotal</span>
              <b>{money(subtotal)}</b>
            </div>
            {form.requiereComprobante && (
              <div>
                <span>ITBIS</span>
                <b>{money(itbis)}</b>
              </div>
            )}
            <div className="grand">
              <span>Total</span>
              <b>{money(total)}</b>
            </div>
          </div>

          <div className="factura-form-actions">
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
              onClick={saveFactura}
            >
              <Save size={17} />
              Guardar factura
            </button>
          </div>
        </section>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Número</th>
              <th>Cliente</th>
              <th>Proyecto</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Pagado</th>
              <th>Balance</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {facturas.length ? (
              facturas
                .slice()
                .reverse()
                .map((factura) => {
                  const balance = Math.max(
                    Number(factura.monto || 0) -
                      Number(factura.pagado || 0),
                    0
                  );

                  const proyecto = proyectos.find(
                    (item) => item.id === factura.proyectoId
                  );

                  const cliente = data.clientes.find(
                    (item) => item.id === factura.clienteId
                  );

                  return (
                    <tr key={factura.id}>
                      <td>
                        <b>{factura.numero}</b>
                      </td>
                      <td>{cliente?.nombre || 'Sin cliente'}</td>
                      <td>{proyecto?.nombre || 'Proyecto'}</td>
                      <td>{fechaRD(factura.fecha || '')}</td>
                      <td>{money(factura.monto)}</td>
                      <td>{money(factura.pagado)}</td>
                      <td>{money(balance)}</td>
                      <td>
                        <span className="invoice-status">
                          {estadoFactura(factura)}
                        </span>
                      </td>
                      <td>
                        <div className="cliente-actions">
                          <button
                            type="button"
                            className="cliente-action-btn edit"
                            onClick={() => setSelectedId(factura.id)}
                            title="Ver factura"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            type="button"
                            className="cliente-action-btn edit"
                            onClick={() => printFactura(factura)}
                            title="Imprimir factura"
                          >
                            <Printer size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
            ) : (
              <tr>
                <td colSpan={9}>
                  <div className="empty">
                    No hay facturas registradas.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div
          className="cp-modal-overlay"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="factura-detail-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="factura-detail-head">
              <div>
                <span className="eyebrow">Detalle de factura</span>
                <h2>{selected.numero}</h2>
                <p>{estadoFactura(selected)}</p>
              </div>

              <button
                type="button"
                className="icon"
                onClick={() => setSelectedId(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="factura-detail-grid">
              <div>
                <FileText size={18} />
                <span>Total</span>
                <b>{money(selected.monto)}</b>
              </div>

              <div>
                <WalletCards size={18} />
                <span>Pagado</span>
                <b>{money(selected.pagado)}</b>
              </div>

              <div>
                <ReceiptText size={18} />
                <span>Balance</span>
                <b>
                  {money(
                    Math.max(selected.monto - selected.pagado, 0)
                  )}
                </b>
              </div>
            </div>

            <section className="factura-concepto">
              <span>Concepto</span>
              <b>{selected.concepto}</b>
            </section>

            <div className="factura-detail-actions">
              <button
                type="button"
                className="primary"
                onClick={() => printFactura(selected)}
              >
                <Printer size={17} />
                Imprimir factura
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .facturas-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .facturas-banner {
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

        .facturas-banner b,
        .facturas-banner span {
          display: block;
        }

        .facturas-banner span {
          margin-top: 4px;
          color: var(--muted);
          font-size: 12px;
        }

        .factura-form {
          margin-bottom: 22px;
        }

        .factura-form-head {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 18px;
        }

        .factura-form-head h3 {
          margin: 6px 0 0;
        }

        .factura-form small {
          display: block;
          margin-top: 5px;
          color: var(--muted);
          font-size: 10px;
        }

        .fiscal-check {
          display: flex !important;
          align-items: center;
          gap: 10px;
        }

        .factura-totals {
          width: min(380px, 100%);
          margin: 18px 0 0 auto;
          border: 1px solid var(--line);
          border-radius: 14px;
          overflow: hidden;
        }

        .factura-totals > div {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding: 12px 14px;
          border-bottom: 1px solid var(--line);
        }

        .factura-totals .grand {
          color: #fff;
          background: linear-gradient(135deg, #1769e0, #168edc);
        }

        .factura-form-actions,
        .factura-detail-actions {
          margin-top: 18px;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .invoice-status {
          display: inline-flex;
          padding: 6px 9px;
          border-radius: 999px;
          color: var(--blue);
          background: rgba(23, 105, 224, 0.09);
          font-size: 10px;
          font-weight: 900;
        }

        .factura-detail-modal {
          width: min(760px, 100%);
          padding: 26px;
          border: 1px solid var(--line);
          border-radius: 24px;
          background: var(--card);
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.3);
        }

        .factura-detail-head {
          display: flex;
          justify-content: space-between;
          gap: 18px;
        }

        .factura-detail-head h2 {
          margin: 7px 0;
        }

        .factura-detail-head p {
          margin: 0;
          color: var(--muted);
        }

        .factura-detail-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 20px;
        }

        .factura-detail-grid > div {
          padding: 14px;
          border: 1px solid var(--line);
          border-radius: 14px;
        }

        .factura-detail-grid svg {
          color: var(--blue);
        }

        .factura-detail-grid span,
        .factura-detail-grid b {
          display: block;
        }

        .factura-detail-grid span {
          margin-top: 8px;
          color: var(--muted);
          font-size: 10px;
        }

        .factura-detail-grid b {
          margin-top: 5px;
        }

        .factura-concepto {
          margin-top: 18px;
          padding: 16px;
          border: 1px solid var(--line);
          border-radius: 14px;
        }

        .factura-concepto span,
        .factura-concepto b {
          display: block;
        }

        .factura-concepto span {
          color: var(--muted);
          font-size: 10px;
        }

        .factura-concepto b {
          margin-top: 6px;
        }

        @media (max-width: 700px) {
          .facturas-top {
            align-items: stretch;
            flex-direction: column;
          }

          .factura-detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
