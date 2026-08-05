'use client';

import Link from 'next/link';
import AppShell from '../../components/AppShell';
import { useData } from '../../components/DataProvider';
import {
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  CircleDollarSign,
  FileText,
  NotebookPen,
  ReceiptText,
  TrendingUp,
  WalletCards,
} from 'lucide-react';

type Cotizacion = {
  id: string;
  numero: string;
  clienteId: string;
  proyecto: string;
  monto: number;
  estado: string;
  total?: number;
};

const money = (value: number) =>
  new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    maximumFractionDigits: 0,
  }).format(value);

const normalizar = (value: string | undefined) =>
  String(value || '').trim().toLowerCase();

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardContent />
    </AppShell>
  );
}

function DashboardContent() {
  const { data } = useData();

  const cotizaciones = data.cotizaciones as Cotizacion[];

  const proyectos = cotizaciones
    .filter((cotizacion) => normalizar(cotizacion.estado) === 'aprobada')
    .map((cotizacion) => {
      const id = `pro-${cotizacion.id}`;

      const bitacoras = data.bitacoras
        .filter(
          (bitacora) =>
            bitacora.proyectoId === id ||
            bitacora.proyectoId === cotizacion.id
        )
        .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));

      const avance = bitacoras.length ? Number(bitacoras[0].avance || 0) : 0;

      const movimientos = data.movimientos.filter(
        (movimiento) =>
          movimiento.proyectoId === id ||
          movimiento.proyectoId === cotizacion.id
      );

      const cobrado = movimientos
        .filter((movimiento) => movimiento.tipo === 'cobro')
        .reduce(
          (total, movimiento) => total + Number(movimiento.monto || 0),
          0
        );

      const gastos = movimientos
        .filter((movimiento) => movimiento.tipo === 'gasto')
        .reduce(
          (total, movimiento) => total + Number(movimiento.monto || 0),
          0
        );

      const monto = Number(cotizacion.total ?? cotizacion.monto ?? 0);
      const balance = Math.max(monto - cobrado, 0);
      const avanceFinanciero =
        monto > 0 ? Math.min((cobrado / monto) * 100, 100) : 0;

      return {
        id,
        nombre: cotizacion.proyecto,
        numero: cotizacion.numero,
        monto,
        avance,
        cobrado,
        gastos,
        balance,
        avanceFinanciero,
        activo: !(avance >= 100 && balance <= 0),
      };
    });

  const activos = proyectos.filter((proyecto) => proyecto.activo);

  const contratado = proyectos.reduce(
    (total, proyecto) => total + proyecto.monto,
    0
  );

  const cobrado = proyectos.reduce(
    (total, proyecto) => total + proyecto.cobrado,
    0
  );

  const gastos = proyectos.reduce(
    (total, proyecto) => total + proyecto.gastos,
    0
  );

  const resultado = cobrado - gastos;
  const balance = Math.max(contratado - cobrado, 0);

  const avancePromedio = activos.length
    ? Math.round(
        activos.reduce(
          (total, proyecto) => total + Number(proyecto.avance || 0),
          0
        ) / activos.length
      )
    : 0;

  const financieroPromedio = activos.length
    ? Math.round(
        activos.reduce(
          (total, proyecto) =>
            total + Number(proyecto.avanceFinanciero || 0),
          0
        ) / activos.length
      )
    : 0;

  const maxChartValue = Math.max(contratado, cobrado, gastos, balance, 1);

  const chartItems = [
    { label: 'Contratado', value: contratado },
    { label: 'Cobrado', value: cobrado },
    { label: 'Gastos', value: gastos },
    { label: 'Pendiente', value: balance },
  ];

  const acciones = [
    {
      titulo: 'Nueva cotización',
      texto: 'Crear una propuesta comercial',
      href: '/cotizaciones',
      icono: FileText,
    },
    {
      titulo: 'Nueva bitácora',
      texto: 'Registrar avance del proyecto',
      href: '/bitacoras',
      icono: NotebookPen,
    },
    {
      titulo: 'Registrar cobro',
      texto: 'Actualizar ingresos y balances',
      href: '/cobros',
      icono: WalletCards,
    },
  ];

  return (
    <div className="clean-dashboard">
      <section className="welcome-card">
        <div>
          <span className="welcome-kicker">Panel ejecutivo</span>
          <h2>Resumen general de CONSTRUPLATA</h2>
          <p>
            Una vista simple de los proyectos, cobros, gastos y avances más
            importantes.
          </p>
        </div>

        <Link href="/reportes" className="welcome-action">
          Ver reportes
          <ArrowUpRight size={17} />
        </Link>
      </section>

      <section className="dashboard-kpis">
        <Link href="/proyectos" className="dashboard-kpi">
          <div className="kpi-icon">
            <BriefcaseBusiness size={20} />
          </div>
          <span>Proyectos activos</span>
          <b>{activos.length}</b>
          <small>{proyectos.length} proyectos totales</small>
        </Link>

        <Link href="/cobros" className="dashboard-kpi">
          <div className="kpi-icon">
            <WalletCards size={20} />
          </div>
          <span>Total cobrado</span>
          <b>{money(cobrado)}</b>
          <small>{money(balance)} pendiente</small>
        </Link>

        <Link href="/gastos" className="dashboard-kpi">
          <div className="kpi-icon">
            <ReceiptText size={20} />
          </div>
          <span>Total gastado</span>
          <b>{money(gastos)}</b>
          <small>Gastos acumulados</small>
        </Link>

        <Link href="/reportes" className="dashboard-kpi featured">
          <div className="kpi-icon">
            <CircleDollarSign size={20} />
          </div>
          <span>Resultado provisional</span>
          <b>{money(resultado)}</b>
          <small>Cobros menos gastos</small>
        </Link>
      </section>

      <section className="dashboard-charts">
        <article className="chart-card finance-chart-card">
          <div className="chart-head">
            <div>
              <span className="eyebrow">Finanzas</span>
              <h3>Panorama financiero</h3>
            </div>

            <BarChart3 size={21} />
          </div>

          <div className="bar-chart">
            {chartItems.map((item) => {
              const height = Math.max(
                8,
                Math.round((item.value / maxChartValue) * 100)
              );

              return (
                <div className="bar-column" key={item.label}>
                  <div className="bar-value">{money(item.value)}</div>

                  <div className="bar-track">
                    <i style={{ height: `${height}%` }} />
                  </div>

                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </article>

        <article className="chart-card progress-chart-card">
          <div className="chart-head">
            <div>
              <span className="eyebrow">Operaciones</span>
              <h3>Avance promedio</h3>
            </div>

            <TrendingUp size={21} />
          </div>

          <div className="donut-row">
            <ProgressDonut
              value={avancePromedio}
              label="Avance físico"
              className="physical"
            />

            <ProgressDonut
              value={financieroPromedio}
              label="Avance financiero"
              className="financial"
            />
          </div>

          <div className="progress-note">
            <span>
              Diferencia actual
              <b>{Math.abs(avancePromedio - financieroPromedio)}%</b>
            </span>

            <p>
              Compara el avance registrado en Bitácoras con el porcentaje
              cobrado de los proyectos activos.
            </p>
          </div>
        </article>
      </section>

      <section className="dashboard-bottom">
        <article className="projects-summary-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Proyectos activos</span>
              <h3>Seguimiento rápido</h3>
            </div>

            <Link href="/proyectos">
              Ver todos
              <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="project-list">
            {activos.length ? (
              activos.slice(0, 4).map((proyecto) => (
                <Link
                  href="/proyectos"
                  className="project-row"
                  key={proyecto.id}
                >
                  <div className="project-name">
                    <b>{proyecto.nombre}</b>
                    <span>{proyecto.numero.replace('COT-', '#')}</span>
                  </div>

                  <div className="project-progress">
                    <div>
                      <span>Físico</span>
                      <b>{proyecto.avance}%</b>
                    </div>
                    <div className="mini-progress">
                      <i style={{ width: `${proyecto.avance}%` }} />
                    </div>
                  </div>

                  <div className="project-balance">
                    <span>Balance</span>
                    <b>{money(proyecto.balance)}</b>
                  </div>
                </Link>
              ))
            ) : (
              <div className="empty-dashboard">No hay proyectos activos.</div>
            )}
          </div>
        </article>

        <article className="quick-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Acciones rápidas</span>
              <h3>Crear y registrar</h3>
            </div>
          </div>

          <div className="quick-list">
            {acciones.map((accion) => {
              const Icono = accion.icono;

              return (
                <Link
                  href={accion.href}
                  className="quick-item"
                  key={accion.titulo}
                >
                  <div>
                    <Icono size={18} />
                  </div>

                  <span>
                    <b>{accion.titulo}</b>
                    <small>{accion.texto}</small>
                  </span>

                  <ArrowUpRight size={17} />
                </Link>
              );
            })}
          </div>
        </article>
      </section>

      <style jsx>{`
        .clean-dashboard {
          display: grid;
          gap: 20px;
        }

        .welcome-card {
          min-height: 150px;
          padding: 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          overflow: hidden;
          position: relative;
          border-radius: 26px;
          color: #fff;
          background:
            radial-gradient(
              circle at 85% 20%,
              rgba(63, 190, 255, 0.35),
              transparent 34%
            ),
            linear-gradient(135deg, #062a56, #07579b 58%, #1189ce);
          box-shadow: 0 24px 60px rgba(4, 54, 100, 0.2);
        }

        .welcome-card::after {
          content: '';
          width: 220px;
          height: 220px;
          position: absolute;
          right: -70px;
          bottom: -125px;
          border: 34px solid rgba(255, 255, 255, 0.08);
          border-radius: 50%;
        }

        .welcome-kicker {
          display: inline-block;
          margin-bottom: 10px;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.11em;
          text-transform: uppercase;
          opacity: 0.78;
        }

        .welcome-card h2 {
          max-width: 700px;
          margin: 0;
          font-size: clamp(25px, 3vw, 39px);
          line-height: 1.08;
        }

        .welcome-card p {
          max-width: 680px;
          margin: 12px 0 0;
          line-height: 1.55;
          opacity: 0.8;
        }

        .welcome-action {
          min-width: 145px;
          height: 48px;
          padding: 0 17px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          position: relative;
          z-index: 2;
          border: 1px solid rgba(255, 255, 255, 0.24);
          border-radius: 14px;
          color: #fff;
          background: rgba(255, 255, 255, 0.12);
          font-weight: 900;
          backdrop-filter: blur(12px);
        }

        .dashboard-kpis {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        .dashboard-kpi {
          min-width: 0;
          padding: 19px;
          display: block;
          position: relative;
          border: 1px solid var(--line);
          border-radius: 20px;
          color: var(--text);
          background: var(--card);
          box-shadow: var(--soft-shadow);
        }

        .dashboard-kpi.featured {
          color: #fff;
          border-color: transparent;
          background: linear-gradient(135deg, #1769e0, #168edc);
        }

        .kpi-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          margin-bottom: 18px;
          border-radius: 13px;
          color: var(--blue);
          background: rgba(23, 105, 224, 0.1);
        }

        .featured .kpi-icon {
          color: #fff;
          background: rgba(255, 255, 255, 0.16);
        }

        .dashboard-kpi span,
        .dashboard-kpi b,
        .dashboard-kpi small {
          display: block;
        }

        .dashboard-kpi span {
          color: var(--muted);
          font-size: 11px;
          font-weight: 800;
        }

        .dashboard-kpi b {
          margin-top: 7px;
          overflow: hidden;
          font-size: clamp(18px, 2vw, 25px);
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dashboard-kpi small {
          margin-top: 8px;
          color: var(--muted);
          font-size: 10px;
        }

        .featured span,
        .featured small {
          color: rgba(255, 255, 255, 0.75);
        }

        .dashboard-charts {
          display: grid;
          grid-template-columns: 1.35fr 0.85fr;
          gap: 18px;
        }

        .chart-card,
        .projects-summary-card,
        .quick-card {
          padding: 22px;
          border: 1px solid var(--line);
          border-radius: 22px;
          background: var(--card);
          box-shadow: var(--soft-shadow);
        }

        .chart-head,
        .section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .chart-head > svg {
          color: var(--blue);
        }

        .chart-head h3,
        .section-head h3 {
          margin: 6px 0 0;
          font-size: 19px;
        }

        .bar-chart {
          height: 265px;
          margin-top: 24px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          align-items: end;
        }

        .bar-column {
          min-width: 0;
          height: 100%;
          display: grid;
          grid-template-rows: 30px 1fr 22px;
          gap: 8px;
          text-align: center;
        }

        .bar-value {
          overflow: hidden;
          color: var(--text);
          font-size: 10px;
          font-weight: 900;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .bar-track {
          min-height: 150px;
          display: flex;
          align-items: end;
          overflow: hidden;
          border-radius: 14px 14px 8px 8px;
          background:
            repeating-linear-gradient(
              to top,
              rgba(23, 105, 224, 0.055) 0,
              rgba(23, 105, 224, 0.055) 1px,
              transparent 1px,
              transparent 25%
            );
        }

        .bar-track i {
          width: 100%;
          min-height: 8px;
          display: block;
          border-radius: 13px 13px 6px 6px;
          background: linear-gradient(180deg, #22b2e6, #1769e0);
        }

        .bar-column:nth-child(3) .bar-track i {
          background: linear-gradient(180deg, #ffb84e, #ee7f2d);
        }

        .bar-column:nth-child(4) .bar-track i {
          background: linear-gradient(180deg, #8f9db0, #64748b);
        }

        .bar-column > span {
          color: var(--muted);
          font-size: 10px;
          font-weight: 800;
        }

        .donut-row {
          min-height: 220px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          align-items: center;
        }

        .progress-note {
          padding: 15px;
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 16px;
          align-items: center;
          border-radius: 15px;
          background: rgba(23, 105, 224, 0.06);
        }

        .progress-note span,
        .progress-note b {
          display: block;
        }

        .progress-note span {
          color: var(--muted);
          font-size: 10px;
        }

        .progress-note b {
          margin-top: 4px;
          color: var(--blue);
          font-size: 22px;
        }

        .progress-note p {
          margin: 0;
          color: var(--muted);
          font-size: 11px;
          line-height: 1.55;
        }

        .dashboard-bottom {
          display: grid;
          grid-template-columns: 1.35fr 0.65fr;
          gap: 18px;
        }

        .section-head a {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--blue);
          font-size: 11px;
          font-weight: 900;
        }

        .project-list,
        .quick-list {
          display: grid;
          gap: 9px;
          margin-top: 18px;
        }

        .project-row {
          padding: 14px;
          display: grid;
          grid-template-columns: 1.2fr 1fr auto;
          gap: 16px;
          align-items: center;
          border: 1px solid var(--line);
          border-radius: 14px;
          color: var(--text);
          background: rgba(23, 105, 224, 0.025);
        }

        .project-name b,
        .project-name span,
        .project-balance span,
        .project-balance b {
          display: block;
        }

        .project-name span,
        .project-balance span {
          margin-top: 4px;
          color: var(--muted);
          font-size: 9px;
        }

        .project-progress > div:first-child {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 6px;
          font-size: 10px;
        }

        .project-progress span {
          color: var(--muted);
        }

        .mini-progress {
          height: 7px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(23, 105, 224, 0.1);
        }

        .mini-progress i {
          height: 100%;
          display: block;
          border-radius: inherit;
          background: linear-gradient(90deg, #1769e0, #22b2e6);
        }

        .project-balance {
          min-width: 115px;
          text-align: right;
        }

        .quick-item {
          min-height: 72px;
          padding: 13px;
          display: grid;
          grid-template-columns: 42px 1fr auto;
          gap: 12px;
          align-items: center;
          border: 1px solid var(--line);
          border-radius: 14px;
          color: var(--text);
          background: rgba(23, 105, 224, 0.025);
        }

        .quick-item > div {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          color: var(--blue);
          background: rgba(23, 105, 224, 0.1);
        }

        .quick-item span,
        .quick-item b,
        .quick-item small {
          display: block;
        }

        .quick-item small {
          margin-top: 4px;
          color: var(--muted);
          font-size: 9px;
        }

        .quick-item > svg {
          color: var(--blue);
        }

        .empty-dashboard {
          padding: 30px;
          text-align: center;
          color: var(--muted);
          border: 1px dashed var(--line);
          border-radius: 14px;
        }

        @media (max-width: 1050px) {
          .dashboard-kpis {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .dashboard-charts,
          .dashboard-bottom {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .welcome-card {
            align-items: stretch;
            flex-direction: column;
          }

          .welcome-action {
            align-self: flex-start;
          }

          .dashboard-kpis {
            grid-template-columns: 1fr;
          }

          .project-row {
            grid-template-columns: 1fr;
          }

          .project-balance {
            text-align: left;
          }

          .donut-row {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 480px) {
          .bar-chart {
            gap: 8px;
          }

          .donut-row,
          .progress-note {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

function ProgressDonut({
  value,
  label,
  className,
}: {
  value: number;
  label: string;
  className: string;
}) {
  const safeValue = Math.min(Math.max(Number(value || 0), 0), 100);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeValue / 100) * circumference;

  return (
    <div className={`donut-widget ${className}`}>
      <svg viewBox="0 0 110 110" aria-label={`${label}: ${safeValue}%`}>
        <circle className="donut-bg" cx="55" cy="55" r={radius} />
        <circle
          className="donut-progress"
          cx="55"
          cy="55"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>

      <div className="donut-center">
        <b>{safeValue}%</b>
        <span>{label}</span>
      </div>

      <style jsx>{`
        .donut-widget {
          width: min(170px, 100%);
          aspect-ratio: 1;
          position: relative;
          justify-self: center;
        }

        svg {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }

        circle {
          fill: none;
          stroke-width: 10;
        }

        .donut-bg {
          stroke: rgba(23, 105, 224, 0.1);
        }

        .donut-progress {
          stroke: #1769e0;
          stroke-linecap: round;
        }

        .financial .donut-progress {
          stroke: #16a271;
        }

        .financial .donut-bg {
          stroke: rgba(22, 162, 113, 0.1);
        }

        .donut-center {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          align-content: center;
          text-align: center;
          pointer-events: none;
        }

        .donut-center b,
        .donut-center span {
          display: block;
        }

        .donut-center b {
          font-size: clamp(23px, 3vw, 32px);
        }

        .donut-center span {
          max-width: 80px;
          margin-top: 4px;
          color: var(--muted);
          font-size: 9px;
          line-height: 1.3;
        }
      `}</style>
    </div>
  );
}
