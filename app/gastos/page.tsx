'use client';

import { useMemo, useState } from 'react';
import PageFrame from '@/components/PageFrame';
import { useData } from '@/components/DataProvider';
import { money, today, uid } from '@/lib/store';
import {
  Eye,
  FileText,
  Filter,
  FolderKanban,
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

type MovimientoGasto = {
  id: string;
  tipo: 'cobro' | 'gasto';
  fecha: string;
  proyectoId: string;
  concepto: string;
  monto: number;
  metodo: string;
  categoria?: string;
  suplidor?: string;
  comprobante?: string;
  observaciones?: string;
};

type ProyectoGasto = {
  id: string;
  cotizacionId: string;
  numero: string;
  nombre: string;
  clienteId: string;
  monto: number;
};

const categorias = [
  'Materiales',
  'Mano de obra',
  'Contratistas',
  'Equipos y maquinarias',
  'Transporte y combustible',
  'Permisos y trámites',
  'Servicios',
  'Administrativos',
  'Imprevistos',
  'Otros',
];

const metodos = [
  'Transferencia',
  'Efectivo',
  'Cheque',
  'Tarjeta',
  'Depósito bancario',
];

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
      <Gastos />
    </PageFrame>
  );
}

function Gastos() {
  const { data, setData } = useData();

  const movimientos = data.movimientos as MovimientoGasto[];

  const proyectos = useMemo<ProyectoGasto[]>(() => {
    const cotizaciones = data.cotizaciones as CotizacionAprobada[];

    return cotizaciones
      .filter((cotizacion) => normalizar(cotizacion.estado) === 'aprobada')
      .map((cotizacion) => ({
        id: `pro-${cotizacion.id}`,
        cotizacionId: cotizacion.id,
        numero: cotizacion.numero,
        nombre: cotizacion.proyecto,
        clienteId: cotizacion.clienteId,
        monto: Number(cotizacion.total ?? cotizacion.monto ?? 0),
      }));
  }, [data.cotizaciones]);

  const gastos = useMemo(
    () =>
      movimientos
        .filter((movimiento) => movimiento.tipo === 'gasto')
        .slice()
        .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha))),
    [movimientos]
  );

  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterProjectId, setFilterProjectId] = useState('todos');
  const [filterCategory, setFilterCategory] = useState('todas');

  const [form, setForm] = useState({
    proyectoId: proyectos[0]?.id || '',
    fecha: today(),
    categoria: 'Materiales',
    suplidor: '',
    concepto: '',
    monto: '',
    metodo: 'Transferencia',
    comprobante: '',
    observaciones: '',
  });

  const selected =
    gastos.find((gasto) => gasto.id === selectedId) || null;

  const gastosFiltrados = useMemo(() => {
    return gastos.filter((gasto) => {
      const projectMatch =
        filterProjectId === 'todos'
          ? true
          : gasto.proyectoId === filterProjectId;

      const categoryMatch =
        filterCategory === 'todas'
          ? true
          : gasto.categoria === filterCategory;

      return projectMatch && categoryMatch;
    });
  }, [gastos, filterProjectId, filterCategory]);

  const totalGastado = gastos.reduce(
    (total, gasto) => total + Number(gasto.monto || 0),
    0
  );

  const currentMonth = today().slice(0, 7);

  const gastoMes = gastos
    .filter((gasto) => gasto.fecha?.slice(0, 7) === currentMonth)
    .reduce(
      (total, gasto) => total + Number(gasto.monto || 0),
      0
    );

  const gastosConProyecto = gastos
    .filter((gasto) => gasto.proyectoId !== 'general')
    .reduce(
      (total, gasto) => total + Number(gasto.monto || 0),
      0
    );

  const gastosGenerales = gastos
    .filter((gasto) => gasto.proyectoId === 'general')
    .reduce(
      (total, gasto) => total + Number(gasto.monto || 0),
      0
    );

  const openNew = () => {
    setForm({
      proyectoId: proyectos[0]?.id || 'general',
      fecha: today(),
      categoria: 'Materiales',
      suplidor: '',
      concepto: '',
      monto: '',
      metodo: 'Transferencia',
      comprobante: '',
      observaciones: '',
    });

    setShowForm(true);
  };

  const saveGasto = () => {
    if (!form.concepto.trim()) {
      window.alert('Escribe el concepto del gasto.');
      return;
    }

    const monto = Number(form.monto || 0);

    if (monto <= 0) {
      window.alert('Escribe un monto válido.');
      return;
    }

    const nuevoGasto: MovimientoGasto = {
      id: uid('gasto'),
      tipo: 'gasto',
      fecha: form.fecha,
      proyectoId: form.proyectoId || 'general',
      concepto: form.concepto.trim(),
      monto,
      metodo: form.metodo,
      categoria: form.categoria,
      suplidor: form.suplidor.trim(),
      comprobante: form.comprobante.trim(),
      observaciones: form.observaciones.trim(),
    };

    setData((current) => ({
      ...current,
      movimientos: [...current.movimientos, nuevoGasto] as any,
    }));

    setShowForm(false);
  };

  const proyectoNombre = (proyectoId: string) => {
    if (proyectoId === 'general') return 'Gasto general';

    return (
      proyectos.find((proyecto) => proyecto.id === proyectoId)?.nombre ||
      'Proyecto no disponible'
    );
  };

  const printGasto = (gasto: MovimientoGasto) => {
    const proyecto = proyectoNombre(gasto.proyectoId);

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
          <title>Comprobante de gasto</title>
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
            .section {
              margin-top: 16px;
              padding: 14px;
              border: 1px solid #d7e0e9;
              border-radius: 10px;
            }
            .section span {
              display: block;
              color: #6e7d8d;
              font-size: 11px;
              text-transform: uppercase;
            }
            .section p {
              margin: 7px 0 0;
              line-height: 1.5;
              white-space: pre-wrap;
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
            <h1>COMPROBANTE DE GASTO</h1>
            <p>CONSTRUPLATA SRL</p>
          </div>

          <div class="grid">
            <div class="box">
              <span>Fecha</span>
              <b>${fechaRD(gasto.fecha)}</b>
            </div>

            <div class="box">
              <span>Proyecto</span>
              <b>${proyecto}</b>
            </div>

            <div class="box">
              <span>Categoría</span>
              <b>${gasto.categoria || 'Otros'}</b>
            </div>

            <div class="box">
              <span>Suplidor / beneficiario</span>
              <b>${gasto.suplidor || 'No especificado'}</b>
            </div>

            <div class="box">
              <span>Método de pago</span>
              <b>${gasto.metodo}</b>
            </div>

            <div class="box">
              <span>Factura / comprobante</span>
              <b>${gasto.comprobante || 'No especificado'}</b>
            </div>
          </div>

          <div class="section">
            <span>Concepto</span>
            <p>${gasto.concepto}</p>
          </div>

          <div class="section">
            <span>Observaciones</span>
            <p>${gasto.observaciones || 'Sin observaciones.'}</p>
          </div>

          <div class="amount">
            <span>Monto pagado</span>
            <b>${money(gasto.monto)}</b>
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

  return (
    <>
      <div className="gastos-top">
        <div className="gastos-banner">
          <WalletCards size={22} />
          <div>
            <b>Control de egresos y gastos por proyecto</b>
            <span>
              Los gastos registrados aquí se reflejan automáticamente en
              Proyectos y en los resúmenes financieros.
            </span>
          </div>
        </div>

        <button
          type="button"
          className="primary"
          onClick={openNew}
        >
          <Plus size={18} />
          Nuevo gasto
        </button>
      </div>

      <section className="stats">
        <article className="stat">
          <WalletCards size={21} />
          <span>Total gastado</span>
          <b>{money(totalGastado)}</b>
        </article>

        <article className="stat">
          <ReceiptText size={21} />
          <span>Gastos del mes</span>
          <b>{money(gastoMes)}</b>
        </article>

        <article className="stat">
          <FolderKanban size={21} />
          <span>Gastos en proyectos</span>
          <b>{money(gastosConProyecto)}</b>
        </article>

        <article className="stat">
          <FileText size={21} />
          <span>Gastos generales</span>
          <b>{money(gastosGenerales)}</b>
        </article>
      </section>

      {showForm && (
        <section className="form-card gasto-form">
          <div className="gasto-form-head">
            <div>
              <span className="eyebrow">Nuevo gasto</span>
              <h3>Registrar egreso</h3>
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
                  })
                }
              >
                <option value="general">Gasto general</option>

                {proyectos.map((proyecto) => (
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
              Categoría
              <select
                value={form.categoria}
                onChange={(event) =>
                  setForm({
                    ...form,
                    categoria: event.target.value,
                  })
                }
              >
                {categorias.map((categoria) => (
                  <option key={categoria}>{categoria}</option>
                ))}
              </select>
            </label>

            <label>
              Suplidor o beneficiario
              <input
                value={form.suplidor}
                onChange={(event) =>
                  setForm({
                    ...form,
                    suplidor: event.target.value,
                  })
                }
                placeholder="Nombre del suplidor o persona"
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
                placeholder="Ej: Compra de cemento"
              />
            </label>

            <label>
              Monto
              <input
                type="number"
                min="0"
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
                {metodos.map((metodo) => (
                  <option key={metodo}>{metodo}</option>
                ))}
              </select>
            </label>

            <label>
              Factura o comprobante
              <input
                value={form.comprobante}
                onChange={(event) =>
                  setForm({
                    ...form,
                    comprobante: event.target.value,
                  })
                }
                placeholder="Número de factura o NCF"
              />
            </label>

            <label className="wide">
              Observaciones
              <textarea
                value={form.observaciones}
                onChange={(event) =>
                  setForm({
                    ...form,
                    observaciones: event.target.value,
                  })
                }
                placeholder="Notas adicionales del gasto..."
              />
            </label>
          </div>

          <div className="gasto-form-actions">
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
              onClick={saveGasto}
            >
              <Save size={17} />
              Guardar gasto
            </button>
          </div>
        </section>
      )}

      <section className="gastos-filters">
        <div className="gastos-filter-title">
          <Filter size={17} />
          Filtros
        </div>

        <label>
          Proyecto
          <select
            value={filterProjectId}
            onChange={(event) =>
              setFilterProjectId(event.target.value)
            }
          >
            <option value="todos">Todos</option>
            <option value="general">Gastos generales</option>

            {proyectos.map((proyecto) => (
              <option key={proyecto.id} value={proyecto.id}>
                {proyecto.nombre}
              </option>
            ))}
          </select>
        </label>

        <label>
          Categoría
          <select
            value={filterCategory}
            onChange={(event) =>
              setFilterCategory(event.target.value)
            }
          >
            <option value="todas">Todas</option>

            {categorias.map((categoria) => (
              <option key={categoria}>{categoria}</option>
            ))}
          </select>
        </label>
      </section>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Proyecto</th>
              <th>Categoría</th>
              <th>Suplidor</th>
              <th>Concepto</th>
              <th>Método</th>
              <th>Monto</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {gastosFiltrados.length ? (
              gastosFiltrados.map((gasto) => (
                <tr key={gasto.id}>
                  <td>{fechaRD(gasto.fecha)}</td>
                  <td>{proyectoNombre(gasto.proyectoId)}</td>
                  <td>{gasto.categoria || 'Otros'}</td>
                  <td>{gasto.suplidor || '—'}</td>
                  <td>{gasto.concepto}</td>
                  <td>{gasto.metodo}</td>
                  <td>
                    <b>{money(gasto.monto)}</b>
                  </td>
                  <td>
                    <div className="cliente-actions">
                      <button
                        type="button"
                        className="cliente-action-btn edit"
                        title="Ver detalle"
                        onClick={() => setSelectedId(gasto.id)}
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        type="button"
                        className="cliente-action-btn edit"
                        title="Imprimir comprobante"
                        onClick={() => printGasto(gasto)}
                      >
                        <Printer size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8}>
                  <div className="empty">
                    No hay gastos registrados con estos filtros.
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
            className="gasto-detail-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="gasto-detail-head">
              <div>
                <span className="eyebrow">Detalle de gasto</span>
                <h2>{money(selected.monto)}</h2>
                <p>{fechaRD(selected.fecha)}</p>
              </div>

              <button
                type="button"
                className="icon"
                onClick={() => setSelectedId(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="gasto-detail-grid">
              <div>
                <FolderKanban size={18} />
                <span>Proyecto</span>
                <b>{proyectoNombre(selected.proyectoId)}</b>
              </div>

              <div>
                <ReceiptText size={18} />
                <span>Categoría</span>
                <b>{selected.categoria || 'Otros'}</b>
              </div>

              <div>
                <WalletCards size={18} />
                <span>Método</span>
                <b>{selected.metodo}</b>
              </div>

              <div>
                <FileText size={18} />
                <span>Comprobante</span>
                <b>{selected.comprobante || '—'}</b>
              </div>
            </div>

            <section className="gasto-detail-section">
              <span>Suplidor o beneficiario</span>
              <b>{selected.suplidor || 'No especificado'}</b>
            </section>

            <section className="gasto-detail-section">
              <span>Concepto</span>
              <b>{selected.concepto}</b>
            </section>

            <section className="gasto-detail-section">
              <span>Observaciones</span>
              <b>{selected.observaciones || 'Sin observaciones'}</b>
            </section>

            <div className="gasto-detail-actions">
              <button
                type="button"
                className="primary"
                onClick={() => printGasto(selected)}
              >
                <Printer size={17} />
                Imprimir comprobante
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .gastos-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .gastos-banner {
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

        .gastos-banner b,
        .gastos-banner span {
          display: block;
        }

        .gastos-banner span {
          margin-top: 4px;
          color: var(--muted);
          font-size: 12px;
        }

        .gasto-form {
          margin-bottom: 22px;
        }

        .gasto-form-head {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 18px;
        }

        .gasto-form-head h3 {
          margin: 6px 0 0;
        }

        .gasto-form-actions,
        .gasto-detail-actions {
          margin-top: 18px;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .gastos-filters {
          margin: 22px 0;
          padding: 16px;
          display: grid;
          grid-template-columns: auto minmax(220px, 1fr) minmax(220px, 1fr);
          gap: 14px;
          align-items: end;
          border: 1px solid var(--line);
          border-radius: 17px;
          background: var(--card);
        }

        .gastos-filter-title {
          min-height: 44px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--blue);
          font-weight: 900;
        }

        .gastos-filters label {
          display: grid;
          gap: 6px;
          color: var(--muted);
          font-size: 11px;
          font-weight: 800;
        }

        .gastos-filters select {
          min-height: 44px;
          padding: 0 12px;
          border: 1px solid var(--line);
          border-radius: 12px;
          color: var(--text);
          background: var(--card);
        }

        .gasto-detail-modal {
          width: min(820px, 100%);
          padding: 26px;
          border: 1px solid var(--line);
          border-radius: 24px;
          background: var(--card);
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.3);
        }

        .gasto-detail-head {
          display: flex;
          justify-content: space-between;
          gap: 18px;
        }

        .gasto-detail-head h2 {
          margin: 7px 0;
        }

        .gasto-detail-head p {
          margin: 0;
          color: var(--muted);
        }

        .gasto-detail-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-top: 20px;
        }

        .gasto-detail-grid > div,
        .gasto-detail-section {
          padding: 14px;
          border: 1px solid var(--line);
          border-radius: 14px;
        }

        .gasto-detail-grid svg {
          color: var(--blue);
        }

        .gasto-detail-grid span,
        .gasto-detail-grid b,
        .gasto-detail-section span,
        .gasto-detail-section b {
          display: block;
        }

        .gasto-detail-grid span,
        .gasto-detail-section span {
          margin-top: 8px;
          color: var(--muted);
          font-size: 10px;
        }

        .gasto-detail-grid b,
        .gasto-detail-section b {
          margin-top: 5px;
        }

        .gasto-detail-section {
          margin-top: 12px;
        }

        @media (max-width: 850px) {
          .gasto-detail-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .gastos-filters {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 620px) {
          .gastos-top {
            align-items: stretch;
            flex-direction: column;
          }

          .gasto-detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
