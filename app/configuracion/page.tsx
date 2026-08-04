'use client';

import { useMemo, useState } from 'react';
import PageFrame from '@/components/PageFrame';
import {
  Building2,
  Check,
  FolderKanban,
  KeyRound,
  ListChecks,
  Plus,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  UserCog,
  UsersRound,
  X,
} from 'lucide-react';

type EmpresaConfig = {
  nombre: string;
  rnc: string;
  telefono: string;
  email: string;
  direccion: string;
  moneda: string;
  itbis: number;
  prefijoCotizacion: string;
  prefijoFactura: string;
};

type UsuarioConfig = {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  activo: boolean;
  proyectos: string[];
  modulos: string[];
  acciones: string[];
};

type RolConfig = {
  id: string;
  nombre: string;
  descripcion: string;
  modulos: string[];
  acciones: string[];
};

type CategoriaConfig = {
  id: string;
  nombre: string;
  tipo: 'gasto' | 'general';
};

type SeguridadConfig = {
  sesionMinutos: number;
  exigirContrasenaFuerte: boolean;
  bloquearTrasIntentos: boolean;
  intentosPermitidos: number;
  auditoriaActiva: boolean;
};

type ConfiguracionGeneral = {
  empresa: EmpresaConfig;
  usuarios: UsuarioConfig[];
  roles: RolConfig[];
  categorias: CategoriaConfig[];
  seguridad: SeguridadConfig;
};

const STORAGE_KEY = 'construplata-configuracion-v2';

const modulosDisponibles = [
  'Dashboard',
  'Clientes',
  'Cotizaciones',
  'Proyectos',
  'Bitácoras',
  'Cobros y avances',
  'Facturación',
  'Gastos',
  'Cajas y bancos',
  'Reportes',
  'Configuraciones',
];

const accionesDisponibles = [
  'Ver',
  'Crear',
  'Editar',
  'Eliminar',
  'Aprobar',
  'Imprimir',
  'Exportar',
  'Administrar usuarios',
];

const initialConfig: ConfiguracionGeneral = {
  empresa: {
    nombre: 'CONSTRUPLATA SRL',
    rnc: '',
    telefono: '',
    email: '',
    direccion: 'Santo Domingo, República Dominicana',
    moneda: 'DOP',
    itbis: 18,
    prefijoCotizacion: 'COT',
    prefijoFactura: 'FAC',
  },
  usuarios: [
    {
      id: 'usuario-admin',
      nombre: 'Administrador',
      correo: '',
      rol: 'Administrador',
      activo: true,
      proyectos: ['Todos'],
      modulos: [...modulosDisponibles],
      acciones: [...accionesDisponibles],
    },
  ],
  roles: [
    {
      id: 'rol-admin',
      nombre: 'Administrador',
      descripcion: 'Acceso total al sistema.',
      modulos: [...modulosDisponibles],
      acciones: [...accionesDisponibles],
    },
    {
      id: 'rol-ingeniero',
      nombre: 'Ingeniero',
      descripcion: 'Gestión operativa y seguimiento de proyectos.',
      modulos: [
        'Dashboard',
        'Clientes',
        'Cotizaciones',
        'Proyectos',
        'Bitácoras',
        'Reportes',
      ],
      acciones: ['Ver', 'Crear', 'Editar', 'Imprimir'],
    },
    {
      id: 'rol-contabilidad',
      nombre: 'Contabilidad',
      descripcion: 'Gestión financiera, cobros, gastos y reportes.',
      modulos: [
        'Dashboard',
        'Cobros y avances',
        'Facturación',
        'Gastos',
        'Cajas y bancos',
        'Reportes',
      ],
      acciones: ['Ver', 'Crear', 'Editar', 'Imprimir', 'Exportar'],
    },
  ],
  categorias: [
    { id: 'cat-materiales', nombre: 'Materiales', tipo: 'gasto' },
    { id: 'cat-mano-obra', nombre: 'Mano de obra', tipo: 'gasto' },
    { id: 'cat-contratistas', nombre: 'Contratistas', tipo: 'gasto' },
    { id: 'cat-equipos', nombre: 'Equipos y maquinarias', tipo: 'gasto' },
    { id: 'cat-transporte', nombre: 'Transporte y combustible', tipo: 'gasto' },
    { id: 'cat-permisos', nombre: 'Permisos y trámites', tipo: 'gasto' },
    { id: 'cat-servicios', nombre: 'Servicios', tipo: 'gasto' },
    { id: 'cat-administrativos', nombre: 'Administrativos', tipo: 'gasto' },
    { id: 'cat-imprevistos', nombre: 'Imprevistos', tipo: 'gasto' },
    { id: 'cat-otros', nombre: 'Otros', tipo: 'general' },
  ],
  seguridad: {
    sesionMinutos: 480,
    exigirContrasenaFuerte: true,
    bloquearTrasIntentos: true,
    intentosPermitidos: 5,
    auditoriaActiva: true,
  },
};

