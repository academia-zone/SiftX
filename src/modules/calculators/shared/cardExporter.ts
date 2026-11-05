/**
 * High-Resolution Card & Chart Exporter
 * Renders SVG / Canvas graphic nodes into crisp, downloadable PNG images
 * and supports 1-click PDF/Print triggers with 100% client-side privacy.
 */

export function downloadSvgAsPng(
  svgElement: SVGSVGElement,
  filename: string,
  scale: number = 2
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);

      const image = new Image();
      image.onload = () => {
        const width = svgElement.clientWidth || parseInt(svgElement.getAttribute('width') || '600', 10);
        const height = svgElement.clientHeight || parseInt(svgElement.getAttribute('height') || '400', 10);

        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }

        // Crisp rendering with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        URL.revokeObjectURL(blobURL);

        canvas.toBlob((pngBlob) => {
          if (!pngBlob) {
            reject(new Error('Failed to generate PNG blob'));
            return;
          }
          const pngUrl = URL.createObjectURL(pngBlob);
          const link = document.createElement('a');
          link.href = pngUrl;
          link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(pngUrl);
          resolve();
        }, 'image/png');
      };

      image.onerror = (e) => {
        URL.revokeObjectURL(blobURL);
        reject(e);
      };

      image.src = blobURL;
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Triggers native high-quality PDF print dialog for a specific element card
 */
export function printElementAsPdf(elementId: string, title: string = 'SiftX Report'): void {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }

  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) {
    window.print();
    return;
  }

  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((el) => el.outerHTML)
    .join('\n');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        ${styles}
        <style>
          body {
            background-color: white !important;
            padding: 30px !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            display: flex;
            justify-content: center;
          }
          .print-card-wrapper {
            max-width: 700px;
            width: 100%;
          }
          @media print {
            body { padding: 0 !important; }
            button, .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="print-card-wrapper">
          ${element.outerHTML}
        </div>
        <script>
          setTimeout(() => {
            window.print();
            window.close();
          }, 400);
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
}
