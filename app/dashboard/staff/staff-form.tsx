"use client";

import { useActionState } from "react";
import { addStaff, type ActionState } from "./actions";
import { Loader2, UserPlus, CheckCircle2 } from "lucide-react";

export function StaffForm() {
  const initialState: ActionState = {};
  const [state, formAction, isPending] = useActionState(addStaff, initialState);

  return (
    <form action={formAction} className="bg-white border border-border rounded-3xl p-5 md:p-6 space-y-5 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-terracotta-dim p-2 rounded-lg border border-terracotta/30">
          <UserPlus className="text-terracotta-hover" size={20} />
        </div>
        <div>
          <h2 className="text-lg font-heading font-semibold text-teal leading-tight">Register Employee</h2>
          <p className="text-[10px] text-ink-mute font-medium mt-0.5">Add a new user to the system</p>
        </div>
      </div>

      {state?.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center font-bold">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="p-3 bg-success-soft border border-success/30 rounded-xl text-success text-sm text-center font-bold flex items-center justify-center gap-2">
          <CheckCircle2 size={16}/> {state.success}
        </div>
      )}

      <div>
        <label className="text-[10px] text-ink-mute uppercase font-bold tracking-wider mb-1 block pl-1">Full Name</label>
        <input name="name" placeholder="e.g., Saad Hameed" required className="bg-white border border-border p-3 rounded-xl w-full text-sm focus:border-terracotta focus:ring-1 focus:ring-terracotta/30 outline-none text-ink transition-all shadow-sm" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] text-ink-mute uppercase font-bold tracking-wider mb-1 block pl-1">System Role</label>
          <select name="role" className="bg-white border border-border p-3 rounded-xl w-full text-sm font-medium focus:border-terracotta outline-none text-ink shadow-sm">
            <option value="Cashier">Cashier</option>
            <option value="Manager">Manager</option>
            <option value="Admin">Admin</option>
            <option value="Super Admin">Super Admin</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] text-ink-mute uppercase font-bold tracking-wider mb-1 block pl-1">Working Shift</label>
          <select name="shift" className="bg-white border border-border p-3 rounded-xl w-full text-sm font-medium focus:border-terracotta outline-none text-ink shadow-sm">
            <option value="Morning">Morning</option>
            <option value="Evening">Evening</option>
            <option value="Night">Night</option>
            <option value="Flexible">Flexible</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] text-ink-mute uppercase font-bold tracking-wider mb-1 block pl-1">Account Status</label>
          <select name="status" className="bg-white border border-border p-3 rounded-xl w-full text-sm font-medium focus:border-terracotta outline-none text-ink shadow-sm">
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] text-ink-mute uppercase font-bold tracking-wider mb-1 block pl-1">Base Salary (Rs)</label>
          <input name="base_salary" type="number" defaultValue="0" min="0" className="bg-white border border-border p-3 rounded-xl w-full text-sm font-bold focus:border-terracotta outline-none text-ink shadow-sm" />
        </div>
      </div>

      <div>
        <label className="text-[10px] text-ink-mute uppercase font-bold tracking-wider mb-1 block pl-1">Phone Number</label>
        <input name="phone" placeholder="03xx xxxxxxx" className="bg-white border border-border p-3 rounded-xl w-full text-sm focus:border-terracotta outline-none text-ink transition-all shadow-sm" />
      </div>

      <hr className="border-dashed border-border/50 my-2" />

      <div>
        <label className="text-[10px] text-ink-mute uppercase font-bold tracking-wider mb-1 block pl-1">Login Email</label>
        <input type="email" name="email" required placeholder="name@alazamat.com" className="bg-white border border-border p-3 rounded-xl w-full text-sm focus:border-terracotta outline-none text-ink transition-all shadow-sm" />
      </div>

      <div>
        <label className="text-[10px] text-ink-mute uppercase font-bold tracking-wider mb-1 block pl-1">Initial Password</label>
        <input type="password" name="password_hash" required placeholder="Temporary password..." className="bg-white border border-border p-3 rounded-xl w-full text-sm focus:border-terracotta outline-none text-ink transition-all shadow-sm" />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-terracotta hover:bg-terracotta-hover text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-terracotta/20 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
      >
        {isPending ? (
          <><Loader2 className="animate-spin" size={18} /> Registering...</>
        ) : (
          "Add Staff Member"
        )}
      </button>
    </form>
  );
}