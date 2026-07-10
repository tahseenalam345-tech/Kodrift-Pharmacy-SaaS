"use client";

import { useState } from "react";
import { Expense } from "@/types";
import { Trash2, Search, FileImage, X, Download, Repeat } from "lucide-react";
import { deleteExpense } from "./actions";
import Papa from "papaparse";

export function ExpenseList({ expenses }: { expenses: Expense[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [viewImage, setViewImage] = useState<string | null>(null);

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ((expense as any).vendor_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || expense.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Accountant ke liye Export Logic
  const handleExport = () => {
    const exportData = filteredExpenses.map(exp => ({
      Date: new Date(exp.expense_date).toLocaleDateString(),
      Description: exp.title,
      Vendor_Payee: (exp as any).vendor_name || "-",
      Category: exp.category,
      Amount: exp.amount,
      Tax_GST: (exp as any).tax_amount || 0,
      Total_Amount: Number(exp.amount) + Number((exp as any).tax_amount || 0),
      Payment_Mode: (exp as any).payment_method || "Cash",
      Is_Recurring: (exp as any).is_recurring ? "Yes" : "No"
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Expenses_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Search, Filter & Export */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-ink-mute" size={16} />
          </div>
          <input
            type="text"
            placeholder="Search by description or vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-border text-ink rounded-xl py-2 pl-10 pr-3 focus:border-terracotta outline-none text-sm shadow-sm"
          />
        </div>
        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-white border border-border text-ink rounded-xl py-2 px-3 focus:border-terracotta outline-none text-sm shadow-sm font-medium"
        >
          <option value="All">All Categories</option>
          <option value="Utilities">Utilities</option>
          <option value="Salary">Salary</option>
          <option value="Rent">Rent</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Supplies">Supplies</option>
          <option value="Other">Other</option>
        </select>
        
        <button 
          onClick={handleExport}
          className="bg-ink hover:bg-ink-dim text-white font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-sm transition-colors"
        >
          <Download size={16} /> Export
        </button>
      </div>

      {filteredExpenses.length === 0 ? (
        <div className="bg-white border border-border rounded-3xl p-12 text-center border-dashed">
          <p className="text-ink-mute">No expenses found.</p>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-ink-dim">
              <thead className="bg-cream text-ink-mute uppercase text-[10px] font-bold tracking-wider border-b border-border">
                <tr>
                  <th className="p-4">Date</th>
                  <th className="p-4">Description / Vendor</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-center">Receipt</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-cream/60 transition-colors group">
                    <td className="p-4 whitespace-nowrap text-xs text-ink-mute font-medium">
                      {new Date(expense.expense_date).toLocaleDateString('en-GB')}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-ink truncate max-w-[180px] flex items-center gap-2">
                        {expense.title} 
                        {/* TypeScript Error Fixed Here: Wrapped icon in a span with title */}
                        {(expense as any).is_recurring && <span title="Recurring"><Repeat size={12} className="text-terracotta" /></span>}
                      </div>
                      <div className="text-[10px] text-ink-mute">{(expense as any).vendor_name || "No Vendor"}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-teal-soft rounded border border-teal/20 text-teal text-[10px] font-bold uppercase inline-flex">
                        {expense.category}
                      </span>
                      <div className="text-[9px] text-ink-mute mt-1">{(expense as any).payment_method || "Cash"}</div>
                    </td>
                    <td className="p-4 text-center">
                      {(expense as any).receipt_url ? (
                        <button onClick={() => setViewImage((expense as any).receipt_url)} className="text-teal bg-teal-soft p-1.5 rounded-lg mx-auto block hover:bg-teal hover:text-white transition-colors">
                          <FileImage size={16} />
                        </button>
                      ) : (
                        <span className="text-[10px] text-ink-mute/50 italic">-</span>
                      )}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="font-bold text-terracotta-hover">Rs {Number(expense.amount).toLocaleString()}</div>
                      {(expense as any).tax_amount > 0 && <div className="text-[9px] text-ink-mute mt-0.5">+ Rs {(expense as any).tax_amount} Tax</div>}
                    </td>
                    <td className="p-4 text-center">
                      <form action={deleteExpense}>
                        <input type="hidden" name="id" value={expense.id} />
                        <button type="submit" className="text-ink-mute hover:text-red-600 transition-colors p-2 bg-transparent hover:bg-red-50 rounded-lg mx-auto block">
                          <Trash2 size={16} />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {viewImage && (
        <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setViewImage(null)}>
          <div className="bg-white rounded-2xl p-2 relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewImage(null)} className="absolute -top-4 -right-4 bg-red-500 text-white p-2 rounded-full shadow-lg z-10"><X size={20} /></button>
            <div className="w-full h-[60vh] relative bg-cream rounded-xl flex items-center justify-center overflow-hidden">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img src={viewImage} alt="Receipt" className="max-w-full max-h-full object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}