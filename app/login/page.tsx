"use client";

import { useActionState } from "react";
import { processLogin } from "./actions";
import { Shield, Loader2, UserCircle, KeyRound, Mail } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(processLogin, undefined);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">

      <Link href="/dashboard" className="absolute top-6 left-6 text-ink-dim hover:text-teal font-bold text-sm transition-colors">
        &larr; Back to Dashboard (View Only)
      </Link>

      <div className="w-full max-w-md bg-white border border-border rounded-3xl p-8 shadow-xl">

        <div className="flex flex-col items-center mb-8">
          <div className="bg-terracotta-dim p-4 rounded-2xl border border-terracotta/30 mb-4">
            <Shield className="text-terracotta-hover" size={32} />
          </div>
          <h1 className="text-2xl font-heading font-semibold text-teal tracking-tight">Staff Portal Login</h1>
          <p className="text-ink-dim text-sm mt-2 text-center">
            Sign in to access Al-Azamat Medical Store management tools.
          </p>
        </div>

        <form action={formAction} className="space-y-5">

          {state?.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center font-bold">
              {state.error}
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label className="text-[10px] text-ink-mute uppercase font-bold tracking-wider mb-1 block pl-1">Your Assigned Role</label>
            <div className="relative">
              <select name="role" required className="bg-white border border-border p-3.5 rounded-xl w-full text-sm focus:border-terracotta outline-none text-ink appearance-none pl-11 transition-colors">
                <option value="Cashier">Cashier</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
                <option value="Super Admin">Super Admin</option>
              </select>
              <UserCircle className="absolute left-4 top-3.5 text-ink-mute pointer-events-none" size={18} />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-[10px] text-ink-mute uppercase font-bold tracking-wider mb-1 block pl-1">Email Address</label>
            <div className="relative">
              <input type="email" name="email" required placeholder="name@alazamat.com" className="bg-white border border-border p-3.5 rounded-xl w-full text-sm focus:border-terracotta outline-none text-ink pl-11 transition-colors" />
              <Mail className="absolute left-4 top-3.5 text-ink-mute" size={18} />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-[10px] text-ink-mute uppercase font-bold tracking-wider mb-1 block pl-1">Password</label>
            <div className="relative">
              <input type="password" name="password" required placeholder="••••••••" className="bg-white border border-border p-3.5 rounded-xl w-full text-sm focus:border-terracotta outline-none text-ink pl-11 transition-colors" />
              <KeyRound className="absolute left-4 top-3.5 text-ink-mute" size={18} />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-terracotta hover:bg-terracotta-hover text-white font-bold py-4 rounded-xl transition-all shadow-md shadow-terracotta/20 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 mt-4"
          >
            {isPending ? <Loader2 className="animate-spin" size={20} /> : "Authenticate Securely"}
          </button>

        </form>
      </div>
    </div>
  );
}