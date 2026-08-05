'use client';

import { useEffect, useMemo, useState } from 'react';
import PageFrame from '@/components/PageFrame';
import { supabase } from '@/lib/supabase';
import {
  Building2,
  Check,
  KeyRound,
  ListChecks,
  Plus,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  UserCog,
  UsersRound,
  History,
  RefreshCw,
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

type AuditoriaAcceso = {
  id: string;
  user_id: string | null;
  nombre: string;
  correo: string;
  evento: string;
  dispositivo: string;
  navegador: string;
  ip: string | null;
  creado_en: string;
};

type ConfiguracionGeneral = {
  empresa: EmpresaConfig;
  usuarios: UsuarioConfig[];
  roles: RolConfig[];
  categorias: CategoriaConfig[];
  seguridad: SeguridadConfig;
};

const STORAGE_KEY = 'construplata-configuracion-v3';

const modulosDisponibles = [
  'Dashboard',
  'Clientes',
  'Cotizaciones',
  'Proyectos',
  'Bitácoras',
  'Cobros y avances',
  'Facturación',
  'Gastos',
  'Caja y bancos',
  'Reportes',
  'Configuración',
];

const accionesDisponibles = [
  'Ver',
  'Crear',
  'Editar',
  'Eliminar',
  'Aprobar',
  'Imprimir',
  'Exportar',
  'Registrar pago',
  'Registrar cobro',
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
  usuarios: [],
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
      descripcion: 'Gestión técnica y seguimiento de proyectos.',
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
        'Caja y bancos',
        'Reportes',
      ],
      acciones: [
        'Ver',
        'Crear',
        'Editar',
        'Imprimir',
        'Exportar',
        'Registrar pago',
        'Registrar cobro',
      ],
    },
    {
      id: 'rol-compras',
      nombre: 'Compras',
      descripcion: 'Gestión de materiales, suplidores y adquisiciones.',
      modulos: ['Dashboard', 'Proyectos', 'Gastos', 'Reportes'],
      acciones: ['Ver', 'Crear', 'Editar', 'Imprimir'],
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

function loadConfig(): ConfiguracionGeneral {
  if (typeof window === 'undefined') return initialConfig;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialConfig;

    const saved = JSON.parse(raw) as Partial<ConfiguracionGeneral>;

    return {
      ...initialConfig,
      ...saved,
      empresa: {
        ...initialConfig.empresa,
        ...(saved.empresa || {}),
      },
      seguridad: {
        ...initialConfig.seguridad,
        ...(saved.seguridad || {}),
      },
      roles: saved.roles?.length ? saved.roles : initialConfig.roles,
      categorias: saved.categorias?.length
        ? saved.categorias
        : initialConfig.categorias,
      usuarios: saved.usuarios || [],
    };
  } catch {
    return initialConfig;
  }
}

