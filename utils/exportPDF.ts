/**
 * Export Intelligence Brief to PDF
 * Uses browser's native print-to-PDF functionality via hidden iframe.
 * Brand: signal2noise — dark theme, #0d1117 bg, #E67E22 accent.
 */

export interface PDFExportData {
  query: string;
  summary: string;
  keySignals: string[];
  movesForLeaders: string[];
  signals?: Array<{
    sourceName: string;
    sourceUrl: string;
    title?: string;
  }>;
  followUpMessages?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export function exportIntelligenceBriefToPDF(data: PDFExportData) {
  const cleanText = (text: string) =>
    text
      .replace(/\*\*/g, '')
      .replace(/\[\d+\](\[\d+\])*/g, '')
      .trim();

  const date = new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  });

  const movesHtml = (data.movesForLeaders || []).map((move, i) => {
    const label = i === 0 ? '<span class="monday-label">Your Monday move: </span>' : '';
    return `<li>${label}${cleanText(move)}</li>`;
  }).join('');

  const signalsHtml = (data.keySignals || []).map(s =>
    `<li>${cleanText(s)}</li>`
  ).join('');

  const sourcesHtml = (data.signals || [])
    .filter(s => s.sourceUrl && s.sourceUrl !== '#')
    .map((s, i) => {
      const name = s.title || s.sourceName || `Source ${i + 1}`;
      return `<div class="source-item">${i + 1}. ${name}<br><a href="${s.sourceUrl}">${s.sourceUrl}</a></div>`;
    }).join('');

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>signal2noise — ${cleanText(data.query)}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Helvetica Neue', 'Arial', sans-serif;
      background: #0d1117;
      color: #F5F5F5;
      line-height: 1.6;
      max-width: 210mm;
      margin: 0 auto;
      padding: 24px;
    }

    .header {
      background: #0d1117;
      border-bottom: 2px solid #E67E22;
      padding: 16px 0 12px;
      margin-bottom: 28px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .logo {
      font-family: 'Helvetica Neue', sans-serif;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: #F5F5F5;
    }

    .logo span { color: #E67E22; }

    .header-date {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: rgba(245, 245, 245, 0.45);
    }

    .query-label {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #E67E22;
      margin-bottom: 6px;
    }

    .query-text {
      font-size: 22px;
      font-weight: 700;
      color: #F5F5F5;
      margin-bottom: 28px;
      line-height: 1.25;
    }

    .section { margin-bottom: 24px; page-break-inside: avoid; }

    .section-title {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: #E67E22;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 1px solid rgba(230, 126, 34, 0.3);
    }

    .summary-text {
      font-size: 12px;
      line-height: 1.75;
      color: rgba(245, 245, 245, 0.85);
    }

    ul { list-style: none; padding: 0; }

    ul li {
      font-size: 11px;
      line-height: 1.65;
      color: rgba(245, 245, 245, 0.85);
      padding: 6px 0 6px 18px;
      border-bottom: 1px solid rgba(245, 245, 245, 0.06);
      position: relative;
    }

    ul li:last-child { border-bottom: none; }

    ul li::before {
      content: "—";
      position: absolute;
      left: 0;
      color: #E67E22;
      font-weight: 700;
    }

    .monday-label {
      color: #E67E22;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-size: 9px;
    }

    .source-item {
      font-size: 9px;
      color: rgba(245, 245, 245, 0.5);
      margin-bottom: 6px;
      line-height: 1.5;
    }

    .source-item a {
      color: rgba(230, 126, 34, 0.7);
      text-decoration: none;
    }

    .footer {
      margin-top: 40px;
      padding-top: 14px;
      border-top: 1px solid rgba(245, 245, 245, 0.1);
      display: flex;
      justify-content: space-between;
      font-size: 8px;
      color: rgba(245, 245, 245, 0.35);
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    @media print {
      body { background: #0d1117; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>

  <div class="header">
    <div class="logo">signal<span>2</span>noise</div>
    <div class="header-date">${date}</div>
  </div>

  <div class="query-label">Intelligence Brief</div>
  <div class="query-text">${cleanText(data.query)}</div>

  <div class="section">
    <div class="section-title">Summary</div>
    <div class="summary-text">${cleanText(data.summary)}</div>
  </div>

  ${signalsHtml ? `
  <div class="section">
    <div class="section-title">Signals</div>
    <ul>${signalsHtml}</ul>
  </div>` : ''}

  ${movesHtml ? `
  <div class="section">
    <div class="section-title">Moves for Leaders</div>
    <ul>${movesHtml}</ul>
  </div>` : ''}

  ${sourcesHtml ? `
  <div class="section">
    <div class="section-title">Sources</div>
    ${sourcesHtml}
  </div>` : ''}

  <div class="footer">
    <span>signals.ensolabs.ai</span>
    <span>Generated by signal2noise</span>
  </div>

</body>
</html>`;

  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  iframe.setAttribute('id', 'pdf-print-frame');

  const existingFrame = document.getElementById('pdf-print-frame');
  if (existingFrame) existingFrame.remove();

  document.body.appendChild(iframe);
  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc || !iframe.contentWindow) {
    alert('Unable to create print preview. Please try again.');
    iframe.remove();
    return;
  }

  iframeDoc.open();
  iframeDoc.write(htmlContent);
  iframeDoc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error('Print failed:', e);
    }
    setTimeout(() => iframe.remove(), 1000);
  }, 300);
}
