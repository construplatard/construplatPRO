'use client';

import { useMemo, useState } from 'react';
import PageFrame from '@/components/PageFrame';
import { useData } from '@/components/DataProvider';
import { money, uid } from '@/lib/store';
import { printQuotationDocument } from '@/lib/printQuotation';
import {
  Plus,
  Trash2,
  X,
  FileText,
  CheckCircle2,
  Printer,
  Eye,
  Pencil,
} from 'lucide-react';

type Partida = {
  id: string;
  descripcion: string;
  detalle: string;
  cantidad: number;
  unidad: string;
  precio: number;
};

type CotizacionExtendida = {
  id: string;
  numero: string;
  clienteId: string;
  proyecto: string;
  monto: number;
  estado: string;
  descripcion?: string;
  fecha?: string;
  vendedor?: string;
  requiereComprobante?: boolean;
  subtotal?: number;
  itbis?: number;
  total?: number;
  partidas?: Partida[];
};

const vendedorPredeterminado = 'Juan Carlos Quiñones';

const emptyPartida = (): Partida => ({
  id: uid('partida'),
  descripcion: '',
  detalle: '',
  cantidad: 1,
  unidad: 'und',
  precio: 0,
});

const formatDate = (value: string) => {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
};

export default function Page() {
  return (
    <PageFrame>
      <Cotizaciones />
    </PageFrame>
  );
}

