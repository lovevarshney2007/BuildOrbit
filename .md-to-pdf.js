module.exports = {
  pdf_options: {
    format: 'A4',
    margin: '20mm',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `<style>section { margin: 0 auto; font-family: system-ui, sans-serif; font-size: 10px; color: #666; }</style><section><span>BuildOrbit Platform</span></section>`,
    footerTemplate: `<style>section { margin: 0 auto; font-family: system-ui, sans-serif; font-size: 10px; color: #666; }</style><section><span class="pageNumber"></span> / <span class="totalPages"></span></section>`
  },
  css: `
    body { font-family: "Inter", "Segoe UI", system-ui, sans-serif; color: #1a1a1a; line-height: 1.6; }
    h1, h2, h3, h4 { color: #0a0a0a; border-bottom: 1px solid #eaeaea; padding-bottom: 8px; margin-top: 24px; }
    h1 { font-size: 28px; font-weight: 800; border-bottom: 2px solid #000; }
    h2 { font-size: 22px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; page-break-inside: avoid; font-size: 11px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; }
    th { background-color: #f4f4f5; font-weight: 600; }
    a { color: #000; text-decoration: none; border-bottom: 1px solid #ccc; }
    code { background: #f4f4f5; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; }
    pre { background: #0a0a0a; color: #fff; padding: 16px; border-radius: 8px; font-family: monospace; white-space: pre-wrap; word-break: break-all; page-break-inside: avoid; font-size: 12px; }
    blockquote { border-left: 4px solid #000; margin-left: 0; padding-left: 16px; color: #555; }
    .page-break { page-break-before: always; }
  `,
  launch_options: {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
};
