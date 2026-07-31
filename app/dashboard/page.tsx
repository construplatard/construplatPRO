import AppShell from '../../components/AppShell';
import {
  Sparkles,
  BriefcaseBusiness,
  WalletCards,
  ReceiptText,
  CircleDollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
  CheckCircle2,
  NotebookPen,
  FileText,
  HardHat,
  Building2,
  Users,
  Plus,
} from 'lucide-react';

const metricas = [
  {
    titulo: 'Proyectos activos',
    valor: '1',
    detalle: '+1 este mes',
    icono: BriefcaseBusiness,
    tipo: 'positivo',
  },
  {
    titulo: 'Monto contratado',
    valor: 'RD$650,000.00',
    detalle: '+18% vs. mes anterior',
    icono: TrendingUp,
    tipo: 'positivo',
  },
  {
    titulo: 'Cobrado',
    valor: 'RD$0.00',
    detalle: 'Pendiente iniciar cobros',
    icono: WalletCards,
    tipo: 'neutro',
  },
  {
    titulo: 'Gastos',
    valor: 'RD$0.00',
    detalle: 'Sin registros aún',
    icono: ReceiptText,
    tipo: 'neutro',
  },
];

const acciones = [
  {
    titulo: 'Nueva cotización',
    texto: 'Crea una propuesta comercial rápida y profesional.',
    icono: FileText,
  },
  {
    titulo: 'Nueva bitácora',
    texto: 'Registra actividades, avances e incidencias del día.',
    icono: NotebookPen,
  },
  {
    titulo: 'Nuevo contratista',
    texto: 'Agrega suplidores y equipos de trabajo.',
    icono: HardHat,
  },
  {
    titulo: 'Nuevo proyecto',
    texto: 'Inicia una nueva obra y centraliza su control.',
    icono: Building2,
  },
];

const actividades = [
  {
    titulo: 'Proyecto creado',
    detalle: 'Remodelación demostración · Hoy',
    estado: 'Completado',
  },
  {
    titulo: 'Cliente registrado',
    detalle: 'Cliente demostración · Santo Domingo',
    estado: 'Activo',
  },
  {
    titulo: 'Sistema inicializado',
    detalle: 'CONSTRUPLATA listo para comenzar',
    estado: 'Listo',
  },
];

const resumen = [
  { etiqueta: 'Clientes', valor: '1' },
  { etiqueta: 'Cotizaciones', valor: '0' },
  { etiqueta: 'Contratistas', valor: '0' },
  { etiqueta: 'Bitácoras', valor: '0' },
];

export default function DashboardPage() {
  return (
    <AppShell>
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
              financiero en un solo panel visual.
            </p>

            <div className="hero-summary-strip">
              {resumen.map((item) => (
                <div key={item.etiqueta} className="hero-summary-item">
                  <b>{item.valor}</b>
                  <span>{item.etiqueta}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-financial-card">
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
          </div>
        </section>

        <section className="kpi-grid-v2">
          {metricas.map((item) => {
            const Icono = item.icono;

            return (
              <article key={item.titulo} className="kpi-card-v2">
                <div className="kpi-card-top">
                  <div className="kpi-icon-wrap">
                    <Icono size={20} />
                  </div>

                  <span
                    className={
                      item.tipo === 'positivo'
                        ? 'trend-pill positive'
                        : item.tipo === 'negativo'
                        ? 'trend-pill negative'
                        : 'trend-pill neutral'
                    }
                  >
                    {item.tipo === 'positivo' ? (
                      <ArrowUpRight size={15} />
                    ) : item.tipo === 'negativo' ? (
                      <ArrowDownRight size={15} />
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
              </article>
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
                  <p>Seguimiento visual del estado actual de la obra.</p>
                </div>

                <button className="ghost-btn-v2">
                  <Plus size={16} />
                  Nuevo proyecto
                </button>
              </div>

              <div className="project-spotlight">
                <div className="project-spotlight-main">
                  <div className="project-tag">En ejecución</div>
                  <h4>Remodelación demostración</h4>
                  <p>Proyecto piloto de modernización y control operativo.</p>

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
                </div>

                <div className="project-progress-card">
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
                    <div><i style={{ height: '36%' }} /></div>
                    <div><i style={{ height: '58%' }} /></div>
                    <div><i style={{ height: '72%' }} /></div>
                    <div><i style={{ height: '44%' }} /></div>
                    <div><i style={{ height: '88%' }} /></div>
                    <div><i style={{ height: '52%' }} /></div>
                    <div><i style={{ height: '66%' }} /></div>
                  </div>
                </div>
              </div>
            </article>

            <article className="dashboard-panel-v2">
              <div className="panel-head-v2">
                <div>
                  <span className="eyebrow">Acciones rápidas</span>
                  <h3>Lo que puedes hacer hoy</h3>
                  <p>Accesos directos para acelerar tu flujo de trabajo.</p>
                </div>
              </div>

              <div className="quick-actions-grid">
                {acciones.map((accion) => {
                  const Icono = accion.icono;

                  return (
                    <div key={accion.titulo} className="quick-action-card">
                      <div className="quick-action-icon">
                        <Icono size={18} />
                      </div>

                      <div>
                        <h4>{accion.titulo}</h4>
                        <p>{accion.texto}</p>
                      </div>
                    </div>
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
                {actividades.map((item) => (
                  <div key={item.titulo} className="activity-item-v2">
                    <div className="activity-icon">
                      <CheckCircle2 size={17} />
                    </div>

                    <div className="activity-copy">
                      <b>{item.titulo}</b>
                      <span>{item.detalle}</span>
                    </div>

                    <small>{item.estado}</small>
                  </div>
                ))}
              </div>
            </article>

            <article className="dashboard-panel-v2 side-panel">
              <div className="panel-head-v2">
                <div>
                  <span className="eyebrow">Distribución</span>
                  <h3>Estado operativo</h3>
                </div>
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
            </article>

            <article className="dashboard-panel-v2 side-panel">
              <div className="panel-head-v2">
                <div>
                  <span className="eyebrow">Resumen de red</span>
                  <h3>Base administrativa</h3>
                </div>
              </div>

              <div className="mini-metrics-list">
                <div className="mini-metric">
                  <div className="mini-icon"><Users size={16} /></div>
                  <div>
                    <span>Clientes</span>
                    <b>1 registrado</b>
                  </div>
                </div>

                <div className="mini-metric">
                  <div className="mini-icon"><FileText size={16} /></div>
                  <div>
                    <span>Cotizaciones</span>
                    <b>0 emitidas</b>
                  </div>
                </div>

                <div className="mini-metric">
                  <div className="mini-icon"><HardHat size={16} /></div>
                  <div>
                    <span>Contratistas</span>
                    <b>0 registrados</b>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
