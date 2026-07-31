export function printQuotationDocument() {
  const source = document.getElementById('quotation-print-area');

  if (!source) {
    window.alert('Primero abre la vista previa de la cotización.');
    return;
  }

  const oldFrame = document.getElementById(
    'quotation-print-frame'
  ) as HTMLIFrameElement | null;

  oldFrame?.remove();

  const frame = document.createElement('iframe');

  frame.id = 'quotation-print-frame';
  frame.setAttribute('title', 'Impresión de cotización');

  Object.assign(frame.style, {
    position: 'fixed',
    right: '0',
    bottom: '0',
    width: '0',
    height: '0',
    border: '0',
    visibility: 'hidden',
  });

  document.body.appendChild(frame);

  const frameWindow = frame.contentWindow;
  const frameDocument = frame.contentDocument;

  if (!frameWindow || !frameDocument) {
    frame.remove();
    window.alert('No se pudo preparar la impresión.');
    return;
  }

  const logo = source.querySelector('img');
  const absoluteLogoSrc = logo?.src || '';

  const clonedHtml = source.outerHTML.replace(
    /src="\/logo-construplata\.jpg"/g,
    `src="${absoluteLogoSrc}"`
  );

  frameDocument.open();
  frameDocument.write(`
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />

        <title>Cotización CONSTRUPLATA</title>

        <style>
          @page {
            size: A4 portrait;
            margin: 0;
          }

          * {
            box-sizing: border-box;
          }

          html,
          body {
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 0;
            overflow: hidden;
            font-family: Arial, Helvetica, sans-serif;
            color: #15253b;
            background: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          body {
            display: block;
          }

          .quotation-document {
            width: 210mm;
            height: 297mm;
            min-width: 210mm;
            min-height: 297mm;
            max-width: 210mm;
            max-height: 297mm;
            margin: 0;
            padding: 0 0 6mm;
            overflow: hidden;
            color: #15253b;
            background: #ffffff;
          }

          .quotation-document-header {
            display: grid;
            grid-template-columns: 46% 54%;
            gap: 7mm;
            padding: 9mm 12mm;
            color: #ffffff;
            background: linear-gradient(
              135deg,
              #062a56 0%,
              #07579b 100%
            );
          }

          .quotation-brand-block {
            min-width: 0;
          }

          .quotation-brand-block img {
            display: block;
            width: 25mm;
            height: 18mm;
            min-width: 25mm;
            min-height: 18mm;
            max-width: 25mm;
            max-height: 18mm;
            margin: 0;
            padding: 1.5mm;
            object-fit: contain;
            object-position: center;
            border-radius: 2.5mm;
            background: #ffffff;
          }

          .quotation-brand-block h2 {
            margin: 2.5mm 0 5mm;
            color: #ffffff;
            font-size: 18pt;
            line-height: 1.05;
          }

          .quotation-brand-block b,
          .quotation-brand-block span {
            display: block;
            color: #ffffff;
          }

          .quotation-brand-block b {
            font-size: 9pt;
          }

          .quotation-brand-block span {
            margin-top: 2mm;
            font-size: 8pt;
          }

          .quotation-document-info {
            min-width: 0;
            padding-left: 6mm;
            border-left: 0.3mm solid rgba(255, 255, 255, 0.72);
          }

          .quotation-document-info h1 {
            margin: 0 0 5mm;
            color: #ffffff;
            font-size: 20pt;
            line-height: 1.05;
          }

          .quotation-document-info > div {
            display: grid;
            grid-template-columns: 30mm minmax(0, 1fr);
            gap: 2mm;
            margin-top: 2mm;
            color: #ffffff;
            font-size: 8.5pt;
          }

          .quotation-document-info b,
          .quotation-document-info span {
            color: #ffffff;
            overflow-wrap: anywhere;
          }

          .quotation-description {
            margin: 6mm 12mm 4mm;
            padding-top: 4mm;
            border-top: 0.8mm solid #07579b;
          }

          .quotation-description h3 {
            margin: 0 0 3mm;
            color: #07579b;
            font-size: 11pt;
          }

          .quotation-description p {
            margin: 0;
            font-size: 9pt;
            line-height: 1.45;
          }

          .quotation-document-table {
            width: calc(100% - 24mm);
            margin: 0 12mm;
            table-layout: fixed;
            border-collapse: collapse;
          }

          .quotation-document-table th,
          .quotation-document-table td {
            padding: 2.2mm;
            border: 0.25mm solid #7c8792;
            font-size: 8pt;
            line-height: 1.25;
            vertical-align: top;
          }

          .quotation-document-table th {
            color: #ffffff;
            background: #07579b;
          }

          .quotation-document-table th:nth-child(1) {
            width: 52%;
          }

          .quotation-document-table th:nth-child(2) {
            width: 14%;
          }

          .quotation-document-table th:nth-child(3),
          .quotation-document-table th:nth-child(4) {
            width: 17%;
          }

          .quotation-document-table td small {
            display: block;
            margin-top: 1.2mm;
            color: #657386;
          }

          .quotation-document-table tr,
          .quotation-document-table td {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .quotation-document-bottom {
            display: grid;
            grid-template-columns: 1fr 72mm;
            gap: 6mm;
            align-items: start;
            margin: 4mm 12mm 0;
          }

          .quotation-validity {
            padding-top: 2mm;
            font-size: 8.5pt;
          }

          .quotation-document-totals {
            border: 0.25mm solid #687582;
          }

          .quotation-document-totals > div {
            display: flex;
            justify-content: space-between;
            gap: 3mm;
            padding: 2.2mm 3mm;
            border-bottom: 0.25mm solid #687582;
            font-size: 8.5pt;
          }

          .quotation-total-highlight {
            color: #ffffff;
            background: #07579b;
          }

          .quotation-total-highlight span,
          .quotation-total-highlight b {
            color: #ffffff;
          }

          .quotation-document-note {
            margin: 4mm 12mm;
            padding: 2.5mm 3mm;
            border-left: 1mm solid #07579b;
            color: #334458;
            background: #edf5fc;
            font-size: 8pt;
            line-height: 1.35;
          }

          .quotation-signatures {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24mm;
            margin: 14mm 18mm 0;
            text-align: center;
            font-size: 8.5pt;
          }

          .quotation-signatures span {
            display: block;
            border-top: 0.25mm solid #222222;
          }

          .quotation-signatures p {
            margin: 2mm 0 0;
          }

          .quotation-document footer {
            margin-top: 9mm;
            color: #07579b;
            text-align: center;
            font-size: 8.5pt;
          }

          .quotation-document-header,
          .quotation-document-bottom,
          .quotation-document-note,
          .quotation-signatures,
          .quotation-document footer {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          @media print {
            html,
            body,
            .quotation-document {
              width: 210mm !important;
              height: 297mm !important;
              margin: 0 !important;
              padding-left: 0 !important;
              padding-right: 0 !important;
              overflow: hidden !important;
            }
          }
        </style>
      </head>

      <body>
        ${clonedHtml}
      </body>
    </html>
  `);
  frameDocument.close();

  const runPrint = () => {
    window.setTimeout(() => {
      try {
        frameWindow.focus();
        frameWindow.print();
      } finally {
        window.setTimeout(() => frame.remove(), 1500);
      }
    }, 250);
  };

  const images = Array.from(frameDocument.images);

  if (!images.length) {
    runPrint();
    return;
  }

  let pending = images.length;

  const finishImage = () => {
    pending -= 1;

    if (pending <= 0) {
      runPrint();
    }
  };

  images.forEach((image) => {
    if (image.complete) {
      finishImage();
      return;
    }

    image.addEventListener('load', finishImage, { once: true });
    image.addEventListener('error', finishImage, { once: true });
  });
}
