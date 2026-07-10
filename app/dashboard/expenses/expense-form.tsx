"use client";

import { useActionState, useState } from "react";
import { addExpense, type ActionState } from "./actions";
import { Loader2, Calendar, Receipt, UploadCloud, FileText, CheckCircle2, Repeat } from "lucide-react";

export function ExpenseForm() {
  const initialState: ActionState = {};
  const [state, formAction, isPending] = useActionState(addExpense, initialState);
  const [fileName, setFileName] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
    else setFileName(null);
  };

  return (
    <form action={formAction} className="bg-white border border-border rounded-3xl p-5 md:p-6 space-y-5 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-terracotta-dim p-2 rounded-lg border border-terracotta/30">
          <Receipt className="text-terracotta-hover" size={20} />
        </div>
        <div>
          <h2 className="text-lg font-heading font-semibold text-teal leading-tight">Record Expense</h2>
          <p className="text-[10px] text-ink-mute font-medium mt-0.5">Log an outgoing payment</p>
        </div>
      </div>

      {state?.error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center font-bold">{state.error}</div>}
      {state?.success && <div className="p-3 bg-success-soft border border-success/30 rounded-xl text-success text-sm text-center font-bold flex items-center justify-center gap-2"><CheckCircle2 size={16}/> {state.success}</div>}

      <div className="space-y-4">
        <div>
          <label className="text-[10px] text-ink-mute uppercase font-bold tracking-wider mb-1 block pl-1">Description</label>
          <input name="title" placeholder="e.g., Electric Bill, Shop Rent" required className="bg-white border border-border p-3 rounded-xl w-full text-sm focus:border-terracotta outline-none text-ink shadow-sm" />
        </div>
        <div>
          <label className="text-[10px] text-ink-mute uppercase font-bold tracking-wider mb-1 block pl-1">Payee / Vendor Name</label>
          <input name="vendor_name" placeholder="e.g., GEPCO, Ali Plumber" className="bg-white border border-border p-3 rounded-xl w-full text-sm focus:border-terracotta outline-none text-ink shadow-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] text-ink-mute uppercase font-bold tracking-wider mb-1 block pl-1">Amount (Rs)</label>
          <input name="amount" type="number" required placeholder="0" className="bg-white border border-border p-3 rounded-xl w-full text-sm font-bold text-terracotta-hover focus:border-terracotta outline-none shadow-sm" />
        </div>
        <div>
          <label className="text-[10px] text-ink-mute uppercase font-bold tracking-wider mb-1 block pl-1">Tax / GST (Optional)</label>
          <input name="tax_amount" type="number" placeholder="0" className="bg-white border border-border p-3 rounded-xl w-full text-sm font-medium focus:border-terracotta outline-none shadow-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] text-ink-mute uppercase font-bold tracking-wider mb-1 block pl-1">Category</label>
          <select name="category" className="bg-white border border-border p-3 rounded-xl w-full text-sm font-medium focus:border-terracotta outline-none shadow-sm">
            <option value="Utilities">Utilities</option>
            <option value="Salary">Salary</option>
            <option value="Rent">Rent</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Supplies">Supplies</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] text-ink-mute uppercase font-bold tracking-wider mb-1 block pl-1">Paid Via</label>
          <select name="payment_method" className="bg-white border border-border p-3 rounded-xl w-full text-sm font-medium focus:border-terracotta outline-none shadow-sm">
            <option value="Cash">Cash (Drawer)</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Online Wallet">Online Wallet</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-[10px] text-ink-mute uppercase font-bold tracking-wider mb-1 block pl-1">Date</label>
        <div className="relative">
          <input name="expense_date" type="date" defaultValue={today} required className="bg-white border border-border p-3 rounded-xl w-full text-sm font-medium focus:border-terracotta outline-none text-ink-dim relative [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:opacity-0 z-10 bg-transparent shadow-sm" />
          <Calendar className="absolute right-3 top-3 text-terracotta z-0" size={18} />
        </div>
      </div>

      {/* Naya Recurring Checkbox */}
      <label className="flex items-center gap-3 p-3 bg-cream/50 border border-border rounded-xl cursor-pointer hover:bg-cream transition-colors">
        <input type="checkbox" name="is_recurring" className="w-5 h-5 accent-terracotta rounded" />
        <div className="flex flex-col">
          <span className="text-sm font-bold text-ink flex items-center gap-1"><Repeat size={14} className="text-terracotta"/> Recurring Expense</span>
          <span className="text-[10px] text-ink-mute">This happens automatically every month (e.g. Rent)</span>
        </div>
      </label>

      {/* File Upload (Receipt) */}
      <div className="relative border-2 border-dashed border-border hover:border-terracotta/50 bg-cream/50 rounded-xl p-4 transition-colors text-center cursor-pointer group">
        <input type="file" name="receipt" accept="image/*,application/pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
        <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
          {fileName ? (
            <><FileText className="text-teal" size={24} /><span className="text-xs font-bold text-teal">{fileName}</span></>
          ) : (
            <><UploadCloud className="text-ink-mute group-hover:text-terracotta" size={24} /><span className="text-xs font-medium text-ink-dim">Upload bill image or PDF</span></>
          )}
        </div>
      </div>

      <button type="submit" disabled={isPending} className="w-full bg-terracotta hover:bg-terracotta-hover text-white font-bold py-3.5 rounded-xl shadow-md disabled:opacity-70 flex items-center justify-center gap-2">
        {isPending ? <><Loader2 className="animate-spin" size={18} /> Saving...</> : "Log Expense"}
      </button>
    </form>
  );
}