function Cotizaciones() {
  const { data, setData } = useData();

  const cotizaciones = data.cotizaciones as CotizacionExtendida[];

  const [showForm, setShowForm] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    clienteId: data.clientes[0]?.id || '',
    proyecto: '',
    descripcion: '',
    fecha: new Date().toISOString().slice(0, 10),
    vendedor: vendedorPredeterminado,
    requiereComprobante: false,
    partidas: [emptyPartida()],
  });

  const nextNumber = useMemo(() => {
    const numbers = cotizaciones
      .map((item) => {
        const match = String(item.numero || '').match(/(\d+)/);
        return match ? Number(match[1]) : 0;
      })
      .filter(Boolean);

    const highest = Math.max(25, ...numbers);
    return `COT-${String(highest + 1).padStart(3, '0')}`;
  }, [cotizaciones]);

  const subtotal = form.partidas.reduce(
    (sum, partida) =>
      sum + Number(partida.cantidad || 0) * Number(partida.precio || 0),
    0
  );

  const itbis = form.requiereComprobante ? subtotal * 0.18 : 0;
  const total = subtotal + itbis;

  const resetForm = () => {
    setEditingId(null);
    setForm({
      clienteId: data.clientes[0]?.id || '',
      proyecto: '',
      descripcion: '',
      fecha: new Date().toISOString().slice(0, 10),
      vendedor: vendedorPredeterminado,
      requiereComprobante: false,
      partidas: [emptyPartida()],
    });
  };

  const openNew = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (cotizacion: CotizacionExtendida) => {
    setEditingId(cotizacion.id);

    setForm({
      clienteId: cotizacion.clienteId || '',
      proyecto: cotizacion.proyecto || '',
      descripcion: cotizacion.descripcion || '',
      fecha: cotizacion.fecha || new Date().toISOString().slice(0, 10),
      vendedor: cotizacion.vendedor || vendedorPredeterminado,
      requiereComprobante: Boolean(cotizacion.requiereComprobante),
      partidas:
        cotizacion.partidas?.length
          ? cotizacion.partidas
          : [
              {
                ...emptyPartida(),
                descripcion: cotizacion.proyecto || 'Trabajo contratado',
                precio: Number(cotizacion.monto || 0),
              },
            ],
    });

    setShowForm(true);
  };

  const updatePartida = (
    id: string,
    field: keyof Partida,
    value: string | number
  ) => {
    setForm((current) => ({
      ...current,
      partidas: current.partidas.map((partida) =>
        partida.id === id
          ? {
              ...partida,
              [field]:
                field === 'cantidad' || field === 'precio'
                  ? Number(value)
                  : value,
            }
          : partida
      ),
    }));
  };

  const addPartida = () => {
    setForm((current) => ({
      ...current,
      partidas: [...current.partidas, emptyPartida()],
    }));
  };

  const removePartida = (id: string) => {
    setForm((current) => ({
      ...current,
      partidas:
        current.partidas.length > 1
          ? current.partidas.filter((partida) => partida.id !== id)
          : current.partidas,
    }));
  };

  const saveCotizacion = () => {
    if (!form.clienteId) {
      window.alert('Selecciona un cliente.');
      return;
    }

    if (!form.proyecto.trim()) {
      window.alert('Escribe el nombre del trabajo o proyecto.');
      return;
    }

    if (!form.partidas.some((partida) => partida.descripcion.trim())) {
      window.alert('Agrega al menos una partida.');
      return;
    }

    setData((current) => {
      const currentCotizaciones =
        current.cotizaciones as CotizacionExtendida[];

      const previous = editingId
        ? currentCotizaciones.find((item) => item.id === editingId)
        : null;

      const saved: CotizacionExtendida = {
        id: editingId || uid('cot'),
        numero: previous?.numero || nextNumber,
        clienteId: form.clienteId,
        proyecto: form.proyecto.trim(),
        monto: total,
        estado: previous?.estado || 'Borrador',
        descripcion: form.descripcion.trim(),
        fecha: form.fecha,
        vendedor: form.vendedor.trim() || vendedorPredeterminado,
        requiereComprobante: form.requiereComprobante,
        subtotal,
        itbis,
        total,
        partidas: form.partidas,
      };

      const nextCotizaciones = editingId
        ? currentCotizaciones.map((item) =>
            item.id === editingId ? saved : item
          )
        : [saved, ...currentCotizaciones];

      return {
        ...current,
        cotizaciones: nextCotizaciones as any,
      };
    });

    setShowForm(false);
    resetForm();
  };

  const changeStatus = (id: string, estado: string) => {
    setData((current) => ({
      ...current,
      cotizaciones: (
        current.cotizaciones as CotizacionExtendida[]
      ).map((item) =>
        item.id === id
          ? {
              ...item,
              estado,
            }
          : item
      ) as any,
    }));
  };

  const deleteCotizacion = (id: string) => {
    if (!window.confirm('¿Deseas eliminar esta cotización?')) return;

    setData((current) => ({
      ...current,
      cotizaciones: (
        current.cotizaciones as CotizacionExtendida[]
      ).filter((item) => item.id !== id) as any,
    }));
  };

  const preview =
    cotizaciones.find((item) => item.id === previewId) || null;

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: '24px',
        }}
      >
        <button
          type="button"
          className="primary"
          onClick={openNew}
        >
          <Plus size={18} />
          Nueva cotización
        </button>
      </div>

      <section className="stats">
        <article className="stat">
          <FileText size={21} />
          <span>Total cotizaciones</span>
          <b>{cotizaciones.length}</b>
        </article>

        <article className="stat">
          <CheckCircle2 size={21} />
          <span>Aprobadas</span>
          <b>
            {
              cotizaciones.filter(
                (item) => item.estado === 'Aprobada'
              ).length
            }
          </b>
        </article>

        <article className="stat">
          <FileText size={21} />
          <span>Próximo número</span>
          <b>{nextNumber.replace('COT-', '#')}</b>
        </article>

        <article className="stat">
          <FileText size={21} />
          <span>Monto cotizado</span>
          <b>
            {money(
              cotizaciones.reduce(
                (sum, item) =>
                  sum + Number(item.total ?? item.monto ?? 0),
                0
              )
            )}
          </b>
        </article>
      </section>

      {showForm && (
        <section className="form-card quotation-builder">
          <div className="quotation-builder-head">
            <div>
              <span className="eyebrow">
                {editingId
                  ? 'Editar cotización'
                  : 'Nueva cotización'}
              </span>

              <h3>
                {editingId
                  ? 'Actualizar cotización'
                  : `Crear ${nextNumber.replace(
                      'COT-',
                      'Cotización #'
                    )}`}
              </h3>
            </div>

            <button
              type="button"
              className="icon"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
            >
              <X size={18} />
            </button>
          </div>

          <div className="form-grid">
            <label>
              Cliente
              <select
                value={form.clienteId}
                onChange={(event) =>
                  setForm({
                    ...form,
                    clienteId: event.target.value,
                  })
                }
              >
                <option value="">Seleccionar cliente</option>

                {data.clientes.map((cliente) => (
                  <option
                    key={cliente.id}
                    value={cliente.id}
                  >
                    {cliente.nombre}
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
              Trabajo / proyecto
              <input
                value={form.proyecto}
                onChange={(event) =>
                  setForm({
                    ...form,
                    proyecto: event.target.value,
                  })
                }
                placeholder="Ej: Remodelación de terraza"
              />
            </label>

            <label>
              Vendedor
              <input
                value={form.vendedor}
                onChange={(event) =>
                  setForm({
                    ...form,
                    vendedor: event.target.value,
                  })
                }
              />
            </label>

            <label className="wide">
              Descripción del proyecto
              <textarea
                value={form.descripcion}
                onChange={(event) =>
                  setForm({
                    ...form,
                    descripcion: event.target.value,
                  })
                }
                placeholder="Describe el alcance general de los trabajos..."
              />
            </label>
          </div>

          <div className="quotation-items">
            <div className="quotation-items-head">
              <div>
                <span className="eyebrow">Partidas</span>
                <h4>Detalle de la cotización</h4>
              </div>

              <button
                type="button"
                className="ghost-btn-v2"
                onClick={addPartida}
              >
                <Plus size={16} />
                Agregar partida
              </button>
            </div>

            {form.partidas.map((partida, index) => (
              <div
                className="quotation-item-row"
                key={partida.id}
              >
                <div className="quotation-item-number">
                  {index + 1}
                </div>

                <label>
                  Descripción
                  <input
                    value={partida.descripcion}
                    onChange={(event) =>
                      updatePartida(
                        partida.id,
                        'descripcion',
                        event.target.value
                      )
                    }
                    placeholder="Ej: Pintura interior premium"
                  />
                </label>

                <label>
                  Detalle
                  <input
                    value={partida.detalle}
                    onChange={(event) =>
                      updatePartida(
                        partida.id,
                        'detalle',
                        event.target.value
                      )
                    }
                    placeholder="Incluye materiales y mano de obra"
                  />
                </label>

                <label>
                  Cantidad
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={partida.cantidad}
                    onChange={(event) =>
                      updatePartida(
                        partida.id,
                        'cantidad',
                        event.target.value
                      )
                    }
                  />
                </label>

                <label>
                  Unidad
                  <input
                    value={partida.unidad}
                    onChange={(event) =>
                      updatePartida(
                        partida.id,
                        'unidad',
                        event.target.value
                      )
                    }
                    placeholder="m², und, glb"
                  />
                </label>

                <label>
                  Precio
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={partida.precio}
                    onChange={(event) =>
                      updatePartida(
                        partida.id,
                        'precio',
                        event.target.value
                      )
                    }
                  />
                </label>

                <div className="quotation-item-total">
                  <span>Total</span>
                  <b>
                    {money(
                      Number(partida.cantidad || 0) *
                        Number(partida.precio || 0)
                    )}
                  </b>
                </div>

                <button
                  type="button"
                  className="cliente-action-btn delete"
                  onClick={() =>
                    removePartida(partida.id)
                  }
                  title="Eliminar partida"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="quotation-tax-card">
            <label className="fiscal-toggle">
              <input
                type="checkbox"
                checked={form.requiereComprobante}
                onChange={(event) =>
                  setForm({
                    ...form,
                    requiereComprobante:
                      event.target.checked,
                  })
                }
              />

              <span>
                <b>
                  El cliente requiere comprobante fiscal
                </b>
                <small>
                  Al activarlo, se adiciona el 18% de
                  ITBIS.
                </small>
              </span>
            </label>

            <div className="quotation-totals">
              <div>
                <span>Subtotal</span>
                <b>{money(subtotal)}</b>
              </div>

              {form.requiereComprobante && (
                <div>
                  <span>ITBIS (18%)</span>
                  <b>{money(itbis)}</b>
                </div>
              )}

              <div className="quotation-grand-total">
                <span>Total general</span>
                <b>{money(total)}</b>
              </div>
            </div>
          </div>

          <div className="quotation-note">
            <b>Nota:</b> En caso de que el cliente
            requiera comprobante fiscal, se adicionará
            el 18% correspondiente al ITBIS sobre el
            subtotal de esta cotización.
          </div>

          <div className="cp-modal-actions">
            <button
              type="button"
              className="ghost-client-btn"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
            >
              Cancelar
            </button>

            <button
              type="button"
              className="primary"
              onClick={saveCotizacion}
            >
              {editingId
                ? 'Guardar cambios'
                : 'Guardar cotización'}
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
              <th>Trabajo</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {cotizaciones.length ? (
              cotizaciones.map((cotizacion) => {
                const cliente = data.clientes.find(
                  (item) =>
                    item.id === cotizacion.clienteId
                );

                return (
                  <tr key={cotizacion.id}>
                    <td>
                      <b>
                        {cotizacion.numero.replace(
                          'COT-',
                          '#'
                        )}
                      </b>
                    </td>

                    <td>
                      {cliente?.nombre || 'Sin cliente'}
                    </td>

                    <td>{cotizacion.proyecto}</td>

                    <td>
                      {formatDate(cotizacion.fecha || '')}
                    </td>

                    <td>
                      {money(
                        Number(
                          cotizacion.total ??
                            cotizacion.monto ??
                            0
                        )
                      )}
                    </td>

                    <td>
                      <select
                        className="quotation-status"
                        value={cotizacion.estado}
                        onChange={(event) =>
                          changeStatus(
                            cotizacion.id,
                            event.target.value
                          )
                        }
                      >
                        <option value="Borrador">
                          Borrador
                        </option>
                        <option value="Enviada">
                          Enviada
                        </option>
                        <option value="Aprobada">
                          Aprobada
                        </option>
                        <option value="Rechazada">
                          Rechazada
                        </option>
                      </select>

                      {cotizacion.estado ===
                        'Aprobada' && (
                        <small className="approved-contract-note">
                          Disponible en Contratos
                        </small>
                      )}
                    </td>

                    <td>
                      <div className="cliente-actions">
                        <button
                          type="button"
                          className="cliente-action-btn edit"
                          title="Vista previa"
                          onClick={() =>
                            setPreviewId(cotizacion.id)
                          }
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          className="cliente-action-btn edit"
                          title="Editar cotización"
                          onClick={() =>
                            openEdit(cotizacion)
                          }
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          className="cliente-action-btn edit"
                          title="Abrir para imprimir"
                          onClick={() =>
                            setPreviewId(cotizacion.id)
                          }
                        >
                          <Printer size={16} />
                        </button>

                        <button
                          type="button"
                          className="cliente-action-btn delete"
                          title="Eliminar cotización"
                          onClick={() =>
                            deleteCotizacion(
                              cotizacion.id
                            )
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7}>
                  <div className="empty">
                    No hay cotizaciones registradas.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {preview && (
        <div
          className="cp-modal-overlay quotation-preview-overlay"
          onClick={() => setPreviewId(null)}
        >
          <div
            className="quotation-preview-shell"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="quotation-preview-toolbar no-print">
              <button
                type="button"
                className="ghost-client-btn"
                onClick={() => setPreviewId(null)}
              >
                Cerrar
              </button>

              <button
                type="button"
                className="primary"
                onClick={printQuotationDocument}
              >
                <Printer size={17} />
                Imprimir / PDF
              </button>
            </div>

            <QuotationTemplate
              cotizacion={preview}
              cliente={
                data.clientes.find(
                  (item) =>
                    item.id === preview.clienteId
                ) || null
              }
            />
          </div>
        </div>
      )}
    </>
  );
}

function QuotationTemplate({
  cotizacion,
  cliente,
}: {
  cotizacion: CotizacionExtendida;
  cliente: {
    nombre: string;
    direccion: string;
    rnc: string;
    telefono: string;
    email: string;
  } | null;
}) {
  const subtotal = Number(
    cotizacion.subtotal ?? cotizacion.monto ?? 0
  );

  const itbis = cotizacion.requiereComprobante
    ? Number(cotizacion.itbis ?? subtotal * 0.18)
    : 0;

  const total = Number(
    cotizacion.total ?? subtotal + itbis
  );

  return (
    <article
      id="quotation-print-area"
      className="quotation-document"
    >
      <header className="quotation-document-header">
        <div className="quotation-brand-block">
          <img
            src="/logo-construplata.jpg"
            alt="CONSTRUPLATA"
          />

          <h2>CONSTRUPLATA</h2>
          <b>CONSTRUPLATA SRL</b>
          <span>
            Santo Domingo, República Dominicana
          </span>
        </div>

        <div className="quotation-document-info">
          <h1>
            COTIZACIÓN{' '}
            {cotizacion.numero.replace('COT-', '#')}
          </h1>

          <div>
            <b>FECHA:</b>
            <span>
              {formatDate(cotizacion.fecha || '')}
            </span>
          </div>

          <div>
            <b>VENDEDOR:</b>
            <span>
              {cotizacion.vendedor ||
                vendedorPredeterminado}
            </span>
          </div>

          <div>
            <b>CLIENTE:</b>
            <span>
              {cliente?.nombre || 'Sin cliente'}
            </span>
          </div>
        </div>
      </header>

      <section className="quotation-description">
        <h3>DESCRIPCIÓN DEL PROYECTO</h3>
        <p>
          {cotizacion.descripcion ||
            cotizacion.proyecto ||
            'Sin descripción.'}
        </p>
      </section>

      <table className="quotation-document-table">
        <thead>
          <tr>
            <th>DESCRIPCIÓN</th>
            <th>CANT.</th>
            <th>PRECIO</th>
            <th>TOTAL</th>
          </tr>
        </thead>

        <tbody>
          {(cotizacion.partidas || []).map(
            (partida, index) => (
              <tr key={partida.id}>
                <td>
                  <b>
                    {index + 1}. {partida.descripcion}
                  </b>

                  {partida.detalle && (
                    <small>{partida.detalle}</small>
                  )}
                </td>

                <td>
                  {partida.cantidad} {partida.unidad}
                </td>

                <td>{money(partida.precio)}</td>

                <td>
                  <b>
                    {money(
                      partida.cantidad *
                        partida.precio
                    )}
                  </b>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>

      <div className="quotation-document-bottom">
        <div className="quotation-validity">
          Cotización válida por 30 días.
        </div>

        <div className="quotation-document-totals">
          <div>
            <span>Subtotal</span>
            <b>{money(subtotal)}</b>
          </div>

          {cotizacion.requiereComprobante && (
            <div>
              <span>ITBIS (18%)</span>
              <b>{money(itbis)}</b>
            </div>
          )}

          <div className="quotation-total-highlight">
            <span>Total general</span>
            <b>{money(total)}</b>
          </div>
        </div>
      </div>

      <p className="quotation-document-note">
        <b>Nota:</b> En caso de que el cliente
        requiera comprobante fiscal, se adicionará
        el 18% correspondiente al ITBIS sobre el
        subtotal de esta cotización.
      </p>

      <div className="quotation-signatures">
        <div>
          <span />
          <p>Firma de Cliente</p>
        </div>

        <div>
          <span />
          <p>Firma de Vendedor</p>
        </div>
      </div>

      <footer>
        Gracias por confiar en{' '}
        <b>CONSTRUPLATA SRL</b>
      </footer>
    </article>
  );
}