const loadConfig = (): ConfiguracionGeneral => {
  if (typeof window === 'undefined') return initialConfig;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : initialConfig;
  } catch {
    return initialConfig;
  }
};

const saveConfig = (config: ConfiguracionGeneral) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

const makeId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function Page() {
  return (
    <PageFrame>
      <Configuraciones />
    </PageFrame>
  );
}

function Configuraciones() {
  const [config, setConfig] = useState<ConfiguracionGeneral>(loadConfig);
  const [tab, setTab] = useState<
    'empresa' | 'usuarios' | 'roles' | 'categorias' | 'seguridad'
  >('empresa');

  const [showUser, setShowUser] = useState(false);
  const [showRole, setShowRole] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [userForm, setUserForm] = useState({
    nombre: '',
    correo: '',
    rol: config.roles[0]?.nombre || 'Administrador',
    activo: true,
    proyectos: 'Todos',
    modulos: [] as string[],
    acciones: [] as string[],
  });

  const [roleForm, setRoleForm] = useState({
    nombre: '',
    descripcion: '',
    modulos: [] as string[],
    acciones: [] as string[],
  });

  const [categoryForm, setCategoryForm] = useState({
    nombre: '',
    tipo: 'gasto' as 'gasto' | 'general',
  });

  const selectedUser = useMemo(
    () => config.usuarios.find((user) => user.id === selectedUserId) || null,
    [config.usuarios, selectedUserId]
  );

  const persist = (next: ConfiguracionGeneral) => {
    setConfig(next);
    saveConfig(next);
  };

  const saveEmpresa = () => {
    persist(config);
    window.alert('Configuración de empresa guardada.');
  };

  const saveUsuario = () => {
    if (!userForm.nombre.trim() || !userForm.correo.trim()) {
      window.alert('Completa el nombre y el correo del usuario.');
      return;
    }

    const role = config.roles.find((item) => item.nombre === userForm.rol);

    const user: UsuarioConfig = {
      id: makeId('usuario'),
      nombre: userForm.nombre.trim(),
      correo: userForm.correo.trim(),
      rol: userForm.rol,
      activo: userForm.activo,
      proyectos: userForm.proyectos
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      modulos: userForm.modulos.length
        ? userForm.modulos
        : role?.modulos || [],
      acciones: userForm.acciones.length
        ? userForm.acciones
        : role?.acciones || [],
    };

    persist({
      ...config,
      usuarios: [...config.usuarios, user],
    });

    setShowUser(false);
    setUserForm({
      nombre: '',
      correo: '',
      rol: config.roles[0]?.nombre || 'Administrador',
      activo: true,
      proyectos: 'Todos',
      modulos: [],
      acciones: [],
    });
  };

  const saveRol = () => {
    if (!roleForm.nombre.trim()) {
      window.alert('Escribe el nombre del rol.');
      return;
    }

    const role: RolConfig = {
      id: makeId('rol'),
      nombre: roleForm.nombre.trim(),
      descripcion: roleForm.descripcion.trim(),
      modulos: roleForm.modulos,
      acciones: roleForm.acciones,
    };

    persist({
      ...config,
      roles: [...config.roles, role],
    });

    setShowRole(false);
    setRoleForm({
      nombre: '',
      descripcion: '',
      modulos: [],
      acciones: [],
    });
  };

  const saveCategoria = () => {
    if (!categoryForm.nombre.trim()) {
      window.alert('Escribe el nombre de la categoría.');
      return;
    }

    persist({
      ...config,
      categorias: [
        ...config.categorias,
        {
          id: makeId('categoria'),
          nombre: categoryForm.nombre.trim(),
          tipo: categoryForm.tipo,
        },
      ],
    });

    setShowCategory(false);
    setCategoryForm({
      nombre: '',
      tipo: 'gasto',
    });
  };

  const deleteUsuario = (id: string) => {
    if (!window.confirm('¿Eliminar este usuario de la configuración?')) return;

    persist({
      ...config,
      usuarios: config.usuarios.filter((user) => user.id !== id),
    });
  };

  const deleteRol = (id: string) => {
    if (!window.confirm('¿Eliminar este rol?')) return;

    persist({
      ...config,
      roles: config.roles.filter((role) => role.id !== id),
    });
  };

  const deleteCategoria = (id: string) => {
    if (!window.confirm('¿Eliminar esta categoría?')) return;

    persist({
      ...config,
      categorias: config.categorias.filter((category) => category.id !== id),
    });
  };

  const copyRolePermissions = (userId: string, roleName: string) => {
    const role = config.roles.find((item) => item.nombre === roleName);
    if (!role) return;

    persist({
      ...config,
      usuarios: config.usuarios.map((user) =>
        user.id === userId
          ? {
              ...user,
              modulos: [...role.modulos],
              acciones: [...role.acciones],
            }
          : user
      ),
    });
  };

  const toggleUserStatus = (userId: string) => {
    persist({
      ...config,
      usuarios: config.usuarios.map((user) =>
        user.id === userId ? { ...user, activo: !user.activo } : user
      ),
    });
  };

  const toggleArrayValue = (
    value: string,
    current: string[],
    setter: (next: string[]) => void
  ) => {
    setter(
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  };

  return (
    <>
      <div className="settings-top">
        <div className="settings-banner">
          <SlidersHorizontal size={22} />
          <div>
            <b>Centro de configuración del sistema</b>
            <span>
              Administra la empresa, usuarios, roles, categorías y seguridad.
            </span>
          </div>
        </div>
      </div>

      <section className="settings-tabs">
        <button
          className={tab === 'empresa' ? 'active' : ''}
          onClick={() => setTab('empresa')}
        >
          <Building2 size={17} />
          Empresa
        </button>

        <button
          className={tab === 'usuarios' ? 'active' : ''}
          onClick={() => setTab('usuarios')}
        >
          <UsersRound size={17} />
          Usuarios
        </button>

        <button
          className={tab === 'roles' ? 'active' : ''}
          onClick={() => setTab('roles')}
        >
          <UserCog size={17} />
          Roles
        </button>

        <button
          className={tab === 'categorias' ? 'active' : ''}
          onClick={() => setTab('categorias')}
        >
          <ListChecks size={17} />
          Categorías
        </button>

        <button
          className={tab === 'seguridad' ? 'active' : ''}
          onClick={() => setTab('seguridad')}
        >
          <ShieldCheck size={17} />
          Seguridad
        </button>
      </section>

      {tab === 'empresa' && (
        <section className="settings-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">Empresa</span>
              <h3>Datos generales y facturación</h3>
            </div>
          </div>

          <div className="settings-grid">
            <label>
              Nombre comercial
              <input
                value={config.empresa.nombre}
                onChange={(event) =>
                  setConfig({
                    ...config,
                    empresa: {
                      ...config.empresa,
                      nombre: event.target.value,
                    },
                  })
                }
              />
            </label>

            <label>
              RNC
              <input
                value={config.empresa.rnc}
                onChange={(event) =>
                  setConfig({
                    ...config,
                    empresa: {
                      ...config.empresa,
                      rnc: event.target.value,
                    },
                  })
                }
              />
            </label>

            <label>
              Teléfono
              <input
                value={config.empresa.telefono}
                onChange={(event) =>
                  setConfig({
                    ...config,
                    empresa: {
                      ...config.empresa,
                      telefono: event.target.value,
                    },
                  })
                }
              />
            </label>

            <label>
              Correo
              <input
                type="email"
                value={config.empresa.email}
                onChange={(event) =>
                  setConfig({
                    ...config,
                    empresa: {
                      ...config.empresa,
                      email: event.target.value,
                    },
                  })
                }
              />
            </label>

            <label className="wide">
              Dirección
              <input
                value={config.empresa.direccion}
                onChange={(event) =>
                  setConfig({
                    ...config,
                    empresa: {
                      ...config.empresa,
                      direccion: event.target.value,
                    },
                  })
                }
              />
            </label>

            <label>
              Moneda
              <select
                value={config.empresa.moneda}
                onChange={(event) =>
                  setConfig({
                    ...config,
                    empresa: {
                      ...config.empresa,
                      moneda: event.target.value,
                    },
                  })
                }
              >
                <option value="DOP">DOP · Peso dominicano</option>
                <option value="USD">USD · Dólar estadounidense</option>
              </select>
            </label>

            <label>
              ITBIS (%)
              <input
                type="number"
                min="0"
                max="100"
                value={config.empresa.itbis}
                onChange={(event) =>
                  setConfig({
                    ...config,
                    empresa: {
                      ...config.empresa,
                      itbis: Number(event.target.value),
                    },
                  })
                }
              />
            </label>

            <label>
              Prefijo cotizaciones
              <input
                value={config.empresa.prefijoCotizacion}
                onChange={(event) =>
                  setConfig({
                    ...config,
                    empresa: {
                      ...config.empresa,
                      prefijoCotizacion: event.target.value.toUpperCase(),
                    },
                  })
                }
              />
            </label>

            <label>
              Prefijo facturas
              <input
                value={config.empresa.prefijoFactura}
                onChange={(event) =>
                  setConfig({
                    ...config,
                    empresa: {
                      ...config.empresa,
                      prefijoFactura: event.target.value.toUpperCase(),
                    },
                  })
                }
              />
            </label>
          </div>

          <div className="panel-actions">
            <button type="button" className="primary" onClick={saveEmpresa}>
              <Save size={17} />
              Guardar configuración
            </button>
          </div>
        </section>
      )}

      {tab === 'usuarios' && (
        <section className="settings-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">Usuarios</span>
              <h3>Accesos, permisos y proyectos asignados</h3>
            </div>

            <button
              type="button"
              className="primary"
              onClick={() => setShowUser(true)}
            >
              <Plus size={17} />
              Nuevo usuario
            </button>
          </div>

          <div className="user-grid">
            {config.usuarios.map((user) => (
              <article className="user-card" key={user.id}>
                <div className="user-head">
                  <div>
                    <span className={user.activo ? 'status active' : 'status'}>
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </span>
                    <h3>{user.nombre}</h3>
                    <p>{user.correo || 'Sin correo'}</p>
                  </div>

                  <button
                    type="button"
                    className="icon danger"
                    onClick={() => deleteUsuario(user.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="user-meta">
                  <div>
                    <span>Rol</span>
                    <b>{user.rol}</b>
                  </div>

                  <div>
                    <span>Proyectos</span>
                    <b>{user.proyectos.join(', ') || 'Sin asignación'}</b>
                  </div>
                </div>

                <div className="user-actions">
                  <button
                    type="button"
                    className="ghost-client-btn"
                    onClick={() => copyRolePermissions(user.id, user.rol)}
                  >
                    Copiar permisos del rol
                  </button>

                  <button
                    type="button"
                    className="ghost-client-btn"
                    onClick={() => toggleUserStatus(user.id)}
                  >
                    {user.activo ? 'Desactivar' : 'Activar'}
                  </button>

                  <button
                    type="button"
                    className="ghost-client-btn"
                    onClick={() => setSelectedUserId(user.id)}
                  >
                    Ver permisos
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {tab === 'roles' && (
        <section className="settings-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">Roles</span>
              <h3>Perfiles de acceso reutilizables</h3>
            </div>

            <button
              type="button"
              className="primary"
              onClick={() => setShowRole(true)}
            >
              <Plus size={17} />
              Nuevo rol
            </button>
          </div>

          <div className="role-grid">
            {config.roles.map((role) => (
              <article className="role-card" key={role.id}>
                <div className="role-head">
                  <div>
                    <KeyRound size={20} />
                    <h3>{role.nombre}</h3>
                  </div>

                  <button
                    type="button"
                    className="icon danger"
                    onClick={() => deleteRol(role.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <p>{role.descripcion || 'Sin descripción.'}</p>

                <div className="role-summary">
                  <span>{role.modulos.length} módulos</span>
                  <span>{role.acciones.length} acciones</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {tab === 'categorias' && (
        <section className="settings-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">Categorías</span>
              <h3>Clasificación para gastos y reportes</h3>
            </div>

            <button
              type="button"
              className="primary"
              onClick={() => setShowCategory(true)}
            >
              <Plus size={17} />
              Nueva categoría
            </button>
          </div>

          <div className="category-grid">
            {config.categorias.map((category) => (
              <article className="category-card" key={category.id}>
                <div>
                  <span>{category.tipo === 'gasto' ? 'Gasto' : 'General'}</span>
                  <h3>{category.nombre}</h3>
                </div>

                <button
                  type="button"
                  className="icon danger"
                  onClick={() => deleteCategoria(category.id)}
                >
                  <Trash2 size={16} />
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      {tab === 'seguridad' && (
        <section className="settings-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">Seguridad</span>
              <h3>Sesiones, contraseñas y auditoría</h3>
            </div>
          </div>

          <div className="security-grid">
            <label>
              Duración de sesión (minutos)
              <input
                type="number"
                min="15"
                value={config.seguridad.sesionMinutos}
                onChange={(event) =>
                  setConfig({
                    ...config,
                    seguridad: {
                      ...config.seguridad,
                      sesionMinutos: Number(event.target.value),
                    },
                  })
                }
              />
            </label>

            <label>
              Intentos permitidos
              <input
                type="number"
                min="1"
                max="20"
                value={config.seguridad.intentosPermitidos}
                onChange={(event) =>
                  setConfig({
                    ...config,
                    seguridad: {
                      ...config.seguridad,
                      intentosPermitidos: Number(event.target.value),
                    },
                  })
                }
              />
            </label>

            <Toggle
              label="Exigir contraseña fuerte"
              checked={config.seguridad.exigirContrasenaFuerte}
              onChange={(checked) =>
                setConfig({
                  ...config,
                  seguridad: {
                    ...config.seguridad,
                    exigirContrasenaFuerte: checked,
                  },
                })
              }
            />

            <Toggle
              label="Bloquear después de varios intentos"
              checked={config.seguridad.bloquearTrasIntentos}
              onChange={(checked) =>
                setConfig({
                  ...config,
                  seguridad: {
                    ...config.seguridad,
                    bloquearTrasIntentos: checked,
                  },
                })
              }
            />

            <Toggle
              label="Auditoría de acciones activa"
              checked={config.seguridad.auditoriaActiva}
              onChange={(checked) =>
                setConfig({
                  ...config,
                  seguridad: {
                    ...config.seguridad,
                    auditoriaActiva: checked,
                  },
                })
              }
            />
          </div>

          <div className="panel-actions">
            <button
              type="button"
              className="primary"
              onClick={() => {
                persist(config);
                window.alert('Configuración de seguridad guardada.');
              }}
            >
              <Save size={17} />
              Guardar seguridad
            </button>
          </div>
        </section>
      )}

      {showUser && (
        <Modal title="Nuevo usuario" onClose={() => setShowUser(false)}>
          <div className="settings-grid">
            <label>
              Nombre
              <input
                value={userForm.nombre}
                onChange={(event) =>
                  setUserForm({ ...userForm, nombre: event.target.value })
                }
              />
            </label>

            <label>
              Correo
              <input
                type="email"
                value={userForm.correo}
                onChange={(event) =>
                  setUserForm({ ...userForm, correo: event.target.value })
                }
              />
            </label>

            <label>
              Rol
              <select
                value={userForm.rol}
                onChange={(event) =>
                  setUserForm({ ...userForm, rol: event.target.value })
                }
              >
                {config.roles.map((role) => (
                  <option key={role.id}>{role.nombre}</option>
                ))}
              </select>
            </label>

            <label>
              Proyectos asignados
              <input
                value={userForm.proyectos}
                onChange={(event) =>
                  setUserForm({ ...userForm, proyectos: event.target.value })
                }
                placeholder="Todos o nombres separados por coma"
              />
            </label>
          </div>

          <Checklist
            title="Acceso a módulos"
            values={modulosDisponibles}
            selected={userForm.modulos}
            onToggle={(value) =>
              toggleArrayValue(value, userForm.modulos, (next) =>
                setUserForm({ ...userForm, modulos: next })
              )
            }
          />

          <Checklist
            title="Permisos por acción"
            values={accionesDisponibles}
            selected={userForm.acciones}
            onToggle={(value) =>
              toggleArrayValue(value, userForm.acciones, (next) =>
                setUserForm({ ...userForm, acciones: next })
              )
            }
          />

          <div className="panel-actions">
            <button className="primary" onClick={saveUsuario}>
              <Save size={17} />
              Guardar usuario
            </button>
          </div>
        </Modal>
      )}

      {showRole && (
        <Modal title="Nuevo rol" onClose={() => setShowRole(false)}>
          <div className="settings-grid">
            <label>
              Nombre del rol
              <input
                value={roleForm.nombre}
                onChange={(event) =>
                  setRoleForm({ ...roleForm, nombre: event.target.value })
                }
              />
            </label>

            <label className="wide">
              Descripción
              <input
                value={roleForm.descripcion}
                onChange={(event) =>
                  setRoleForm({
                    ...roleForm,
                    descripcion: event.target.value,
                  })
                }
              />
            </label>
          </div>

          <Checklist
            title="Módulos del rol"
            values={modulosDisponibles}
            selected={roleForm.modulos}
            onToggle={(value) =>
              toggleArrayValue(value, roleForm.modulos, (next) =>
                setRoleForm({ ...roleForm, modulos: next })
              )
            }
          />

          <Checklist
            title="Acciones permitidas"
            values={accionesDisponibles}
            selected={roleForm.acciones}
            onToggle={(value) =>
              toggleArrayValue(value, roleForm.acciones, (next) =>
                setRoleForm({ ...roleForm, acciones: next })
              )
            }
          />

          <div className="panel-actions">
            <button className="primary" onClick={saveRol}>
              <Save size={17} />
              Guardar rol
            </button>
          </div>
        </Modal>
      )}

      {showCategory && (
        <Modal title="Nueva categoría" onClose={() => setShowCategory(false)}>
          <div className="settings-grid">
            <label>
              Nombre
              <input
                value={categoryForm.nombre}
                onChange={(event) =>
                  setCategoryForm({
                    ...categoryForm,
                    nombre: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Tipo
              <select
                value={categoryForm.tipo}
                onChange={(event) =>
                  setCategoryForm({
                    ...categoryForm,
                    tipo: event.target.value as 'gasto' | 'general',
                  })
                }
              >
                <option value="gasto">Gasto</option>
                <option value="general">General</option>
              </select>
            </label>
          </div>

          <div className="panel-actions">
            <button className="primary" onClick={saveCategoria}>
              <Save size={17} />
              Guardar categoría
            </button>
          </div>
        </Modal>
      )}

      {selectedUser && (
        <Modal
          title={`Permisos de ${selectedUser.nombre}`}
          onClose={() => setSelectedUserId(null)}
        >
          <Checklist
            title="Módulos asignados"
            values={modulosDisponibles}
            selected={selectedUser.modulos}
            readOnly
          />

          <Checklist
            title="Acciones permitidas"
            values={accionesDisponibles}
            selected={selectedUser.acciones}
            readOnly
          />
        </Modal>
      )}

      <style jsx>{`
        .settings-top {
          margin-bottom: 18px;
        }

        .settings-banner {
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

        .settings-banner b,
        .settings-banner span {
          display: block;
        }

        .settings-banner span {
          margin-top: 4px;
          color: var(--muted);
          font-size: 12px;
        }

        .settings-tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }

        .settings-tabs button {
          min-height: 42px;
          padding: 0 14px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid var(--line);
          border-radius: 12px;
          color: var(--muted);
          background: var(--card);
          font-weight: 800;
        }

        .settings-tabs button.active {
          color: #fff;
          border-color: transparent;
          background: linear-gradient(135deg, #1769e0, #168edc);
        }

        .settings-panel {
          padding: 22px;
          border: 1px solid var(--line);
          border-radius: 22px;
          background: var(--card);
          box-shadow: var(--soft-shadow);
        }

        .panel-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .panel-head h3 {
          margin: 6px 0 0;
        }

        .settings-grid,
        .security-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .settings-grid label,
        .security-grid label {
          display: grid;
          gap: 7px;
          color: var(--muted);
          font-size: 11px;
          font-weight: 800;
        }

        .settings-grid input,
        .settings-grid select,
        .security-grid input {
          min-height: 44px;
          padding: 0 12px;
          border: 1px solid var(--line);
          border-radius: 12px;
          color: var(--text);
          background: var(--card);
        }

        .wide {
          grid-column: 1 / -1;
        }

        .panel-actions {
          margin-top: 18px;
          display: flex;
          justify-content: flex-end;
        }

        .user-grid,
        .role-grid,
        .category-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .user-card,
        .role-card,
        .category-card {
          padding: 18px;
          border: 1px solid var(--line);
          border-radius: 18px;
          background: rgba(23, 105, 224, 0.025);
        }

        .user-head,
        .role-head,
        .category-card {
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }

        .user-card h3,
        .role-card h3,
        .category-card h3 {
          margin: 8px 0 4px;
        }

        .user-card p,
        .role-card p {
          margin: 0;
          color: var(--muted);
          font-size: 12px;
        }

        .status {
          display: inline-flex;
          padding: 6px 9px;
          border-radius: 999px;
          color: #a24b4b;
          background: rgba(162, 75, 75, 0.1);
          font-size: 10px;
          font-weight: 900;
        }

        .status.active {
          color: #19885b;
          background: rgba(25, 136, 91, 0.12);
        }

        .user-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 9px;
          margin-top: 14px;
        }

        .user-meta > div {
          padding: 11px;
          border: 1px solid var(--line);
          border-radius: 12px;
        }

        .user-meta span,
        .user-meta b {
          display: block;
        }

        .user-meta span {
          color: var(--muted);
          font-size: 9px;
        }

        .user-meta b {
          margin-top: 5px;
          font-size: 12px;
        }

        .user-actions {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
          margin-top: 14px;
        }

        .role-head > div {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--blue);
        }

        .role-summary {
          display: flex;
          gap: 8px;
          margin-top: 14px;
        }

        .role-summary span,
        .category-card span {
          padding: 6px 9px;
          border-radius: 999px;
          color: var(--blue);
          background: rgba(23, 105, 224, 0.1);
          font-size: 10px;
          font-weight: 900;
        }

        .category-card {
          align-items: center;
        }

        .danger {
          color: #c25151;
        }

        @media (max-width: 800px) {
          .settings-grid,
          .security-grid,
          .user-grid,
          .role-grid,
          .category-grid {
            grid-template-columns: 1fr;
          }

          .wide {
            grid-column: auto;
          }

          .panel-head {
            align-items: stretch;
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      className={`toggle-row ${checked ? 'checked' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span>{label}</span>
      <i>{checked ? <Check size={15} /> : null}</i>

      <style jsx>{`
        .toggle-row {
          min-height: 52px;
          padding: 12px 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          border: 1px solid var(--line);
          border-radius: 14px;
          color: var(--text);
          background: var(--card);
          font-weight: 800;
        }

        .toggle-row i {
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          color: #fff;
          background: var(--line);
        }

        .toggle-row.checked i {
          background: #1769e0;
        }
      `}</style>
    </button>
  );
}

function Checklist({
  title,
  values,
  selected,
  onToggle,
  readOnly = false,
}: {
  title: string;
  values: string[];
  selected: string[];
  onToggle?: (value: string) => void;
  readOnly?: boolean;
}) {
  return (
    <section className="checklist">
      <h3>{title}</h3>

      <div>
        {values.map((value) => {
          const checked = selected.includes(value);

          return (
            <button
              type="button"
              key={value}
              className={checked ? 'checked' : ''}
              onClick={() => !readOnly && onToggle?.(value)}
            >
              <i>{checked ? <Check size={14} /> : null}</i>
              {value}
            </button>
          );
        })}
      </div>

      <style jsx>{`
        .checklist {
          margin-top: 18px;
        }

        .checklist h3 {
          margin: 0 0 10px;
          font-size: 14px;
        }

        .checklist > div {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .checklist button {
          min-height: 38px;
          padding: 0 11px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border: 1px solid var(--line);
          border-radius: 11px;
          color: var(--muted);
          background: var(--card);
        }

        .checklist button i {
          width: 20px;
          height: 20px;
          display: grid;
          place-items: center;
          border-radius: 6px;
          background: rgba(23, 105, 224, 0.08);
        }

        .checklist button.checked {
          color: var(--blue);
          border-color: rgba(23, 105, 224, 0.35);
          background: rgba(23, 105, 224, 0.08);
        }
      `}</style>
    </section>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="cp-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(event) => event.stopPropagation()}>
        <div className="settings-modal-head">
          <h2>{title}</h2>
          <button type="button" className="icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {children}

        <style jsx>{`
          .settings-modal {
            width: min(900px, 100%);
            max-height: calc(100vh - 48px);
            padding: 24px;
            overflow: auto;
            border: 1px solid var(--line);
            border-radius: 24px;
            background: var(--card);
            box-shadow: 0 30px 90px rgba(0, 0, 0, 0.3);
          }

          .settings-modal-head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
            margin-bottom: 18px;
          }

          .settings-modal-head h2 {
            margin: 0;
          }
        `}</style>
      </div>
    </div>
  );
}
