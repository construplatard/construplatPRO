'use client';

import { useMemo, useState } from 'react';
import AppShell from '../../components/AppShell';
import { useData } from '../../components/DataProvider';
import { Plus, Pencil, Trash2, X, Search, UserRound, Mail, Phone } from 'lucide-react';

type ClienteForm = {
  nombre: string;
  direccion: string;
  rnc: string;
  telefono: string;
  email: string;
};

const emptyForm: ClienteForm = {
  nombre: '',
  direccion: '',
  rnc: '',
  telefono: '',
  email: '',
};

export default function ClientesPage() {
  return (
    <AppShell>
      <ClientesContent />
    </AppShell>
  );
}

function ClientesContent() {
  const { data, setData } = useData();

  const [search, setSearch] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ClienteForm>(emptyForm);

  const clientes = data.clientes || [];

  const filteredClientes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clientes;

    return clientes.filter((cliente) =>
      [
        cliente.nombre,
        cliente.direccion,
        cliente.rnc,
        cliente.telefono,
        cliente.email,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [clientes, search]);

  const openNewClient = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpenForm(true);
  };

  const openEditClient = (cliente: (typeof clientes)[number]) => {
    setEditingId(cliente.id);
    setForm({
      nombre: cliente.nombre || '',
      direccion: cliente.direccion || '',
      rnc: cliente.rnc || '',
      telefono: cliente.telefono || '',
      email: cliente.email || '',
    });
    setOpenForm(true);
  };

  const closeForm = () => {
    setOpenForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const saveClient = () => {
    if (!form.nombre.trim()) {
      alert('Debe ingresar el nombre del cliente.');
      return;
    }

    setData((current) => {
      const nextClientes = editingId
        ? current.clientes.map((cliente) =>
            cliente.id === editingId
              ? {
                  ...cliente,
                  nombre: form.nombre.trim(),
                  direccion: form.direccion.trim(),
                  rnc: form.rnc.trim(),
                  telefono: form.telefono.trim(),
                  email: form.email.trim(),
                }
              : cliente
          )
        : [
            {
              id: crypto.randomUUID(),
              nombre: form.nombre.trim(),
              direccion: form.direccion.trim(),
              rnc: form.rnc.trim(),
              telefono: form.telefono.trim(),
              email: form.email.trim(),
            },
            ...current.clientes,
          ];

      return { ...current, clientes: nextClientes };
    });

    closeForm();
  };

  const deleteClient = (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este cliente?')) return;

    setData((current) => ({
      ...current,
      clientes: current.clientes.filter((cliente) => cliente.id !== id),
    }));
  };

  return (
    <div className="clientes-v2-page">
      <div className="panel clientes-toolbar">
        <div className="clientes-toolbar-left">
          <span className="eyebrow">Directorio de clientes</span>
          <p className="clientes-toolbar-text">
            Gestiona expedientes, contactos y datos principales.
          </p>
        </div>

        <div className="clientes-toolbar-right">
          <div className="clientes-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Buscar cliente, correo o teléfono..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <button type="button" className="primary" onClick={openNewClient}>
            <Plus size={18} />
            Nuevo cliente
          </button>
        </div>
      </div>

      <div className="panel clientes-summary-cards">
        <div className="cliente-mini-stat">
          <div className="cliente-mini-icon"><UserRound size={18} /></div>
          <div><span>Total clientes</span><b>{clientes.length}</b></div>
        </div>

        <div className="cliente-mini-stat">
          <div className="cliente-mini-icon"><Mail size={18} /></div>
          <div><span>Con correo</span><b>{clientes.filter((c) => c.email).length}</b></div>
        </div>

        <div className="cliente-mini-stat">
          <div className="cliente-mini-icon"><Phone size={18} /></div>
          <div><span>Con teléfono</span><b>{clientes.filter((c) => c.telefono).length}</b></div>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>RNC/Cédula</th>
              <th>Teléfono</th>
              <th>Correo</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filteredClientes.length ? (
              filteredClientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td>
                    <div className="cliente-main-cell">
                      <b>{cliente.nombre || 'Sin nombre'}</b>
                      <small>{cliente.direccion || 'Sin dirección'}</small>
                    </div>
                  </td>
                  <td>{cliente.rnc || '—'}</td>
                  <td>{cliente.telefono || '—'}</td>
                  <td>{cliente.email || '—'}</td>
                  <td>
                    <div className="cliente-actions">
                      <button
                        type="button"
                        className="cliente-action-btn edit"
                        onClick={() => openEditClient(cliente)}
                        title="Editar cliente"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        className="cliente-action-btn delete"
                        onClick={() => deleteClient(cliente.id)}
                        title="Eliminar cliente"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>
                  <div className="empty">No se encontraron clientes registrados.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {openForm && (
        <div className="cp-modal-overlay" onClick={closeForm}>
          <div className="cp-modal" onClick={(event) => event.stopPropagation()}>
            <div className="cp-modal-head">
              <div>
                <span className="eyebrow">{editingId ? 'Editar cliente' : 'Nuevo cliente'}</span>
                <h3>
                  {editingId
                    ? 'Actualizar información del cliente'
                    : 'Registrar nuevo cliente'}
                </h3>
              </div>

              <button type="button" className="icon" onClick={closeForm}>
                <X size={18} />
              </button>
            </div>

            <div className="form-grid">
              <label className="wide">
                Nombre / Razón social
                <input
                  value={form.nombre}
                  onChange={(event) => setForm({ ...form, nombre: event.target.value })}
                  placeholder="Ej: Juan Carlos Quiñones"
                />
              </label>

              <label className="wide">
                Dirección
                <input
                  value={form.direccion}
                  onChange={(event) => setForm({ ...form, direccion: event.target.value })}
                  placeholder="Ej: Avenida Enriquillo 17"
                />
              </label>

              <label>
                RNC / Cédula
                <input
                  value={form.rnc}
                  onChange={(event) => setForm({ ...form, rnc: event.target.value })}
                  placeholder="Ej: 402-2582147-5"
                />
              </label>

              <label>
                Teléfono
                <input
                  value={form.telefono}
                  onChange={(event) => setForm({ ...form, telefono: event.target.value })}
                  placeholder="Ej: 809-399-6353"
                />
              </label>

              <label className="wide">
                Correo
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  placeholder="Ej: cliente@gmail.com"
                />
              </label>
            </div>

            <div className="cp-modal-actions">
              <button type="button" className="ghost-client-btn" onClick={closeForm}>
                Cancelar
              </button>

              <button type="button" className="primary" onClick={saveClient}>
                {editingId ? 'Guardar cambios' : 'Crear cliente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
