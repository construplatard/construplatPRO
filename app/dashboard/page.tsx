import Link from 'next/link';
import AppShell from '../../components/AppShell';
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

type MetricType = 'positive' | 'neutral';

type Metric = {
  titulo: string;
  valor: string;
  detalle: string;
  icono: React.ComponentType<{ size?: number }>;
  tipo: MetricType;
  href: string;
};

type QuickAction = {
  titulo: string;
  texto: string;
  icono: React.ComponentType<{ size?: number }>;
  href: string;
};

const metricas: Metric[] = [
  {
    titulo: 'Proyectos activos',
    valor: '1',
    detalle: '+1 este mes',
    icono: BriefcaseBusiness,
    tipo: 'positive',
    href: '/proyectos',
  },
  {
    titulo: 'Monto contratado',
    valor: 'RD$650,000.00',
    detalle: 'Ver proyectos',
    icono: TrendingUp,
    tipo: 'positive',
    href: '/proyectos',
  },
  {
    titulo: 'Cobrado',
    valor: 'RD$0.00',
    detalle: 'Registrar cobro',
    icono: WalletCards,
    tipo: 'neutral',
    href: '/cobros',
  },
  {
    titulo: 'Gastos',
    valor: 'RD$0.00',
    detalle: 'Registrar gasto',
    icono: ReceiptText,
    tipo: 'neutral',
    href: '/gastos',
  },
];

const acciones: QuickAction[] = [
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
  {
    titulo: 'Proyecto creado',
    detalle: 'Remodelación demostración · Hoy',
    estado: 'Completado',
    href: '/proyectos',
  },
  {
    titulo: 'Cliente registrado',
    detalle: 'Cliente demostración · Santo Domingo',
    estado: 'Activo',
    href: '/clientes',
  },
  {
    titulo: 'Sistema inicializado',
    detalle: 'CONSTRUPLATA listo para comenzar',
    estado: 'Listo',
    href: '/configuracion',
  },
];

const resumen = [
  {
    etiqueta: 'Clientes',
    valor: '1',
    href: '/clientes',
  },
  {
    etiqueta: 'Cotizaciones',
    valor: '0',
    href: '/cotizaciones',
  },
  {
    etiqueta: 'Contratistas',
    valor: '0',
    href: '/contratistas',
  },
  {
    etiqueta: 'Bitácoras',
    valor: '0',
    href: '/bitacoras',
  },
];

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="dashboard-v2">
        {/* ENCABEZADO PRINCIPAL */}

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
              <b>RD$650,000.00</b>
              <small>Monto global contratado</small>
            </div>

            <div className="hero-financial-grid">
              <div>
                <span>Cobrado</span>
                <b>RD$0.00</b>
              </div>

              <div>
                <span>Pendiente</span>
                <b>RD$650,000.00</b>
              </div>

              <div>
                <span>Gastos</span>
                <b>RD$0.00</b>
              </div>

              <div>
                <span>Rentabilidad</span>
                <b>0%</b>
              </div>
            </div>

            <div className="financial-card-link">
              Ver reporte financiero
              <ArrowUpRight size={16} />
            </div>
          </Link>
        </section>

        {/* INDICADORES */}

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
            {/* PROYECTO PRINCIPAL */}

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

              <div className="project-spotlight">
                <Link
                  href="/proyectos"
                  className="project-spotlight-main"
                >
                  <div className="project-tag">En ejecución</div>

                  <h4>Remodelación demostración</h4>

                  <p>
                    Proyecto piloto de modernización y control operativo.
                  </p>

                  <div className="project-meta-grid">
                    <div>
                      <span>Cliente</span>
                      <b>Cliente demostración</b>
                    </div>

                    <div>
                      <span>Ubicación</span>
                      <b>Santo Domingo</b>
                    </div>

                    <div>
                      <span>Contrato</span>
                      <b>RD$650,000.00</b>
                    </div>

                    <div>
                      <span>Avance</span>
                      <b>25%</b>
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
                    <b>25%</b>
                  </div>

                  <div className="progress modern">
                    <i style={{ width: '25%' }} />
                  </div>

                  <div className="progress-legend">
                    <span>Inicio</span>
                    <span>Obra gris</span>
                    <span>Terminación</span>
                    <span>Entrega</span>
                  </div>

                  <div className="mini-bars-chart">
                    <div>
                      <i style={{ height: '36%' }} />
                    </div>
                    <div>
                      <i style={{ height: '58%' }} />
                    </div>
                    <div>
                      <i style={{ height: '72%' }} />
                    </div>
                    <div>
                      <i style={{ height: '44%' }} />
                    </div>
                    <div>
                      <i style={{ height: '88%' }} />
                    </div>
                    <div>
                      <i style={{ height: '52%' }} />
                    </div>
                    <div>
                      <i style={{ height: '66%' }} />
                    </div>
                  </div>

                  <div className="progress-card-link">
                    Ver seguimiento
                    <ChevronRight size={16} />
                  </div>
                </Link>
              </div>
            </article>

            {/* ACCIONES RÁPIDAS */}

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
            {/* ACTIVIDAD RECIENTE */}

            <article className="dashboard-panel-v2 side-panel">
              <div className="panel-head-v2">
                <div>
                  <span className="eyebrow">Actividad reciente</span>
                  <h3>Últimos movimientos</h3>
                </div>
              </div>

              <div className="activity-list-v2">
                {actividades.map((item) => (
                  <Link
                    key={item.titulo}
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
                ))}
              </div>
            </article>

            {/* ESTADO OPERATIVO */}

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
                <div className="fake-donut">
                  <div className="fake-donut-center">
                    <b>25%</b>
                    <span>Avance</span>
                  </div>
                </div>

                <div className="donut-legend">
                  <div>
                    <i className="dot blue" />
                    <span>Avance físico</span>
                    <b>25%</b>
                  </div>

                  <div>
                    <i className="dot soft" />
                    <span>Pendiente</span>
                    <b>75%</b>
                  </div>
                </div>
              </div>
            </Link>

            {/* BASE ADMINISTRATIVA */}

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
                    <b>1 registrado</b>
                  </div>

                  <ChevronRight size={16} />
                </Link>

                <Link href="/cotizaciones" className="mini-metric">
                  <div className="mini-icon">
                    <FileText size={16} />
                  </div>

                  <div>
                    <span>Cotizaciones</span>
                    <b>0 emitidas</b>
                  </div>

                  <ChevronRight size={16} />
                </Link>

                <Link href="/contratistas" className="mini-metric">
                  <div className="mini-icon">
                    <HardHat size={16} />
                  </div>

                  <div>
                    <span>Contratistas</span>
                    <b>0 registrados</b>
                  </div>

                  <ChevronRight size={16} />
                </Link>

                <Link href="/caja" className="mini-metric">
                  <div className="mini-icon">
                    <Landmark size={16} />
                  </div>

                  <div>
                    <span>Caja y bancos</span>
                    <b>Ver disponibilidad</b>
                  </div>

                  <ChevronRight size={16} />
                </Link>
              </div>
            </article>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
