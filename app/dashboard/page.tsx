'use client';

import Link from 'next/link';
import AppShell from '../../components/AppShell';
import { useData } from '../../components/DataProvider';
import {
  Activity,
  ArrowUpRight,
  BadgeDollarSign,
  BarChart3,
  BriefcaseBusiness,
  CalendarRange,
  CircleDollarSign,
  FileText,
  NotebookPen,
  ReceiptText,
  Sparkles,
  TrendingUp,
  WalletCards,
} from 'lucide-react';

type Cotizacion = {
  id: string;
  numero: string;
  clienteId: string;
  proyecto: string;
  monto: number;
  total?: number;
  estado: string;
};

const money = (value: number) =>
  new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    maximumFractionDigits: 0,
  }).format(value || 0);

const compactMoney = (value: number) =>
  new Intl.NumberFormat('es-DO', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value || 0);

const normalizar = (value?: string) => String(value || '').trim().toLowerCase();

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardContent />
    </AppShell>
  );
}

function DashboardContent() {
  const { data } = useData();

  const cotizaciones = (data.cotizaciones || []) as Cotizacion[];

  const proyectos = cotizaciones
    .filter((cotizacion) => normalizar(cotizacion.estado) === 'aprobada')
    .map((cotizacion) => {
      const proyectoId = `pro-${cotizacion.id}`;

      const bitacoras = (data.bitacoras || [])
        .filter(
          (bitacora) =>
            bitacora.proyectoId === proyectoId ||
            bitacora.proyectoId === cotizacion.id,
        )
        .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));

      const movimientos = (data.movimientos || []).filter(
        (movimiento) =>
          movimiento.proyectoId === proyectoId ||
          movimiento.proyectoId === cotizacion.id,
      );

      const cobrado = movimientos
        .filter((movimiento) => movimiento.tipo === 'cobro')
        .reduce((acc, item) => acc + Number(item.monto || 0), 0);

      const gastado = movimientos
        .filter((movimiento) => movimiento.tipo === 'gasto')
        .reduce((acc, item) => acc + Number(item.monto || 0), 0);

      const monto = Number(cotizacion.total ?? cotizacion.monto ?? 0);
      const avanceFisico = bitacoras.length ? Number(bitacoras[0].avance || 0) : 0;
      const pendiente = Math.max(monto - cobrado, 0);
      const avanceFinanciero = monto > 0 ? Math.min((cobrado / monto) * 100, 100) : 0;

      return {
        id: proyectoId,
        nombre: cotizacion.proyecto || 'Proyecto sin nombre',
        numero: cotizacion.numero || '',
        monto,
        cobrado,
        gastado,
        pendiente,
        avanceFisico,
        avanceFinanciero,
        activo: !(avanceFisico >= 100 && pendiente <= 0),
      };
    });

  const activos = proyectos.filter((item) => item.activo);
  const contratado = proyectos.reduce((acc, item) => acc + item.monto, 0);
  const cobrado = proyectos.reduce((acc, item) => acc + item.cobrado, 0);
  const gastado = proyectos.reduce((acc, item) => acc + item.gastado, 0);
  const pendiente = Math.max(contratado - cobrado, 0);
  const utilidad = cobrado - gastado;

  const avancePromedio = activos.length
    ? Math.round(
        activos.reduce((acc, item) => acc + Number(item.avanceFisico || 0), 0) /
          activos.length,
      )
    : 0;

  const chartItems = [
    { label: 'Contratado', value: contratado, className: 'c1' },
    { label: 'Cobrado', value: cobrado, className: 'c2' },
    { label: 'Gastos', value: gastado, className: 'c3' },
    { label: 'Pendiente', value: pendiente, className: 'c4' },
  ];

  const maxValue = Math.max(...chartItems.map((item) => item.value), 1);

  return (
    <div className="dashboard-ultra">
      <section className="hero-ultra">
        <div className="hero-accent hero-accent-a" />
        <div className="hero-accent hero-accent-b" />

        <div className="hero-top">
          <div>
            <span className="hero-eyebrow">RESUMEN EJECUTIVO</span>
            <h2>Estado general de las obras</h2>
          </div>

          <Link href="/reportes" className="hero-report-link">
            Reportes
            <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="hero-dashboard-grid">
          <div className="hero-primary">
            <div className="hero-primary-icon">
              <TrendingUp size={24} />
            </div>

            <div>
              <span>Resultado provisional</span>
              <b>{money(utilidad)}</b>
              <small>Cobros menos gastos registrados</small>
            </div>
          </div>

          <div className="hero-stat">
            <span>Activos</span>
            <b>{activos.length}</b>
            <div className="hero-stat-line">
              <i style={{ width: `${Math.min(activos.length * 12, 100)}%` }} />
            </div>
          </div>

          <div className="hero-stat">
            <span>Avance promedio</span>
            <b>{avancePromedio}%</b>
            <div className="hero-stat-line cyan">
              <i style={{ width: `${avancePromedio}%` }} />
            </div>
          </div>

          <div className="hero-stat">
            <span>Pendiente</span>
            <b>{money(pendiente)}</b>
            <small>Por cobrar</small>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <CardStat
          icon={<BriefcaseBusiness size={22} />}
          title="Proyectos activos"
          value={String(activos.length)}
          subtitle={`${proyectos.length} proyectos totales`}
          tone="blue"
          href="/proyectos"
        />
        <CardStat
          icon={<WalletCards size={22} />}
          title="Total cobrado"
          value={money(cobrado)}
          subtitle={`${money(pendiente)} pendiente`}
          tone="cyan"
          href="/cobros"
        />
        <CardStat
          icon={<ReceiptText size={22} />}
          title="Total gastado"
          value={money(gastado)}
          subtitle="Control de egresos" 
          tone="violet"
          href="/gastos"
        />
        <CardStat
          icon={<CircleDollarSign size={22} />}
          title="Balance provisional"
          value={money(utilidad)}
          subtitle="Cobros menos gastos"
          tone="green"
          href="/reportes"
        />
      </section>

      <section className="content-grid">
        <article className="panel chart-panel">
          <div className="panel-head">
            <div>
              <span className="mini-label">VISIÓN GENERAL</span>
              <h3>Movimiento financiero</h3>
            </div>
            <BadgeDollarSign size={22} />
          </div>

          <div className="top-summary">
            <div>
              <span>Monto contratado</span>
              <b>{money(contratado)}</b>
            </div>
            <div>
              <span>Total cobrado</span>
              <b>{money(cobrado)}</b>
            </div>
            <div>
              <span>Total gastado</span>
              <b>{money(gastado)}</b>
            </div>
          </div>

          <div className="bars-wrap">
            {chartItems.map((item) => {
              const height = Math.max(16, Math.round((item.value / maxValue) * 100));
              return (
                <div className="bar-col" key={item.label}>
                  <span className="bar-value">{compactMoney(item.value)}</span>
                  <div className="bar-base">
                    <i className={item.className} style={{ height: `${height}%` }} />
                  </div>
                  <small>{item.label}</small>
                </div>
              );
            })}
          </div>
        </article>

        <article className="panel side-panel">
          <div className="panel-head">
            <div>
              <span className="mini-label">INDICADORES</span>
              <h3>Rendimiento</h3>
            </div>
            <BarChart3 size={22} />
          </div>

          <div className="insight-card blue-bg">
            <div className="insight-top">
              <span>Avance físico</span>
              <strong>{avancePromedio}%</strong>
            </div>
            <div className="progress big">
              <i style={{ width: `${avancePromedio}%` }} />
            </div>
          </div>

          <div className="insight-card green-bg">
            <div className="insight-top">
              <span>Proyectos aprobados</span>
              <strong>{proyectos.length}</strong>
            </div>
            <div className="progress big green">
              <i style={{ width: `${Math.min(proyectos.length * 10, 100)}%` }} />
            </div>
          </div>

          <div className="mini-dual">
            <div>
              <span>Disponible por cobrar</span>
              <b>{money(pendiente)}</b>
            </div>
            <div>
              <span>Utilidad estimada</span>
              <b>{money(utilidad)}</b>
            </div>
          </div>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel projects-panel">
          <div className="panel-head">
            <div>
              <span className="mini-label">SEGUIMIENTO</span>
              <h3>Proyectos activos</h3>
            </div>
            <Link href="/proyectos" className="panel-link">
              Ver todos
              <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className="project-list">
            {activos.length ? (
              activos.slice(0, 4).map((item) => (
                <Link href="/proyectos" key={item.id} className="project-item">
                  <div className="project-main">
                    <div className="project-icon">
                      <CalendarRange size={18} />
                    </div>
                    <div>
                      <b>{item.nombre}</b>
                      <span>{item.numero}</span>
                    </div>
                  </div>

                  <div className="project-progress">
                    <div className="row-title">
                      <span>Avance</span>
                      <strong>{item.avanceFisico}%</strong>
                    </div>
                    <div className="progress">
                      <i style={{ width: `${item.avanceFisico}%` }} />
                    </div>
                  </div>

                  <div className="project-balance">
                    <span>Balance pendiente</span>
                    <b>{money(item.pendiente)}</b>
                  </div>
                </Link>
              ))
            ) : (
              <div className="empty-state">No hay proyectos activos por ahora.</div>
            )}
          </div>
        </article>

        <article className="panel quick-panel">
          <div className="panel-head">
            <div>
              <span className="mini-label">ACCESOS RÁPIDOS</span>
              <h3>Acciones rápidas</h3>
            </div>
            <Activity size={20} />
          </div>

          <div className="quick-grid">
            <QuickAction
              href="/cotizaciones"
              icon={<FileText size={20} />}
              title="Nueva cotización"
              text="Crear propuesta"
            />
            <QuickAction
              href="/bitacoras"
              icon={<NotebookPen size={20} />}
              title="Nueva bitácora"
              text="Registrar avance"
            />
            <QuickAction
              href="/cobros"
              icon={<WalletCards size={20} />}
              title="Registrar cobro"
              text="Actualizar ingreso"
            />
          </div>
        </article>
      </section>

      <style jsx>{`
        .dashboard-ultra {
          display: grid;
          gap: 18px;
        }

        .hero-ultra {
          position: relative;
          overflow: hidden;
          padding: 24px;
          border-radius: 28px;
          color: #ffffff;
          background:
            radial-gradient(
              circle at 92% 10%,
              rgba(79, 199, 255, 0.3),
              transparent 26%
            ),
            linear-gradient(
              135deg,
              #051a34 0%,
              #0a477f 55%,
              #0b83c8 100%
            );
          box-shadow: 0 24px 60px rgba(5, 61, 119, 0.25);
        }

        .hero-accent {
          position: absolute;
          pointer-events: none;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .hero-accent-a {
          width: 260px;
          height: 260px;
          right: -110px;
          top: -130px;
          box-shadow:
            0 0 0 35px rgba(255, 255, 255, 0.025),
            0 0 0 70px rgba(255, 255, 255, 0.018);
        }

        .hero-accent-b {
          width: 160px;
          height: 160px;
          left: -90px;
          bottom: -110px;
        }

        .hero-top,
        .hero-dashboard-grid {
          position: relative;
          z-index: 1;
        }

        .hero-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .hero-eyebrow {
          color: #9edcff;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.16em;
        }

        .hero-top h2 {
          margin: 7px 0 0;
          color: #ffffff;
          font-size: clamp(27px, 3vw, 40px);
          line-height: 1.05;
          letter-spacing: -0.035em;
        }

        .hero-report-link {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 10px 13px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 13px;
          color: #ffffff;
          background: rgba(255, 255, 255, 0.11);
          font-size: 12px;
          font-weight: 900;
          backdrop-filter: blur(10px);
        }

        .hero-dashboard-grid {
          display: grid;
          grid-template-columns: 1.35fr repeat(3, minmax(0, 0.7fr));
          gap: 12px;
          margin-top: 20px;
        }

        .hero-primary,
        .hero-stat {
          min-width: 0;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.09);
          backdrop-filter: blur(12px);
        }

        .hero-primary {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 17px;
          border-radius: 20px;
        }

        .hero-primary-icon {
          flex: 0 0 auto;
          width: 49px;
          height: 49px;
          display: grid;
          place-items: center;
          border-radius: 16px;
          color: #072f5b;
          background: linear-gradient(135deg, #e6f7ff, #9fe1ff);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
        }

        .hero-primary span,
        .hero-primary b,
        .hero-primary small,
        .hero-stat span,
        .hero-stat b,
        .hero-stat small {
          display: block;
        }

        .hero-primary span,
        .hero-stat span {
          color: rgba(255, 255, 255, 0.72);
          font-size: 11px;
          font-weight: 700;
        }

        .hero-primary b {
          margin-top: 5px;
          color: #ffffff;
          font-size: 25px;
          line-height: 1.05;
          overflow-wrap: anywhere;
        }

        .hero-primary small,
        .hero-stat small {
          margin-top: 5px;
          color: rgba(255, 255, 255, 0.58);
          font-size: 10px;
        }

        .hero-stat {
          padding: 16px;
          border-radius: 20px;
        }

        .hero-stat b {
          margin-top: 9px;
          color: #ffffff;
          font-size: 22px;
          line-height: 1.05;
          overflow-wrap: anywhere;
        }

        .hero-stat-line {
          height: 6px;
          margin-top: 13px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
        }

        .hero-stat-line i {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #83e5ff, #ffffff);
        }

        .hero-stat-line.cyan i {
          background: linear-gradient(90deg, #5cebd2, #b7fff3);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1.35fr 0.65fr;
          gap: 16px;
        }

        .panel {
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 26px;
          padding: 20px;
          box-shadow: var(--soft-shadow);
        }

        .panel-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .mini-label {
          display: inline-block;
          color: #1c78f0;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.15em;
        }

        .panel-head h3 {
          margin: 5px 0 0;
          color: var(--text);
          font-size: 26px;
        }

        .panel-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #1c78f0;
          font-size: 13px;
          font-weight: 800;
        }

        .top-summary {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 18px;
        }

        .top-summary > div,
        .mini-dual > div {
          padding: 14px;
          border-radius: 18px;
          background: var(--surface);
        }

        .top-summary span,
        .top-summary b,
        .mini-dual span,
        .mini-dual b {
          display: block;
        }

        .top-summary span,
        .mini-dual span {
          color: var(--muted);
          font-size: 11px;
        }

        .top-summary b,
        .mini-dual b {
          margin-top: 6px;
          color: var(--text);
          font-size: 18px;
          overflow-wrap: anywhere;
        }

        .bars-wrap {
          margin-top: 22px;
          height: 280px;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          align-items: end;
        }

        .bar-col {
          display: grid;
          grid-template-rows: auto 1fr auto;
          gap: 8px;
          align-items: end;
          text-align: center;
          min-width: 0;
        }

        .bar-value {
          font-size: 11px;
          color: var(--muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .bar-base {
          position: relative;
          height: 100%;
          min-height: 180px;
          border-radius: 22px;
          overflow: hidden;
          background: var(--surface);
        }

        .bar-base i {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 22px;
        }

        .bar-base i.c1 {
          background: linear-gradient(180deg, #61d6ff, #1c78f0);
        }

        .bar-base i.c2 {
          background: linear-gradient(180deg, #55edd0, #12b39f);
        }

        .bar-base i.c3 {
          background: linear-gradient(180deg, #bd95ff, #7a51ff);
        }

        .bar-base i.c4 {
          background: linear-gradient(180deg, #9ce86e, #52b631);
        }

        .bar-col small {
          color: var(--muted);
          font-size: 12px;
          font-weight: 700;
        }

        .insight-card {
          padding: 16px;
          border-radius: 20px;
          margin-top: 16px;
        }

        .blue-bg {
          background: linear-gradient(135deg, #eef7ff, #e5f1ff);
        }

        .green-bg {
          background: linear-gradient(135deg, #edfcef, #e6faf0);
        }

        .insight-top {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 12px;
        }

        .insight-top span {
          color: #58718e;
          font-size: 12px;
          font-weight: 700;
        }

        .insight-top strong {
          color: #0d2545;
          font-size: 22px;
        }

        .progress {
          height: 8px;
          overflow: hidden;
          border-radius: 999px;
          background: var(--line);
        }

        .progress.big {
          height: 10px;
        }

        .progress i {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #1c78f0, #37b8ff);
        }

        .progress.green i {
          background: linear-gradient(90deg, #34b76b, #8ce75d);
        }

        .mini-dual {
          display: grid;
          gap: 12px;
          margin-top: 16px;
        }

        .project-list,
        .quick-grid {
          display: grid;
          gap: 12px;
          margin-top: 18px;
        }

        .project-item,
        .quick-action {
          border-radius: 20px;
          background: var(--surface);
          border: 1px solid var(--line);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }

        .project-item:hover,
        .quick-action:hover,
        .card-stat:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 35px rgba(23, 105, 224, 0.12);
        }

        .project-item {
          display: grid;
          grid-template-columns: 1.05fr 1fr auto;
          gap: 14px;
          align-items: center;
          padding: 16px;
        }

        .project-main {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .project-icon,
        .qa-icon {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 16px;
          flex: 0 0 auto;
          color: #1c78f0;
          background: #eaf4ff;
        }

        .project-main b,
        .project-main span,
        .project-balance span,
        .project-balance b {
          display: block;
        }

        .project-main b,
        .qa-copy b {
          color: var(--text);
          font-size: 16px;
          line-height: 1.2;
        }

        .project-main span,
        .project-balance span,
        .qa-copy span {
          margin-top: 4px;
          color: var(--muted);
          font-size: 12px;
        }

        .project-balance {
          text-align: right;
        }

        .project-balance b {
          margin-top: 5px;
          color: var(--text);
          font-size: 14px;
          overflow-wrap: anywhere;
        }

        .row-title {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          color: var(--muted);
          font-size: 11px;
          margin-bottom: 7px;
        }

        .row-title strong {
          color: var(--text);
        }

        .quick-action {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 12px;
          padding: 16px;
        }

        .qa-copy b,
        .qa-copy span {
          display: block;
        }

        .qa-arrow {
          color: #1c78f0;
        }

        .empty-state {
          padding: 30px;
          text-align: center;
          color: var(--muted);
        }

        :global(html[data-theme='dark']) .panel,
        :global(html[data-theme='dark']) .card-stat {
          background: #0d1b2f !important;
        }

        :global(html[data-theme='dark']) .top-summary > div,
        :global(html[data-theme='dark']) .bar-base,
        :global(html[data-theme='dark']) .mini-dual > div,
        :global(html[data-theme='dark']) .project-item,
        :global(html[data-theme='dark']) .quick-action {
          background: #091425 !important;
        }

        :global(html[data-theme='dark']) .blue-bg {
          background: linear-gradient(135deg, rgba(28, 120, 240, 0.16), rgba(28, 120, 240, 0.08));
        }

        :global(html[data-theme='dark']) .green-bg {
          background: linear-gradient(135deg, rgba(52, 183, 107, 0.16), rgba(52, 183, 107, 0.08));
        }

        :global(html[data-theme='dark']) .insight-top span {
          color: #9ab0c9;
        }

        :global(html[data-theme='dark']) .insight-top strong,
        :global(html[data-theme='dark']) .hero-floating strong {
          color: #eaf2ff;
        }

        :global(html[data-theme='dark']) .hero-floating {
          background: rgba(9, 20, 37, 0.95);
        }

        :global(html[data-theme='dark']) .hero-floating small {
          color: #a6b9d1;
        }

        @media (max-width: 1100px) {
          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .content-grid {
            grid-template-columns: 1fr;
          }

          .hero-dashboard-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .hero-primary {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 760px) {
          .hero-ultra {
            padding: 22px;
            border-radius: 24px;
          }

          .hero-top {
            align-items: stretch;
            flex-direction: column;
          }

          .hero-report-link {
            width: fit-content;
          }

          .stats-grid,
          .top-summary,
          .content-grid {
            grid-template-columns: 1fr;
          }

          .bars-wrap {
            gap: 10px;
            height: 220px;
          }

          .bar-base {
            min-height: 140px;
          }

          .project-item {
            grid-template-columns: 1fr;
          }

          .project-balance {
            text-align: left;
          }

          .panel-head h3 {
            font-size: 22px;
          }

          .hero-dashboard-grid {
            grid-template-columns: 1fr;
          }

          .hero-primary {
            grid-column: auto;
          }
        }
      `}</style>
    </div>
  );
}

