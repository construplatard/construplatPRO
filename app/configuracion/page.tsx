'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import PageFrame from '@/components/PageFrame';
import { supabase } from '@/lib/supabase';
import {
  Building2,
  Check,
  History,
  KeyRound,
  ListChecks,
  LoaderCircle,
  Plus,
  RefreshCw,
  Save,
  Settings2,
  ShieldCheck,
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

type SeguridadConfig = {
  sesionMinutos: number;
  exigirContrasenaFuerte: boolean;
  bloquearTrasIntentos: boolean;
  intentosPermitidos: number;
  auditoriaActiva: boolean;
};

type PreferenciasConfig = {
  tema: 'system' | 'light' | 'dark';
  idioma: string;
  zonaHoraria: string;
  formatoFecha: string;
  notificaciones: boolean;
  rolePermissions?: Record<
    string,
    {
      modulos: string[];
      acciones: string[];
    }
  >;
};

type UsuarioConfig = {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  rolId: string | null;
  activo: boolean;
  esSuperAdmin: boolean;
};

type RolConfig = {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  modulos: string[];
  acciones: string[];
};

type CategoriaConfig = {
  id: string;
  nombre: string;
  tipo: 'gasto' | 'general';
  activo: boolean;
  orden: number;
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

type SystemSettingsRow = {
  id: number;
  empresa: Partial<EmpresaConfig> | null;
  seguridad: Partial<SeguridadConfig> | null;
  preferencias: Partial<PreferenciasConfig> | null;
};

const initialEmpresa: EmpresaConfig = {
  nombre: 'CONSTRUPLATA SRL',
  rnc: '',
  telefono: '',
  email: '',
  direccion: 'Santo Domingo, República Dominicana',
  moneda: 'DOP',
  itbis: 18,
  prefijoCotizacion: 'COT',
  prefijoFactura: 'FAC',
};

const initialSeguridad: SeguridadConfig = {
  sesionMinutos: 480,
  exigirContrasenaFuerte: true,
  bloquearTrasIntentos: true,
  intentosPermitidos: 5,
  auditoriaActiva: true,
};

const initialPreferencias: PreferenciasConfig = {
  tema: 'system',
  idioma: 'es',
  zonaHoraria: 'America/Santo_Domingo',
  formatoFecha: 'DD/MM/YYYY',
  notificaciones: true,
  rolePermissions: {},
};

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

function roleNameFromJoin(value: unknown) {
  if (!value) return 'Usuario';

  if (Array.isArray(value)) {
    const first = value[0] as { nombre?: string } | undefined;
    return first?.nombre || 'Usuario';
  }

  return (value as { nombre?: string }).nombre || 'Usuario';
}

function resolveTheme(theme: PreferenciasConfig['tema']) {
  if (theme === 'light' || theme === 'dark') return theme;

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export default function Page() {
  return (
    <PageFrame>
      <Configuraciones />
    </PageFrame>
  );
}

function Configuraciones() {
  const [tab, setTab] = useState<
    | 'empresa'
    | 'usuarios'
    | 'roles'
    | 'categorias'
    | 'preferencias'
    | 'seguridad'
    | 'auditoria'
  >('empresa');

  const [empresa, setEmpresa] = useState<EmpresaConfig>(initialEmpresa);
  const [seguridad, setSeguridad] =
    useState<SeguridadConfig>(initialSeguridad);
  const [preferencias, setPreferencias] =
    useState<PreferenciasConfig>(initialPreferencias);

  const [usuarios, setUsuarios] = useState<UsuarioConfig[]>([]);
  const [roles, setRoles] = useState<RolConfig[]>([]);
  const [categorias, setCategorias] = useState<CategoriaConfig[]>([]);
  const [auditoria, setAuditoria] = useState<AuditoriaAcceso[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');

  const [showUser, setShowUser] = useState(false);
  const [showRole, setShowRole] = useState(false);
  const [showCategory, setShowCategory] = useState(false);

  const [userForm, setUserForm] = useState({
    nombre: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    rol: '',
    activo: true,
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

  const selectedRole = useMemo(
    () => roles.find((role) => role.nombre === userForm.rol),
    [roles, userForm.rol]
  );

  const cargarTodo = useCallback(async () => {
    setLoading(true);
    setError('');

    const [
      settingsResult,
      usersResult,
      rolesResult,
      categoriesResult,
    ] = await Promise.all([
      supabase
        .from('system_settings')
        .select('id,empresa,seguridad,preferencias')
        .eq('id', 1)
        .single(),
      supabase
        .from('user_profiles')
        .select(
          'id,nombre,correo,activo,es_super_admin,rol_id,roles(id,nombre)'
        )
        .order('nombre'),
      supabase
        .from('roles')
        .select('id,nombre,descripcion,activo')
        .order('nombre'),
      supabase
        .from('config_categories')
        .select('id,nombre,tipo,activo,orden')
        .order('orden')
        .order('nombre'),
    ]);

    const firstError =
      settingsResult.error ||
      usersResult.error ||
      rolesResult.error ||
      categoriesResult.error;

    if (firstError) {
      setError(firstError.message);
      setLoading(false);
      return;
    }

    const settings = settingsResult.data as SystemSettingsRow;

    const nextEmpresa: EmpresaConfig = {
      ...initialEmpresa,
      ...(settings.empresa || {}),
    };

    const nextSeguridad: SeguridadConfig = {
      ...initialSeguridad,
      ...(settings.seguridad || {}),
    };

    const nextPreferencias: PreferenciasConfig = {
      ...initialPreferencias,
      ...(settings.preferencias || {}),
      rolePermissions:
        settings.preferencias?.rolePermissions || {},
    };

    setEmpresa(nextEmpresa);
    setSeguridad(nextSeguridad);
    setPreferencias(nextPreferencias);

    const rolePermissions =
      nextPreferencias.rolePermissions || {};

    const roleRows = (rolesResult.data || []).map((item) => {
      const permission = rolePermissions[item.nombre] || {
        modulos: [],
        acciones: [],
      };

      return {
        id: item.id,
        nombre: item.nombre,
        descripcion: item.descripcion || '',
        activo: item.activo !== false,
        modulos: permission.modulos,
        acciones: permission.acciones,
      } satisfies RolConfig;
    });

    setRoles(roleRows);

    setUsuarios(
      (usersResult.data || []).map((item) => ({
        id: item.id,
        nombre: item.nombre || 'Usuario',
        correo: item.correo || '',
        rol: roleNameFromJoin(item.roles),
        rolId: item.rol_id || null,
        activo: item.activo !== false,
        esSuperAdmin: item.es_super_admin === true,
      }))
    );

    setCategorias(
      (categoriesResult.data || []).map((item) => ({
        id: item.id,
        nombre: item.nombre,
        tipo: item.tipo as 'gasto' | 'general',
        activo: item.activo !== false,
        orden: Number(item.orden || 0),
      }))
    );

    if (!userForm.rol && roleRows.length) {
      setUserForm((current) => ({
        ...current,
        rol: roleRows[0].nombre,
      }));
    }

    document.documentElement.dataset.theme = resolveTheme(
      nextPreferencias.tema
    );

    setLoading(false);
  }, [userForm.rol]);

  const cargarAuditoria = useCallback(async () => {
    const { data, error: auditError } = await supabase
      .from('auditoria_accesos')
      .select(
        'id,user_id,nombre,correo,evento,dispositivo,navegador,ip,creado_en'
      )
      .order('creado_en', { ascending: false })
      .limit(300);

    if (auditError) {
      setError(auditError.message);
      return;
    }

    setAuditoria((data || []) as AuditoriaAcceso[]);
  }, []);

  useEffect(() => {
    cargarTodo();

    const channel = supabase
      .channel('construplata-settings-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_settings',
        },
        cargarTodo
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'config_categories',
        },
        cargarTodo
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'roles',
        },
        cargarTodo
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles',
        },
        cargarTodo
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cargarTodo]);

  useEffect(() => {
    if (tab === 'auditoria') {
      cargarAuditoria();
    }
  }, [tab, cargarAuditoria]);

  const guardarSettings = async (
    section: 'empresa' | 'seguridad' | 'preferencias'
  ) => {
    setSaving(section);
    setError('');

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setError('La sesión expiró. Vuelve a iniciar sesión.');
      setSaving('');
      return;
    }

    const payload =
      section === 'empresa'
        ? { empresa }
        : section === 'seguridad'
          ? { seguridad }
          : { preferencias };

    const { error: saveError } = await supabase
      .from('system_settings')
      .update({
        ...payload,
        updated_by: session.user.id,
      })
      .eq('id', 1);

    if (saveError) {
      setError(saveError.message);
      setSaving('');
      return;
    }

    if (section === 'preferencias') {
      document.documentElement.dataset.theme = resolveTheme(
        preferencias.tema
      );
    }

    setSaving('');
    window.alert('Configuración guardada en Supabase.');
  };

  const guardarRolePermissions = async (
    nextRoles: RolConfig[]
  ) => {
    const rolePermissions = Object.fromEntries(
      nextRoles.map((role) => [
        role.nombre,
        {
          modulos: role.modulos,
          acciones: role.acciones,
        },
      ])
    );

    const nextPreferencias = {
      ...preferencias,
      rolePermissions,
    };

    setPreferencias(nextPreferencias);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { error: permissionsError } = await supabase
      .from('system_settings')
      .update({
        preferencias: nextPreferencias,
        updated_by: session?.user?.id || null,
      })
      .eq('id', 1);

    if (permissionsError) {
      throw permissionsError;
    }
  };

  const saveUsuario = async () => {
    if (!userForm.nombre.trim() || !userForm.correo.trim()) {
      window.alert('Completa el nombre y el correo.');
      return;
    }

    if (userForm.contrasena.length < 6) {
      window.alert(
        'La contraseña debe tener al menos 6 caracteres.'
      );
      return;
    }

    if (
      userForm.contrasena !==
      userForm.confirmarContrasena
    ) {
      window.alert('Las contraseñas no coinciden.');
      return;
    }

    setSaving('usuario');

    try {
      const modulos = userForm.modulos.length
        ? userForm.modulos
        : selectedRole?.modulos || [];

      const acciones = userForm.acciones.length
        ? userForm.acciones
        : selectedRole?.acciones || [];

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: userForm.nombre.trim(),
          correo: userForm.correo.trim().toLowerCase(),
          contrasena: userForm.contrasena,
          rol: userForm.rol,
          activo: userForm.activo,
          modulos,
          acciones,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || 'No se pudo crear el usuario.'
        );
      }

      setShowUser(false);
      setUserForm({
        nombre: '',
        correo: '',
        contrasena: '',
        confirmarContrasena: '',
        rol: roles[0]?.nombre || '',
        activo: true,
        modulos: [],
        acciones: [],
      });

      await cargarTodo();
      window.alert(
        'Usuario creado en Supabase. Ya puede entrar desde cualquier dispositivo.'
      );
    } catch (createError) {
      window.alert(
        createError instanceof Error
          ? createError.message
          : 'No se pudo crear el usuario.'
      );
    } finally {
      setSaving('');
    }
  };

  const toggleUsuarioActivo = async (
    user: UsuarioConfig
  ) => {
    if (user.esSuperAdmin) {
      window.alert(
        'El administrador principal no puede desactivarse aquí.'
      );
      return;
    }

    setSaving(user.id);

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        activo: !user.activo,
      })
      .eq('id', user.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      await cargarTodo();
    }

    setSaving('');
  };

  const saveRol = async () => {
    if (!roleForm.nombre.trim()) {
      window.alert('Escribe el nombre del rol.');
      return;
    }

    setSaving('rol');

    try {
      const { data: newRole, error: roleError } =
        await supabase
          .from('roles')
          .insert({
            nombre: roleForm.nombre.trim(),
            descripcion: roleForm.descripcion.trim(),
            activo: true,
          })
          .select('id,nombre,descripcion,activo')
          .single();

      if (roleError) throw roleError;

      const nextRoles = [
        ...roles,
        {
          id: newRole.id,
          nombre: newRole.nombre,
          descripcion: newRole.descripcion || '',
          activo: newRole.activo !== false,
          modulos: roleForm.modulos,
          acciones: roleForm.acciones,
        },
      ];

      await guardarRolePermissions(nextRoles);

      setShowRole(false);
      setRoleForm({
        nombre: '',
        descripcion: '',
        modulos: [],
        acciones: [],
      });

      await cargarTodo();
      window.alert('Rol guardado en Supabase.');
    } catch (roleSaveError) {
      window.alert(
        roleSaveError instanceof Error
          ? roleSaveError.message
          : 'No se pudo guardar el rol.'
      );
    } finally {
      setSaving('');
    }
  };

  const deleteRol = async (role: RolConfig) => {
    if (
      !window.confirm(
        `¿Eliminar el rol "${role.nombre}"?`
      )
    ) {
      return;
    }

    setSaving(role.id);

    try {
      const { error: deleteError } = await supabase
        .from('roles')
        .delete()
        .eq('id', role.id);

      if (deleteError) throw deleteError;

      await guardarRolePermissions(
        roles.filter((item) => item.id !== role.id)
      );

      await cargarTodo();
    } catch (roleDeleteError) {
      window.alert(
        roleDeleteError instanceof Error
          ? roleDeleteError.message
          : 'No se pudo eliminar el rol.'
      );
    } finally {
      setSaving('');
    }
  };

  const saveCategoria = async () => {
    if (!categoryForm.nombre.trim()) {
      window.alert('Escribe el nombre de la categoría.');
      return;
    }

    setSaving('categoria');

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { error: categoryError } = await supabase
      .from('config_categories')
      .insert({
        nombre: categoryForm.nombre.trim(),
        tipo: categoryForm.tipo,
        activo: true,
        orden: categorias.length + 1,
        created_by: session?.user?.id || null,
      });

    if (categoryError) {
      window.alert(categoryError.message);
      setSaving('');
      return;
    }

    setShowCategory(false);
    setCategoryForm({
      nombre: '',
      tipo: 'gasto',
    });

    await cargarTodo();
    setSaving('');
    window.alert('Categoría guardada en Supabase.');
  };

  const deleteCategoria = async (
    category: CategoriaConfig
  ) => {
    if (
      !window.confirm(
        `¿Eliminar la categoría "${category.nombre}"?`
      )
    ) {
      return;
    }

    setSaving(category.id);

    const { error: deleteError } = await supabase
      .from('config_categories')
      .delete()
      .eq('id', category.id);

    if (deleteError) {
      window.alert(deleteError.message);
    } else {
      await cargarTodo();
    }

    setSaving('');
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

  if (loading) {
    return (
      <div className="settings-loading">
        <LoaderCircle className="spin" size={28} />
        Cargando configuración desde Supabase...
        <style jsx>{`
          .settings-loading {
            min-height: 380px;
            display: grid;
            place-items: center;
            align-content: center;
            gap: 12px;
            color: var(--muted);
          }

          .spin {
            animation: spin 0.9s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <section className="sync-banner">
        <div>
          <RefreshCw size={19} />
          <span>
            Configuración sincronizada con Supabase
          </span>
        </div>

        <button onClick={cargarTodo}>
          <RefreshCw size={15} />
          Actualizar
        </button>
      </section>

      {error && (
        <div className="error-box">{error}</div>
      )}

      <section className="settings-tabs">
        <TabButton
          active={tab === 'empresa'}
          onClick={() => setTab('empresa')}
          icon={<Building2 size={17} />}
          label="Empresa"
        />
        <TabButton
          active={tab === 'usuarios'}
          onClick={() => setTab('usuarios')}
          icon={<UsersRound size={17} />}
          label="Usuarios"
        />
        <TabButton
          active={tab === 'roles'}
          onClick={() => setTab('roles')}
          icon={<UserCog size={17} />}
          label="Roles"
        />
        <TabButton
          active={tab === 'categorias'}
          onClick={() => setTab('categorias')}
          icon={<ListChecks size={17} />}
          label="Categorías"
        />
        <TabButton
          active={tab === 'preferencias'}
          onClick={() => setTab('preferencias')}
          icon={<Settings2 size={17} />}
          label="Preferencias"
        />
        <TabButton
          active={tab === 'seguridad'}
          onClick={() => setTab('seguridad')}
          icon={<ShieldCheck size={17} />}
          label="Seguridad"
        />
        <TabButton
          active={tab === 'auditoria'}
          onClick={() => setTab('auditoria')}
          icon={<History size={17} />}
          label="Auditoría"
        />
      </section>

      {tab === 'empresa' && (
        <SettingsPanel
          eyebrow="Empresa"
          title="Datos generales"
          action={
            <SaveButton
              loading={saving === 'empresa'}
              onClick={() =>
                guardarSettings('empresa')
              }
            />
          }
        >
          <div className="settings-grid">
            <Field label="Nombre comercial">
              <input
                value={empresa.nombre}
                onChange={(event) =>
                  setEmpresa({
                    ...empresa,
                    nombre: event.target.value,
                  })
                }
              />
            </Field>

            <Field label="RNC">
              <input
                value={empresa.rnc}
                onChange={(event) =>
                  setEmpresa({
                    ...empresa,
                    rnc: event.target.value,
                  })
                }
              />
            </Field>

            <Field label="Teléfono">
              <input
                value={empresa.telefono}
                onChange={(event) =>
                  setEmpresa({
                    ...empresa,
                    telefono: event.target.value,
                  })
                }
              />
            </Field>

            <Field label="Correo">
              <input
                value={empresa.email}
                onChange={(event) =>
                  setEmpresa({
                    ...empresa,
                    email: event.target.value,
                  })
                }
              />
            </Field>

            <Field label="Dirección" wide>
              <input
                value={empresa.direccion}
                onChange={(event) =>
                  setEmpresa({
                    ...empresa,
                    direccion: event.target.value,
                  })
                }
              />
            </Field>

            <Field label="Moneda">
              <select
                value={empresa.moneda}
                onChange={(event) =>
                  setEmpresa({
                    ...empresa,
                    moneda: event.target.value,
                  })
                }
              >
                <option value="DOP">DOP</option>
                <option value="USD">USD</option>
              </select>
            </Field>

            <Field label="ITBIS %">
              <input
                type="number"
                value={empresa.itbis}
                onChange={(event) =>
                  setEmpresa({
                    ...empresa,
                    itbis: Number(event.target.value),
                  })
                }
              />
            </Field>

            <Field label="Prefijo cotización">
              <input
                value={empresa.prefijoCotizacion}
                onChange={(event) =>
                  setEmpresa({
                    ...empresa,
                    prefijoCotizacion:
                      event.target.value,
                  })
                }
              />
            </Field>

            <Field label="Prefijo factura">
              <input
                value={empresa.prefijoFactura}
                onChange={(event) =>
                  setEmpresa({
                    ...empresa,
                    prefijoFactura:
                      event.target.value,
                  })
                }
              />
            </Field>
          </div>
        </SettingsPanel>
      )}

      {tab === 'usuarios' && (
        <SettingsPanel
          eyebrow="Usuarios"
          title="Accesos del sistema"
          action={
            <button
              className="primary"
              onClick={() => setShowUser(true)}
            >
              <Plus size={17} />
              Nuevo usuario
            </button>
          }
        >
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
                {usuarios.map((user) => (
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
                        {user.activo
                          ? 'Activo'
                          : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="small-action"
                        disabled={
                          saving === user.id ||
                          user.esSuperAdmin
                        }
                        onClick={() =>
                          toggleUsuarioActivo(user)
                        }
                      >
                        {user.activo
                          ? 'Desactivar'
                          : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SettingsPanel>
      )}

      {tab === 'roles' && (
        <SettingsPanel
          eyebrow="Roles"
          title="Roles y permisos predeterminados"
          action={
            <button
              className="primary"
              onClick={() => setShowRole(true)}
            >
              <Plus size={17} />
              Nuevo rol
            </button>
          }
        >
          <div className="cards-grid">
            {roles.map((role) => (
              <article className="config-card" key={role.id}>
                <div className="card-row">
                  <div>
                    <b>{role.nombre}</b>
                    <p>
                      {role.descripcion ||
                        'Sin descripción'}
                    </p>
                  </div>

                  <button
                    className="danger-icon"
                    disabled={saving === role.id}
                    onClick={() => deleteRol(role)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="chips">
                  <span>
                    {role.modulos.length} módulos
                  </span>
                  <span>
                    {role.acciones.length} acciones
                  </span>
                </div>
              </article>
            ))}
          </div>
        </SettingsPanel>
      )}

      {tab === 'categorias' && (
        <SettingsPanel
          eyebrow="Categorías"
          title="Clasificación compartida"
          action={
            <button
              className="primary"
              onClick={() => setShowCategory(true)}
            >
              <Plus size={17} />
              Nueva categoría
            </button>
          }
        >
          <div className="cards-grid">
            {categorias.map((category) => (
              <article
                className="config-card"
                key={category.id}
              >
                <div className="card-row">
                  <div>
                    <b>{category.nombre}</b>
                    <p>
                      {category.tipo === 'gasto'
                        ? 'Categoría de gasto'
                        : 'Categoría general'}
                    </p>
                  </div>

                  <button
                    className="danger-icon"
                    disabled={
                      saving === category.id
                    }
                    onClick={() =>
                      deleteCategoria(category)
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </SettingsPanel>
      )}

      {tab === 'preferencias' && (
        <SettingsPanel
          eyebrow="Preferencias"
          title="Preferencias generales"
          action={
            <SaveButton
              loading={saving === 'preferencias'}
              onClick={() =>
                guardarSettings('preferencias')
              }
            />
          }
        >
          <div className="settings-grid">
            <Field label="Apariencia">
              <select
                value={preferencias.tema}
                onChange={(event) =>
                  setPreferencias({
                    ...preferencias,
                    tema: event.target
                      .value as PreferenciasConfig['tema'],
                  })
                }
              >
                <option value="system">
                  Automático
                </option>
                <option value="light">
                  Modo día
                </option>
                <option value="dark">
                  Modo noche
                </option>
              </select>
            </Field>

            <Field label="Idioma">
              <select
                value={preferencias.idioma}
                onChange={(event) =>
                  setPreferencias({
                    ...preferencias,
                    idioma: event.target.value,
                  })
                }
              >
                <option value="es">Español</option>
              </select>
            </Field>

            <Field label="Zona horaria">
              <select
                value={preferencias.zonaHoraria}
                onChange={(event) =>
                  setPreferencias({
                    ...preferencias,
                    zonaHoraria:
                      event.target.value,
                  })
                }
              >
                <option value="America/Santo_Domingo">
                  República Dominicana
                </option>
                <option value="America/New_York">
                  Nueva York
                </option>
              </select>
            </Field>

            <Field label="Formato de fecha">
              <select
                value={preferencias.formatoFecha}
                onChange={(event) =>
                  setPreferencias({
                    ...preferencias,
                    formatoFecha:
                      event.target.value,
                  })
                }
              >
                <option value="DD/MM/YYYY">
                  DD/MM/YYYY
                </option>
                <option value="MM/DD/YYYY">
                  MM/DD/YYYY
                </option>
              </select>
            </Field>
          </div>

          <button
            className={
              preferencias.notificaciones
                ? 'switch-row active'
                : 'switch-row'
            }
            onClick={() =>
              setPreferencias({
                ...preferencias,
                notificaciones:
                  !preferencias.notificaciones,
              })
            }
          >
            <span>Notificaciones activas</span>
            <Check size={17} />
          </button>
        </SettingsPanel>
      )}

      {tab === 'seguridad' && (
        <SettingsPanel
          eyebrow="Seguridad"
          title="Políticas del sistema"
          action={
            <SaveButton
              loading={saving === 'seguridad'}
              onClick={() =>
                guardarSettings('seguridad')
              }
            />
          }
        >
          <div className="settings-grid">
            <Field label="Minutos de sesión">
              <input
                type="number"
                value={seguridad.sesionMinutos}
                onChange={(event) =>
                  setSeguridad({
                    ...seguridad,
                    sesionMinutos: Number(
                      event.target.value
                    ),
                  })
                }
              />
            </Field>

            <Field label="Intentos permitidos">
              <input
                type="number"
                value={
                  seguridad.intentosPermitidos
                }
                onChange={(event) =>
                  setSeguridad({
                    ...seguridad,
                    intentosPermitidos: Number(
                      event.target.value
                    ),
                  })
                }
              />
            </Field>
          </div>

          <div className="switch-list">
            <SwitchButton
              label="Exigir contraseña fuerte"
              active={
                seguridad.exigirContrasenaFuerte
              }
              onClick={() =>
                setSeguridad({
                  ...seguridad,
                  exigirContrasenaFuerte:
                    !seguridad.exigirContrasenaFuerte,
                })
              }
            />

            <SwitchButton
              label="Bloquear después de varios intentos"
              active={
                seguridad.bloquearTrasIntentos
              }
              onClick={() =>
                setSeguridad({
                  ...seguridad,
                  bloquearTrasIntentos:
                    !seguridad.bloquearTrasIntentos,
                })
              }
            />

            <SwitchButton
              label="Auditoría activa"
              active={seguridad.auditoriaActiva}
              onClick={() =>
                setSeguridad({
                  ...seguridad,
                  auditoriaActiva:
                    !seguridad.auditoriaActiva,
                })
              }
            />
          </div>
        </SettingsPanel>
      )}

      {tab === 'auditoria' && (
        <SettingsPanel
          eyebrow="Auditoría"
          title="Registro de accesos"
          action={
            <button
              className="primary"
              onClick={cargarAuditoria}
            >
              <RefreshCw size={17} />
              Actualizar
            </button>
          }
        >
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
                {auditoria.length ? (
                  auditoria.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {new Intl.DateTimeFormat(
                          'es-DO',
                          {
                            dateStyle: 'short',
                            timeStyle: 'medium',
                          }
                        ).format(
                          new Date(item.creado_en)
                        )}
                      </td>
                      <td>{item.nombre}</td>
                      <td>{item.correo}</td>
                      <td>{item.evento}</td>
                      <td>{item.dispositivo}</td>
                      <td>{item.navegador}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="empty"
                    >
                      Todavía no hay accesos
                      registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SettingsPanel>
      )}

      {showUser && (
        <Modal
          eyebrow="Usuario"
          title="Crear usuario en Supabase"
          onClose={() => setShowUser(false)}
          footer={
            <>
              <button
                className="ghost"
                onClick={() => setShowUser(false)}
              >
                Cancelar
              </button>

              <button
                className="primary"
                disabled={saving === 'usuario'}
                onClick={saveUsuario}
              >
                <KeyRound size={17} />
                {saving === 'usuario'
                  ? 'Creando...'
                  : 'Crear usuario'}
              </button>
            </>
          }
        >
          <div className="settings-grid">
            <Field label="Nombre">
              <input
                value={userForm.nombre}
                onChange={(event) =>
                  setUserForm({
                    ...userForm,
                    nombre: event.target.value,
                  })
                }
              />
            </Field>

            <Field label="Correo">
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
            </Field>

            <Field label="Contraseña">
              <input
                type="password"
                value={userForm.contrasena}
                onChange={(event) =>
                  setUserForm({
                    ...userForm,
                    contrasena:
                      event.target.value,
                  })
                }
              />
            </Field>

            <Field label="Confirmar contraseña">
              <input
                type="password"
                value={
                  userForm.confirmarContrasena
                }
                onChange={(event) =>
                  setUserForm({
                    ...userForm,
                    confirmarContrasena:
                      event.target.value,
                  })
                }
              />
            </Field>

            <Field label="Rol">
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
                {roles.map((role) => (
                  <option
                    key={role.id}
                    value={role.nombre}
                  >
                    {role.nombre}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <PermissionSelector
            title="Módulos permitidos"
            options={modulosDisponibles}
            selected={
              userForm.modulos.length
                ? userForm.modulos
                : selectedRole?.modulos || []
            }
            onToggle={(value) => {
              const base = userForm.modulos.length
                ? userForm.modulos
                : selectedRole?.modulos || [];

              toggleArrayValue(
                value,
                base,
                (next) =>
                  setUserForm({
                    ...userForm,
                    modulos: next,
                  })
              );
            }}
          />

          <PermissionSelector
            title="Acciones permitidas"
            options={accionesDisponibles}
            selected={
              userForm.acciones.length
                ? userForm.acciones
                : selectedRole?.acciones || []
            }
            onToggle={(value) => {
              const base = userForm.acciones.length
                ? userForm.acciones
                : selectedRole?.acciones || [];

              toggleArrayValue(
                value,
                base,
                (next) =>
                  setUserForm({
                    ...userForm,
                    acciones: next,
                  })
              );
            }}
          />
        </Modal>
      )}

      {showRole && (
        <Modal
          eyebrow="Rol"
          title="Nuevo rol"
          onClose={() => setShowRole(false)}
          footer={
            <>
              <button
                className="ghost"
                onClick={() => setShowRole(false)}
              >
                Cancelar
              </button>

              <button
                className="primary"
                disabled={saving === 'rol'}
                onClick={saveRol}
              >
                <Save size={17} />
                {saving === 'rol'
                  ? 'Guardando...'
                  : 'Guardar rol'}
              </button>
            </>
          }
        >
          <div className="settings-grid">
            <Field label="Nombre">
              <input
                value={roleForm.nombre}
                onChange={(event) =>
                  setRoleForm({
                    ...roleForm,
                    nombre: event.target.value,
                  })
                }
              />
            </Field>

            <Field label="Descripción" wide>
              <input
                value={roleForm.descripcion}
                onChange={(event) =>
                  setRoleForm({
                    ...roleForm,
                    descripcion:
                      event.target.value,
                  })
                }
              />
            </Field>
          </div>

          <PermissionSelector
            title="Módulos"
            options={modulosDisponibles}
            selected={roleForm.modulos}
            onToggle={(value) =>
              toggleArrayValue(
                value,
                roleForm.modulos,
                (next) =>
                  setRoleForm({
                    ...roleForm,
                    modulos: next,
                  })
              )
            }
          />

          <PermissionSelector
            title="Acciones"
            options={accionesDisponibles}
            selected={roleForm.acciones}
            onToggle={(value) =>
              toggleArrayValue(
                value,
                roleForm.acciones,
                (next) =>
                  setRoleForm({
                    ...roleForm,
                    acciones: next,
                  })
              )
            }
          />
        </Modal>
      )}

      {showCategory && (
        <Modal
          eyebrow="Categoría"
          title="Nueva categoría"
          onClose={() => setShowCategory(false)}
          footer={
            <>
              <button
                className="ghost"
                onClick={() =>
                  setShowCategory(false)
                }
              >
                Cancelar
              </button>

              <button
                className="primary"
                disabled={saving === 'categoria'}
                onClick={saveCategoria}
              >
                <Save size={17} />
                {saving === 'categoria'
                  ? 'Guardando...'
                  : 'Guardar categoría'}
              </button>
            </>
          }
        >
          <div className="settings-grid">
            <Field label="Nombre">
              <input
                value={categoryForm.nombre}
                onChange={(event) =>
                  setCategoryForm({
                    ...categoryForm,
                    nombre: event.target.value,
                  })
                }
              />
            </Field>

            <Field label="Tipo">
              <select
                value={categoryForm.tipo}
                onChange={(event) =>
                  setCategoryForm({
                    ...categoryForm,
                    tipo: event.target
                      .value as 'gasto' | 'general',
                  })
                }
              >
                <option value="gasto">
                  Gasto
                </option>
                <option value="general">
                  General
                </option>
              </select>
            </Field>
          </div>
        </Modal>
      )}

      <style jsx>{`
        .sync-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
          padding: 13px 15px;
          border: 1px solid rgba(29, 123, 226, 0.2);
          border-radius: 15px;
          color: #1768be;
          background: rgba(23, 104, 190, 0.08);
        }

        .sync-banner > div,
        .sync-banner button {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sync-banner button {
          border: 0;
          background: transparent;
          color: inherit;
          font-weight: 800;
          cursor: pointer;
        }

        .error-box {
          margin-bottom: 14px;
          padding: 12px 14px;
          border-radius: 13px;
          color: #9b3131;
          background: #fff0f0;
        }

        .settings-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          overflow-x: auto;
        }

        .settings-tabs :global(button) {
          min-height: 42px;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 0 14px;
          border: 1px solid var(--line);
          border-radius: 12px;
          color: var(--muted);
          background: var(--card);
          font-weight: 800;
          cursor: pointer;
          white-space: nowrap;
        }

        .settings-tabs :global(button.active) {
          color: white;
          border-color: transparent;
          background: #1768be;
        }

        .settings-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-top: 20px;
        }

        input,
        select {
          width: 100%;
          min-height: 44px;
          box-sizing: border-box;
          padding: 0 12px;
          border: 1px solid var(--line);
          border-radius: 11px;
          color: var(--text);
          background: var(--surface);
          font-size: 14px;
        }

        .primary,
        .ghost,
        .small-action,
        .danger-icon {
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

        .primary:disabled,
        .small-action:disabled,
        .danger-icon:disabled {
          opacity: 0.55;
          cursor: wait;
        }

        .ghost {
          min-height: 42px;
          padding: 0 14px;
          border: 1px solid var(--line);
          border-radius: 11px;
          color: var(--text);
          background: var(--card);
          font-weight: 800;
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
          border-bottom: 1px solid var(--line);
          color: var(--text);
          text-align: left;
          font-size: 13px;
        }

        th {
          color: var(--muted);
          font-size: 11px;
          text-transform: uppercase;
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

        .small-action {
          padding: 8px 10px;
          border-radius: 9px;
          color: #1768be;
          background: rgba(23, 104, 190, 0.1);
          font-weight: 800;
        }

        .cards-grid {
          display: grid;
          grid-template-columns:
            repeat(auto-fit, minmax(230px, 1fr));
          gap: 14px;
          margin-top: 18px;
        }

        .config-card {
          padding: 17px;
          border: 1px solid var(--line);
          border-radius: 16px;
          background: var(--surface);
        }

        .config-card b {
          color: var(--text);
        }

        .config-card p {
          margin: 7px 0 0;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.45;
        }

        .card-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .danger-icon {
          display: grid;
          place-items: center;
          padding: 8px;
          border-radius: 9px;
          color: #a13333;
          background: #fff0f0;
        }

        .chips {
          display: flex;
          flex-wrap: wrap;
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
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 14px;
          padding: 14px;
          border: 1px solid var(--line);
          border-radius: 13px;
          color: var(--muted);
          background: var(--surface);
          cursor: pointer;
        }

        .switch-row.active {
          color: #1768be;
          border-color: rgba(23, 104, 190, 0.35);
          background: rgba(23, 104, 190, 0.09);
        }

        .audit-table table {
          min-width: 900px;
        }

        .empty {
          padding: 28px;
          color: var(--muted);
          text-align: center;
        }

        :global(html[data-theme='dark']) .status {
          color: #ffb9b9;
          background: rgba(173, 51, 51, 0.2);
        }

        :global(html[data-theme='dark']) .status.active {
          color: #8fe6c7;
          background: rgba(17, 142, 99, 0.18);
        }

        :global(html[data-theme='dark']) .chips span {
          color: #9fd0ff;
          background: rgba(23, 104, 190, 0.17);
        }

        @media (max-width: 760px) {
          .sync-banner {
            align-items: flex-start;
            flex-direction: column;
          }

          .settings-grid {
            grid-template-columns: 1fr;
          }

          .primary {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      className={active ? 'active' : ''}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}

function SettingsPanel({
  eyebrow,
  title,
  action,
  children,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="settings-panel">
      <div className="panel-head">
        <div>
          <span>{eyebrow}</span>
          <h3>{title}</h3>
        </div>

        {action}
      </div>

      {children}

      <style jsx>{`
        .settings-panel {
          padding: 22px;
          border: 1px solid var(--line);
          border-radius: 20px;
          color: var(--text);
          background: var(--card);
          box-shadow: var(--soft-shadow);
        }

        .panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .panel-head span {
          color: #1768be;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        h3 {
          margin: 5px 0 0;
          color: var(--text);
        }

        @media (max-width: 760px) {
          .settings-panel {
            padding: 16px;
          }

          .panel-head {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>
    </section>
  );
}

function Field({
  label,
  wide,
  children,
}: {
  label: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={wide ? 'wide' : ''}>
      {label}
      {children}

      <style jsx>{`
        label {
          display: grid;
          gap: 7px;
          color: var(--text);
          font-size: 13px;
          font-weight: 800;
        }

        label.wide {
          grid-column: 1 / -1;
        }

        @media (max-width: 760px) {
          label.wide {
            grid-column: auto;
          }
        }
      `}</style>
    </label>
  );
}

function SaveButton({
  loading,
  onClick,
}: {
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="save"
      disabled={loading}
      onClick={onClick}
    >
      {loading ? (
        <LoaderCircle className="spin" size={17} />
      ) : (
        <Save size={17} />
      )}
      {loading ? 'Guardando...' : 'Guardar'}

      <style jsx>{`
        .save {
          min-height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 15px;
          border: 0;
          border-radius: 12px;
          color: white;
          background: #1768be;
          font-weight: 900;
          cursor: pointer;
        }

        .save:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .spin {
          animation: spin 0.9s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 760px) {
          .save {
            width: 100%;
          }
        }
      `}</style>
    </button>
  );
}

function SwitchButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={active ? 'switch active' : 'switch'}
      onClick={onClick}
    >
      <span>{label}</span>
      <Check size={17} />

      <style jsx>{`
        .switch {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px;
          border: 1px solid var(--line);
          border-radius: 13px;
          color: var(--muted);
          background: var(--surface);
          cursor: pointer;
        }

        .switch.active {
          color: #1768be;
          border-color: rgba(23, 104, 190, 0.35);
          background: rgba(23, 104, 190, 0.09);
        }
      `}</style>
    </button>
  );
}

function PermissionSelector({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="permissions">
      <b>{title}</b>

      <div>
        {options.map((option) => (
          <button
            key={option}
            className={
              selected.includes(option)
                ? 'active'
                : ''
            }
            onClick={() => onToggle(option)}
          >
            <Check size={15} />
            {option}
          </button>
        ))}
      </div>

      <style jsx>{`
        .permissions {
          margin-top: 20px;
        }

        .permissions > b {
          color: var(--text);
        }

        .permissions > div {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }

        button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 9px 11px;
          border: 1px solid var(--line);
          border-radius: 10px;
          color: var(--muted);
          background: var(--surface);
          cursor: pointer;
        }

        button.active {
          color: #1768be;
          border-color: rgba(23, 104, 190, 0.35);
          background: rgba(23, 104, 190, 0.09);
        }
      `}</style>
    </div>
  );
}

function Modal({
  eyebrow,
  title,
  onClose,
  footer,
  children,
}: {
  eyebrow: string;
  title: string;
  onClose: () => void;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="overlay">
      <div className="modal">
        <div className="head">
          <div>
            <span>{eyebrow}</span>
            <h3>{title}</h3>
          </div>

          <button onClick={onClose}>
            <X size={19} />
          </button>
        </div>

        {children}

        <div className="footer">{footer}</div>
      </div>

      <style jsx>{`
        .overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: grid;
          place-items: center;
          padding: 18px;
          background: rgba(6, 24, 42, 0.68);
        }

        .modal {
          width: min(100%, 880px);
          max-height: 92vh;
          overflow-y: auto;
          box-sizing: border-box;
          padding: 22px;
          border: 1px solid var(--line);
          border-radius: 20px;
          color: var(--text);
          background: var(--card);
          box-shadow: 0 28px 80px rgba(0, 0, 0, 0.3);
        }

        .head,
        .footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .head span {
          color: #1768be;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        h3 {
          margin: 5px 0 0;
          color: var(--text);
        }

        .head > button {
          display: grid;
          place-items: center;
          padding: 8px;
          border: 0;
          border-radius: 10px;
          color: var(--text);
          background: var(--surface);
          cursor: pointer;
        }

        .footer {
          margin-top: 24px;
        }

        @media (max-width: 760px) {
          .modal {
            padding: 17px;
          }

          .footer {
            align-items: stretch;
            flex-direction: column-reverse;
          }

          .footer :global(button) {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
