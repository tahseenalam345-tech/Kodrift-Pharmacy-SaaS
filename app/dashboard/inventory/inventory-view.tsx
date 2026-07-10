"use client";

import { useState, useTransition } from "react";
import { Medicine } from "@/types";
import { 
  LayoutGrid, List as ListIcon, AlertTriangle, TrendingUp, Package, 
  ChevronDown, Edit, Trash2, Pill, Droplet, Syringe, Bandage, FlaskConical,
  CheckSquare, Square, Edit3, Save, X, Loader2
} from "lucide-react";
import Link from "next/link";
import { quickUpdateMedicine, bulkDeleteMedicines } from "./actions"; // Import our new actions

export function InventoryView({ inventory }: { inventory: Medicine[] }) {
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [isPending, startTransition] = useTransition();

  // --- COMPLEX STATE MANAGEMENT ---
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ stock: 0, sale_price: 0 });

  // 1. Bulk Selection Logic
  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents accordion from opening
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === inventory.length) setSelectedIds([]);
    else setSelectedIds(inventory.map(item => item.id));
  };

  const handleBulkDelete = () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} items?`)) return;
    startTransition(async () => {
      await bulkDeleteMedicines(selectedIds);
      setSelectedIds([]); // Clear selection after delete
    });
  };

  // 2. Quick Edit Logic
  const startQuickEdit = (item: Medicine, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents accordion from opening
    setEditingId(item.id);
    setEditForm({ stock: item.stock, sale_price: item.sale_price });
  };

  const saveQuickEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      await quickUpdateMedicine(id, editForm.stock, editForm.sale_price);
      setEditingId(null);
    });
  };

  const cancelQuickEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  // Helpers
  const getExpiryStatus = (expiryDate: string | undefined | null) => {
    if (!expiryDate) return { text: "No Date", color: "bg-cream text-ink-mute border-border" };
    const today = new Date();
    const expDate = new Date(expiryDate);
    const monthsLeft = (expDate.getFullYear() - today.getFullYear()) * 12 + (expDate.getMonth() - today.getMonth());
    if (monthsLeft < 0) return { text: "Expired", color: "bg-red-100 text-red-700 border-red-200" };
    if (monthsLeft <= 3) return { text: "Expiring Soon", color: "bg-orange-100 text-orange-700 border-orange-200" };
    return { text: new Date(expiryDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }), color: "bg-success/10 text-success border-success/20" };
  };

  const getStockHealth = (stock: number) => {
    if (stock === 0) return { color: 'bg-red-500', width: '0%' };
    if (stock <= 10) return { color: 'bg-red-500', width: `${Math.max(10, (stock / 50) * 100)}%` };
    if (stock <= 30) return { color: 'bg-orange-500', width: `${Math.max(20, (stock / 100) * 100)}%` };
    return { color: 'bg-teal', width: `${Math.min(100, (stock / 200) * 100)}%` };
  };

  const getCategoryIcon = (category: string | undefined | null) => {
    switch (category) {
      case 'Tablet': case 'Capsule': return <Pill className="text-teal" size={24} strokeWidth={1.5} />;
      case 'Syrup': case 'Drops': return <Droplet className="text-terracotta" size={24} strokeWidth={1.5} />;
      case 'Injection': return <Syringe className="text-teal" size={24} strokeWidth={1.5} />;
      case 'Cream': case 'Cosmetics': return <FlaskConical className="text-terracotta-hover" size={24} strokeWidth={1.5} />;
      case 'Surgicals': return <Bandage className="text-teal" size={24} strokeWidth={1.5} />;
      default: return <Package className="text-ink-mute" size={24} strokeWidth={1.5} />;
    }
  };

  return (
    <div className="space-y-4 relative pb-20">
      
      {/* FLOATING ACTION BAR FOR BULK ACTIONS */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-ink text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 z-50 animate-rise border border-ink-dim">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold bg-white/20 px-3 py-1 rounded-lg text-lg">{selectedIds.length}</span>
            <span className="text-sm font-medium text-ink-mute text-cream">items selected</span>
          </div>
          <div className="w-px h-8 bg-white/20"></div>
          <button 
            onClick={handleBulkDelete} 
            disabled={isPending}
            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Delete Selected
          </button>
          <button onClick={() => setSelectedIds([])} className="text-ink-mute hover:text-white bg-white/10 p-2 rounded-full transition-colors ml-2">
            <X size={16} />
          </button>
        </div>
      )}

      {/* TOGGLE BUTTONS & SELECT ALL */}
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-3">
          <button onClick={toggleSelectAll} className="flex items-center gap-2 text-sm font-bold text-ink-dim hover:text-teal transition-colors">
            {selectedIds.length === inventory.length && inventory.length > 0 ? (
              <CheckSquare size={18} className="text-teal" />
            ) : (
              <Square size={18} />
            )}
            Select All
          </button>
          <span className="text-xs text-ink-mute font-bold uppercase tracking-wider pl-4 border-l border-border">
            Showing {inventory.length} items
          </span>
        </div>
        <div className="flex bg-cream p-1 rounded-xl border border-border shadow-sm">
          <button onClick={() => setView('list')} className={`p-1.5 rounded-lg transition-all flex items-center gap-2 text-xs font-bold ${view === 'list' ? 'bg-white text-teal shadow-sm border border-border' : 'text-ink-mute hover:text-ink'}`}>
            <ListIcon size={16} /> <span className="hidden md:inline pr-1">List</span>
          </button>
          <button onClick={() => setView('grid')} className={`p-1.5 rounded-lg transition-all flex items-center gap-2 text-xs font-bold ${view === 'grid' ? 'bg-white text-teal shadow-sm border border-border' : 'text-ink-mute hover:text-ink'}`}>
            <LayoutGrid size={16} /> <span className="hidden md:inline pr-1">Grid</span>
          </button>
        </div>
      </div>

      {/* GRID VIEW */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 opacity-100 transition-opacity">
          {inventory.map((item) => {
            const expiry = getExpiryStatus(item.expiry_date);
            const health = getStockHealth(item.stock);
            const isSelected = selectedIds.includes(item.id);
            const isEditing = editingId === item.id;
            
            return (
              <details key={item.id} className={`group bg-white border ${isSelected ? 'border-teal ring-2 ring-teal/20' : 'border-border hover:border-teal/40'} rounded-2xl flex flex-col relative overflow-hidden transition-all shadow-sm`}>
                
                <summary className="p-4 list-none outline-none cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3 items-center">
                      <div onClick={(e) => toggleSelect(item.id, e)} className="cursor-pointer">
                        {isSelected ? <CheckSquare className="text-teal" size={20} /> : <Square className="text-ink-mute" size={20} />}
                      </div>
                      <div className="w-10 h-10 bg-cream rounded-xl flex items-center justify-center border border-border">
                        {getCategoryIcon(item.category)}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-[9px] font-bold border ${expiry.color}`}>{expiry.text}</span>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-heading font-bold text-ink text-lg leading-tight truncate">{item.name}</h3>
                    <p className="text-xs text-terracotta-hover font-medium truncate">{item.formula || "No formula"}</p>
                  </div>

                  {/* QUICK EDIT IN GRID */}
                  <div onClick={(e) => e.stopPropagation()} className="mb-4 p-3 bg-cream/50 rounded-xl border border-border/50">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-ink-dim">Stock:</span>
                          <input type="number" value={editForm.stock} onChange={e => setEditForm({...editForm, stock: Number(e.target.value)})} className="w-20 px-2 py-1 text-sm border border-teal rounded focus:outline-none focus:ring-1 focus:ring-teal bg-white" />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-ink-dim">Price:</span>
                          <input type="number" value={editForm.sale_price} onChange={e => setEditForm({...editForm, sale_price: Number(e.target.value)})} className="w-20 px-2 py-1 text-sm border border-teal rounded focus:outline-none focus:ring-1 focus:ring-teal bg-white" />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button onClick={(e) => saveQuickEdit(item.id, e)} className="flex-1 bg-teal hover:bg-teal-hover text-white py-1.5 rounded-lg text-xs font-bold flex justify-center items-center gap-1">
                            {isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                          </button>
                          <button onClick={cancelQuickEdit} className="px-3 bg-white border border-border text-ink-mute hover:text-ink rounded-lg flex items-center">
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-end mb-1 group/edit">
                          <span className="text-xs font-bold text-ink-dim">Stock: <span className={item.stock < 10 ? 'text-red-600' : 'text-teal'}>{item.stock}</span></span>
                          <span className="text-xs font-bold text-ink-dim">Rs {item.sale_price}</span>
                        </div>
                        <div className="w-full bg-cream rounded-full h-1.5 overflow-hidden border border-border/50">
                          <div className={`${health.color} h-1.5 rounded-full transition-all duration-500`} style={{ width: health.width }}></div>
                        </div>
                        <button onClick={(e) => startQuickEdit(item, e)} className="mt-2 w-full flex items-center justify-center gap-1.5 text-[10px] font-bold text-ink-mute hover:text-teal bg-white border border-border py-1.5 rounded-lg transition-colors">
                          <Edit3 size={12} /> Quick Edit
                        </button>
                      </>
                    )}
                  </div>

                  <div className="flex justify-center items-center pt-2 border-t border-border">
                    <div className="flex items-center gap-1 text-ink-mute group-open:text-teal transition-colors">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Expand Details</span>
                      <ChevronDown size={16} className="group-open:rotate-180 transition-transform" />
                    </div>
                  </div>
                </summary>

                <div className="p-4 bg-cream/40 border-t border-border/50 flex flex-col gap-3">
                  <Link href={`/dashboard/inventory/${item.id}`} className="w-full bg-white border border-border hover:border-teal text-teal font-bold py-2 rounded-xl transition-all text-xs flex justify-center items-center gap-1.5 shadow-sm">
                    <Edit size={14} /> Full Edit Page
                  </Link>
                </div>
              </details>
            );
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {view === 'list' && (
        <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-cream text-ink-mute uppercase text-[10px] font-bold tracking-wider border-b border-border">
            <div className="col-span-4 pl-8">Medicine & Details</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2 text-center">Expiry Status</div>
            <div className="col-span-2 text-right">Stock Level</div>
            <div className="col-span-2 text-right pr-8">Sale Price</div>
          </div>

          <div className="divide-y divide-border">
            {inventory.map((item) => {
              const expiry = getExpiryStatus(item.expiry_date);
              const health = getStockHealth(item.stock);
              const isSelected = selectedIds.includes(item.id);
              const isEditing = editingId === item.id;

              return (
                <details key={item.id} className={`group transition-colors ${isSelected ? 'bg-teal-soft/30' : 'hover:bg-cream/30'}`}>
                  <summary className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center cursor-pointer list-none outline-none relative">
                    
                    {/* CHECKBOX & BASIC INFO */}
                    <div className="col-span-1 md:col-span-4 flex items-center gap-3 pl-1">
                      <div onClick={(e) => toggleSelect(item.id, e)} className="cursor-pointer mr-1">
                        {isSelected ? <CheckSquare className="text-teal" size={18} /> : <Square className="text-ink-mute hover:text-ink-dim" size={18} />}
                      </div>
                      <div className="flex-none"><ChevronDown size={16} className="text-ink-mute group-open:rotate-180 transition-transform" /></div>
                      <div className="w-10 h-10 bg-cream rounded-lg hidden md:flex items-center justify-center border border-border">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-ink truncate flex items-center gap-2">
                          {item.name} <span className="text-[9px] px-1.5 py-0.5 rounded bg-cream text-ink-mute border border-border uppercase">{item.brand || "GENERIC"}</span>
                        </p>
                        <p className="text-xs text-terracotta-hover font-medium truncate">{item.formula || "No Formula"}</p>
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 hidden md:block">
                      <span className="px-2 py-1 bg-teal-soft rounded border border-teal/20 text-teal text-[10px] font-bold uppercase">{item.category || "OTHER"}</span>
                    </div>

                    <div className="col-span-1 md:col-span-2 hidden md:flex justify-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${expiry.color}`}>{expiry.text}</span>
                    </div>

                    {/* QUICK EDIT / STOCK & PRICE VIEW */}
                    {isEditing ? (
                      <div className="col-span-1 md:col-span-4 grid grid-cols-2 gap-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-xs text-ink-dim">Stock:</span>
                          <input type="number" value={editForm.stock} onChange={e => setEditForm({...editForm, stock: Number(e.target.value)})} className="w-20 px-2 py-1 text-sm border border-teal rounded focus:outline-none focus:ring-1 focus:ring-teal bg-white shadow-sm" />
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-xs text-ink-dim">Price:</span>
                          <input type="number" value={editForm.sale_price} onChange={e => setEditForm({...editForm, sale_price: Number(e.target.value)})} className="w-20 px-2 py-1 text-sm border border-teal rounded focus:outline-none focus:ring-1 focus:ring-teal bg-white shadow-sm" />
                          <button onClick={(e) => saveQuickEdit(item.id, e)} className="p-1.5 bg-teal text-white rounded hover:bg-teal-hover ml-1">
                            {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                          </button>
                          <button onClick={cancelQuickEdit} className="p-1.5 bg-white border border-border text-ink-mute hover:text-ink rounded">
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="col-span-1 md:col-span-2 hidden md:flex flex-col justify-center items-end gap-1 group/edit" onClick={(e) => { e.stopPropagation(); startQuickEdit(item, e); }}>
                          <div className="flex items-center gap-2 cursor-pointer hover:bg-cream px-2 py-1 rounded transition-colors border border-transparent hover:border-border">
                            {item.stock < 10 && <AlertTriangle size={12} className="text-terracotta animate-pulse" />}
                            <span className={`font-bold text-sm ${item.stock < 10 ? 'text-red-600' : 'text-ink'}`}>
                              {item.stock} <span className="text-[10px] text-ink-mute font-normal">units</span>
                            </span>
                            <Edit3 size={12} className="opacity-0 group-hover/edit:opacity-100 text-teal transition-opacity" />
                          </div>
                          <div className="w-16 bg-cream rounded-full h-1 overflow-hidden border border-border/50 mr-2">
                            <div className={`${health.color} h-1 rounded-full`} style={{ width: health.width }}></div>
                          </div>
                        </div>

                        <div className="col-span-1 md:col-span-2 flex justify-end items-center pr-2 group/edit" onClick={(e) => { e.stopPropagation(); startQuickEdit(item, e); }}>
                          <div className="flex items-center gap-2 cursor-pointer hover:bg-cream px-2 py-1 rounded transition-colors border border-transparent hover:border-border">
                            <span className="font-bold text-teal text-base whitespace-nowrap">Rs {item.sale_price}</span>
                            <Edit3 size={12} className="opacity-0 group-hover/edit:opacity-100 text-teal transition-opacity" />
                          </div>
                        </div>
                      </>
                    )}
                  </summary>

                  {/* EXPANDED DETAILS */}
                  <div className="p-4 md:p-6 bg-cream/40 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-6 ml-12">
                    <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
                      <h4 className="text-[10px] font-bold text-ink-mute uppercase tracking-wider mb-3">Specifications</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm"><span className="text-ink-dim">Pack Size:</span><span className="font-medium text-ink">{item.pack_size || '-'}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-ink-dim">Cost Price:</span><span className="font-medium text-ink">Rs {item.cost_price}</span></div>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center items-end gap-3">
                      <Link href={`/dashboard/inventory/${item.id}`} className="w-full bg-white border border-border hover:border-teal text-teal font-bold py-2.5 px-6 rounded-xl transition-all text-sm flex justify-center items-center gap-2 shadow-sm">
                        <Edit size={16} /> Edit Full Profile
                      </Link>
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}