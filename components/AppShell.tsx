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

    setDark(savedTheme === 'dark');
  }, [router]);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem('cp-theme', dark ? 'dark' : 'light');
  }, [dark]);

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
      <div className="shell">
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
                      title={label}
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

        </aside>

        {open && <button className="sidebar-overlay" onClick={() => setOpen(false)} />}

        <main className="main">
          <header className="topbar">
            <div className="topbar-left">
              <button
                className="icon mobile mobile-menu-button"
                onClick={() => setOpen(true)}
                aria-label="Abrir menú"
              >
                <Menu size={20} />
              </button>

              <div className="mobile mobile-top-brand">
                <img src="/logo-construplata.jpg" alt="CONSTRUPLATA" />
                <div>
                  <b>{current?.label || 'CONSTRUPLATA'}</b>
                  <span>CONSTRUPLATA PRO</span>
                </div>
              </div>

              <div className="page-heading desktop-page-heading">
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


        .sidebar {
          padding-bottom: 24px;
        }

        .brand {
          min-height: 112px;
          padding: 18px 16px 20px;
          align-items: center;
        }

        .brand-mark {
          width: 74px;
          height: 74px;
          flex: 0 0 74px;
          padding: 7px;
          border-radius: 21px;
          background: #fff;
          box-shadow: 0 14px 32px rgba(0, 0, 0, 0.18);
        }

        .brand-mark img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 14px;
        }

        .brand-copy b {
          font-size: 18px;
          letter-spacing: 0.045em;
        }

        .brand-copy span {
          margin-top: 6px;
          font-size: 11px;
        }

        .sidebar-nav {
          padding-top: 8px;
          padding-bottom: 28px;
        }

        .nav-group:first-child {
          margin-top: 0;
        }

        @media (max-width: 980px) {
          .brand {
            min-height: 96px;
          }

          .brand-mark {
            width: 62px;
            height: 62px;
            flex-basis: 62px;
          }
        }


        .mobile-top-brand,
        .mobile-sidebar-footer {
          display: none;
        }

        @media (max-width: 768px) {
          .shell {
            display: block;
            width: 100%;
            min-height: 100vh;
          }

          .sidebar {
            width: min(88vw, 320px) !important;
            padding: 14px 12px 16px;
            transform: translateX(-105%);
            transition: transform 0.28s ease;
            overflow-y: auto;
            box-shadow: 20px 0 60px rgba(0, 0, 0, 0.34);
          }

          .sidebar.open {
            transform: translateX(0);
          }

          .main {
            width: 100% !important;
            margin-left: 0 !important;
          }

          .sidebar-overlay {
            position: fixed;
            inset: 0;
            z-index: 35;
            border: 0;
            background: rgba(2, 12, 25, 0.62);
            backdrop-filter: blur(3px);
          }

          .brand {
            min-height: 92px;
            padding: 10px 8px 16px;
          }

          .brand-mark {
            width: 66px;
            height: 66px;
            flex-basis: 66px;
          }

          .brand-copy b {
            font-size: 17px;
          }

          .brand-copy span {
            font-size: 10px;
          }

          .sidebar-close {
            margin-left: auto;
          }

          .sidebar-nav {
            padding: 4px 0 18px;
            overflow: visible;
          }

          .nav-group {
            gap: 4px;
          }

          .nav-group-label {
            padding: 7px 12px 4px;
          }

          .nav {
            min-height: 50px;
            padding: 12px 13px;
            font-size: 14px;
          }

          .nav-icon {
            width: 27px;
          }

          .mobile-sidebar-footer {
            margin-top: 10px;
            padding: 12px;
            display: grid;
            grid-template-columns: 42px 1fr 38px;
            gap: 10px;
            align-items: center;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            background: rgba(255, 255, 255, 0.06);
          }

          .mobile-sidebar-footer b,
          .mobile-sidebar-footer span {
            display: block;
          }

          .mobile-sidebar-footer b {
            font-size: 12px;
          }

          .mobile-sidebar-footer span {
            margin-top: 3px;
            color: #91aac4;
            font-size: 10px;
          }

          .mobile-sidebar-footer button {
            width: 38px;
            height: 38px;
            display: grid;
            place-items: center;
            border: 0;
            border-radius: 11px;
            color: #fff;
            background: rgba(255, 255, 255, 0.08);
          }

          .topbar {
            min-height: 68px;
            padding: 9px 12px;
            gap: 10px;
          }

          .topbar-left {
            min-width: 0;
            flex: 1;
            gap: 9px;
          }

          .desktop-page-heading {
            display: none;
          }

          .mobile-top-brand {
            min-width: 0;
            display: flex;
            align-items: center;
            gap: 9px;
          }

          .mobile-top-brand img {
            width: 40px;
            height: 40px;
            padding: 3px;
            object-fit: contain;
            border-radius: 11px;
            background: #fff;
          }

          .mobile-top-brand div {
            min-width: 0;
          }

          .mobile-top-brand b,
          .mobile-top-brand span {
            display: block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .mobile-top-brand b {
            max-width: 145px;
            color: var(--text);
            font-size: 14px;
          }

          .mobile-top-brand span {
            margin-top: 2px;
            color: var(--muted);
            font-size: 8px;
            letter-spacing: 0.08em;
          }

          .mobile-menu-button {
            width: 42px;
            height: 42px;
            border-radius: 13px;
          }

          .top-actions {
            gap: 6px;
          }

          .search-control-wrap,
          .logout-desktop,
          .top-user-copy,
          .user-chevron {
            display: none !important;
          }

          .top-user-button {
            min-height: 42px;
            padding: 3px;
            border-radius: 13px;
          }

          .top-user-button .avatar {
            width: 36px;
            height: 36px;
            border-radius: 11px;
            font-size: 11px;
          }

          .top-action-button {
            width: 42px;
            height: 42px;
            border-radius: 13px;
          }

          .content {
            min-height: calc(100vh - 68px);
            padding: 14px 12px 24px;
          }

          .page-content {
            max-width: 100%;
          }

          .top-dropdown {
            position: fixed;
            top: 72px;
            right: 10px;
            left: 10px;
            width: auto !important;
            max-height: calc(100vh - 90px);
            overflow-y: auto;
          }
        }

        @media (min-width: 769px) {
          .sidebar {
            transform: none !important;
          }

          .mobile-top-brand,
          .mobile-sidebar-footer,
          .mobile-menu-button,
          .sidebar-close {
            display: none !important;
          }
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
