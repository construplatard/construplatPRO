'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  FolderKanban,
  NotebookPen,
  WalletCards,
  ReceiptText,
  CircleDollarSign,
  Landmark,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  Search,
  Bell,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  UserRound,
  CheckCircle2,
} from 'lucide-react';
import { DataProvider } from './DataProvider';

const menu = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'General' },
  { href: '/clientes', label: 'Clientes', icon: Users, group: 'Gestión' },
  { href: '/cotizaciones', label: 'Cotizaciones', icon: FileText, group: 'Gestión' },
  { href: '/contratos', label: 'Contratos', icon: FileText, group: 'Gestión' },
  { href: '/proyectos', label: 'Proyectos', icon: FolderKanban, group: 'Operaciones' },
  { href: '/bitacoras', label: 'Bitácoras', icon: NotebookPen, group: 'Operaciones' },
  { href: '/cobros', label: 'Cobros y avances', icon: WalletCards, group: 'Finanzas' },
  { href: '/facturas', label: 'Facturación', icon: ReceiptText, group: 'Finanzas' },
  { href: '/gastos', label: 'Gastos', icon: CircleDollarSign, group: 'Finanzas' },
  { href: '/caja', label: 'Caja y bancos', icon: Landmark, group: 'Finanzas' },
  { href: '/reportes', label: 'Reportes', icon: BarChart3, group: 'Análisis' },
  { href: '/configuracion', label: 'Configuración', icon: Settings, group: 'Sistema' },
] as const;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('cp-auth') !== '1') {
      router.replace('/login');
    }

    const savedTheme = localStorage.getItem('cp-theme');
    const savedSidebar = localStorage.getItem('cp-sidebar');

    setDark(savedTheme === 'dark');
    setCollapsed(savedSidebar === 'collapsed');
  }, [router]);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem('cp-theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    localStorage.setItem('cp-sidebar', collapsed ? 'collapsed' : 'expanded');
  }, [collapsed]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
        setSearchOpen(true);
      }

      if (event.key === 'Escape') {
        setSearchOpen(false);
        setNotificationsOpen(false);
        setUserOpen(false);
      }
    };

    const handleOutside = (event: MouseEvent) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
        setNotificationsOpen(false);
        setUserOpen(false);
      }
    };

    window.addEventListener('keydown', handleShortcut);
    window.addEventListener('mousedown', handleOutside);

    return () => {
      window.removeEventListener('keydown', handleShortcut);
      window.removeEventListener('mousedown', handleOutside);
    };
  }, []);

  const current = useMemo(
    () => menu.find((item) => item.href === path),
    [path]
  );

  const groups = useMemo(() => {
    const order = ['General', 'Gestión', 'Operaciones', 'Finanzas', 'Análisis', 'Sistema'];

    return order
      .map((group) => ({
        group,
        items: menu.filter((item) => item.group === group),
      }))
      .filter((section) => section.items.length > 0);
  }, []);

  const searchResults = useMemo(() => {
    const value = searchText.trim().toLowerCase();

    if (!value) return menu.slice(0, 6);

    return menu.filter((item) =>
      `${item.label} ${item.group}`.toLowerCase().includes(value)
    );
  }, [searchText]);

  const goTo = (href: string) => {
    router.push(href);
    setSearchText('');
    setSearchOpen(false);
    setNotificationsOpen(false);
    setUserOpen(false);
  };

  const logout = () => {
    localStorage.removeItem('cp-auth');
    router.push('/login');
  };

  const toggleNotifications = () => {
    setNotificationsOpen((value) => !value);
    setUserOpen(false);
    setSearchOpen(false);
  };

  const toggleUser = () => {
    setUserOpen((value) => !value);
    setNotificationsOpen(false);
    setSearchOpen(false);
  };

  return (
    <DataProvider>
      <div className={`shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <aside className={open ? 'sidebar open' : 'sidebar'}>
          <div className="brand">
            <div className="brand-mark">
              <img src="/logo-construplata.jpg" alt="CONSTRUPLATA" />
            </div>

            <div className="brand-copy">
              <b>CONSTRUPLATA</b>
              <span>Gestión & Ingeniería</span>
            </div>

            <button
              className="icon mobile sidebar-close"
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
            >
              <X size={20} />
            </button>
          </div>

          <button
            className="sidebar-collapse desktop-only"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            <span>{collapsed ? '' : 'Contraer menú'}</span>
          </button>

          <nav className="sidebar-nav">
            {groups.map(({ group, items }) => (
              <div className="nav-group" key={group}>
                <span className="nav-group-label">{group}</span>

                {items.map(({ href, label, icon: Icon }) => {
                  const active = path === href;

                  return (
                    <Link
                      key={href}
                      href={href}
                      className={active ? 'nav active' : 'nav'}
                      onClick={() => setOpen(false)}
                      title={collapsed ? label : undefined}
                    >
                      <span className="nav-icon">
                        <Icon size={18} />
                      </span>
                      <span className="nav-label">{label}</span>
                      {active && <span className="nav-indicator" />}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="side-profile">
            <div className="side-avatar">JC</div>
            <div className="side-profile-copy">
              <b>Juan Carlos</b>
              <span>Administrador</span>
            </div>
            <button className="side-logout" onClick={logout} aria-label="Cerrar sesión">
              <LogOut size={17} />
            </button>
          </div>
        </aside>

        {open && <button className="sidebar-overlay" onClick={() => setOpen(false)} />}

        <main className="main">
          <header className="topbar">
            <div className="topbar-left">
              <button
                className="icon mobile"
                onClick={() => setOpen(true)}
                aria-label="Abrir menú"
              >
                <Menu size={20} />
              </button>

              <div className="page-heading">
                <span className="page-eyebrow">Centro de control</span>
                <h1>{current?.label || 'CONSTRUPLATA'}</h1>
                <p>Gestión administrativa, financiera y operativa</p>
              </div>
            </div>

            <div className="top-actions functional-top-actions" ref={headerRef}>
              <div className="top-control-wrap search-control-wrap">
                <div className="global-search">
                  <Search size={17} />
                  <input
                    ref={searchRef}
                    value={searchText}
                    placeholder="Buscar en el sistema..."
                    onFocus={() => {
                      setSearchOpen(true);
                      setNotificationsOpen(false);
                      setUserOpen(false);
                    }}
                    onChange={(event) => {
                      setSearchText(event.target.value);
                      setSearchOpen(true);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && searchResults[0]) {
                        goTo(searchResults[0].href);
                      }
                    }}
                  />
                  <kbd>Ctrl K</kbd>
                </div>

                {searchOpen && (
                  <div className="top-dropdown search-dropdown">
                    <div className="dropdown-title">
                      <Search size={15} />
                      <span>Resultados</span>
                    </div>

                    {searchResults.length ? (
                      searchResults.map(({ href, label, group, icon: Icon }) => (
                        <button
                          type="button"
                          key={href}
                          className="dropdown-item"
                          onClick={() => goTo(href)}
                        >
                          <span className="dropdown-icon">
                            <Icon size={16} />
                          </span>

                          <span className="dropdown-copy">
                            <b>{label}</b>
                            <small>{group}</small>
                          </span>

                          <ArrowIcon />
                        </button>
                      ))
                    ) : (
                      <div className="dropdown-empty">
                        No se encontraron módulos.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="top-control-wrap">
                <button
                  type="button"
                  className="top-action-button notification-button"
                  aria-label="Notificaciones"
                  onClick={toggleNotifications}
                >
                  <Bell size={18} />
                  <span className="notification-dot" />
                </button>

                {notificationsOpen && (
                  <div className="top-dropdown notification-dropdown">
                    <div className="dropdown-title">
                      <Bell size={15} />
                      <span>Notificaciones</span>
                    </div>

                    <button
                      type="button"
                      className="notification-item"
                      onClick={() => goTo('/cobros')}
                    >
                      <CheckCircle2 size={17} />
                      <span>
                        <b>Revisa los cobros pendientes</b>
                        <small>Consulta balances y avances financieros.</small>
                      </span>
                    </button>

                    <button
                      type="button"
                      className="notification-item"
                      onClick={() => goTo('/bitacoras')}
                    >
                      <NotebookPen size={17} />
                      <span>
                        <b>Actualiza las bitácoras</b>
                        <small>Registra el avance físico de tus proyectos.</small>
                      </span>
                    </button>

                    <button
                      type="button"
                      className="notification-item"
                      onClick={() => goTo('/reportes')}
                    >
                      <BarChart3 size={17} />
                      <span>
                        <b>Reporte ejecutivo disponible</b>
                        <small>Consulta resultados, gastos y rentabilidad.</small>
                      </span>
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="top-action-button"
                onClick={() => setDark(!dark)}
                aria-label="Cambiar tema"
                title={dark ? 'Activar modo claro' : 'Activar modo oscuro'}
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <div className="top-control-wrap">
                <button
                  type="button"
                  className="top-user top-user-button"
                  onClick={toggleUser}
                  aria-expanded={userOpen}
                >
                  <div className="avatar">JC</div>
                  <div className="top-user-copy">
                    <b>Juan Carlos</b>
                    <span>Administrador</span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={userOpen ? 'user-chevron open' : 'user-chevron'}
                  />
                </button>

                {userOpen && (
                  <div className="top-dropdown user-dropdown">
                    <div className="user-dropdown-head">
                      <div className="avatar large">JC</div>
                      <div>
                        <b>Juan Carlos</b>
                        <span>Administrador</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={() => goTo('/configuracion')}
                    >
                      <span className="dropdown-icon">
                        <Settings size={16} />
                      </span>
                      <span className="dropdown-copy">
                        <b>Configuración</b>
                        <small>Empresa, usuarios y permisos</small>
                      </span>
                    </button>

                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={() => goTo('/dashboard')}
                    >
                      <span className="dropdown-icon">
                        <UserRound size={16} />
                      </span>
                      <span className="dropdown-copy">
                        <b>Mi panel</b>
                        <small>Volver al dashboard</small>
                      </span>
                    </button>

                    <button
                      type="button"
                      className="dropdown-item logout-item"
                      onClick={logout}
                    >
                      <span className="dropdown-icon">
                        <LogOut size={16} />
                      </span>
                      <span className="dropdown-copy">
                        <b>Cerrar sesión</b>
                        <small>Salir de CONSTRUPLATA PRO</small>
                      </span>
                    </button>
                  </div>
                )}
              </div>

              <button
                className="top-action-button logout-desktop"
                onClick={logout}
                aria-label="Salir"
                title="Cerrar sesión"
              >
                <LogOut size={18} />
              </button>
            </div>
          </header>

          <div className="content">
            <div className="content-glow content-glow-one" />
            <div className="content-glow content-glow-two" />
            <div className="page-content">{children}</div>
          </div>
        </main>
      </div>

      <style jsx>{`
        .functional-top-actions {
          position: relative;
        }

        .top-control-wrap {
          position: relative;
        }

        .search-control-wrap {
          z-index: 30;
        }

        .top-user-button {
          cursor: pointer;
          border: 1px solid var(--line);
          font: inherit;
        }

        .user-chevron {
          transition: transform 0.2s ease;
        }

        .user-chevron.open {
          transform: rotate(180deg);
        }

        .top-dropdown {
          width: 320px;
          padding: 10px;
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          z-index: 100;
          overflow: hidden;
          border: 1px solid var(--line);
          border-radius: 18px;
          color: var(--text);
          background: var(--card);
          box-shadow: 0 24px 70px rgba(3, 24, 48, 0.24);
          animation: dropdownIn 0.18s ease;
        }

        .search-dropdown {
          width: min(410px, calc(100vw - 34px));
          right: 0;
        }

        .dropdown-title {
          padding: 8px 10px 11px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--muted);
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .dropdown-item,
        .notification-item {
          width: 100%;
          min-height: 58px;
          padding: 10px;
          display: flex;
          align-items: center;
          gap: 11px;
          border: 0;
          border-radius: 13px;
          color: var(--text);
          background: transparent;
          text-align: left;
          cursor: pointer;
        }

        .dropdown-item:hover,
        .notification-item:hover {
          background: rgba(23, 105, 224, 0.08);
        }

        .dropdown-icon {
          width: 36px;
          height: 36px;
          flex: 0 0 36px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          color: var(--blue);
          background: rgba(23, 105, 224, 0.1);
        }

        .dropdown-copy {
          min-width: 0;
          flex: 1;
        }

        .dropdown-copy b,
        .dropdown-copy small,
        .notification-item b,
        .notification-item small {
          display: block;
        }

        .dropdown-copy b,
        .notification-item b {
          font-size: 12px;
        }

        .dropdown-copy small,
        .notification-item small {
          margin-top: 3px;
          color: var(--muted);
          font-size: 10px;
          line-height: 1.35;
        }

        .dropdown-empty {
          padding: 24px 12px;
          color: var(--muted);
          text-align: center;
          font-size: 12px;
        }

        .notification-dropdown {
          width: 340px;
        }

        .notification-item > svg {
          flex: 0 0 auto;
          color: var(--blue);
        }

        .notification-item > span {
          min-width: 0;
        }

        .user-dropdown {
          width: 285px;
        }

        .user-dropdown-head {
          padding: 10px 10px 14px;
          display: flex;
          align-items: center;
          gap: 11px;
          border-bottom: 1px solid var(--line);
          margin-bottom: 7px;
        }

        .user-dropdown-head b,
        .user-dropdown-head span {
          display: block;
        }

        .user-dropdown-head span {
          margin-top: 3px;
          color: var(--muted);
          font-size: 10px;
        }

        .avatar.large {
          width: 44px;
          height: 44px;
        }

        .logout-item {
          color: #c24b4b;
        }

        .logout-item .dropdown-icon {
          color: #c24b4b;
          background: rgba(194, 75, 75, 0.1);
        }

        @keyframes dropdownIn {
          from {
            opacity: 0;
            transform: translateY(-6px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 980px) {
          .search-control-wrap {
            display: none;
          }

          .top-user-copy {
            display: none;
          }

          .top-user-button {
            padding: 5px;
          }

          .user-chevron {
            display: none;
          }
        }

        @media (max-width: 620px) {
          .notification-dropdown,
          .user-dropdown {
            position: fixed;
            top: 76px;
            right: 12px;
            left: 12px;
            width: auto;
          }
        }
      `}</style>
    </DataProvider>
  );
}

function ArrowIcon() {
  return (
    <span
      aria-hidden="true"
      style={{
        color: 'var(--muted)',
        fontSize: 18,
        lineHeight: 1,
      }}
    >
      ›
    </span>
  );
}
