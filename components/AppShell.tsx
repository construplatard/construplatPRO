'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
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
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);

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

  const logout = () => {
    localStorage.removeItem('cp-auth');
    router.push('/login');
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

            <div className="top-actions">
              <div className="global-search">
                <Search size={17} />
                <input placeholder="Buscar en el sistema..." />
                <kbd>Ctrl K</kbd>
              </div>

              <button className="top-action-button notification-button" aria-label="Notificaciones">
                <Bell size={18} />
                <span className="notification-dot" />
              </button>

              <button
                className="top-action-button"
                onClick={() => setDark(!dark)}
                aria-label="Cambiar tema"
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <div className="top-user">
                <div className="avatar">JC</div>
                <div className="top-user-copy">
                  <b>Juan Carlos</b>
                  <span>Administrador</span>
                </div>
                <ChevronDown size={16} />
              </div>

              <button className="top-action-button logout-desktop" onClick={logout} aria-label="Salir">
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
    </DataProvider>
  );
}