function CardStat({
  icon,
  title,
  value,
  subtitle,
  tone,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  tone: 'blue' | 'cyan' | 'violet' | 'green';
  href: string;
}) {
  return (
    <Link href={href} className={`card-stat ${tone}`}>
      <div className="card-top">
        <div className="card-icon">{icon}</div>
      </div>

      <div className="card-body">
        <h4>{title}</h4>
        <b>{value}</b>
        <small>{subtitle}</small>
      </div>

      <style jsx>{`
        .card-stat {
          display: grid;
          gap: 16px;
          padding: 20px;
          border-radius: 24px;
          border: 1px solid var(--line);
          background: var(--card);
          box-shadow: var(--soft-shadow);
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-icon {
          width: 56px;
          height: 56px;
          display: grid;
          place-items: center;
          border-radius: 18px;
        }

        .card-body h4 {
          margin: 0;
          color: var(--text);
          font-size: 18px;
          line-height: 1.2;
        }

        .card-body b {
          display: block;
          margin-top: 14px;
          color: var(--text);
          font-size: 28px;
          line-height: 1.08;
          overflow-wrap: anywhere;
        }

        .card-body small {
          display: block;
          margin-top: 8px;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.45;
        }

        .blue .card-icon {
          color: #1c78f0;
          background: linear-gradient(135deg, #eef7ff, #dbeeff);
        }

        .cyan .card-icon {
          color: #0aaec0;
          background: linear-gradient(135deg, #e8fbfd, #d7fbff);
        }

        .violet .card-icon {
          color: #7752ff;
          background: linear-gradient(135deg, #f2edff, #ebe2ff);
        }

        .green .card-icon {
          color: #38a34d;
          background: linear-gradient(135deg, #edf9ed, #dff7df);
        }
      `}</style>
    </Link>
  );
}

function QuickAction({
  href,
  icon,
  title,
  text,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <Link href={href} className="quick-action">
      <div className="qa-icon">{icon}</div>
      <div className="qa-copy">
        <b>{title}</b>
        <span>{text}</span>
      </div>
      <ArrowUpRight size={18} className="qa-arrow" />
    </Link>
  );
}
