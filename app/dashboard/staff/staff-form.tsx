"use client";

import { useActionState, useState } from "react";
import { addStaff, type ActionState } from "./actions";
import { Loader2, UserPlus, CheckCircle2, Lock, Tag, Trash, BarChart2, UploadCloud, FileText, Percent } from "lucide-react";

export function StaffForm() {
  const initialState: ActionState = {};
  const [state, formAction, isPending] = useActionState(addStaff, initialState);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileName(file ? file.name : null);
  };

  return (
    <form action={formAction} className="bg-white border border-border rounded-3xl p-5 md:p-6 space-y-5 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-terracotta-dim p-2 rounded-lg border border-terracotta/30">
          <UserPlus className="text-terracotta-hover" size={20} />
        </div>
        <div>
          <h2 className="text-lg font-heading font-semibold text-teal leading-tight">Register Employee</h2>
          <p className="text-[10px] text-ink-mute font-medium mt-0.5">Add user & set permissions</p>
        </div>
      </div>

      {state?.error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center font-bold">{state.error}</div>}
      {state?.success && <div className="p-3 bg-success-soft border border-success/30 rounded-xl text-success text-sm text-center font-bold flex items-center justify-center gap-2"><CheckCircle2 size={16}/> {state.success}</div>}

      <div>
        <label className="text-[10px] text-ink-mute uppercase font-bold tracking-wider mb-1 block pl-1">Full Name</label>
        <input name="name" placeholder="e.g., Saad Hameed" required className="bg-white border border-border p-3 rounded-xl w-full text-sm focus:border-terracotta outline-none text-ink shadow-sm" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] text-ink-mute uppercase font-bold tracking-wider mb-1 block pl-1">System Role</label>
          <select name="role" className="bg-white border border-border p-3 rounded-xl w-full text-sm font-medium focus:border-terracotta outline-none text-ink shadow-sm">
            <option value="Cashier">Cashier</option>
            <option value="Manager">Manager</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] text-ink-mute uppercase font-bold tracking-wider mb-1 block pl-1">Working Shift</label>
          <select name="shift" className="bg-white border border-border p-3 rounded-xl w-full text-sm font-medium focus:border-terracotta outline-none text-ink shadow-sm">
            <option value="Morning">Morning</option>
            <option value="Evening">Evening</option>
            <option value="Night">Night</option>
          </select>
        </div>
      </div>

      {/* NEW: Salary and Commission */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] text-ink-mute uppercase font-bold tracking-wider mb-1 block pl-1">Base Salary (Rs)</label>
          <input name="base_salary" type="number" defaultValue="0" min="0" className="bg-white border border-border p-3 rounded-xl w-full text-sm font-bold focus:border-terracotta outline-none text-ink shadow-sm" />
        </div>
        <div>
          <label className="text-[10px] text-ink-mute uppercase font-bold tracking-wider mb-1 block pl-1 flex items-center gap-1">Sales Commission <Percent size={10}/></label>
          <input name="commission_rate" type="number" step="0.1" defaultValue="0" min="0" max="100" className="bg-white border border-border p-3 rounded-xl w-full text-sm font-bold text-teal focus:border-terracotta outline-none shadow-sm" />
        </div>
      </div>

      <div className="bg-cream/50 border border-border rounded-xl p-4 space-y-3">
        <h3 className="text-[10px] font-bold text-ink-dim uppercase tracking-wider flex items-center gap-1 mb-2"><Lock size={12}/> Security Access Control</h3>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" name="can_give_discount" className="w-4 h-4 accent-terracotta rounded" />
          <span className="text-xs font-bold text-ink flex items-center gap-1"><Tag size={12} className="text-teal"/> Allow Manual Discounts</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" name="can_delete_sales" className="w-4 h-4 accent-terracotta rounded" />
          <span className="text-xs font-bold text-ink flex items-center gap-1"><Trash size={12} className="text-red-500"/> Allow Deleting/Refunding</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" name="can_view_reports" className="w-4 h-4 accent-terracotta rounded" />
          <span className="text-xs font-bold text-ink flex items-center gap-1"><BarChart2 size={12} className="text-teal"/> Access Financial Reports</span>
        </label>
      </div>

      <hr className="border-dashed border-border/50 my-2" />

      <div>
        <label className="text-[10px] text-ink-mute uppercase font-bold tracking-wider mb-1 block pl-1">Upload CNIC / License</label>
        <div className="relative border-2 border-dashed border-border hover:border-terracotta/50 bg-cream/50 rounded-xl p-4 transition-colors text-center cursor-pointer group">
          <input type="file" name="cnic_document" accept="image/*,application/pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
          <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
            {fileName ? (
              <><FileText className="text-teal" size={24} /><span className="text-xs font-bold text-teal">{fileName}</span></>
            ) : (
              <><UploadCloud className="text-ink-mute group-hover:text-terracotta" size={24} /><span className="text-xs font-medium text-ink-dim">Tap to upload staff document</span></>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] text-ink-mute uppercase font-bold tracking-wider mb-1 block pl-1">Login Email</label>
          <input type="email" name="email" required placeholder="name@kodrift.com" className="bg-white border border-border p-3 rounded-xl w-full text-sm focus:border-terracotta outline-none text-ink shadow-sm" />
        </div>
        <div>
          <label className="text-[10px] text-ink-mute uppercase font-bold tracking-wider mb-1 block pl-1">Password</label>
          <input type="password" name="password_hash" required placeholder="Password..." className="bg-white border border-border p-3 rounded-xl w-full text-sm focus:border-terracotta outline-none text-ink shadow-sm" />
        </div>
      </div>

      <button type="submit" disabled={isPending} className="w-full bg-terracotta hover:bg-terracotta-hover text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2">
        {isPending ? <><Loader2 className="animate-spin" size={18} /> Registering...</> : "Add Staff Member"}
      </button>
    </form>
  );
}