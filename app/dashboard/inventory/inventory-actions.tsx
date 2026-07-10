"use client";

import { useState, useRef, useTransition } from "react";
import { Download, FileDown, FileUp, Loader2 } from "lucide-react";
import Papa from "papaparse";
import { Medicine } from "@/types";
import { bulkImportMedicines } from "./actions"; // Backend action import kiya

export function InventoryCSVManager({ inventory }: { inventory: Medicine[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const exportData = inventory.map(item => ({
      Name: item.name,
      Brand: item.brand,
      Formula: item.formula,
      Category: item.category,
      Stock: item.stock,
      Cost_Price: item.cost_price,
      Sale_Price: item.sale_price,
      Expiry_Date: item.expiry_date || '',
      Pack_Size: item.pack_size || 1,
      Potency: item.potency || ''
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Inventory_Backup_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsOpen(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Yahan par Backend Server Action Call ho rahi hai
        startTransition(async () => {
          try {
            const res = await bulkImportMedicines(results.data);
            if (res.success) {
              alert(`Successfully imported ${res.count} items!`);
            }
          } catch (error: any) {
            alert(`Error importing data: ${error.message}`);
          } finally {
            setIsOpen(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }
        });
      },
      error: (error) => {
        alert("Error parsing CSV: " + error.message);
      }
    });
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="p-2 bg-white border border-border rounded-xl text-ink-dim hover:text-teal hover:border-teal transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
      >
        {isPending ? <Loader2 size={20} className="animate-spin text-teal" /> : <Download size={20} />}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-border rounded-2xl shadow-lg z-50 overflow-hidden animate-rise">
          <div className="p-2 flex flex-col gap-1">
            <button onClick={handleExport} className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-ink hover:bg-cream hover:text-teal flex items-center gap-3 transition-colors">
              <FileDown size={16} className="text-teal" />
              Export to CSV (Excel)
            </button>
            <div className="w-full h-px bg-border/50 my-1"></div>
            <button onClick={() => fileInputRef.current?.click()} className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-ink hover:bg-cream hover:text-terracotta flex items-center gap-3 transition-colors">
              <FileUp size={16} className="text-terracotta" />
              Import CSV File
            </button>
            <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImport} className="hidden" />
          </div>
        </div>
      )}
    </div>
  );
}