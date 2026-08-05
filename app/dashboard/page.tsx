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
  Activity,
  Layers3,
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

const compactMoney = (value: number) =>
  new Intl.NumberFormat('es-DO', {
    notation: 'compact',
    maximumFractionDigits: 1,
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
            total + Number(proyecto.avanceFinanciero || 0),
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
      titulo: 'Nueva cotización',
      texto: 'Crear propuesta',
      href: '/cotizaciones',
      icono: FileText,
    },
    {
      titulo: 'Nueva bitácora',
      texto: 'Registrar avance',
      href: '/bitacoras',
      icono: NotebookPen,
    },
    {
      titulo: 'Registrar cobro',
      texto: 'Actualizar ingreso',
      href: '/cobros',
      icono: WalletCards,
    },
  ];

  return (
    <div className="executive-dashboard">
      <section className="hero">
        <div className="hero-copy">
          <span className="hero-kicker">
            CONSTRUPLATA PRO · PANEL EJECUTIVO
          </span>

          <h2>
            Visión completa de tus proyectos,
            <em> finanzas y avances.</em>
          </h2>

          <p>
            Todo lo importante de la operación en una vista rápida,
            moderna y lista para computadora o teléfono.
          </p>

          <div className="hero-metrics">
            <div>
              <span>Contratado</span>
              <b>{money(contratado)}</b>
            </div>

            <div>
              <span>Pendiente</span>
              <b>{money(balance)}</b>
            </div>

            <div>
              <span>Avance</span>
              <b>{avancePromedio}%</b>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-ring ring-a" />
          <div className="hero-ring ring-b" />
          <div className="hero-result">
            <Activity size={26} />
            <span>Resultado provisional</span>
            <b>{money(resultado)}</b>
          </div>
        </div>

        <Link href="/reportes" className="hero-action">
          Ver reportes
          <ArrowUpRight size={17} />
        </Link>
      </section>

      <section className="kpi-grid">
        <Link href="/proyectos" className="kpi-card">
          <div className="kpi-top">
            <div className="icon-wrap">
              <BriefcaseBusiness size={21} />
            </div>
            <span>Activos</span>
          </div>
          <p>Proyectos activos</p>
          <b>{activos.length}</b>
          <small>{proyectos.length} proyectos totales</small>
        </Link>

        <Link href="/cobros" className="kpi-card">
          <div className="kpi-top">
            <div className="icon-wrap">
              <WalletCards size={21} />
            </div>
            <span>Cobros</span>
          </div>
          <p>Total cobrado</p>
          <b>{money(cobrado)}</b>
          <small>{money(balance)} pendiente</small>
        </Link>

        <Link href="/gastos" className="kpi-card">
          <div className="kpi-top">
            <div className="icon-wrap">
              <ReceiptText size={21} />
            </div>
            <span>Gastos</span>
          </div>
          <p>Total gastado</p>
          <b>{money(gastos)}</b>
          <small>Control de egresos</small>
        </Link>

        <Link href="/reportes" className="kpi-card featured">
          <div className="kpi-top">
            <div className="icon-wrap">
              <CircleDollarSign size={21} />
            </div>
            <span>Balance</span>
          </div>
          <p>Resultado provisional</p>
          <b>{money(resultado)}</b>
          <small>Cobros menos gastos</small>
        </Link>
      </section>

      <section className="charts-layout">
        <article className="panel finance-panel">
          <div className="panel-head">
            <div>
              <span>FINANZAS</span>
              <h3>Panorama financiero</h3>
            </div>
            <BarChart3 size={22} />
          </div>

          <div className="chart-summary">
            <div>
              <span>Total contratado</span>
              <b>{money(contratado)}</b>
            </div>
            <div>
              <span>Disponible</span>
              <b>{money(balance)}</b>
            </div>
          </div>

          <div className="bar-chart">
            {chartItems.map((item) => {
              const height = Math.max(
                10,
                Math.round((item.value / maxChartValue) * 100)
              );

              return (
                <div className="bar-column" key={item.label}>
                  <div className="bar-value">
                    {compactMoney(item.value)}
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

        <article className="panel progress-panel">
          <div className="panel-head">
            <div>
              <span>OPERACIONES</span>
              <h3>Avance promedio</h3>
            </div>
            <TrendingUp size={22} />
          </div>

          <div className="donuts">
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

          <div className="difference-card">
            <span>Diferencia actual</span>
            <b>
              {Math.abs(avancePromedio - financieroPromedio)}%
            </b>
          </div>

          <div className="pulse-line">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        </article>
      </section>

      <section className="bottom-layout">
        <article className="panel projects-panel">
          <div className="panel-head">
            <div>
              <span>PROYECTOS ACTIVOS</span>
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
                  <div className="project-title">
                    <div className="project-icon">
                      <Layers3 size={18} />
                    </div>

                    <div>
                      <b>{proyecto.nombre}</b>
                      <span>
                        {proyecto.numero.replace('COT-', '#')}
                      </span>
                    </div>
                  </div>

                  <div className="project-progress">
                    <div>
                      <span>Avance</span>
                      <b>{proyecto.avance}%</b>
                    </div>

                    <div className="mini-progress">
                      <i
                        style={{
                          width: `${proyecto.avance}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="project-balance">
                    <span>Balance</span>
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
        </article>

        <article className="panel quick-panel">
          <div className="panel-head">
            <div>
              <span>ACCESOS RÁPIDOS</span>
              <h3>Crear y registrar</h3>
            </div>
          </div>

          <div className="quick-list">
            {acciones.map((accion) => {
              const Icon = accion.icono;

              return (
                <Link
                  key={accion.titulo}
                  href={accion.href}
                  className="quick-item"
                >
                  <div className="quick-icon">
                    <Icon size={19} />
                  </div>

                  <div>
                    <b>{accion.titulo}</b>
                    <span>{accion.texto}</span>
                  </div>

                  <ArrowUpRight size={16} />
                </Link>
              );
            })}
          </div>
        </article>
      </section>

      <style jsx>{`
        .executive-dashboard {
          display: grid;
          gap: 18px;
        }

        .hero {
          position: relative;
          overflow: hidden;
          min-height: 250px;
          display: grid;
          grid-template-columns: 1.35fr 0.65fr auto;
          align-items: center;
          gap: 26px;
          padding: 30px 32px;
          border-radius: 28px;
          color: white;
          background:
            radial-gradient(
              circle at 85% 20%,
              rgba(55, 203, 255, 0.35),
              transparent 28%
            ),
            radial-gradient(
              circle at 10% 110%,
              rgba(71, 86, 255, 0.48),
              transparent 42%
            ),
            linear-gradient(
              135deg,
              #031a35 0%,
              #06477e 52%,
              #0c7db7 100%
            );
          box-shadow: 0 28px 70px rgba(4, 54, 100, 0.28);
        }

        .hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(
              rgba(255,255,255,.035) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,.035) 1px,
              transparent 1px
            );
          background-size: 28px 28px;
          mask-image: linear-gradient(to right, #000, transparent 88%);
        }

        .hero-copy,
        .hero-visual,
        .hero-action {
          position: relative;
          z-index: 2;
        }

        .hero-kicker {
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.16em;
          color: #a9dcff;
        }

        .hero h2 {
          max-width: 700px;
          margin: 14px 0 12px;
          font-size: clamp(38px, 4vw, 64px);
          line-height: 0.98;
          letter-spacing: -0.045em;
        }

        .hero h2 em {
          display: block;
          font-style: normal;
          color: #9cd8ff;
        }

        .hero p {
          max-width: 620px;
          margin: 0;
          color: rgba(255,255,255,.75);
          line-height: 1.6;
        }

        .hero-metrics {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 22px;
        }

        .hero-metrics > div {
          min-width: 135px;
          padding: 11px 13px;
          border: 1px solid rgba(255,255,255,.14);
          border-radius: 14px;
          background: rgba(255,255,255,.08);
          backdrop-filter: blur(12px);
        }

        .hero-metrics span,
        .hero-metrics b {
          display: block;
        }

        .hero-metrics span {
          font-size: 10px;
          opacity: .7;
        }

        .hero-metrics b {
          margin-top: 4px;
          font-size: 15px;
        }

        .hero-visual {
          min-height: 180px;
          display: grid;
          place-items: center;
        }

        .hero-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,.14);
        }

        .ring-a {
          width: 180px;
          height: 180px;
        }

        .ring-b {
          width: 130px;
          height: 130px;
        }

        .hero-result {
          width: 145px;
          height: 145px;
          display: grid;
          place-items: center;
          align-content: center;
          gap: 7px;
          border: 1px solid rgba(255,255,255,.16);
          border-radius: 50%;
          background: rgba(255,255,255,.1);
          backdrop-filter: blur(14px);
          text-align: center;
        }

        .hero-result span {
          font-size: 10px;
          opacity: .72;
        }

        .hero-result b {
          font-size: 17px;
          max-width: 120px;
          overflow-wrap: anywhere;
        }

        .hero-action {
          align-self: end;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 11px 13px;
          border-radius: 13px;
          background: rgba(255,255,255,.1);
          color: white;
          font-size: 12px;
          font-weight: 900;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .kpi-card {
          min-width: 0;
          padding: 18px;
          border: 1px solid var(--line);
          border-radius: 20px;
          background: var(--card);
          box-shadow: var(--soft-shadow);
          transition: transform .2s ease, box-shadow .2s ease;
        }

        .kpi-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 36px rgba(23,105,224,.12);
        }

        .kpi-card.featured {
          color: white;
          border-color: transparent;
          background: linear-gradient(135deg, #0a4d98, #1686db);
        }

        .kpi-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .icon-wrap {
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          color: #1769e0;
          background: #eaf4ff;
        }

        .kpi-top > span {
          padding: 6px 9px;
          border-radius: 999px;
          color: #1769e0;
          background: #edf5ff;
          font-size: 10px;
          font-weight: 900;
        }

        .featured .icon-wrap,
        .featured .kpi-top > span {
          color: white;
          background: rgba(255,255,255,.14);
        }

        .kpi-card p {
          margin: 17px 0 5px;
          color: var(--muted);
          font-size: 12px;
        }

        .kpi-card > b {
          display: block;
          color: var(--text);
          font-size: 22px;
          overflow-wrap: anywhere;
        }

        .kpi-card small {
          display: block;
          margin-top: 5px;
          color: var(--muted);
        }

        .featured p,
        .featured small {
          color: rgba(255,255,255,.74);
        }

        .featured > b {
          color: white;
        }

        .charts-layout,
        .bottom-layout {
          display: grid;
          gap: 16px;
        }

        .charts-layout {
          grid-template-columns: 1.25fr .75fr;
        }

        .bottom-layout {
          grid-template-columns: 1.25fr .75fr;
        }

        .panel {
          padding: 21px;
          border: 1px solid var(--line);
          border-radius: 22px;
          background: var(--card);
          box-shadow: var(--soft-shadow);
        }

        .panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .panel-head span {
          color: #1769e0;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .14em;
        }

        .panel-head h3 {
          margin: 5px 0 0;
          color: var(--text);
        }

        .panel-head > a {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #1769e0;
          font-size: 12px;
          font-weight: 900;
        }

        .chart-summary {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-top: 18px;
        }

        .chart-summary > div {
          padding: 13px;
          border-radius: 14px;
          background: var(--surface);
        }

        .chart-summary span,
        .chart-summary b {
          display: block;
        }

        .chart-summary span {
          color: var(--muted);
          font-size: 10px;
        }

        .chart-summary b {
          margin-top: 4px;
          color: var(--text);
        }

        .bar-chart {
          height: 250px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          align-items: end;
          margin-top: 20px;
        }

        .bar-column {
          height: 100%;
          display: grid;
          grid-template-rows: auto 1fr auto;
          gap: 8px;
          text-align: center;
        }

        .bar-value {
          color: var(--muted);
          font-size: 10px;
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
          border-radius: 12px;
          background: linear-gradient(180deg, #27b2ff, #1769e0);
        }

        .bar-column > span {
          color: var(--muted);
          font-size: 11px;
        }

        .donuts {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-top: 22px;
        }

        .difference-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 18px;
          padding: 14px;
          border-radius: 14px;
          background: var(--surface);
          color: var(--muted);
        }

        .difference-card b {
          color: var(--text);
          font-size: 20px;
        }

        .pulse-line {
          height: 60px;
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 7px;
          margin-top: 16px;
        }

        .pulse-line span {
          flex: 1;
          border-radius: 999px;
          background: linear-gradient(180deg, #35c9ff, #1769e0);
        }

        .pulse-line span:nth-child(1) { height: 22%; }
        .pulse-line span:nth-child(2) { height: 55%; }
        .pulse-line span:nth-child(3) { height: 34%; }
        .pulse-line span:nth-child(4) { height: 76%; }
        .pulse-line span:nth-child(5) { height: 48%; }
        .pulse-line span:nth-child(6) { height: 88%; }

        .project-list {
          display: grid;
          gap: 10px;
          margin-top: 16px;
        }

        .project-row {
          display: grid;
          grid-template-columns: 1.1fr .9fr auto;
          align-items: center;
          gap: 14px;
          padding: 14px;
          border: 1px solid var(--line);
          border-radius: 16px;
          background: var(--surface);
        }

        .project-title {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .project-icon {
          flex: 0 0 auto;
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          color: #1769e0;
          background: #eaf4ff;
        }

        .project-title b,
        .project-title span,
        .project-progress span,
        .project-progress b,
        .project-balance span,
        .project-balance b {
          display: block;
        }

        .project-title b {
          color: var(--text);
          font-size: 13px;
        }

        .project-title span,
        .project-progress span,
        .project-balance span {
          margin-top: 3px;
          color: var(--muted);
          font-size: 10px;
        }

        .project-progress > div:first-child {
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }

        .mini-progress {
          height: 7px;
          margin-top: 7px;
          overflow: hidden;
          border-radius: 999px;
          background: var(--line);
        }

        .mini-progress i {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #1769e0, #26a8f2);
        }

        .project-balance {
          text-align: right;
        }

        .project-balance b {
          margin-top: 4px;
          color: var(--text);
        }

        .quick-list {
          display: grid;
          gap: 10px;
          margin-top: 16px;
        }

        .quick-item {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 11px;
          padding: 13px;
          border: 1px solid var(--line);
          border-radius: 15px;
          background: var(--surface);
        }

        .quick-icon {
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          color: #1769e0;
          background: #eaf4ff;
        }

        .quick-item b,
        .quick-item span {
          display: block;
        }

        .quick-item b {
          color: var(--text);
          font-size: 13px;
        }

        .quick-item span {
          margin-top: 3px;
          color: var(--muted);
          font-size: 11px;
        }

        .empty-dashboard {
          padding: 24px;
          color: var(--muted);
          text-align: center;
        }

        :global(html[data-theme='dark']) .kpi-card,
        :global(html[data-theme='dark']) .panel {
          background: #0e1c30;
        }

        :global(html[data-theme='dark']) .project-row,
        :global(html[data-theme='dark']) .quick-item,
        :global(html[data-theme='dark']) .chart-summary > div,
        :global(html[data-theme='dark']) .bar-track,
        :global(html[data-theme='dark']) .difference-card {
          background: #0a1728;
        }

        @media (max-width: 1000px) {
          .hero {
            grid-template-columns: 1fr .55fr;
          }

          .hero-action {
            position: absolute;
            right: 20px;
            bottom: 20px;
          }

          .kpi-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .charts-layout,
          .bottom-layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .executive-dashboard {
            gap: 13px;
          }

          .hero {
            min-height: auto;
            grid-template-columns: 1fr;
            padding: 20px;
            border-radius: 22px;
          }

          .hero h2 {
            font-size: 29px;
          }

          .hero p {
            font-size: 13px;
          }

          .hero-visual {
            min-height: 150px;
          }

          .hero-action {
            position: relative;
            right: auto;
            bottom: auto;
            width: fit-content;
          }

          .hero-metrics {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .hero-metrics > div {
            min-width: 0;
          }

          .hero-metrics > div:last-child {
            grid-column: 1 / -1;
          }

          .kpi-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .kpi-card {
            padding: 14px;
          }

          .kpi-card > b {
            font-size: 17px;
          }

          .panel {
            padding: 16px;
            border-radius: 18px;
          }

          .bar-chart {
            height: 210px;
            gap: 8px;
          }

          .bar-value {
            font-size: 8px;
          }

          .bar-column > span {
            font-size: 9px;
          }

          .project-row {
            grid-template-columns: 1fr;
            align-items: stretch;
          }

          .project-balance {
            text-align: left;
          }

          .donuts {
            gap: 6px;
          }
        }

        @media (max-width: 390px) {
          .kpi-grid {
            grid-template-columns: 1fr;
          }

          .hero-metrics {
            grid-template-columns: 1fr;
          }

          .hero-metrics > div:last-child {
            grid-column: auto;
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
          width: 120px;
          height: 120px;
          display: grid;
          place-items: center;
          border-radius: 50%;
        }

        .donut > div {
          width: 84px;
          height: 84px;
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
          font-weight: 900;
          text-align: center;
        }

        :global(html[data-theme='dark']) .donut > div {
          background: #0e1c30;
        }

        @media (max-width: 700px) {
          .donut {
            width: 98px;
            height: 98px;
          }

          .donut > div {
            width: 69px;
            height: 69px;
          }

          .donut b {
            font-size: 18px;
          }

          .donut-item > span {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
}
