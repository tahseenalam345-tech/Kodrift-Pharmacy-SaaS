"use client";

import { useActionState, useState } from "react";
import { updateMedicine, deleteMedicine, type ActionState } from "../actions";
import { Loader2, Calendar, Trash2 } from "lucide-react";
import { Medicine } from "@/types";

export function EditMedicineForm({ medicine }: { medicine: Medicine }) {
  const initialState: ActionState = {};
  const [state, formAction, isPending] = useActionState(updateMedicine, initialState);

  const [packs, setPacks] = useState<number>(Math.floor(medicine.stock / (medicine.pack_size || 1)));
  const [packSize, setPackSize] = useState<number>(medicine.pack_size || 1);
  const totalUnits = packs * packSize;

  return (
    <div className="space-y-4">
      <form action={formAction} className="bg-white border border-border rounded-3xl p-4 md:p-6 space-y-6 shadow-sm">
        <input type="hidden" name="id" value={medicine.id} />

        {state?.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center font-bold">
            {state.error}
          </div>
        )}
        {state?.success && (
          <div className="p-3 bg-success/10 border border-success/20 rounded-xl text-success text-sm text-center font-bold">
            {state.success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="name" defaultValue={medicine.name} placeholder="Medicine Name" required className="bg-cream border border-border p-3 rounded-xl w-full text-sm focus:border-terracotta outline-none text-ink font-medium" />
          <input name="brand" defaultValue={medicine.brand || ""} placeholder="Brand / Company" className="bg-cream border border-border p-3 rounded-xl w-full text-sm focus:border-terracotta outline-none text-ink font-medium" />
        </div>

        <div className="p-4 bg-cream/50 border border-border rounded-xl space-y-3">
          <label className="text-xs text-ink-mute uppercase font-bold tracking-wider block">Formula & Potency</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input name="formula" defaultValue={medicine.formula || ""} placeholder="Formula" className="md:col-span-2 bg-white border border-border p-3 rounded-xl w-full text-sm focus:border-terracotta outline-none text-ink" />
            <input name="potency" defaultValue={medicine.potency || ""} placeholder="e.g., 500mg" className="bg-white border border-border p-3 rounded-xl w-full text-sm focus:border-terracotta outline-none text-ink" />
          </div>
        </div>

        <div className="p-4 bg-cream/50 border border-border rounded-xl space-y-4">
          <label className="text-xs text-ink-mute uppercase font-bold tracking-wider block">Stock & Pricing</label>
          <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4">
            <div>
              <span className="text-[10px] text-ink-dim mb-1 block font-semibold">Total Packs</span>
              <input type="number" value={packs === 0 && medicine.stock > 0 ? medicine.stock : packs} onChange={(e) => setPacks(Number(e.target.value))} className="bg-white border border-border p-3 rounded-xl w-full text-sm focus:border-terracotta outline-none text-ink" />
            </div>
            <div>
              <span className="text-[10px] text-ink-dim mb-1 block font-semibold">Items/Pack</span>
              <input name="pack_size" type="number" value={packSize} onChange={(e) => setPackSize(Number(e.target.value))} className="bg-white border border-border p-3 rounded-xl w-full text-sm focus:border-terracotta outline-none text-ink" />
            </div>
            <div>
              <span className="text-[10px] text-ink-dim mb-1 block font-semibold">Total Units</span>
              <input name="stock" type="number" readOnly value={totalUnits === 0 && medicine.stock > 0 ? medicine.stock : totalUnits} className="bg-cream border border-border p-3 rounded-xl w-full text-sm text-ink-mute cursor-not-allowed font-bold" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-ink-dim mb-1 block font-semibold">Cost Price (Pack)</span>
              <input name="cost_price" type="number" defaultValue={medicine.cost_price} className="bg-white border border-border p-3 rounded-xl w-full text-sm focus:border-terracotta outline-none text-ink" />
            </div>
            <div>
              <span className="text-[10px] text-ink-dim mb-1 block font-semibold">Sale Price (Pack)</span>
              <input name="sale_price" type="number" defaultValue={medicine.sale_price} className="bg-white border border-border p-3 rounded-xl w-full text-sm focus:border-terracotta outline-none text-ink" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select name="category" defaultValue={medicine.category || "Tablet"} className="bg-white border border-border p-3 rounded-xl w-full text-sm focus:border-terracotta outline-none text-ink font-medium">
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
              defaultValue={medicine.expiry_date || ""} 
              className="bg-white border border-border p-3 rounded-xl w-full text-sm focus:border-terracotta outline-none text-ink relative [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer z-10 bg-transparent font-medium" 
            />
            <Calendar className="absolute right-3 top-3 text-teal pointer-events-none z-0" size={18} />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isPending}
          className="w-full bg-terracotta hover:bg-terracotta-hover text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-terracotta/20 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <><Loader2 className="animate-spin" size={20} /> Updating Database...</>
          ) : (
            "Save Master Changes"
          )}
        </button>
      </form>

      <form action={deleteMedicine} className="bg-red-50 border border-red-200 rounded-3xl p-4 flex justify-between items-center shadow-sm">
        <input type="hidden" name="id" value={medicine.id} />
        <div>
          <h4 className="text-red-700 font-bold text-sm">Danger Zone</h4>
          <p className="text-xs text-red-500">Permanently remove this item.</p>
        </div>
        <button 
          type="submit"
          onClick={(e) => { if(!confirm("Are you sure you want to delete this medicine entirely?")) e.preventDefault(); }}
          className="bg-white hover:bg-red-600 border border-red-200 hover:border-red-600 text-red-600 hover:text-white transition-colors py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </form>
    </div>
  );
}