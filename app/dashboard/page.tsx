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
            bitacora.proyectoId === cotizacion.id
        )
        .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));

      const movimientos = (data.movimientos || []).filter(
        (movimiento) =>
          movimiento.proyectoId === proyectoId ||
          movimiento.proyectoId === cotizacion.id
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
          activos.length
      )
    : 0;

  const financieroPromedio = activos.length
    ? Math.round(
        activos.reduce((acc, item) => acc + Number(item.avanceFinanciero || 0), 0) /
          activos.length
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
    <div className="dashboard-premium">
      <section className="hero-premium">
        <div className="hero-copy">
          <span className="eyebrow">PANEL PRINCIPAL</span>
          <h2>Dashboard ejecutivo de CONSTRUPLATA</h2>
          <p>
            Un resumen más moderno, visual y claro de tus proyectos, cobros,
            gastos y avances.
          </p>

          <div className="hero-tags">
            <span>Proyectos</span>
            <span>Finanzas</span>
            <span>Bitácoras</span>
            <span>Reportes</span>
          </div>
        </div>

        <div className="hero-highlight">
          <div className="hero-highlight-card">
            <Activity size={22} />
            <small>Resultado provisional</small>
            <strong>{money(utilidad)}</strong>
            <span>{money(pendiente)} pendiente por cobrar</span>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <CardStat
          icon={<BriefcaseBusiness size={22} />}
          title="Proyectos activos"
          value={String(activos.length)}
          subtitle={`${proyectos.length} proyectos totales`}
          badge="Activos"
          tone="blue"
          href="/proyectos"
        />
        <CardStat
          icon={<WalletCards size={22} />}
          title="Total cobrado"
          value={money(cobrado)}
          subtitle={`${money(pendiente)} pendiente`}
          badge="Cobros"
          tone="cyan"
          href="/cobros"
        />
        <CardStat
          icon={<ReceiptText size={22} />}
          title="Total gastado"
          value={money(gastado)}
          subtitle="Control de egresos"
          badge="Gastos"
          tone="violet"
          href="/gastos"
        />
        <CardStat
          icon={<CircleDollarSign size={22} />}
          title="Balance provisional"
          value={money(utilidad)}
          subtitle="Cobros menos gastos"
          badge="Balance"
          tone="green"
          href="/reportes"
        />
      </section>

      <section className="main-grid">
        <article className="panel panel-large finance-panel">
          <div className="panel-head">
            <div>
              <span className="mini-label">VISIÓN FINANCIERA</span>
              <h3>Comparativo general</h3>
            </div>
            <BadgeDollarSign size={22} />
          </div>

          <div className="mini-resume">
            <div>
              <span>Contratado</span>
              <b>{money(contratado)}</b>
            </div>
            <div>
              <span>Cobrado</span>
              <b>{money(cobrado)}</b>
            </div>
            <div>
              <span>Gastado</span>
              <b>{money(gastado)}</b>
            </div>
          </div>

          <div className="bars-wrap">
            {chartItems.map((item) => {
              const height = Math.max(14, Math.round((item.value / maxValue) * 100));
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

        <article className="panel panel-side progress-panel">
          <div className="panel-head">
            <div>
              <span className="mini-label">AVANCES</span>
              <h3>Indicadores clave</h3>
            </div>
            <BarChart3 size={22} />
          </div>

          <div className="ring-grid">
            <RingPercent label="Avance físico" value={avancePromedio} color="blue" />
            <RingPercent
              label="Avance financiero"
              value={financieroPromedio}
              color="green"
            />
          </div>

          <div className="line-kpis">
            <div>
              <span>Cotizaciones aprobadas</span>
              <b>{proyectos.length}</b>
            </div>
            <div>
              <span>Disponible por cobrar</span>
              <b>{money(pendiente)}</b>
            </div>
          </div>
        </article>
      </section>

      <section className="main-grid">
        <article className="panel panel-large">
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
              activos.slice(0, 5).map((item) => (
                <Link href="/proyectos" key={item.id} className="project-item">
                  <div className="project-left">
                    <div className="project-icon">
                      <CalendarRange size={18} />
                    </div>
                    <div>
                      <b>{item.nombre}</b>
                      <span>{item.numero}</span>
                    </div>
                  </div>

                  <div className="project-middle">
                    <div className="row-title">
                      <span>Avance</span>
                      <strong>{item.avanceFisico}%</strong>
                    </div>
                    <div className="progress">
                      <i style={{ width: `${item.avanceFisico}%` }} />
                    </div>
                  </div>

                  <div className="project-right">
                    <span>Balance</span>
                    <b>{money(item.pendiente)}</b>
                  </div>
                </Link>
              ))
            ) : (
              <div className="empty-state">No hay proyectos activos por ahora.</div>
            )}
          </div>
        </article>

        <article className="panel panel-side">
          <div className="panel-head">
            <div>
              <span className="mini-label">ACCESOS RÁPIDOS</span>
              <h3>Crear y registrar</h3>
            </div>
            <FileText size={20} />
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
        .dashboard-premium {
          display: grid;
          gap: 18px;
        }

        .hero-premium {
          position: relative;
          overflow: hidden;
          display: grid;
          grid-template-columns: 1.25fr 0.75fr;
          gap: 20px;
          align-items: center;
          padding: 28px;
          border-radius: 28px;
          color: #fff;
          background:
            radial-gradient(circle at 85% 15%, rgba(70, 180, 255, 0.4), transparent 22%),
            radial-gradient(circle at 10% 100%, rgba(40, 105, 255, 0.35), transparent 32%),
            linear-gradient(135deg, #03162b 0%, #063767 48%, #0a6cb0 100%);
          box-shadow: 0 26px 60px rgba(3, 44, 92, 0.24);
        }

        .hero-premium::after {
          content: '';
          position: absolute;
          right: -120px;
          top: -90px;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.06);
        }

        .hero-copy,
        .hero-highlight {
          position: relative;
          z-index: 1;
        }

        .eyebrow {
          display: inline-block;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.16em;
          color: #a8dbff;
        }

        .hero-premium h2 {
          margin: 10px 0 10px;
          font-size: clamp(30px, 4vw, 48px);
          line-height: 1.02;
          letter-spacing: -0.03em;
        }

        .hero-premium p {
          margin: 0;
          max-width: 720px;
          color: rgba(255, 255, 255, 0.82);
          line-height: 1.6;
        }

        .hero-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 18px;
        }

        .hero-tags span {
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .hero-highlight {
          display: flex;
          justify-content: flex-end;
        }

        .hero-highlight-card {
          width: 100%;
          max-width: 280px;
          display: grid;
          gap: 8px;
          padding: 20px;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.14);
          backdrop-filter: blur(14px);
        }

        .hero-highlight-card small {
          color: rgba(255, 255, 255, 0.78);
          font-size: 12px;
        }

        .hero-highlight-card strong {
          font-size: 28px;
          line-height: 1;
        }

        .hero-highlight-card span {
          color: rgba(255, 255, 255, 0.75);
          font-size: 12px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        .main-grid {
          display: grid;
          grid-template-columns: 1.35fr 0.65fr;
          gap: 16px;
        }

        .panel {
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 24px;
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

        .mini-resume {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin-top: 18px;
        }

        .mini-resume > div {
          padding: 14px;
          background: var(--surface);
          border-radius: 16px;
        }

        .mini-resume span,
        .mini-resume b {
          display: block;
        }

        .mini-resume span {
          color: var(--muted);
          font-size: 11px;
        }

        .mini-resume b {
          margin-top: 6px;
          color: var(--text);
          font-size: 18px;
          line-height: 1.2;
          overflow-wrap: anywhere;
        }

        .bars-wrap {
          margin-top: 22px;
          height: 260px;
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
          border-radius: 18px;
          overflow: hidden;
          background: var(--surface);
          min-height: 170px;
        }

        .bar-base i {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 18px;
        }

        .bar-base i.c1 {
          background: linear-gradient(180deg, #50d3ff, #1c78f0);
        }

        .bar-base i.c2 {
          background: linear-gradient(180deg, #55e8d9, #12a89b);
        }

        .bar-base i.c3 {
          background: linear-gradient(180deg, #b18cff, #7752ff);
        }

        .bar-base i.c4 {
          background: linear-gradient(180deg, #8ee55d, #43b02a);
        }

        .bar-col small {
          color: var(--muted);
          font-size: 12px;
          font-weight: 700;
        }

        .ring-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin-top: 22px;
        }

        .line-kpis {
          display: grid;
          gap: 10px;
          margin-top: 20px;
        }

        .line-kpis > div {
          padding: 14px;
          border-radius: 16px;
          background: var(--surface);
        }

        .line-kpis span,
        .line-kpis b {
          display: block;
        }

        .line-kpis span {
          color: var(--muted);
          font-size: 11px;
        }

        .line-kpis b {
          margin-top: 5px;
          color: var(--text);
          font-size: 18px;
          overflow-wrap: anywhere;
        }

        .project-list {
          display: grid;
          gap: 12px;
          margin-top: 18px;
        }

        .project-item {
          display: grid;
          grid-template-columns: 1.1fr 1fr auto;
          gap: 14px;
          align-items: center;
          padding: 16px;
          border-radius: 18px;
          background: var(--surface);
          border: 1px solid var(--line);
        }

        .project-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .project-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          color: #1c78f0;
          background: #ecf5ff;
          flex: 0 0 auto;
        }

        .project-left b,
        .project-left span,
        .project-right span,
        .project-right b {
          display: block;
        }

        .project-left b {
          color: var(--text);
          font-size: 14px;
        }

        .project-left span,
        .project-right span {
          margin-top: 4px;
          color: var(--muted);
          font-size: 11px;
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

        .progress {
          height: 8px;
          overflow: hidden;
          border-radius: 999px;
          background: var(--line);
        }

        .progress i {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #1c78f0, #34b6ff);
        }

        .project-right {
          text-align: right;
        }

        .project-right b {
          margin-top: 4px;
          color: var(--text);
          font-size: 14px;
          overflow-wrap: anywhere;
        }

        .quick-grid {
          display: grid;
          gap: 12px;
          margin-top: 18px;
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

        :global(html[data-theme='dark']) .mini-resume > div,
        :global(html[data-theme='dark']) .bar-base,
        :global(html[data-theme='dark']) .line-kpis > div,
        :global(html[data-theme='dark']) .project-item,
        :global(html[data-theme='dark']) .quick-action {
          background: #0a1628 !important;
        }

        :global(html[data-theme='dark']) .project-icon {
          background: rgba(28, 120, 240, 0.16);
        }

        @media (max-width: 1100px) {
          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .main-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .hero-premium {
            grid-template-columns: 1fr;
            padding: 20px;
            border-radius: 22px;
          }

          .hero-highlight {
            justify-content: flex-start;
          }

          .hero-highlight-card {
            max-width: none;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .mini-resume {
            grid-template-columns: 1fr;
          }

          .bars-wrap {
            gap: 10px;
            height: 220px;
          }

          .bar-base {
            min-height: 140px;
          }

          .ring-grid {
            grid-template-columns: 1fr 1fr;
          }

          .project-item {
            grid-template-columns: 1fr;
            text-align: left;
          }

          .project-right {
            text-align: left;
          }

          .panel-head h3 {
            font-size: 22px;
          }
        }

        @media (max-width: 520px) {
          .ring-grid {
            grid-template-columns: 1fr;
          }

          .bars-wrap {
            grid-template-columns: repeat(4, minmax(50px, 1fr));
          }

          .bar-value {
            font-size: 9px;
          }

          .bar-col small {
            font-size: 10px;
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
  badge,
  tone,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  badge: string;
  tone: 'blue' | 'cyan' | 'violet' | 'green';
  href: string;
}) {
  return (
    <Link href={href} className={`card-stat ${tone}`}>
      <div className="card-head">
        <div className="card-icon">{icon}</div>
        <span className="badge">{badge}</span>
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
          padding: 18px;
          border-radius: 24px;
          border: 1px solid var(--line);
          background: var(--card);
          box-shadow: var(--soft-shadow);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }

        .card-stat:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 40px rgba(23, 105, 224, 0.12);
        }

        .card-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .card-icon {
          width: 54px;
          height: 54px;
          display: grid;
          place-items: center;
          border-radius: 18px;
          flex: 0 0 auto;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 7px 12px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 900;
          white-space: nowrap;
        }

        .card-body h4 {
          margin: 0;
          color: var(--text);
          font-size: 20px;
          line-height: 1.15;
        }

        .card-body b {
          display: block;
          margin-top: 14px;
          color: var(--text);
          font-size: 26px;
          line-height: 1.1;
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
          background: #eaf4ff;
        }

        .blue .badge {
          color: #1c78f0;
          background: #eef5ff;
        }

        .cyan .card-icon {
          color: #0aaec0;
          background: #e8fbfd;
        }

        .cyan .badge {
          color: #0aaec0;
          background: #ecfeff;
        }

        .violet .card-icon {
          color: #7752ff;
          background: #f2edff;
        }

        .violet .badge {
          color: #7752ff;
          background: #f4f0ff;
        }

        .green .card-icon {
          color: #3aa23a;
          background: #edf9ed;
        }

        .green .badge {
          color: #3aa23a;
          background: #f0fcf0;
        }

        @media (max-width: 760px) {
          .card-body h4 {
            font-size: 18px;
          }

          .card-body b {
            font-size: 22px;
          }
        }
      `}</style>
    </Link>
  );
}

function RingPercent({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: 'blue' | 'green';
}) {
  const safe = Math.max(0, Math.min(100, value));
  const tone = color === 'green' ? '#14a88f' : '#1c78f0';

  return (
    <div className="ring-box">
      <div
        className="ring"
        style={{
          background: `conic-gradient(${tone} ${safe * 3.6}deg, var(--line) 0deg)`,
        }}
      >
        <div className="inner">
          <b>{safe}%</b>
        </div>
      </div>
      <span>{label}</span>

      <style jsx>{`
        .ring-box {
          display: grid;
          justify-items: center;
          gap: 10px;
          padding: 14px;
          border-radius: 18px;
          background: var(--surface);
        }

        .ring {
          width: 118px;
          height: 118px;
          border-radius: 50%;
          display: grid;
          place-items: center;
        }

        .inner {
          width: 84px;
          height: 84px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: var(--card);
        }

        .inner b {
          color: var(--text);
          font-size: 22px;
        }

        .ring-box span {
          color: var(--muted);
          font-size: 12px;
          font-weight: 700;
          text-align: center;
        }

        :global(html[data-theme='dark']) .inner {
          background: #0d1b2f;
        }
      `}</style>
    </div>
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

      <style jsx>{`
        .quick-action {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border-radius: 18px;
          background: var(--surface);
          border: 1px solid var(--line);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }

        .quick-action:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 32px rgba(23, 105, 224, 0.1);
        }

        .qa-icon {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 16px;
          color: #1c78f0;
          background: #ebf5ff;
        }

        .qa-copy b,
        .qa-copy span {
          display: block;
        }

        .qa-copy b {
          color: var(--text);
          font-size: 16px;
          line-height: 1.2;
        }

        .qa-copy span {
          margin-top: 5px;
          color: var(--muted);
          font-size: 13px;
        }

        .qa-arrow {
          color: #1c78f0;
        }

        @media (max-width: 760px) {
          .qa-copy b {
            font-size: 15px;
          }

          .qa-copy span {
            font-size: 12px;
          }
        }
      `}</style>
    </Link>
  );
}
