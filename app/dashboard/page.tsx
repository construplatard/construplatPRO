'use client';

import Link from 'next/link';
import AppShell from '../../components/AppShell';
import {useData} from '../../components/DataProvider';
import {
  Sparkles,
  BriefcaseBusiness,
  WalletCards,
  ReceiptText,
  CircleDollarSign,
  TrendingUp,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  NotebookPen,
  FileText,
  HardHat,
  Building2,
  Users,
  Plus,
  ChevronRight,
  Landmark,
} from 'lucide-react';

const money = (value: number) =>
  new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    maximumFractionDigits: 2,
  }).format(value);

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardContent />
    </AppShell>
  );
}

function DashboardContent() {
  const {data} = useData();

  const ingresos = data.movimientos
    .filter((item) => item.tipo === 'cobro')
    .reduce((total, item) => total + Number(item.monto || 0), 0);

  const gastos = data.movimientos
    .filter((item) => item.tipo === 'gasto')
    .reduce((total, item) => total + Number(item.monto || 0), 0);

  const contratado = data.proyectos.reduce(
    (total, item) => total + Number(item.monto || 0),
    0
  );

  const pendiente = Math.max(contratado - ingresos, 0);

  const proyectosActivos = data.proyectos.filter((item) => {
    const estado = (item.estado || '').toLowerCase();
    return estado !== 'completado' && estado !== 'finalizado';
  });

  const avancePromedio = data.proyectos.length
    ? Math.round(
        data.proyectos.reduce(
          (total, item) => total + Number(item.avance || 0),
          0
        ) / data.proyectos.length
      )
    : 0;

  const rentabilidad =
    ingresos > 0
      ? Math.round(((ingresos - gastos) / ingresos) * 100)
      : 0;

  const proyectoPrincipal =
    proyectosActivos[0] || data.proyectos[0] || null;

  const clientePrincipal = proyectoPrincipal
    ? data.clientes.find(
        (cliente) => cliente.id === proyectoPrincipal.clienteId
      )
    : null;

  const metricas = [
    {
      titulo: 'Proyectos activos',
      valor: String(proyectosActivos.length),
      detalle: `${data.proyectos.length} registrados`,
      icono: BriefcaseBusiness,
      href: '/proyectos',
      tipo: 'positive',
    },
    {
      titulo: 'Monto contratado',
      valor: money(contratado),
      detalle: 'Ver proyectos',
      icono: TrendingUp,
      href: '/proyectos',
      tipo: 'positive',
    },
    {
      titulo: 'Cobrado',
      valor: money(ingresos),
      detalle: 'Registrar cobro',
      icono: WalletCards,
      href: '/cobros',
      tipo: 'neutral',
    },
    {
      titulo: 'Gastos',
      valor: money(gastos),
      detalle: 'Registrar gasto',
      icono: ReceiptText,
      href: '/gastos',
      tipo: 'neutral',
    },
  ];

  const resumen = [
    {
      etiqueta: 'Clientes',
      valor: data.clientes.length,
      href: '/clientes',
    },
    {
      etiqueta: 'Cotizaciones',
      valor: data.cotizaciones.length,
      href: '/cotizaciones',
    },
    {
      etiqueta: 'Contratistas',
      valor: data.contratistas.length,
      href: '/contratistas',
    },
    {
      etiqueta: 'Bitácoras',
      valor: data.bitacoras.length,
      href: '/bitacoras',
    },
  ];

  const acciones = [
    {
      titulo: 'Nueva cotización',
      texto: 'Crea una propuesta comercial rápida y profesional.',
      icono: FileText,
      href: '/cotizaciones',
    },
    {
      titulo: 'Nueva bitácora',
      texto: 'Registra actividades, avances e incidencias del día.',
      icono: NotebookPen,
      href: '/bitacoras',
    },
    {
      titulo: 'Nuevo contratista',
      texto: 'Agrega contratistas y controla sus trabajos.',
      icono: HardHat,
      href: '/contratistas',
    },
    {
      titulo: 'Nuevo proyecto',
      texto: 'Inicia una nueva obra y centraliza su control.',
      icono: Building2,
      href: '/proyectos',
    },
  ];

  const actividades = [
    ...data.bitacoras
      .slice(-2)
      .reverse()
      .map((item) => ({
        titulo: 'Bitácora registrada',
        detalle: `${item.fecha} · ${item.actividades || 'Sin descripción'}`,
        estado: `${item.avance || 0}%`,
        href: '/bitacoras',
      })),

    ...data.movimientos
      .slice(-2)
      .reverse()
      .map((item) => ({
        titulo:
          item.tipo === 'cobro'
            ? 'Cobro registrado'
            : 'Gasto registrado',
        detalle: `${item.fecha} · ${item.concepto}`,
        estado: money(item.monto),
        href: item.tipo === 'cobro' ? '/cobros' : '/gastos',
      })),

    ...data.proyectos
      .slice(-1)
      .reverse()
      .map((item) => ({
        titulo: 'Proyecto registrado',
        detalle: `${item.nombre} · ${item.estado}`,
        estado: `${item.avance || 0}%`,
        href: '/proyectos',
      })),
  ].slice(0, 5);

  return (
    <div className="dashboard-v2">
      <section className="dashboard-hero-v2">
        <div className="dashboard-hero-copy">
          <span className="hero-badge-v2">
            <Sparkles size={15} />
            Resumen ejecutivo
          </span>

          <h2>Buenos días, CONSTRUPLATA</h2>

          <p>
            Control general de la empresa, los proyectos y el desempeño
            financiero desde un solo centro de control.
          </p>

          <div className="hero-summary-strip">
            {resumen.map((item) => (
              <Link
                key={item.etiqueta}
                href={item.href}
                className="hero-summary-item"
              >
                <b>{item.valor}</b>
                <span>{item.etiqueta}</span>

                <div className="summary-link-icon">
                  <ChevronRight size={15} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <Link href="/reportes" className="hero-financial-card">
          <div className="hero-financial-head">
            <span>Panorama financiero</span>
            <CircleDollarSign size={18} />
          </div>

          <div className="hero-financial-main">
            <b>{money(contratado)}</b>
            <small>Monto global contratado</small>
          </div>

          <div className="hero-financial-grid">
            <div>
              <span>Cobrado</span>
              <b>{money(ingresos)}</b>
            </div>

            <div>
              <span>Pendiente</span>
              <b>{money(pendiente)}</b>
            </div>

            <div>
              <span>Gastos</span>
              <b>{money(gastos)}</b>
            </div>

            <div>
              <span>Rentabilidad</span>
              <b>{rentabilidad}%</b>
            </div>
          </div>

          <div className="financial-card-link">
            Ver reporte financiero
            <ArrowUpRight size={16} />
          </div>
        </Link>
      </section>

      <section className="kpi-grid-v2">
        {metricas.map((item) => {
          const Icono = item.icono;

          return (
            <Link
              key={item.titulo}
              href={item.href}
              className="kpi-card-v2"
            >
              <div className="kpi-card-top">
                <div className="kpi-icon-wrap">
                  <Icono size={20} />
                </div>

                <span
                  className={
                    item.tipo === 'positive'
                      ? 'trend-pill positive'
                      : 'trend-pill neutral'
                  }
                >
                  {item.tipo === 'positive' ? (
                    <ArrowUpRight size={15} />
                  ) : (
                    <CalendarDays size={15} />
                  )}

                  {item.detalle}
                </span>
              </div>

              <div className="kpi-content">
                <span>{item.titulo}</span>
                <b>{item.valor}</b>
              </div>

              <span className="kpi-open-icon">
                <ChevronRight size={17} />
              </span>
            </Link>
          );
        })}
      </section>

      <section className="dashboard-main-grid-v2">
        <div className="dashboard-column-main">
          <article className="dashboard-panel-v2 hero-panel">
            <div className="panel-head-v2">
              <div>
                <span className="eyebrow">Proyecto principal</span>
                <h3>Proyectos activos</h3>
                <p>Seguimiento visual del estado actual de las obras.</p>
              </div>

              <Link href="/proyectos" className="ghost-btn-v2">
                <Plus size={16} />
                Nuevo proyecto
              </Link>
            </div>

            {proyectoPrincipal ? (
              <div className="project-spotlight">
                <Link
                  href="/proyectos"
                  className="project-spotlight-main"
                >
                  <div className="project-tag">
                    {proyectoPrincipal.estado || 'En ejecución'}
                  </div>

                  <h4>{proyectoPrincipal.nombre}</h4>

                  <p>
                    Control técnico, financiero y documental del proyecto.
                  </p>

                  <div className="project-meta-grid">
                    <div>
                      <span>Cliente</span>
                      <b>{clientePrincipal?.nombre || 'Sin cliente'}</b>
                    </div>

                    <div>
                      <span>Ubicación</span>
                      <b>{proyectoPrincipal.direccion || 'Sin dirección'}</b>
                    </div>

                    <div>
                      <span>Contrato</span>
                      <b>{money(proyectoPrincipal.monto)}</b>
                    </div>

                    <div>
                      <span>Avance</span>
                      <b>{proyectoPrincipal.avance || 0}%</b>
                    </div>
                  </div>

                  <div className="open-project-link">
                    Abrir proyecto
                    <ArrowUpRight size={16} />
                  </div>
                </Link>

                <Link
                  href="/proyectos"
                  className="project-progress-card"
                >
                  <div className="project-progress-head">
                    <span>Progreso general</span>
                    <b>{proyectoPrincipal.avance || 0}%</b>
                  </div>

                  <div className="progress modern">
                    <i
                      style={{
                        width: `${Math.min(
                          Number(proyectoPrincipal.avance || 0),
                          100
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="progress-legend">
                    <span>Inicio</span>
                    <span>Obra gris</span>
                    <span>Terminación</span>
                    <span>Entrega</span>
                  </div>

                  <div className="mini-bars-chart">
                    {[36, 58, 72, 44, 88, 52, 66].map(
                      (height, index) => (
                        <div key={index}>
                          <i style={{height: `${height}%`}} />
                        </div>
                      )
                    )}
                  </div>

                  <div className="progress-card-link">
                    Ver seguimiento
                    <ChevronRight size={16} />
                  </div>
                </Link>
              </div>
            ) : (
              <div className="empty">
                No hay proyectos registrados todavía.
              </div>
            )}
          </article>

          <article className="dashboard-panel-v2">
            <div className="panel-head-v2">
              <div>
                <span className="eyebrow">Acciones rápidas</span>
                <h3>Lo que puedes hacer hoy</h3>
                <p>
                  Accesos directos para acelerar tu flujo de trabajo.
                </p>
              </div>
            </div>

            <div className="quick-actions-grid">
              {acciones.map((accion) => {
                const Icono = accion.icono;

                return (
                  <Link
                    key={accion.titulo}
                    href={accion.href}
                    className="quick-action-card"
                  >
                    <div className="quick-action-icon">
                      <Icono size={18} />
                    </div>

                    <div className="quick-action-copy">
                      <h4>{accion.titulo}</h4>
                      <p>{accion.texto}</p>
                    </div>

                    <div className="quick-action-arrow">
                      <ArrowUpRight size={17} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </article>
        </div>

        <div className="dashboard-column-side">
          <article className="dashboard-panel-v2 side-panel">
            <div className="panel-head-v2">
              <div>
                <span className="eyebrow">Actividad reciente</span>
                <h3>Últimos movimientos</h3>
              </div>
            </div>

            <div className="activity-list-v2">
              {actividades.length ? (
                actividades.map((item, index) => (
                  <Link
                    key={`${item.titulo}-${index}`}
                    href={item.href}
                    className="activity-item-v2"
                  >
                    <div className="activity-icon">
                      <CheckCircle2 size={17} />
                    </div>

                    <div className="activity-copy">
                      <b>{item.titulo}</b>
                      <span>{item.detalle}</span>
                    </div>

                    <small>{item.estado}</small>
                  </Link>
                ))
              ) : (
                <div className="empty">No hay actividad reciente.</div>
              )}
            </div>
          </article>

          <Link
            href="/proyectos"
            className="dashboard-panel-v2 side-panel dashboard-link-panel"
          >
            <div className="panel-head-v2">
              <div>
                <span className="eyebrow">Distribución</span>
                <h3>Estado operativo</h3>
              </div>

              <ChevronRight size={18} />
            </div>

            <div className="status-donut-card">
              <div
                className="fake-donut"
                style={{
                  background: `conic-gradient(
                    #1769e0 0 ${avancePromedio}%,
                    rgba(23,105,224,.12) ${avancePromedio}% 100%
                  )`,
                }}
              >
                <div className="fake-donut-center">
                  <b>{avancePromedio}%</b>
                  <span>Avance</span>
                </div>
              </div>

              <div className="donut-legend">
                <div>
                  <i className="dot blue" />
                  <span>Avance físico</span>
                  <b>{avancePromedio}%</b>
                </div>

                <div>
                  <i className="dot soft" />
                  <span>Pendiente</span>
                  <b>{Math.max(100 - avancePromedio, 0)}%</b>
                </div>
              </div>
            </div>
          </Link>

          <article className="dashboard-panel-v2 side-panel">
            <div className="panel-head-v2">
              <div>
                <span className="eyebrow">Resumen de red</span>
                <h3>Base administrativa</h3>
              </div>
            </div>

            <div className="mini-metrics-list">
              <Link href="/clientes" className="mini-metric">
                <div className="mini-icon">
                  <Users size={16} />
                </div>

                <div>
                  <span>Clientes</span>
                  <b>{data.clientes.length} registrados</b>
                </div>

                <ChevronRight size={16} />
              </Link>

              <Link href="/cotizaciones" className="mini-metric">
                <div className="mini-icon">
                  <FileText size={16} />
                </div>

                <div>
                  <span>Cotizaciones</span>
                  <b>{data.cotizaciones.length} emitidas</b>
                </div>

                <ChevronRight size={16} />
              </Link>

              <Link href="/contratistas" className="mini-metric">
                <div className="mini-icon">
                  <HardHat size={16} />
                </div>

                <div>
                  <span>Contratistas</span>
                  <b>{data.contratistas.length} registrados</b>
                </div>

                <ChevronRight size={16} />
              </Link>

              <Link href="/caja" className="mini-metric">
                <div className="mini-icon">
                  <Landmark size={16} />
                </div>

                <div>
                  <span>Caja estimada</span>
                  <b>{money(ingresos - gastos)}</b>
                </div>

                <ChevronRight size={16} />
              </Link>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
