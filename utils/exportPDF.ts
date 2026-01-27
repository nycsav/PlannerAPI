/**
 * Export Intelligence Brief to PDF
 * Uses browser's native print-to-PDF functionality
 */

export interface PDFExportData {
  query: string;
  summary: string;
  keySignals: string[];
  movesForLeaders: string[];
  signals?: Array<{
    sourceName: string;
    sourceUrl: string;
  }>;
  frameworks?: Array<{
    label: string;
    actions: string[];
  }>;
}

export function exportIntelligenceBriefToPDF(data: PDFExportData) {
  // Clean markdown asterisks and citation numbers from text
  // PRD requirement: Citation numbers should not appear in Moves for Leaders
  const cleanText = (text: string) => {
    return text
      .replace(/\*\*/g, '') // Remove markdown bold
      .replace(/\[\d+\](\[\d+\])*/g, '') // Remove citation numbers like [1], [2][3]
      .trim();
  };

  // Create a new window with print-optimized content
  const printWindow = window.open('', '', 'width=800,height=600');

  if (!printWindow) {
    alert('Please allow popups to download PDF');
    return;
  }

  // Build HTML content
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Intelligence Brief - ${cleanText(data.query)}</title>
      <style>
        @page {
          size: A4;
          margin: 20mm;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Helvetica', 'Arial', sans-serif;
          line-height: 1.6;
          color: #000;
          max-width: 210mm;
          margin: 0 auto;
          padding: 20px;
        }

        .header {
          background-color: #1B365D;
          color: white;
          padding: 15px 20px;
          margin: -20px -20px 30px -20px;
        }

        .header h1 {
          font-size: 24px;
          font-weight: bold;
          letter-spacing: 2px;
        }

        .query-label {
          font-size: 10px;
          text-transform: uppercase;
          color: #666;
          margin-bottom: 5px;
          letter-spacing: 1px;
        }

        .query-text {
          font-size: 12px;
          color: #1B365D;
          margin-bottom: 20px;
          font-weight: 600;
        }

        .main-title {
          font-size: 28px;
          font-weight: bold;
          text-transform: uppercase;
          color: #1B365D;
          margin-bottom: 25px;
          letter-spacing: 1px;
        }

        .section {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }

        .section-title {
          font-size: 16px;
          font-weight: bold;
          text-transform: uppercase;
          color: #1B365D;
          margin-bottom: 10px;
          border-bottom: 2px solid #1B365D;
          padding-bottom: 5px;
        }

        .section-content {
          font-size: 11px;
          line-height: 1.7;
        }

        .list-item {
          margin-bottom: 8px;
          padding-left: 20px;
          position: relative;
        }

        .list-item:before {
          content: "•";
          position: absolute;
          left: 0;
          color: #FF6B35;
          font-weight: bold;
          font-size: 14px;
        }

        .framework {
          margin-bottom: 15px;
        }

        .framework-title {
          font-size: 12px;
          font-weight: bold;
          color: #000;
          margin-bottom: 5px;
        }

        .framework-action {
          margin-left: 15px;
          margin-bottom: 5px;
          font-size: 10px;
        }

        .sources {
          page-break-inside: avoid;
        }

        .source-item {
          margin-bottom: 8px;
          font-size: 10px;
        }

        .source-link {
          color: #2563EB;
          text-decoration: none;
        }

        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ccc;
          font-size: 9px;
          color: #666;
          display: flex;
          justify-content: space-between;
        }

        @media print {
          body {
            padding: 0;
          }

          .header {
            margin: 0;
          }

          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>PLANNERAPI</h1>
      </div>

      <div class="query-label">YOUR QUERY</div>
      <div class="query-text">${cleanText(data.query)}</div>

      <h1 class="main-title">Intelligence Brief</h1>

      <div class="section">
        <h2 class="section-title">Summary</h2>
        <div class="section-content">
          ${cleanText(data.summary)}
        </div>
      </div>

      ${data.keySignals && data.keySignals.length > 0 ? `
        <div class="section">
          <h2 class="section-title">Key Signals</h2>
          <div class="section-content">
            ${data.keySignals.map(signal => `
              <div class="list-item">${cleanText(signal)}</div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${data.movesForLeaders && data.movesForLeaders.length > 0 ? `
        <div class="section">
          <h2 class="section-title">Moves for Leaders</h2>
          <div class="section-content">
            ${data.movesForLeaders.map(move => `
              <div class="list-item">${cleanText(move)}</div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${data.frameworks && data.frameworks.length > 0 ? `
        <div class="section">
          <h2 class="section-title">Strategic Frameworks</h2>
          <div class="section-content">
            ${data.frameworks.map(framework => `
              <div class="framework">
                <div class="framework-title">${framework.label}</div>
                ${framework.actions.map(action => `
                  <div class="framework-action">• ${cleanText(action)}</div>
                `).join('')}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${data.signals && data.signals.length > 0 ? `
        <div class="section sources">
          <h2 class="section-title">Sources</h2>
          <div class="section-content">
            ${data.signals.map((signal, index) => `
              <div class="source-item">
                ${index + 1}. ${signal.sourceName}
                ${signal.sourceUrl && signal.sourceUrl !== '#' ? `<br><a href="${signal.sourceUrl}" class="source-link">${signal.sourceUrl}</a>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <div class="footer">
        <span>Generated by PlannerAPI</span>
        <span>${new Date().toLocaleDateString()}</span>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Wait for content to load, then trigger print dialog
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      // Close the print window after printing (user can cancel)
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    }, 250);
  };
}
