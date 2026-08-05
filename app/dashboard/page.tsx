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

      const avance = bitacoras.length
        ? Number(bitacoras[0].avance || 0)
        : 0;

      const movimientos = data.movimientos.filter(
        (movimiento) =>
          movimiento.proyectoId === id ||
          movimiento.proyectoId === cotizacion.id
      );

      const cobrado = movimientos
        .filter((movimiento) => movimiento.tipo === 'cobro')
        .reduce(
          (total, movimiento) =>
            total + Number(movimiento.monto || 0),
          0
        );

      const gastos = movimientos
        .filter((movimiento) => movimiento.tipo === 'gasto')
        .reduce(
          (total, movimiento) =>
            total + Number(movimiento.monto || 0),
          0
        );

      const monto = Number(
        cotizacion.total ?? cotizacion.monto ?? 0
      );

      const balance = Math.max(monto - cobrado, 0);

      const avanceFinanciero =
        monto > 0
          ? Math.min((cobrado / monto) * 100, 100)
          : 0;

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
          (total, proyecto) =>
            total + Number(proyecto.avance || 0),
          0
        ) / activos.length
      )
    : 0;

  const financieroPromedio = activos.length
    ? Math.round(
        activos.reduce(
          (total, proyecto) =>
            total +
            Number(proyecto.avanceFinanciero || 0),
          0
        ) / activos.length
      )
    : 0;

  const maxChartValue = Math.max(
    contratado,
    cobrado,
    gastos,
    balance,
    1
  );

  const chartItems = [
    { label: 'Contratado', value: contratado },
    { label: 'Cobrado', value: cobrado },
    { label: 'Gastos', value: gastos },
    { label: 'Pendiente', value: balance },
  ];

  const acciones = [
    {
      titulo: 'Cotización',
      texto: 'Crear propuesta',
      href: '/cotizaciones',
      icono: FileText,
    },
    {
      titulo: 'Bitácora',
      texto: 'Registrar avance',
      href: '/bitacoras',
      icono: NotebookPen,
    },
    {
      titulo: 'Cobro',
      texto: 'Registrar ingreso',
      href: '/cobros',
      icono: WalletCards,
    },
  ];

  return (
    <div className="mobile-dashboard">
      <section className="hero-card">
        <div className="hero-copy">
          <span>CONSTRUPLATA PRO</span>
          <h2>Resumen general de tus obras</h2>
          <p>
            Datos financieros y avance de proyectos en una sola vista.
          </p>
        </div>

        <div className="hero-result">
          <TrendingUp size={24} />
          <div>
            <span>Resultado</span>
            <b>{money(resultado)}</b>
          </div>
        </div>

        <Link href="/reportes" className="hero-link">
          Ver reportes
          <ArrowUpRight size={16} />
        </Link>
      </section>

      <section className="kpi-grid">
        <Link href="/proyectos" className="kpi-card">
          <div className="kpi-icon">
            <BriefcaseBusiness size={20} />
          </div>
          <span>Proyectos activos</span>
          <b>{activos.length}</b>
          <small>{proyectos.length} totales</small>
        </Link>

        <Link href="/cobros" className="kpi-card">
          <div className="kpi-icon">
            <WalletCards size={20} />
          </div>
          <span>Total cobrado</span>
          <b>{money(cobrado)}</b>
          <small>{money(balance)} pendiente</small>
        </Link>

        <Link href="/gastos" className="kpi-card">
          <div className="kpi-icon">
            <ReceiptText size={20} />
          </div>
          <span>Total gastado</span>
          <b>{money(gastos)}</b>
          <small>Egresos acumulados</small>
        </Link>

        <Link href="/reportes" className="kpi-card featured">
          <div className="kpi-icon">
            <CircleDollarSign size={20} />
          </div>
          <span>Resultado provisional</span>
          <b>{money(resultado)}</b>
          <small>Cobros menos gastos</small>
        </Link>
      </section>

      <section className="quick-section">
        <div className="section-title">
          <div>
            <span>Acciones rápidas</span>
            <h3>Registrar</h3>
          </div>
        </div>

        <div className="quick-grid">
          {acciones.map((accion) => {
            const Icon = accion.icono;

            return (
              <Link
                key={accion.titulo}
                href={accion.href}
                className="quick-item"
              >
                <div>
                  <Icon size={18} />
                </div>
                <span>
                  <b>{accion.titulo}</b>
                  <small>{accion.texto}</small>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="charts-grid">
        <article className="card">
          <div className="card-head">
            <div>
              <span>Finanzas</span>
              <h3>Panorama financiero</h3>
            </div>
            <BarChart3 size={20} />
          </div>

          <div className="bar-chart">
            {chartItems.map((item) => {
              const height = Math.max(
                8,
                Math.round(
                  (item.value / maxChartValue) * 100
                )
              );

              return (
                <div className="bar-column" key={item.label}>
                  <div className="bar-value">
                    {money(item.value)}
                  </div>

                  <div className="bar-track">
                    <i style={{ height: `${height}%` }} />
                  </div>

                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </article>

        <article className="card">
          <div className="card-head">
            <div>
              <span>Operaciones</span>
              <h3>Avance promedio</h3>
            </div>
            <TrendingUp size={20} />
          </div>

          <div className="donut-row">
            <ProgressDonut
              value={avancePromedio}
              label="Físico"
              className="physical"
            />

            <ProgressDonut
              value={financieroPromedio}
              label="Financiero"
              className="financial"
            />
          </div>

          <div className="difference">
            <span>Diferencia actual</span>
            <b>
              {Math.abs(
                avancePromedio - financieroPromedio
              )}
              %
            </b>
          </div>
        </article>
      </section>

      <section className="projects-card">
        <div className="section-title">
          <div>
            <span>Proyectos activos</span>
            <h3>Seguimiento rápido</h3>
          </div>

          <Link href="/proyectos">
            Ver todos
            <ArrowUpRight size={15} />
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
                <div className="project-top">
                  <div>
                    <b>{proyecto.nombre}</b>
                    <span>
                      {proyecto.numero.replace('COT-', '#')}
                    </span>
                  </div>

                  <strong>{proyecto.avance}%</strong>
                </div>

                <div className="mini-progress">
                  <i
                    style={{
                      width: `${proyecto.avance}%`,
                    }}
                  />
                </div>

                <div className="project-bottom">
                  <span>Balance pendiente</span>
                  <b>{money(proyecto.balance)}</b>
                </div>
              </Link>
            ))
          ) : (
            <div className="empty-dashboard">
              No hay proyectos activos.
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        .mobile-dashboard {
          display: grid;
          gap: 16px;
        }

        .hero-card {
          position: relative;
          overflow: hidden;
          min-height: 210px;
          padding: 24px;
          border-radius: 25px;
          color: white;
          background:
            radial-gradient(
              circle at 80% 18%,
              rgba(0, 212, 255, 0.3),
              transparent 26%
            ),
            linear-gradient(
              135deg,
              #041c3a,
              #075291 60%,
              #0a7dc0
            );
          box-shadow: 0 20px 45px
            rgba(4, 54, 100, 0.24);
        }

        .hero-card::after {
          content: '';
          position: absolute;
          width: 190px;
          height: 190px;
          right: -80px;
          bottom: -110px;
          border: 30px solid
            rgba(255, 255, 255, 0.06);
          border-radius: 50%;
        }

        .hero-copy {
          position: relative;
          z-index: 2;
          max-width: 580px;
        }

        .hero-copy > span,
        .section-title span,
        .card-head span {
          color: #1769e0;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .hero-copy > span {
          color: #9ed6ff;
        }

        .hero-copy h2 {
          max-width: 620px;
          margin: 8px 0 8px;
          font-size: 31px;
          line-height: 1.06;
        }

        .hero-copy p {
          max-width: 540px;
          margin: 0;
          color: rgba(255, 255, 255, 0.76);
          line-height: 1.5;
        }

        .hero-result {
          position: relative;
          z-index: 2;
          width: fit-content;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 20px;
          padding: 12px 14px;
          border: 1px solid
            rgba(255, 255, 255, 0.14);
          border-radius: 15px;
          background:
            rgba(255, 255, 255, 0.09);
        }

        .hero-result span,
        .hero-result b {
          display: block;
        }

        .hero-result span {
          font-size: 11px;
          opacity: 0.72;
        }

        .hero-result b {
          margin-top: 2px;
          font-size: 18px;
        }

        .hero-link {
          position: absolute;
          z-index: 3;
          right: 20px;
          bottom: 20px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 12px;
          border-radius: 12px;
          color: white;
          background: rgba(
            255,
            255,
            255,
            0.11
          );
          font-size: 12px;
          font-weight: 800;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .kpi-card {
          min-width: 0;
          padding: 17px;
          border: 1px solid var(--line);
          border-radius: 18px;
          background: var(--card);
          box-shadow: var(--soft-shadow);
        }

        .kpi-card.featured {
          color: white;
          border-color: transparent;
          background: linear-gradient(
            135deg,
            #0d4f98,
            #187fd3
          );
        }

        .kpi-icon {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          margin-bottom: 14px;
          border-radius: 12px;
          color: #1769e0;
          background: #edf5ff;
        }

        .featured .kpi-icon {
          color: white;
          background: rgba(
            255,
            255,
            255,
            0.14
          );
        }

        .kpi-card > span,
        .kpi-card > b,
        .kpi-card > small {
          display: block;
        }

        .kpi-card > span {
          color: var(--muted);
          font-size: 12px;
        }

        .featured > span,
        .featured > small {
          color: rgba(
            255,
            255,
            255,
            0.74
          );
        }

        .kpi-card > b {
          margin-top: 7px;
          color: var(--text);
          font-size: 23px;
          overflow-wrap: anywhere;
        }

        .featured > b {
          color: white;
        }

        .kpi-card > small {
          margin-top: 5px;
          color: var(--muted);
          line-height: 1.35;
        }

        .quick-section,
        .card,
        .projects-card {
          padding: 20px;
          border: 1px solid var(--line);
          border-radius: 20px;
          background: var(--card);
          box-shadow: var(--soft-shadow);
        }

        .section-title,
        .card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .section-title h3,
        .card-head h3 {
          margin: 5px 0 0;
          color: var(--text);
        }

        .section-title > a {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #1769e0;
          font-size: 12px;
          font-weight: 800;
        }

        .quick-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin-top: 16px;
        }

        .quick-item {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          padding: 13px;
          border: 1px solid var(--line);
          border-radius: 14px;
          background: var(--surface);
        }

        .quick-item > div {
          flex: 0 0 auto;
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          color: #1769e0;
          background: #e9f3ff;
        }

        .quick-item span,
        .quick-item b,
        .quick-item small {
          display: block;
          min-width: 0;
        }

        .quick-item b {
          color: var(--text);
          font-size: 13px;
        }

        .quick-item small {
          margin-top: 3px;
          color: var(--muted);
          font-size: 11px;
        }

        .charts-grid {
          display: grid;
          grid-template-columns:
            1.2fr 0.8fr;
          gap: 16px;
        }

        .bar-chart {
          height: 260px;
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          gap: 14px;
          align-items: end;
          margin-top: 22px;
        }

        .bar-column {
          height: 100%;
          min-width: 0;
          display: grid;
          grid-template-rows:
            auto 1fr auto;
          gap: 8px;
          text-align: center;
        }

        .bar-value {
          color: var(--muted);
          font-size: 10px;
          overflow-wrap: anywhere;
        }

        .bar-track {
          position: relative;
          overflow: hidden;
          border-radius: 12px;
          background: var(--surface);
        }

        .bar-track i {
          position: absolute;
          inset: auto 0 0;
          display: block;
          border-radius: 12px;
          background: linear-gradient(
            180deg,
            #26a8f2,
            #1769e0
          );
        }

        .bar-column > span {
          color: var(--muted);
          font-size: 11px;
        }

        .donut-row {
          display: grid;
          grid-template-columns:
            repeat(2, 1fr);
          gap: 14px;
          margin-top: 24px;
        }

        .difference {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: 18px;
          padding: 14px;
          border-radius: 14px;
          background: var(--surface);
          color: var(--muted);
        }

        .difference b {
          color: var(--text);
          font-size: 20px;
        }

        .project-list {
          display: grid;
          gap: 10px;
          margin-top: 16px;
        }

        .project-row {
          display: grid;
          gap: 10px;
          padding: 14px;
          border: 1px solid var(--line);
          border-radius: 15px;
          background: var(--surface);
        }

        .project-top,
        .project-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .project-top b,
        .project-top span {
          display: block;
        }

        .project-top b {
          color: var(--text);
          font-size: 13px;
        }

        .project-top span,
        .project-bottom span {
          margin-top: 3px;
          color: var(--muted);
          font-size: 11px;
        }

        .project-top strong {
          color: #1769e0;
          font-size: 18px;
        }

        .mini-progress {
          height: 7px;
          overflow: hidden;
          border-radius: 999px;
          background: var(--line);
        }

        .mini-progress i {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(
            90deg,
            #1769e0,
            #24a1ee
          );
        }

        .project-bottom b {
          color: var(--text);
        }

        .empty-dashboard {
          padding: 26px;
          color: var(--muted);
          text-align: center;
        }

        :global(html[data-theme='dark']) .kpi-card,
        :global(html[data-theme='dark']) .quick-section,
        :global(html[data-theme='dark']) .card,
        :global(html[data-theme='dark']) .projects-card {
          background: #0e1c30;
        }

        :global(html[data-theme='dark']) .quick-item,
        :global(html[data-theme='dark']) .project-row,
        :global(html[data-theme='dark']) .bar-track,
        :global(html[data-theme='dark']) .difference {
          background: #0a1728;
        }

        @media (max-width: 900px) {
          .mobile-dashboard {
            gap: 13px;
          }

          .hero-card {
            min-height: auto;
            padding: 20px;
          }

          .hero-copy h2 {
            max-width: 260px;
            font-size: 26px;
          }

          .hero-copy p {
            max-width: 260px;
            font-size: 13px;
          }

          .hero-result {
            margin-top: 18px;
          }

          .hero-link {
            right: 16px;
            bottom: 16px;
          }

          .kpi-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .kpi-card {
            padding: 14px;
          }

          .kpi-card > b {
            font-size: 18px;
          }

          .quick-grid {
            grid-template-columns: 1fr;
          }

          .charts-grid {
            grid-template-columns: 1fr;
          }

          .bar-chart {
            height: 220px;
          }
        }

        @media (max-width: 560px) {
          .hero-card {
            border-radius: 20px;
          }

          .hero-result {
            width: calc(100% - 120px);
          }

          .hero-result b {
            font-size: 15px;
          }

          .hero-link {
            padding: 9px 10px;
            font-size: 11px;
          }

          .kpi-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .kpi-icon {
            width: 34px;
            height: 34px;
            margin-bottom: 10px;
          }

          .kpi-card > span {
            font-size: 11px;
          }

          .kpi-card > b {
            font-size: 16px;
          }

          .kpi-card > small {
            font-size: 10px;
          }

          .quick-section,
          .card,
          .projects-card {
            padding: 16px;
            border-radius: 18px;
          }

          .bar-chart {
            gap: 8px;
          }

          .bar-value {
            font-size: 8px;
          }

          .bar-column > span {
            font-size: 9px;
          }

          .donut-row {
            gap: 8px;
          }

          .project-bottom {
            align-items: flex-start;
            flex-direction: column;
            gap: 3px;
          }
        }

        @media (max-width: 380px) {
          .kpi-grid {
            grid-template-columns: 1fr;
          }

          .hero-result {
            width: 100%;
            box-sizing: border-box;
          }

          .hero-link {
            position: relative;
            right: auto;
            bottom: auto;
            width: fit-content;
            margin-top: 12px;
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
  const safeValue = Math.max(0, Math.min(value, 100));

  return (
    <div className={`donut-item ${className}`}>
      <div
        className="donut"
        style={{
          background: `conic-gradient(var(--donut-color) ${
            safeValue * 3.6
          }deg, var(--line) 0deg)`,
        }}
      >
        <div>
          <b>{safeValue}%</b>
        </div>
      </div>

      <span>{label}</span>

      <style jsx>{`
        .donut-item {
          display: grid;
          justify-items: center;
          gap: 9px;
          --donut-color: #1769e0;
        }

        .donut-item.financial {
          --donut-color: #20a6a0;
        }

        .donut {
          width: 118px;
          height: 118px;
          display: grid;
          place-items: center;
          border-radius: 50%;
        }

        .donut > div {
          width: 82px;
          height: 82px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: var(--card);
        }

        .donut b {
          color: var(--text);
          font-size: 22px;
        }

        .donut-item > span {
          color: var(--muted);
          font-size: 12px;
          font-weight: 800;
        }

        :global(html[data-theme='dark']) .donut > div {
          background: #0e1c30;
        }

        @media (max-width: 560px) {
          .donut {
            width: 96px;
            height: 96px;
          }

          .donut > div {
            width: 68px;
            height: 68px;
          }

          .donut b {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  );
}
