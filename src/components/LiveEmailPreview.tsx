import { useEffect, useRef } from 'react';

interface LiveEmailPreviewProps {
  renderedHtml: string;
}

export default function LiveEmailPreview({ renderedHtml }: LiveEmailPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;

      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body {
                  margin: 0;
                  padding: 20px;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  background: #f9fafb;
                }
                img {
                  max-width: 100%;
                  height: auto;
                }
              </style>
            </head>
            <body>
              ${renderedHtml}
            </body>
          </html>
        `);
        doc.close();
      }
    }
  }, [renderedHtml]);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="p-4 border-b bg-white">
        <h2 className="text-lg font-semibold text-gray-800">Live Preview</h2>
        <p className="text-xs text-gray-500 mt-1">
          Rendered email with current data
        </p>
      </div>

      <div className="flex-1 overflow-hidden p-4">
        <iframe
          ref={iframeRef}
          title="Email Preview"
          className="w-full h-full border border-gray-200 rounded-lg bg-white shadow-sm"
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  );
}
