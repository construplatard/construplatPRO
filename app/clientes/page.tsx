'use client';

import { useMemo, useState } from 'react';
import AppShell from '../../components/AppShell';
import { useData } from '../../components/DataProvider';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  UserRound,
  Mail,
  Phone,
  MapPin,
  IdCard,
} from 'lucide-react';

type ClienteForm = {
  nombre: string;
  direccion: string;
  rnc: string;
  telefono: string;
  correo: string;
};

const emptyForm: ClienteForm = {
  nombre: '',
  direccion: '',
  rnc: '',
  telefono: '',
  correo: '',
};

export default function ClientesPage() {
  const store = useData() as any;
  const data = store.data || { clientes: [] };
  const setData = store.setData;

  const [search, setSearch] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ClienteForm>(emptyForm);

  const clientes = data.clientes || [];

  const filteredClientes = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return clientes;

    return clientes.filter((cliente: any) =>
      [
        cliente.nombre,
        cliente.direccion,
        cliente.rnc,
        cliente.telefono,
        cliente.correo,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [clientes, search]);

  const persistData = (nextData: any) => {
    if (!setData) return;
    try {
      setData(nextData);
    } catch {
      setData(() => nextData);
    }
  };

  const openNewClient = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpenForm(true);
  };

  const openEditClient = (cliente: any) => {
    setEditingId(cliente.id);
    setForm({
      nombre: cliente.nombre || '',
      direccion: cliente.direccion || '',
      rnc: cliente.rnc || '',
      telefono: cliente.telefono || '',
      correo: cliente.correo || '',
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

    let nextClientes = [...clientes];

    if (editingId) {
      nextClientes = nextClientes.map((cliente: any) =>
        cliente.id === editingId
          ? {
              ...cliente,
              ...form,
            }
          : cliente
      );
    } else {
      nextClientes.unshift({
        id: crypto.randomUUID(),
        ...form,
      });
    }

    persistData({
      ...data,
      clientes: nextClientes,
    });

    closeForm();
  };

  const deleteClient = (id: string) => {
    const ok = confirm('¿Seguro que deseas eliminar este cliente?');
    if (!ok) return;

    const nextClientes = clientes.filter((cliente: any) => cliente.id !== id);

    persistData({
      ...data,
      clientes: nextClientes,
    });
  };

  return (
    <AppShell>
      <div className="clientes-v2-page">
        {/* AQUÍ YA NO REPETIMOS EL TÍTULO "CLIENTES" */}
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
                placeholder="Buscar cliente, correo, teléfono..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button className="primary" onClick={openNewClient}>
              <Plus size={18} />
              Nuevo cliente
            </button>
          </div>
        </div>

        <div className="panel clientes-summary-cards">
          <div className="cliente-mini-stat">
            <div className="cliente-mini-icon">
              <UserRound size={18} />
            </div>
            <div>
              <span>Total clientes</span>
              <b>{clientes.length}</b>
            </div>
          </div>

          <div className="cliente-mini-stat">
            <div className="cliente-mini-icon">
              <Mail size={18} />
            </div>
            <div>
              <span>Con correo</span>
              <b>{clientes.filter((c: any) => c.correo).length}</b>
            </div>
          </div>

          <div className="cliente-mini-stat">
            <div className="cliente-mini-icon">
              <Phone size={18} />
            </div>
            <div>
              <span>Con teléfono</span>
              <b>{clientes.filter((c: any) => c.telefono).length}</b>
            </div>
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
                filteredClientes.map((cliente: any) => (
                  <tr key={cliente.id}>
                    <td>
                      <div className="cliente-main-cell">
                        <b>{cliente.nombre || 'Sin nombre'}</b>
                        <small>{cliente.direccion || 'Sin dirección'}</small>
                      </div>
                    </td>

                    <td>{cliente.rnc || '—'}</td>
                    <td>{cliente.telefono || '—'}</td>
                    <td>{cliente.correo || '—'}</td>

                    <td>
                      <div className="cliente-actions">
                        <button
                          className="cliente-action-btn edit"
                          onClick={() => openEditClient(cliente)}
                          title="Editar cliente"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
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
                    <div className="empty">
                      No se encontraron clientes registrados.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {openForm && (
          <div className="cp-modal-overlay" onClick={closeForm}>
            <div
              className="cp-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="cp-modal-head">
                <div>
                  <span className="eyebrow">
                    {editingId ? 'Editar cliente' : 'Nuevo cliente'}
                  </span>
                  <h3>
                    {editingId
                      ? 'Actualizar información del cliente'
                      : 'Registrar nuevo cliente'}
                  </h3>
                </div>

                <button className="icon" onClick={closeForm}>
                  <X size={18} />
                </button>
              </div>

              <div className="form-grid">
                <label className="wide">
                  Nombre / Razón social
                  <input
                    value={form.nombre}
                    onChange={(e) =>
                      setForm({ ...form, nombre: e.target.value })
                    }
                    placeholder="Ej: Juan Carlos Quiñones"
                  />
                </label>

                <label className="wide">
                  Dirección
                  <input
                    value={form.direccion}
                    onChange={(e) =>
                      setForm({ ...form, direccion: e.target.value })
                    }
                    placeholder="Ej: Avenida Enriquillo 17"
                  />
                </label>

                <label>
                  RNC / Cédula
                  <input
                    value={form.rnc}
                    onChange={(e) =>
                      setForm({ ...form, rnc: e.target.value })
                    }
                    placeholder="Ej: 402-2582147-5"
                  />
                </label>

                <label>
                  Teléfono
                  <input
                    value={form.telefono}
                    onChange={(e) =>
                      setForm({ ...form, telefono: e.target.value })
                    }
                    placeholder="Ej: 809-399-6353"
                  />
                </label>

                <label className="wide">
                  Correo
                  <input
                    type="email"
                    value={form.correo}
                    onChange={(e) =>
                      setForm({ ...form, correo: e.target.value })
                    }
                    placeholder="Ej: cliente@gmail.com"
                  />
                </label>
              </div>

              <div className="cp-modal-actions">
                <button className="ghost-client-btn" onClick={closeForm}>
                  Cancelar
                </button>

                <button className="primary" onClick={saveClient}>
                  {editingId ? 'Guardar cambios' : 'Crear cliente'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
