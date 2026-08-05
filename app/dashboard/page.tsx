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
    <div className="dashboard-ultra premium-dashboard">
      <div className="dashboard-premium-bg" aria-hidden="true">
        <div className="dashboard-glow glow-a" />
        <div className="dashboard-glow glow-b" />
        <div className="dashboard-glow glow-c" />
        <div className="dashboard-floating-dots primary-dots">
          {Array.from({ length: 18 }).map((_, index) => (
            <span key={`primary-${index}`} className={`dashboard-dot dot-${index + 1}`} />
          ))}
        </div>
        <div className="dashboard-floating-dots secondary-dots">
          {Array.from({ length: 12 }).map((_, index) => (
            <span key={`secondary-${index}`} className={`dashboard-dot soft-dot soft-dot-${index + 1}`} />
          ))}
        </div>
      </div>
      <section className="hero-ultra">
        <div className="hero-accent hero-accent-a" />
        <div className="hero-accent hero-accent-b" />
        <div className="hero-wave wave-one" />
        <div className="hero-wave wave-two" />
        <div className="hero-particle particle-one" />
        <div className="hero-particle particle-two" />
        <div className="hero-particle particle-three" />

        <div className="hero-top">
          <div>
            <div className="hero-title-row">
              <span className="hero-eyebrow">RESUMEN EJECUTIVO</span>
              <span className="live-badge">
                <i />
                Datos actualizados
              </span>
            </div>
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
              <small>
                <strong className="trend-pill">
                  <TrendingUp size={12} />
                  Balance actual
                </strong>
                Cobros menos gastos registrados
              </small>
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
            <div className="mini-bars">
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
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
            <div className="metric-tile">
              <span>Monto contratado</span>
              <b>{money(contratado)}</b>
            </div>
            <div className="metric-tile">
              <span>Total cobrado</span>
              <b>{money(cobrado)}</b>
            </div>
            <div className="metric-tile">
              <span>Total gastado</span>
              <b>{money(gastado)}</b>
            </div>
          </div>

          <div className="bars-wrap">
            {chartItems.map((item) => {
              const height = Math.max(16, Math.round((item.value / maxValue) * 100));
              return (
                <div className={`bar-col ${item.className}`} key={item.label}>
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
            <div className="dual-card">
              <span>Disponible por cobrar</span>
              <b>{money(pendiente)}</b>
            </div>
            <div className="dual-card">
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
          position: relative;
          isolation: isolate;
          display: grid;
          gap: 18px;
          overflow: hidden;
          border-radius: 30px;
        }

        .premium-dashboard {
          background:
            radial-gradient(circle at top right, rgba(62, 181, 255, 0.14), transparent 26%),
            radial-gradient(circle at bottom left, rgba(54, 137, 255, 0.1), transparent 28%);
        }

        .dashboard-ultra > :not(.dashboard-premium-bg) {
          position: relative;
          z-index: 2;
        }

        .dashboard-premium-bg {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          overflow: hidden;
        }

        .dashboard-glow {
          position: absolute;
          border-radius: 999px;
          filter: blur(10px);
          opacity: 0.38;
          animation: premiumGlowPulse 8s ease-in-out infinite;
        }

        .glow-a {
          width: 280px;
          height: 280px;
          top: -60px;
          right: -40px;
          background: radial-gradient(circle, rgba(56, 173, 255, 0.28) 0%, rgba(56, 173, 255, 0.08) 50%, transparent 75%);
        }

        .glow-b {
          width: 220px;
          height: 220px;
          bottom: 12%;
          left: -50px;
          background: radial-gradient(circle, rgba(111, 232, 255, 0.18) 0%, rgba(111, 232, 255, 0.06) 52%, transparent 76%);
          animation-delay: -2s;
        }

        .glow-c {
          width: 180px;
          height: 180px;
          top: 40%;
          right: 22%;
          background: radial-gradient(circle, rgba(144, 219, 255, 0.15) 0%, rgba(144, 219, 255, 0.05) 55%, transparent 78%);
          animation-delay: -4s;
        }

        .dashboard-floating-dots {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .dashboard-dot {
          position: absolute;
          border-radius: 999px;
          background: radial-gradient(circle at 35% 35%, rgba(208, 245, 255, 0.96) 0%, rgba(121, 213, 255, 0.7) 42%, rgba(36, 153, 237, 0.22) 72%, transparent 100%);
          box-shadow:
            0 0 12px rgba(154, 230, 255, 0.28),
            0 0 28px rgba(62, 182, 255, 0.12);
          opacity: 0.5;
          animation: dashboardDotFloat 10s ease-in-out infinite;
        }

        .dashboard-dot::after {
          content: '';
          position: absolute;
          inset: -10px;
          border-radius: inherit;
          border: 1px solid rgba(169, 233, 255, 0.12);
          opacity: 0.8;
        }

        .soft-dot {
          opacity: 0.22;
          filter: blur(0.4px);
          background: radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.95) 0%, rgba(164, 231, 255, 0.42) 48%, transparent 100%);
          animation: dashboardSoftFloat 14s ease-in-out infinite;
        }

        .soft-dot::after {
          inset: -14px;
          border-color: rgba(185, 240, 255, 0.08);
        }

        .dot-1  { width: 10px; height: 10px; top: 7%;  left: 6%;  animation-duration: 8s;  }
        .dot-2  { width: 14px; height: 14px; top: 12%; left: 18%; animation-duration: 11s; animation-delay: -2s; }
        .dot-3  { width: 8px;  height: 8px;  top: 9%;  left: 32%; animation-duration: 9s;  animation-delay: -1s; }
        .dot-4  { width: 16px; height: 16px; top: 16%; left: 48%; animation-duration: 12s; animation-delay: -3s; }
        .dot-5  { width: 9px;  height: 9px;  top: 10%; left: 64%; animation-duration: 8.8s; animation-delay: -2.5s; }
        .dot-6  { width: 12px; height: 12px; top: 8%;  left: 80%; animation-duration: 10.5s; animation-delay: -1.5s; }
        .dot-7  { width: 7px;  height: 7px;  top: 24%; left: 90%; animation-duration: 7.9s; animation-delay: -4s; }
        .dot-8  { width: 11px; height: 11px; top: 33%; left: 11%; animation-duration: 10.8s; animation-delay: -3.2s; }
        .dot-9  { width: 18px; height: 18px; top: 40%; left: 26%; animation-duration: 12.4s; animation-delay: -2.2s; }
        .dot-10 { width: 8px;  height: 8px;  top: 37%; left: 43%; animation-duration: 8.7s; animation-delay: -1.7s; }
        .dot-11 { width: 13px; height: 13px; top: 46%; left: 59%; animation-duration: 11.4s; animation-delay: -4.6s; }
        .dot-12 { width: 7px;  height: 7px;  top: 42%; left: 76%; animation-duration: 9.5s; animation-delay: -2.9s; }
        .dot-13 { width: 15px; height: 15px; top: 58%; left: 87%; animation-duration: 12.7s; animation-delay: -5s; }
        .dot-14 { width: 9px;  height: 9px;  top: 71%; left: 8%;  animation-duration: 8.6s; animation-delay: -1.3s; }
        .dot-15 { width: 14px; height: 14px; top: 75%; left: 24%; animation-duration: 10.2s; animation-delay: -3.8s; }
        .dot-16 { width: 8px;  height: 8px;  top: 83%; left: 46%; animation-duration: 9.1s; animation-delay: -2.4s; }
        .dot-17 { width: 17px; height: 17px; top: 79%; left: 68%; animation-duration: 11.8s; animation-delay: -3.1s; }
        .dot-18 { width: 10px; height: 10px; top: 86%; left: 84%; animation-duration: 8.9s; animation-delay: -4.4s; }

        .soft-dot-1  { width: 6px;  height: 6px;  top: 6%;  left: 24%; animation-delay: -1s; }
        .soft-dot-2  { width: 5px;  height: 5px;  top: 19%; left: 72%; animation-delay: -3s; }
        .soft-dot-3  { width: 7px;  height: 7px;  top: 22%; left: 38%; animation-delay: -6s; }
        .soft-dot-4  { width: 4px;  height: 4px;  top: 28%; left: 56%; animation-delay: -4s; }
        .soft-dot-5  { width: 6px;  height: 6px;  top: 48%; left: 16%; animation-delay: -2.5s; }
        .soft-dot-6  { width: 5px;  height: 5px;  top: 54%; left: 82%; animation-delay: -5.5s; }
        .soft-dot-7  { width: 6px;  height: 6px;  top: 61%; left: 35%; animation-delay: -3.4s; }
        .soft-dot-8  { width: 4px;  height: 4px;  top: 66%; left: 58%; animation-delay: -7s; }
        .soft-dot-9  { width: 7px;  height: 7px;  top: 73%; left: 74%; animation-delay: -2.2s; }
        .soft-dot-10 { width: 5px;  height: 5px;  top: 81%; left: 14%; animation-delay: -5.1s; }
        .soft-dot-11 { width: 4px;  height: 4px;  top: 87%; left: 63%; animation-delay: -1.8s; }
        .soft-dot-12 { width: 6px;  height: 6px;  top: 90%; left: 90%; animation-delay: -4.8s; }

        @keyframes premiumGlowPulse {
          0%, 100% { transform: scale(1) translate3d(0, 0, 0); opacity: 0.28; }
          50% { transform: scale(1.08) translate3d(0, -8px, 0); opacity: 0.45; }
        }

        @keyframes dashboardDotFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(0.95);
            opacity: 0.35;
          }
          25% {
            transform: translate3d(10px, -18px, 0) scale(1.15);
            opacity: 0.7;
          }
          50% {
            transform: translate3d(-8px, -28px, 0) scale(1.02);
            opacity: 0.95;
          }
          75% {
            transform: translate3d(12px, -12px, 0) scale(1.12);
            opacity: 0.58;
          }
        }

        @keyframes dashboardSoftFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.18;
          }
          30% {
            transform: translate3d(8px, -10px, 0) scale(1.1);
            opacity: 0.32;
          }
          60% {
            transform: translate3d(-5px, -18px, 0) scale(0.95);
            opacity: 0.22;
          }
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
          background-size: 140% 140%;
          animation: heroGradientMove 10s ease-in-out infinite;
        }


        .hero-ultra::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,.028) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.028) 1px, transparent 1px);
          background-size: 30px 30px;
          mask-image: linear-gradient(to right, #000, transparent 88%);
        }

        .hero-title-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }

        .live-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 9px;
          border-radius: 999px;
          color: #dff7ff;
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.12);
          font-size: 10px;
          font-weight: 800;
        }

        .live-badge i {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #68f2c0;
          box-shadow: 0 0 0 0 rgba(104,242,192,.5);
          animation: livePulse 1.8s infinite;
        }

        .trend-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-right: 7px;
          padding: 4px 7px;
          border-radius: 999px;
          color: #d9fff1;
          background: rgba(62, 220, 160, 0.14);
          font-size: 9px;
          font-weight: 900;
        }

        .mini-bars {
          height: 24px;
          display: flex;
          align-items: end;
          gap: 4px;
          margin-top: 10px;
        }

        .mini-bars i {
          flex: 1;
          min-width: 5px;
          border-radius: 999px;
          background: linear-gradient(180deg, #ffffff, #79dcff);
        }

        .mini-bars i:nth-child(1) { height: 35%; }
        .mini-bars i:nth-child(2) { height: 70%; }
        .mini-bars i:nth-child(3) { height: 48%; }
        .mini-bars i:nth-child(4) { height: 88%; }
        .mini-bars i:nth-child(5) { height: 58%; }

        @keyframes sheenMove {
          0% {
            left: -180px;
            opacity: 0;
          }

          15% {
            opacity: 1;
          }

          55% {
            opacity: 1;
          }

          75%,
          100% {
            left: calc(100% + 120px);
            opacity: 0;
          }
        }

        @keyframes livePulse {
          0% {
            box-shadow: 0 0 0 0 rgba(104,242,192,.5);
          }

          70% {
            box-shadow: 0 0 0 8px rgba(104,242,192,0);
          }

          100% {
            box-shadow: 0 0 0 0 rgba(104,242,192,0);
          }
        }

        @keyframes miniBar {
          0%,
          100% {
            transform: scaleY(.72);
            opacity: .62;
          }

          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }

        @keyframes heroGradientMove {
          0%,
          100% {
            background-position: 0% 50%;
          }

          50% {
            background-position: 100% 50%;
          }
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


        .hero-wave {
          position: absolute;
          pointer-events: none;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.08);
          animation: heroPulse 6s ease-in-out infinite;
        }

        .wave-one {
          width: 420px;
          height: 420px;
          right: -210px;
          top: -190px;
        }

        .wave-two {
          width: 310px;
          height: 310px;
          right: -150px;
          top: -135px;
          animation-delay: 1.4s;
        }

        .hero-particle {
          position: absolute;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: rgba(196, 240, 255, 0.95);
          box-shadow: 0 0 18px rgba(118, 218, 255, 0.9);
          animation: floatParticle 5s ease-in-out infinite;
        }

        .particle-one {
          top: 22%;
          right: 34%;
        }

        .particle-two {
          top: 64%;
          right: 16%;
          animation-delay: 1.7s;
        }

        .particle-three {
          bottom: 18%;
          left: 42%;
          animation-delay: 3.1s;
        }

        .animated-card {
          animation: cardEnter 0.75s ease both;
          transition:
            transform 0.25s ease,
            background 0.25s ease,
            box-shadow 0.25s ease;
        }

        .animated-card:hover {
          transform: translateY(-6px) scale(1.02);
          background: rgba(255, 255, 255, 0.16);
          border-color: rgba(255,255,255,.24);
          box-shadow:
            0 20px 44px rgba(0, 0, 0, 0.18),
            0 0 0 1px rgba(138,221,255,.14);
        }

        .delay-1 {
          animation-delay: 0.08s;
        }

        .delay-2 {
          animation-delay: 0.18s;
        }

        .delay-3 {
          animation-delay: 0.28s;
        }

        .delay-4 {
          animation-delay: 0.38s;
        }

        .hero-primary-icon {
          animation: iconFloat 3.2s ease-in-out infinite;
        }

        .hero-report-link {
          transition:
            transform 0.22s ease,
            background 0.22s ease,
            box-shadow 0.22s ease;
        }

        .hero-report-link:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.18);
          box-shadow: 0 12px 25px rgba(0, 0, 0, 0.14);
        }

        .hero-stat-line i {
          animation: progressGlow 2.7s ease-in-out infinite;
        }

        @keyframes cardEnter {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes heroPulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.35;
          }

          50% {
            transform: scale(1.08);
            opacity: 0.68;
          }
        }

        @keyframes floatParticle {
          0%,
          100% {
            transform: translateY(0) translateX(0);
            opacity: 0.45;
          }

          50% {
            transform: translateY(-14px) translateX(8px);
            opacity: 1;
          }
        }

        @keyframes iconFloat {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }

          50% {
            transform: translateY(-5px) rotate(3deg);
          }
        }

        @keyframes progressGlow {
          0%,
          100% {
            filter: brightness(1);
          }

          50% {
            filter: brightness(1.35);
          }
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


        @media (prefers-reduced-motion: reduce) {
          .hero-ultra,
          .hero-wave,
          .hero-particle,
          .dashboard-glow,
          .dashboard-dot,
          .hero-primary-icon,
          .hero-stat-line i,
          .metric-tile,
          .dual-card,
          .insight-card,
          .project-item,
          .quick-action,
          .project-icon,
          .qa-icon,
          .bar-anim .bar-base i,
          .card-stat,
          .card-orb,
          .card-shine,
          .card-meter i {
            animation: none !important;
          }
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

          .hero-title-row {
            align-items: flex-start;
            flex-direction: column;
            gap: 7px;
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
          position: relative;
          overflow: hidden;
          display: grid;
          gap: 16px;
          padding: 20px;
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,.08);
          background:
            radial-gradient(circle at top right, rgba(255,255,255,.08), transparent 26%),
            linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,.01)),
            var(--card);
          box-shadow: var(--soft-shadow);
          isolation: isolate;
          transition: transform .26s ease, box-shadow .26s ease, border-color .26s ease;
        }

        .card-stat:hover {
          transform: translateY(-6px) scale(1.015);
          border-color: rgba(115, 205, 255, .28);
          box-shadow: 0 18px 44px rgba(9, 75, 140, .18);
        }

        .card-top {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .card-icon {
          width: 56px;
          height: 56px;
          display: grid;
          place-items: center;
          border-radius: 18px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.2);
        }

        .card-body {
          position: relative;
          z-index: 1;
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
