"use client";

import { DownloadCloud } from "lucide-react";

export function ExportPdfBtn() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          /* Hide Sidebar, Header, and interactive elements */
          nav, aside, button, form { display: none !important; }
          
          /* Format the main report area for A4 Paper */
          body { background: white; margin: 0; padding: 0; color: black; }
          #report-container { width: 100%; max-width: 100%; padding: 0; }
          
          /* Force background colors to print (KPI cards, charts) */
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          
          /* Break pages cleanly */
          .page-break { page-break-inside: avoid; }
        }
      `}} />

      <button 
        onClick={handlePrint}
        className="bg-ink hover:bg-ink-dim text-white font-bold py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md transition-all active:scale-95"
      >
        <DownloadCloud size={18} />
        Save as PDF Report
      </button>
    </>
  );
}