function saveConfig(config: ConfiguracionGeneral) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

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
    | 'empresa'
    | 'usuarios'
    | 'roles'
    | 'categorias'
    | 'seguridad'
    | 'auditoria'
  >('empresa');

  const [showUser, setShowUser] = useState(false);
  const [showRole, setShowRole] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [auditoria, setAuditoria] = useState<AuditoriaAcceso[]>([]);
  const [loadingAuditoria, setLoadingAuditoria] = useState(false);

  const [userForm, setUserForm] = useState({
    nombre: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    rol: 'Administrador',
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

  const persist = (next: ConfiguracionGeneral) => {
    setConfig(next);
    saveConfig(next);
  };

  useEffect(() => {
    if (!config.roles.some((role) => role.nombre === userForm.rol)) {
      setUserForm((current) => ({
        ...current,
        rol: config.roles[0]?.nombre || 'Administrador',
      }));
    }
  }, [config.roles, userForm.rol]);

  const cargarAuditoria = async () => {
    setLoadingAuditoria(true);

    const { data, error } = await supabase
      .from('auditoria_accesos')
      .select(
        'id,user_id,nombre,correo,evento,dispositivo,navegador,ip,creado_en'
      )
      .order('creado_en', { ascending: false })
      .limit(300);

    if (error) {
      window.alert(
        `No se pudo cargar la auditoría: ${error.message}`
      );
      setLoadingAuditoria(false);
      return;
    }

    setAuditoria((data || []) as AuditoriaAcceso[]);
    setLoadingAuditoria(false);
  };

  useEffect(() => {
    if (tab === 'auditoria') {
      cargarAuditoria();
    }
  }, [tab]);

  const selectedRole = useMemo(
    () => config.roles.find((role) => role.nombre === userForm.rol),
    [config.roles, userForm.rol]
  );

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

  const saveEmpresa = () => {
    persist(config);
    window.alert('Configuración de empresa guardada.');
  };

  const saveUsuario = async () => {
    if (!userForm.nombre.trim() || !userForm.correo.trim()) {
      window.alert('Completa el nombre y el correo del usuario.');
      return;
    }

    if (userForm.contrasena.length < 6) {
      window.alert('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (userForm.contrasena !== userForm.confirmarContrasena) {
      window.alert('Las contraseñas no coinciden.');
      return;
    }

    const correo = userForm.correo.trim().toLowerCase();

    if (
      config.usuarios.some(
        (usuario) => usuario.correo.toLowerCase() === correo
      )
    ) {
      window.alert('Ya existe un usuario con ese correo.');
      return;
    }

    const modulos = userForm.modulos.length
      ? userForm.modulos
      : selectedRole?.modulos || [];

    const acciones = userForm.acciones.length
      ? userForm.acciones
      : selectedRole?.acciones || [];

    setCreatingUser(true);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: userForm.nombre.trim(),
          correo,
          contrasena: userForm.contrasena,
          rol: userForm.rol,
          activo: userForm.activo,
          modulos,
          acciones,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        window.alert(result.error || 'No se pudo crear el usuario.');
        return;
      }

      const user: UsuarioConfig = {
        id: result.user.id,
        nombre: result.user.nombre,
        correo: result.user.correo,
        rol: result.user.rol,
        activo: result.user.activo,
        proyectos: userForm.proyectos
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        modulos,
        acciones,
      };

      persist({
        ...config,
        usuarios: [...config.usuarios, user],
      });

      setShowUser(false);
      setUserForm({
        nombre: '',
        correo: '',
        contrasena: '',
        confirmarContrasena: '',
        rol: config.roles[0]?.nombre || 'Administrador',
        activo: true,
        proyectos: 'Todos',
        modulos: [],
        acciones: [],
      });

      window.alert(
        'Usuario creado correctamente. Ya puede iniciar sesión desde PC o teléfono.'
      );
    } catch {
      window.alert(
        'No se pudo conectar con el servidor para crear el usuario.'
      );
    } finally {
      setCreatingUser(false);
    }
  };

  const saveRol = () => {
    if (!roleForm.nombre.trim()) {
      window.alert('Escribe el nombre del rol.');
      return;
    }

    persist({
      ...config,
      roles: [
        ...config.roles,
        {
          id: makeId('rol'),
          nombre: roleForm.nombre.trim(),
          descripcion: roleForm.descripcion.trim(),
          modulos: roleForm.modulos,
          acciones: roleForm.acciones,
        },
      ],
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

  return (
    <>
      <div className="settings-top">
        <div className="settings-banner">
          <SlidersHorizontal size={22} />
          <div>
            <b>Centro de configuración del sistema</b>
            <span>
              Empresa, usuarios, roles, categorías y seguridad.
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

        <button
          className={tab === 'auditoria' ? 'active' : ''}
          onClick={() => setTab('auditoria')}
        >
          <History size={17} />
          Auditoría
        </button>
      </section>

      {tab === 'empresa' && (
        <section className="settings-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">Empresa</span>
              <h3>Datos generales y facturación</h3>
            </div>

            <button className="primary" onClick={saveEmpresa}>
              <Save size={17} />
              Guardar
            </button>
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

            <label className="full">
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
                <option value="DOP">DOP</option>
                <option value="USD">USD</option>
              </select>
            </label>

            <label>
              ITBIS %
              <input
                type="number"
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
          </div>
        </section>
      )}

      {tab === 'usuarios' && (
        <section className="settings-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">Usuarios</span>
              <h3>Usuarios reales de Supabase</h3>
            </div>

            <button className="primary" onClick={() => setShowUser(true)}>
              <Plus size={17} />
              Nuevo usuario
            </button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {config.usuarios.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty">
                      Todavía no has creado usuarios desde esta pantalla.
                    </td>
                  </tr>
                ) : (
                  config.usuarios.map((user) => (
                    <tr key={user.id}>
                      <td>{user.nombre}</td>
                      <td>{user.correo}</td>
                      <td>{user.rol}</td>
                      <td>
                        <span
                          className={
                            user.activo
                              ? 'status active'
                              : 'status'
                          }
                        >
                          {user.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="danger-icon"
                          onClick={() =>
                            persist({
                              ...config,
                              usuarios: config.usuarios.filter(
                                (item) => item.id !== user.id
                              ),
                            })
                          }
                          title="Quitar de la lista local"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <p className="note">
            Al crear un usuario aquí, también se crea en Supabase
            Authentication y puede iniciar sesión desde cualquier dispositivo.
          </p>
        </section>
      )}

      {tab === 'roles' && (
        <section className="settings-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">Roles</span>
              <h3>Perfiles y permisos predeterminados</h3>
            </div>

            <button className="primary" onClick={() => setShowRole(true)}>
              <Plus size={17} />
              Nuevo rol
            </button>
          </div>

          <div className="cards-grid">
            {config.roles.map((role) => (
              <article className="role-card" key={role.id}>
                <div>
                  <b>{role.nombre}</b>
                  <p>{role.descripcion}</p>
                </div>

                <div className="chips">
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
              <h3>Clasificación de gastos y registros</h3>
            </div>

            <button
              className="primary"
              onClick={() => setShowCategory(true)}
            >
              <Plus size={17} />
              Nueva categoría
            </button>
          </div>

          <div className="cards-grid">
            {config.categorias.map((category) => (
              <article className="role-card" key={category.id}>
                <div>
                  <b>{category.nombre}</b>
                  <p>
                    {category.tipo === 'gasto'
                      ? 'Categoría de gasto'
                      : 'Categoría general'}
                  </p>
                </div>
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
              <h3>Políticas del sistema</h3>
            </div>

            <button
              className="primary"
              onClick={() => {
                persist(config);
                window.alert('Configuración de seguridad guardada.');
              }}
            >
              <Save size={17} />
              Guardar
            </button>
          </div>

          <div className="settings-grid">
            <label>
              Minutos de sesión
              <input
                type="number"
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
          </div>

          <div className="switch-list">
            {[
              {
                key: 'exigirContrasenaFuerte' as const,
                label: 'Exigir contraseña fuerte',
              },
              {
                key: 'bloquearTrasIntentos' as const,
                label: 'Bloquear después de varios intentos',
              },
              {
                key: 'auditoriaActiva' as const,
                label: 'Auditoría activa',
              },
            ].map((item) => (
              <button
                key={item.key}
                className={
                  config.seguridad[item.key]
                    ? 'switch-row active'
                    : 'switch-row'
                }
                onClick={() =>
                  setConfig({
                    ...config,
                    seguridad: {
                      ...config.seguridad,
                      [item.key]: !config.seguridad[item.key],
                    },
                  })
                }
              >
                <span>{item.label}</span>
                <Check size={17} />
              </button>
            ))}
          </div>
        </section>
      )}

      {tab === 'auditoria' && (
        <section className="settings-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">Auditoría</span>
              <h3>Registro de accesos de usuarios</h3>
            </div>

            <button
              className="primary"
              onClick={cargarAuditoria}
              disabled={loadingAuditoria}
            >
              <RefreshCw size={17} />
              {loadingAuditoria ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>

          <div className="table-wrap audit-table">
            <table>
              <thead>
                <tr>
                  <th>Fecha y hora</th>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Evento</th>
                  <th>Dispositivo</th>
                  <th>Navegador</th>
                </tr>
              </thead>

              <tbody>
                {auditoria.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty">
                      {loadingAuditoria
                        ? 'Cargando auditoría...'
                        : 'Todavía no hay accesos registrados.'}
                    </td>
                  </tr>
                ) : (
                  auditoria.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {new Intl.DateTimeFormat('es-DO', {
                          dateStyle: 'short',
                          timeStyle: 'medium',
                        }).format(new Date(item.creado_en))}
                      </td>
                      <td>{item.nombre || 'Usuario'}</td>
                      <td>{item.correo}</td>
                      <td>
                        <span className="status active">
                          {item.evento}
                        </span>
                      </td>
                      <td>{item.dispositivo}</td>
                      <td>{item.navegador}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <p className="note">
            Cada inicio de sesión correcto queda registrado con usuario,
            fecha, hora, dispositivo y navegador.
          </p>
        </section>
      )}

      {showUser && (
        <div className="cp-modal-overlay">
          <div className="cp-modal">
            <div className="modal-head">
              <div>
                <span className="eyebrow">Usuario</span>
                <h3>Crear usuario real</h3>
              </div>

              <button onClick={() => setShowUser(false)}>
                <X size={19} />
              </button>
            </div>

            <div className="settings-grid">
              <label>
                Nombre
                <input
                  value={userForm.nombre}
                  onChange={(event) =>
                    setUserForm({
                      ...userForm,
                      nombre: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Correo
                <input
                  type="email"
                  value={userForm.correo}
                  onChange={(event) =>
                    setUserForm({
                      ...userForm,
                      correo: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Contraseña
                <input
                  type="password"
                  value={userForm.contrasena}
                  onChange={(event) =>
                    setUserForm({
                      ...userForm,
                      contrasena: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Confirmar contraseña
                <input
                  type="password"
                  value={userForm.confirmarContrasena}
                  onChange={(event) =>
                    setUserForm({
                      ...userForm,
                      confirmarContrasena: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Rol
                <select
                  value={userForm.rol}
                  onChange={(event) =>
                    setUserForm({
                      ...userForm,
                      rol: event.target.value,
                      modulos: [],
                      acciones: [],
                    })
                  }
                >
                  {config.roles.map((role) => (
                    <option key={role.id} value={role.nombre}>
                      {role.nombre}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Proyectos
                <input
                  value={userForm.proyectos}
                  onChange={(event) =>
                    setUserForm({
                      ...userForm,
                      proyectos: event.target.value,
                    })
                  }
                  placeholder="Todos o separados por coma"
                />
              </label>
            </div>

            <div className="permissions-box">
              <b>Módulos permitidos</b>
              <div className="check-grid">
                {modulosDisponibles.map((module) => {
                  const selected =
                    userForm.modulos.length === 0
                      ? selectedRole?.modulos.includes(module)
                      : userForm.modulos.includes(module);

                  return (
                    <button
                      key={module}
                      className={selected ? 'check active' : 'check'}
                      onClick={() => {
                        const base =
                          userForm.modulos.length === 0
                            ? selectedRole?.modulos || []
                            : userForm.modulos;

                        toggleArrayValue(module, base, (next) =>
                          setUserForm({
                            ...userForm,
                            modulos: next,
                          })
                        );
                      }}
                    >
                      <Check size={15} />
                      {module}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="permissions-box">
              <b>Acciones permitidas</b>
              <div className="check-grid">
                {accionesDisponibles.map((action) => {
                  const selected =
                    userForm.acciones.length === 0
                      ? selectedRole?.acciones.includes(action)
                      : userForm.acciones.includes(action);

                  return (
                    <button
                      key={action}
                      className={selected ? 'check active' : 'check'}
                      onClick={() => {
                        const base =
                          userForm.acciones.length === 0
                            ? selectedRole?.acciones || []
                            : userForm.acciones;

                        toggleArrayValue(action, base, (next) =>
                          setUserForm({
                            ...userForm,
                            acciones: next,
                          })
                        );
                      }}
                    >
                      <Check size={15} />
                      {action}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="ghost-client-btn"
                onClick={() => setShowUser(false)}
              >
                Cancelar
              </button>

              <button
                className="primary"
                onClick={saveUsuario}
                disabled={creatingUser}
              >
                <KeyRound size={17} />
                {creatingUser ? 'Creando...' : 'Crear usuario'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRole && (
        <div className="cp-modal-overlay">
          <div className="cp-modal">
            <div className="modal-head">
              <div>
                <span className="eyebrow">Rol</span>
                <h3>Nuevo rol</h3>
              </div>

              <button onClick={() => setShowRole(false)}>
                <X size={19} />
              </button>
            </div>

            <div className="settings-grid">
              <label>
                Nombre
                <input
                  value={roleForm.nombre}
                  onChange={(event) =>
                    setRoleForm({
                      ...roleForm,
                      nombre: event.target.value,
                    })
                  }
                />
              </label>

              <label className="full">
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

            <div className="permissions-box">
              <b>Módulos</b>
              <div className="check-grid">
                {modulosDisponibles.map((module) => (
                  <button
                    key={module}
                    className={
                      roleForm.modulos.includes(module)
                        ? 'check active'
                        : 'check'
                    }
                    onClick={() =>
                      toggleArrayValue(
                        module,
                        roleForm.modulos,
                        (next) =>
                          setRoleForm({
                            ...roleForm,
                            modulos: next,
                          })
                      )
                    }
                  >
                    <Check size={15} />
                    {module}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="ghost-client-btn"
                onClick={() => setShowRole(false)}
              >
                Cancelar
              </button>

              <button className="primary" onClick={saveRol}>
                <Save size={17} />
                Guardar rol
              </button>
            </div>
          </div>
        </div>
      )}

      {showCategory && (
        <div className="cp-modal-overlay">
          <div className="cp-modal small">
            <div className="modal-head">
              <div>
                <span className="eyebrow">Categoría</span>
                <h3>Nueva categoría</h3>
              </div>

              <button onClick={() => setShowCategory(false)}>
                <X size={19} />
              </button>
            </div>

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

            <div className="modal-actions">
              <button
                className="ghost-client-btn"
                onClick={() => setShowCategory(false)}
              >
                Cancelar
              </button>

              <button className="primary" onClick={saveCategoria}>
                <Save size={17} />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .settings-top {
          margin-bottom: 16px;
        }

        .settings-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px;
          border-radius: 18px;
          color: white;
          background: linear-gradient(135deg, #0d4d91, #1378d4);
        }

        .settings-banner b,
        .settings-banner span {
          display: block;
        }

        .settings-banner span {
          margin-top: 4px;
          opacity: 0.78;
          font-size: 13px;
        }

        .settings-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          overflow-x: auto;
        }

        .settings-tabs button {
          min-height: 42px;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 0 14px;
          border: 1px solid #d9e3eb;
          border-radius: 12px;
          background: white;
          color: #53697d;
          font-weight: 800;
          cursor: pointer;
          white-space: nowrap;
        }

        .settings-tabs button.active {
          color: white;
          border-color: #1768be;
          background: #1768be;
        }

        .settings-panel {
          padding: 22px;
          border: 1px solid #dce5ec;
          border-radius: 20px;
          background: white;
        }

        .panel-head,
        .modal-head,
        .modal-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .eyebrow {
          color: #1768be;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        h3 {
          margin: 5px 0 0;
          color: #153853;
        }

        .primary,
        .ghost-client-btn,
        .danger-icon,
        .modal-head > button {
          border: 0;
          cursor: pointer;
        }

        .primary {
          min-height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 15px;
          border-radius: 12px;
          color: white;
          background: #1768be;
          font-weight: 900;
        }

        .primary:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-top: 20px;
        }

        label {
          display: grid;
          gap: 7px;
          color: #38546b;
          font-size: 13px;
          font-weight: 800;
        }

        label.full {
          grid-column: 1 / -1;
        }

        input,
        select {
          width: 100%;
          min-height: 44px;
          box-sizing: border-box;
          padding: 0 12px;
          border: 1px solid #cfdae3;
          border-radius: 11px;
          background: white;
          font-size: 14px;
        }

        .table-wrap {
          margin-top: 18px;
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th,
        td {
          padding: 13px 12px;
          border-bottom: 1px solid #e4ebf0;
          text-align: left;
          font-size: 13px;
        }

        th {
          color: #708296;
          font-size: 11px;
          text-transform: uppercase;
        }

        .empty {
          padding: 28px;
          color: #8090a0;
          text-align: center;
        }

        .status {
          display: inline-flex;
          padding: 6px 9px;
          border-radius: 999px;
          color: #8a4d4d;
          background: #fff0f0;
          font-size: 11px;
          font-weight: 900;
        }

        .status.active {
          color: #0b735b;
          background: #e9f8f2;
        }

        .danger-icon {
          padding: 8px;
          border-radius: 9px;
          color: #a13333;
          background: #fff0f0;
        }

        .note {
          margin: 16px 0 0;
          color: #718397;
          font-size: 12px;
          line-height: 1.5;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 14px;
          margin-top: 18px;
        }

        .role-card {
          padding: 17px;
          border: 1px solid #dfe7ed;
          border-radius: 16px;
          background: #fbfcfd;
        }

        .role-card p {
          margin: 7px 0 0;
          color: #738397;
          font-size: 13px;
          line-height: 1.45;
        }

        .chips {
          display: flex;
          gap: 7px;
          margin-top: 14px;
        }

        .chips span {
          padding: 6px 8px;
          border-radius: 999px;
          color: #245f95;
          background: #edf5fc;
          font-size: 11px;
          font-weight: 800;
        }

        .switch-list {
          display: grid;
          gap: 10px;
          margin-top: 20px;
        }

        .switch-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px;
          border: 1px solid #dfe7ed;
          border-radius: 13px;
          background: white;
          color: #5c7185;
          cursor: pointer;
        }

        .switch-row.active {
          color: #1768be;
          border-color: #bdd6ec;
          background: #f2f8fd;
        }

        .cp-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: grid;
          place-items: center;
          padding: 18px;
          background: rgba(6, 24, 42, 0.62);
        }

        .cp-modal {
          width: min(100%, 860px);
          max-height: 92vh;
          overflow-y: auto;
          box-sizing: border-box;
          padding: 22px;
          border-radius: 20px;
          background: white;
          box-shadow: 0 28px 80px rgba(0, 0, 0, 0.25);
        }

        .cp-modal.small {
          max-width: 560px;
        }

        .modal-head > button {
          display: grid;
          place-items: center;
          padding: 8px;
          border-radius: 10px;
          color: #53697d;
          background: #eef3f7;
        }

        .permissions-box {
          margin-top: 20px;
        }

        .check-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }

        .check {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 9px 11px;
          border: 1px solid #d7e1e9;
          border-radius: 10px;
          color: #5b7084;
          background: white;
          cursor: pointer;
        }

        .check.active {
          color: #1768be;
          border-color: #99c2e8;
          background: #edf6ff;
        }

        .modal-actions {
          margin-top: 24px;
        }

        .ghost-client-btn {
          min-height: 42px;
          padding: 0 14px;
          border: 1px solid #d5e0e8;
          border-radius: 11px;
          color: #5d7286;
          background: white;
          font-weight: 800;
        }


        html[data-theme='dark'] .settings-panel,
        html[data-theme='dark'] .login-card,
        html[data-theme='dark'] .cp-modal {
          color: var(--text);
          border-color: var(--line);
          background: var(--card);
        }

        html[data-theme='dark'] .settings-tabs button,
        html[data-theme='dark'] .role-card,
        html[data-theme='dark'] .switch-row,
        html[data-theme='dark'] input,
        html[data-theme='dark'] select,
        html[data-theme='dark'] .check,
        html[data-theme='dark'] .ghost-client-btn {
          color: var(--text);
          border-color: var(--line);
          background: rgba(255, 255, 255, 0.045);
        }

        html[data-theme='dark'] .settings-tabs button.active,
        html[data-theme='dark'] .check.active,
        html[data-theme='dark'] .switch-row.active {
          color: #ffffff;
          border-color: rgba(73, 158, 255, 0.5);
          background: rgba(23, 105, 224, 0.3);
        }

        html[data-theme='dark'] h3,
        html[data-theme='dark'] label,
        html[data-theme='dark'] td {
          color: var(--text);
        }

        html[data-theme='dark'] th,
        html[data-theme='dark'] .note,
        html[data-theme='dark'] .empty,
        html[data-theme='dark'] .role-card p {
          color: var(--muted);
        }

        html[data-theme='dark'] th,
        html[data-theme='dark'] td {
          border-bottom-color: var(--line);
        }

        html[data-theme='dark'] .table-wrap {
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.025);
        }

        html[data-theme='light'] .settings-panel,
        html:not([data-theme='dark']) .settings-panel {
          color: #153853;
          background: #ffffff;
        }

        .audit-table table {
          min-width: 900px;
        }

        @media (max-width: 760px) {
          .settings-panel {
            padding: 16px;
          }

          .panel-head {
            align-items: flex-start;
            flex-direction: column;
          }

          .settings-grid {
            grid-template-columns: 1fr;
          }

          label.full {
            grid-column: auto;
          }

          .primary {
            width: 100%;
          }

          .cp-modal {
            padding: 17px;
          }

          .modal-actions {
            align-items: stretch;
            flex-direction: column-reverse;
          }

          .modal-actions button {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
