"use client";

import { useActionState, useState } from "react";
import { addMedicine, type ActionState } from "../actions";
import { Loader2, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewMedicinePage() {
  const initialState: ActionState = {};
  const [state, formAction, isPending] = useActionState(addMedicine, initialState);

  // React State for our Auto-Calculator
  const [packs, setPacks] = useState<number>(0);
  const [packSize, setPackSize] = useState<number>(1);
  const totalUnits = packs * packSize; // Auto-calculated!

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      
      {/* HEADER SECTION WITH BACK BUTTON */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/inventory" className="p-2 bg-white border border-border rounded-xl text-ink-mute hover:text-teal hover:border-teal transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold text-teal">Add New Medicine</h1>
          <p className="text-ink-dim text-sm">Register a new item in your inventory database.</p>
        </div>
      </div>

      <form action={formAction} className="bg-white border border-border rounded-3xl p-6 space-y-6 shadow-sm">
        
        {state?.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center font-bold">
            {state.error}
          </div>
        )}

        {/* Name & Brand */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="name" placeholder="Medicine Name" required className="bg-cream border border-border p-3 rounded-xl w-full text-sm focus:border-terracotta outline-none text-ink font-medium" />
          <input name="brand" placeholder="Brand / Company" className="bg-cream border border-border p-3 rounded-xl w-full text-sm focus:border-terracotta outline-none text-ink font-medium" />
        </div>

        {/* Formula & Potency */}
        <div className="p-4 bg-cream/50 border border-border rounded-xl space-y-3">
          <label className="text-xs text-ink-mute uppercase font-bold tracking-wider block">Formula & Potency</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input name="formula" placeholder="Formula (e.g., Paracetamol)" className="md:col-span-2 bg-white border border-border p-3 rounded-xl w-full text-sm focus:border-terracotta outline-none text-ink" />
            <input name="potency" placeholder="e.g., 500mg" className="bg-white border border-border p-3 rounded-xl w-full text-sm focus:border-terracotta outline-none text-ink" />
          </div>
        </div>

        {/* Stock & Pricing */}
        <div className="p-4 bg-cream/50 border border-border rounded-xl space-y-4">
          <label className="text-xs text-ink-mute uppercase font-bold tracking-wider block">Stock & Pricing</label>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <span className="text-[10px] text-ink-dim mb-1 block font-semibold">Total Packs</span>
              <input type="number" value={packs || ""} onChange={(e) => setPacks(Number(e.target.value))} className="bg-white border border-border p-3 rounded-xl w-full text-sm focus:border-terracotta outline-none text-ink" placeholder="0" />
            </div>
            <div>
              <span className="text-[10px] text-ink-dim mb-1 block font-semibold">Items/Pack</span>
              <input name="pack_size" type="number" value={packSize || ""} onChange={(e) => setPackSize(Number(e.target.value))} className="bg-white border border-border p-3 rounded-xl w-full text-sm focus:border-terracotta outline-none text-ink" placeholder="1" />
            </div>
            <div>
              <span className="text-[10px] text-ink-dim mb-1 block font-semibold">Total Units</span>
              {/* This input submits to the database, but is strictly controlled by our math! */}
              <input name="stock" type="number" readOnly value={totalUnits} className="bg-cream border border-border p-3 rounded-xl w-full text-sm text-ink-mute cursor-not-allowed font-bold" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-ink-dim mb-1 block font-semibold">Cost Price (Pack)</span>
              <input name="cost_price" type="number" placeholder="Cost Price" className="bg-white border border-border p-3 rounded-xl w-full text-sm focus:border-terracotta outline-none text-ink" />
            </div>
            <div>
              <span className="text-[10px] text-ink-dim mb-1 block font-semibold">Sale Price (Pack)</span>
              <input name="sale_price" type="number" placeholder="Sale Price" className="bg-white border border-border p-3 rounded-xl w-full text-sm focus:border-terracotta outline-none text-ink" />
            </div>
          </div>
        </div>

        {/* Category & Expiry */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select name="category" className="bg-white border border-border p-3 rounded-xl w-full text-sm focus:border-terracotta outline-none text-ink font-medium">
            <option value="Tablet">Tablet</option>
            <option value="Syrup">Syrup</option>
            <option value="Injection">Injection</option>
            <option value="Capsule">Capsule</option>
            <option value="Drops">Drops</option>
            <option value="Sachet">Sachet</option>
            <option value="Surgicals">Surgicals</option>
            <option value="Cream">Cream</option>
            <option value="Cosmetics">Cosmetics</option>
            <option value="Other">Other</option>
          </select>
          
          <div className="relative">
            <input 
              name="expiry_date" 
              type="date" 
              className="bg-white border border-border p-3 rounded-xl w-full text-sm focus:border-terracotta outline-none text-ink relative [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer z-10 bg-transparent font-medium" 
            />
            <Calendar className="absolute right-3 top-3 text-teal pointer-events-none z-0" size={18} />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isPending}
          className="w-full bg-terracotta hover:bg-terracotta-hover text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-terracotta/20 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 mt-4"
        >
          {isPending ? (
            <><Loader2 className="animate-spin" size={20} /> Saving to Database...</>
          ) : (
            "Save Medicine"
          )}
        </button>
      </form>
    </div>
  );
}