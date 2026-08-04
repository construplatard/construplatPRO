'use client';

import { useMemo, useState } from 'react';
import PageFrame from '@/components/PageFrame';
import { useData } from '@/components/DataProvider';
import { money, today } from '@/lib/store';
import {
  BarChart3,
  Eye,
  FileText,
  FolderKanban,
  Printer,
  ReceiptText,
  TrendingUp,
  WalletCards,
  X,
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

type Factura = {
  id: string;
  numero: string;
  clienteId: string;
  proyectoId: string;
  concepto: string;
  monto: number;
  pagado: number;
  estado: string;
  fecha?: string;
  vencimiento?: string;
};

type Movimiento = {
  id: string;
  tipo: 'cobro' | 'gasto';
  fecha: string;
  proyectoId: string;
  concepto: string;
  monto: number;
  metodo: string;
  categoria?: string;
};

type ProyectoReporte = {
  id: string;
  cotizacionId: string;
  numero: string;
  nombre: string;
  clienteId: string;
  monto: number;
  avanceFisico: number;
  cobrado: number;
  balance: number;
  avanceFinanciero: number;
  facturado: number;
  pagadoFacturas: number;
  pendienteFacturas: number;
  gastos: number;
  resultado: number;
  margen: number;
  estado: string;
};

const normalizar = (value: string | undefined) =>
  String(value || '').trim().toLowerCase();

const fechaRD = (value: string) => {
  if (!value) return '—';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
};

export default function Page() {
  return (
    <PageFrame>
      <Reportes />
    </PageFrame>
  );
}

function Reportes() {
  const { data } = useData();

  const movimientos = data.movimientos as Movimiento[];
  const facturas = data.facturas as Factura[];

  const [projectFilter, setProjectFilter] = useState('todos');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState(today());
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const proyectos = useMemo<ProyectoReporte[]>(() => {
    const cotizaciones = data.cotizaciones as Cotizacion[];

    return cotizaciones
      .filter((cotizacion) => normalizar(cotizacion.estado) === 'aprobada')
      .map((cotizacion) => {
        const projectId = `pro-${cotizacion.id}`;

        const bitacoras = data.bitacoras
          .filter(
            (bitacora) =>
              bitacora.proyectoId === projectId ||
              bitacora.proyectoId === cotizacion.id
          )
          .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));

        const avanceFisico = bitacoras.length
          ? Number(bitacoras[0].avance || 0)
          : 0;

        const projectMovements = movimientos.filter(
          (movement) =>
            movement.proyectoId === projectId ||
            movement.proyectoId === cotizacion.id
        );

        const cobrado = projectMovements
          .filter((movement) => movement.tipo === 'cobro')
          .reduce((sum, movement) => sum + Number(movement.monto || 0), 0);

        const gastos = projectMovements
          .filter((movement) => movement.tipo === 'gasto')
          .reduce((sum, movement) => sum + Number(movement.monto || 0), 0);

        const projectInvoices = facturas.filter(
          (invoice) =>
            invoice.proyectoId === projectId ||
            invoice.proyectoId === cotizacion.id
        );

        const facturado = projectInvoices.reduce(
          (sum, invoice) => sum + Number(invoice.monto || 0),
          0
        );

        const pagadoFacturas = projectInvoices.reduce(
          (sum, invoice) => sum + Number(invoice.pagado || 0),
          0
        );

        const monto = Number(cotizacion.total ?? cotizacion.monto ?? 0);
        const balance = Math.max(monto - cobrado, 0);
        const avanceFinanciero =
          monto > 0 ? Math.min((cobrado / monto) * 100, 100) : 0;
        const pendienteFacturas = Math.max(facturado - pagadoFacturas, 0);
        const resultado = cobrado - gastos;
        const margen = cobrado > 0 ? (resultado / cobrado) * 100 : 0;
        const finalizado = avanceFisico >= 100 && balance <= 0;

        return {
          id: projectId,
          cotizacionId: cotizacion.id,
          numero: cotizacion.numero,
          nombre: cotizacion.proyecto,
          clienteId: cotizacion.clienteId,
          monto,
          avanceFisico,
          cobrado,
          balance,
          avanceFinanciero,
          facturado,
          pagadoFacturas,
          pendienteFacturas,
          gastos,
          resultado,
          margen,
          estado: finalizado ? 'Finalizado y saldado' : 'Activo',
        };
      });
  }, [data.cotizaciones, data.bitacoras, movimientos, facturas]);

  const filteredProjects = proyectos.filter((project) =>
    projectFilter === 'todos' ? true : project.id === projectFilter
  );

  const filteredMovements = movimientos.filter((movement) => {
    const projectMatch =
      projectFilter === 'todos'
        ? true
        : movement.proyectoId === projectFilter;

    const fromMatch = dateFrom ? movement.fecha >= dateFrom : true;
    const toMatch = dateTo ? movement.fecha <= dateTo : true;

    return projectMatch && fromMatch && toMatch;
  });

  const totalContratado = filteredProjects.reduce(
    (sum, project) => sum + project.monto,
    0
  );

  const totalCobrado = filteredProjects.reduce(
    (sum, project) => sum + project.cobrado,
    0
  );

  const totalGastos = filteredProjects.reduce(
    (sum, project) => sum + project.gastos,
    0
  );

  const totalBalance = filteredProjects.reduce(
    (sum, project) => sum + project.balance,
    0
  );

  const resultadoGeneral = totalCobrado - totalGastos;
  const margenGeneral =
    totalCobrado > 0 ? (resultadoGeneral / totalCobrado) * 100 : 0;

  const facturasPendientes = facturas.filter((invoice) => {
    const balance = Number(invoice.monto || 0) - Number(invoice.pagado || 0);
    return balance > 0;
  }).length;

  const gastoPorCategoria = useMemo(() => {
    const map = new Map<string, number>();

    filteredMovements
      .filter((movement) => movement.tipo === 'gasto')
      .forEach((movement) => {
        const category = movement.categoria || 'Otros';
        map.set(category, (map.get(category) || 0) + Number(movement.monto || 0));
      });

    return Array.from(map.entries())
      .map(([categoria, monto]) => ({ categoria, monto }))
      .sort((a, b) => b.monto - a.monto);
  }, [filteredMovements]);

  const selectedProject =
    proyectos.find((project) => project.id === selectedProjectId) || null;

  const printGeneral = () => {
    const printWindow = window.open('', '_blank', 'width=1000,height=900');

    if (!printWindow) {
      window.alert('Habilita las ventanas emergentes para imprimir.');
      return;
    }

    const projectRows = filteredProjects
      .map(
        (project) => `
          <tr>
            <td>${project.nombre}</td>
            <td>${project.estado}</td>
            <td>${money(project.monto)}</td>
            <td>${money(project.cobrado)}</td>
            <td>${money(project.gastos)}</td>
            <td>${money(project.resultado)}</td>
            <td>${project.avanceFisico.toFixed(0)}%</td>
            <td>${project.avanceFinanciero.toFixed(0)}%</td>
          </tr>
        `
      )
      .join('');

    printWindow.document.write(`
      <!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>Reporte General</title>
          <style>
            @page { size: A4 landscape; margin: 12mm; }
            * { box-sizing: border-box; }
            body { margin: 0; font-family: Arial, sans-serif; color: #17304d; }
            .header { padding: 22px; color: #fff; background: #07579b; border-radius: 14px; }
            .header h1 { margin: 0 0 6px; }
            .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 18px 0; }
            .card { padding: 12px; border: 1px solid #d7e0e9; border-radius: 10px; }
            .card span { display: block; color: #6e7d8d; font-size: 10px; text-transform: uppercase; }
            .card b { display: block; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 9px; border: 1px solid #d7e0e9; font-size: 11px; text-align: left; }
            th { color: #fff; background: #07579b; }
            .footer { margin-top: 20px; text-align: center; color: #6e7d8d; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>REPORTE GENERAL</h1>
            <p>CONSTRUPLATA SRL · Generado ${fechaRD(today())}</p>
          </div>

          <div class="cards">
            <div class="card"><span>Total contratado</span><b>${money(totalContratado)}</b></div>
            <div class="card"><span>Total cobrado</span><b>${money(totalCobrado)}</b></div>
            <div class="card"><span>Total gastado</span><b>${money(totalGastos)}</b></div>
            <div class="card"><span>Resultado provisional</span><b>${money(resultadoGeneral)}</b></div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Proyecto</th>
                <th>Estado</th>
                <th>Contratado</th>
                <th>Cobrado</th>
                <th>Gastos</th>
                <th>Resultado</th>
                <th>Avance físico</th>
                <th>Avance financiero</th>
              </tr>
            </thead>
            <tbody>${projectRows}</tbody>
          </table>

          <div class="footer">Documento generado desde CONSTRUPLATA PRO</div>

          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const printProject = (project: ProyectoReporte) => {
    const client = data.clientes.find((item) => item.id === project.clienteId);

    const printWindow = window.open('', '_blank', 'width=900,height=900');

    if (!printWindow) {
      window.alert('Habilita las ventanas emergentes para imprimir.');
      return;
    }

    printWindow.document.write(`
      <!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>${project.nombre}</title>
          <style>
            @page { size: A4; margin: 16mm; }
            * { box-sizing: border-box; }
            body { margin: 0; font-family: Arial, sans-serif; color: #17304d; }
            .header { padding: 24px; color: #fff; background: #07579b; border-radius: 14px; }
            .header h1 { margin: 0 0 6px; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 18px; }
            .box { padding: 14px; border: 1px solid #d7e0e9; border-radius: 10px; }
            .box span { display: block; color: #6e7d8d; font-size: 10px; text-transform: uppercase; }
            .box b { display: block; margin-top: 6px; }
            .footer { margin-top: 35px; text-align: center; color: #6e7d8d; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>REPORTE DE PROYECTO</h1>
            <p>${project.nombre}</p>
          </div>

          <div class="grid">
            <div class="box"><span>Cliente</span><b>${client?.nombre || 'Sin cliente'}</b></div>
            <div class="box"><span>Estado</span><b>${project.estado}</b></div>
            <div class="box"><span>Cotización</span><b>${project.numero}</b></div>
            <div class="box"><span>Monto contratado</span><b>${money(project.monto)}</b></div>
            <div class="box"><span>Total cobrado</span><b>${money(project.cobrado)}</b></div>
            <div class="box"><span>Balance pendiente</span><b>${money(project.balance)}</b></div>
            <div class="box"><span>Total facturado</span><b>${money(project.facturado)}</b></div>
            <div class="box"><span>Total gastado</span><b>${money(project.gastos)}</b></div>
            <div class="box"><span>Resultado provisional</span><b>${money(project.resultado)}</b></div>
            <div class="box"><span>Margen provisional</span><b>${project.margen.toFixed(1)}%</b></div>
            <div class="box"><span>Avance físico</span><b>${project.avanceFisico.toFixed(0)}%</b></div>
            <div class="box"><span>Avance financiero</span><b>${project.avanceFinanciero.toFixed(0)}%</b></div>
          </div>

          <div class="footer">Documento generado desde CONSTRUPLATA PRO</div>

          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <>
      <div className="reports-top">
        <div className="reports-banner">
          <BarChart3 size={22} />
          <div>
            <b>Centro de análisis financiero y operativo</b>
            <span>
              Compara cobros, gastos, facturación, balances y avances de cada
              proyecto.
            </span>
          </div>
        </div>

        <button type="button" className="primary" onClick={printGeneral}>
          <Printer size={18} />
          Imprimir reporte
        </button>
      </div>

      <section className="stats">
        <article className="stat">
          <FolderKanban size={21} />
          <span>Total contratado</span>
          <b>{money(totalContratado)}</b>
        </article>

        <article className="stat">
          <WalletCards size={21} />
          <span>Total cobrado</span>
          <b>{money(totalCobrado)}</b>
        </article>

        <article className="stat">
          <ReceiptText size={21} />
          <span>Total gastado</span>
          <b>{money(totalGastos)}</b>
        </article>

        <article className="stat">
          <TrendingUp size={21} />
          <span>Resultado provisional</span>
          <b>{money(resultadoGeneral)}</b>
        </article>
      </section>

      <section className="report-filters">
        <label>
          Proyecto
          <select
            value={projectFilter}
            onChange={(event) => setProjectFilter(event.target.value)}
          >
            <option value="todos">Todos los proyectos</option>
            {proyectos.map((project) => (
              <option key={project.id} value={project.id}>
                {project.nombre}
              </option>
            ))}
          </select>
        </label>

        <label>
          Desde
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
          />
        </label>

        <label>
          Hasta
          <input
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
          />
        </label>
      </section>

      <section className="summary-grid">
        <article>
          <span>Balance pendiente</span>
          <b>{money(totalBalance)}</b>
        </article>

        <article>
          <span>Margen provisional</span>
          <b>{margenGeneral.toFixed(1)}%</b>
        </article>

        <article>
          <span>Facturas pendientes</span>
          <b>{facturasPendientes}</b>
        </article>

        <article>
          <span>Proyectos activos</span>
          <b>{filteredProjects.filter((project) => project.estado === 'Activo').length}</b>
        </article>
      </section>

      <div className="report-project-grid">
        {filteredProjects.map((project) => {
          const client = data.clientes.find(
            (item) => item.id === project.clienteId
          );

          return (
            <article className="report-project-card" key={project.id}>
              <div className="report-project-head">
                <div>
                  <span className="project-state">{project.estado}</span>
                  <h3>{project.nombre}</h3>
                  <p>
                    {project.numero.replace('COT-', '#')} ·{' '}
                    {client?.nombre || 'Sin cliente'}
                  </p>
                </div>

                <div className="report-actions">
                  <button
                    type="button"
                    className="project-view-button"
                    onClick={() => setSelectedProjectId(project.id)}
                    title="Ver detalle"
                  >
                    <Eye size={18} />
                  </button>

                  <button
                    type="button"
                    className="project-view-button"
                    onClick={() => printProject(project)}
                    title="Imprimir proyecto"
                  >
                    <Printer size={18} />
                  </button>
                </div>
              </div>

              <div className="progress-block">
                <div className="progress-copy">
                  <span>Avance físico</span>
                  <b>{project.avanceFisico.toFixed(0)}%</b>
                </div>
                <div className="progress large">
                  <i style={{ width: `${project.avanceFisico}%` }} />
                </div>
              </div>

              <div className="progress-block">
                <div className="progress-copy">
                  <span>Avance financiero</span>
                  <b>{project.avanceFinanciero.toFixed(0)}%</b>
                </div>
                <div className="progress large financial">
                  <i style={{ width: `${project.avanceFinanciero}%` }} />
                </div>
              </div>

              <div className="report-money-grid">
                <div>
                  <span>Contratado</span>
                  <b>{money(project.monto)}</b>
                </div>
                <div>
                  <span>Cobrado</span>
                  <b>{money(project.cobrado)}</b>
                </div>
                <div>
                  <span>Gastado</span>
                  <b>{money(project.gastos)}</b>
                </div>
                <div>
                  <span>Resultado</span>
                  <b>{money(project.resultado)}</b>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <section className="category-report">
        <div>
          <span className="eyebrow">Gastos</span>
          <h3>Distribución por categoría</h3>
        </div>

        <div className="category-list">
          {gastoPorCategoria.length ? (
            gastoPorCategoria.map((item) => (
              <div key={item.categoria}>
                <span>{item.categoria}</span>
                <b>{money(item.monto)}</b>
              </div>
            ))
          ) : (
            <p>No hay gastos registrados en el período seleccionado.</p>
          )}
        </div>
      </section>

      {selectedProject && (
        <div
          className="cp-modal-overlay"
          onClick={() => setSelectedProjectId(null)}
        >
          <div
            className="report-detail-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="report-detail-head">
              <div>
                <span className="eyebrow">Reporte del proyecto</span>
                <h2>{selectedProject.nombre}</h2>
                <p>{selectedProject.estado}</p>
              </div>

              <button
                type="button"
                className="icon"
                onClick={() => setSelectedProjectId(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="report-detail-grid">
              <div>
                <FileText size={18} />
                <span>Contratado</span>
                <b>{money(selectedProject.monto)}</b>
              </div>
              <div>
                <WalletCards size={18} />
                <span>Cobrado</span>
                <b>{money(selectedProject.cobrado)}</b>
              </div>
              <div>
                <ReceiptText size={18} />
                <span>Balance</span>
                <b>{money(selectedProject.balance)}</b>
              </div>
              <div>
                <TrendingUp size={18} />
                <span>Resultado</span>
                <b>{money(selectedProject.resultado)}</b>
              </div>
              <div>
                <FileText size={18} />
                <span>Facturado</span>
                <b>{money(selectedProject.facturado)}</b>
              </div>
              <div>
                <ReceiptText size={18} />
                <span>Pendiente facturas</span>
                <b>{money(selectedProject.pendienteFacturas)}</b>
              </div>
            </div>

            <div className="report-detail-actions">
              <button
                type="button"
                className="primary"
                onClick={() => printProject(selectedProject)}
              >
                <Printer size={17} />
                Imprimir reporte
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .reports-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .reports-banner {
          flex: 1;
          min-height: 62px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid var(--line);
          border-radius: 17px;
          color: var(--blue);
          background: rgba(23, 105, 224, 0.07);
        }

        .reports-banner b,
        .reports-banner span {
          display: block;
        }

        .reports-banner span {
          margin-top: 4px;
          color: var(--muted);
          font-size: 12px;
        }

        .report-filters {
          margin: 22px 0;
          padding: 16px;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 12px;
          border: 1px solid var(--line);
          border-radius: 17px;
          background: var(--card);
        }

        .report-filters label {
          display: grid;
          gap: 6px;
          color: var(--muted);
          font-size: 11px;
          font-weight: 800;
        }

        .report-filters select,
        .report-filters input {
          min-height: 44px;
          padding: 0 12px;
          border: 1px solid var(--line);
          border-radius: 12px;
          color: var(--text);
          background: var(--card);
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 22px;
        }

        .summary-grid article {
          padding: 17px;
          border: 1px solid var(--line);
          border-radius: 16px;
          background: var(--card);
        }

        .summary-grid span,
        .summary-grid b {
          display: block;
        }

        .summary-grid span {
          color: var(--muted);
          font-size: 10px;
        }

        .summary-grid b {
          margin-top: 6px;
          font-size: 18px;
        }

        .report-project-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .report-project-card {
          padding: 22px;
          border: 1px solid var(--line);
          border-radius: 22px;
          background: var(--card);
          box-shadow: var(--soft-shadow);
        }

        .report-project-head {
          display: flex;
          justify-content: space-between;
          gap: 14px;
        }

        .report-project-card h3 {
          margin: 10px 0 5px;
          font-size: 20px;
        }

        .report-project-card p {
          margin: 0;
          color: var(--muted);
          font-size: 12px;
        }

        .project-state {
          display: inline-flex;
          padding: 6px 9px;
          border-radius: 999px;
          color: var(--blue);
          background: rgba(23, 105, 224, 0.1);
          font-size: 10px;
          font-weight: 900;
        }

        .report-actions {
          display: flex;
          gap: 7px;
        }

        .project-view-button {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border: 1px solid var(--line);
          border-radius: 13px;
          color: var(--blue);
          background: rgba(23, 105, 224, 0.07);
        }

        .progress-block {
          margin-top: 16px;
        }

        .progress-copy {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 7px;
        }

        .progress-copy span {
          color: var(--muted);
          font-size: 11px;
        }

        .financial i {
          background: linear-gradient(90deg, #14946b, #35c38f);
        }

        .report-money-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 9px;
          margin-top: 18px;
        }

        .report-money-grid > div {
          padding: 12px;
          border: 1px solid var(--line);
          border-radius: 13px;
        }

        .report-money-grid span,
        .report-money-grid b {
          display: block;
        }

        .report-money-grid span {
          color: var(--muted);
          font-size: 9px;
        }

        .report-money-grid b {
          margin-top: 5px;
          font-size: 12px;
        }

        .category-report {
          margin-top: 24px;
          padding: 20px;
          border: 1px solid var(--line);
          border-radius: 20px;
          background: var(--card);
        }

        .category-report h3 {
          margin: 6px 0 16px;
        }

        .category-list {
          display: grid;
          gap: 8px;
        }

        .category-list > div {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          padding: 12px 14px;
          border: 1px solid var(--line);
          border-radius: 12px;
        }

        .category-list span {
          color: var(--muted);
        }

        .report-detail-modal {
          width: min(820px, 100%);
          padding: 26px;
          border: 1px solid var(--line);
          border-radius: 24px;
          background: var(--card);
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.3);
        }

        .report-detail-head {
          display: flex;
          justify-content: space-between;
          gap: 18px;
        }

        .report-detail-head h2 {
          margin: 7px 0;
        }

        .report-detail-head p {
          margin: 0;
          color: var(--muted);
        }

        .report-detail-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 20px;
        }

        .report-detail-grid > div {
          padding: 14px;
          border: 1px solid var(--line);
          border-radius: 14px;
        }

        .report-detail-grid svg {
          color: var(--blue);
        }

        .report-detail-grid span,
        .report-detail-grid b {
          display: block;
        }

        .report-detail-grid span {
          margin-top: 8px;
          color: var(--muted);
          font-size: 10px;
        }

        .report-detail-grid b {
          margin-top: 5px;
        }

        .report-detail-actions {
          margin-top: 20px;
          display: flex;
          justify-content: flex-end;
        }

        @media (max-width: 900px) {
          .reports-top {
            align-items: stretch;
            flex-direction: column;
          }

          .report-project-grid {
            grid-template-columns: 1fr;
          }

          .summary-grid,
          .report-money-grid,
          .report-detail-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 620px) {
          .report-filters,
          .summary-grid,
          .report-money-grid,
          .report-detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
