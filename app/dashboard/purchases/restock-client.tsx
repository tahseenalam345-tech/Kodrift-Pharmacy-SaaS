"use client";

import { useState, useRef, useEffect } from "react";
import { Medicine, RestockCartItem } from "@/types";
import { 
  Truck, Plus, Minus, Trash2, ArrowDownCircle, Loader2, CheckCircle2,
  Pill, Droplet, Syringe, Bandage, FlaskConical, Package as PackageIcon, ScanBarcode, Banknote, CreditCard, CalendarClock
} from "lucide-react";
import { processPurchase } from "./actions";

// existingSuppliers prop mein database se nikal kar history pass ki jayegi
export function RestockClient({ inventory, existingSuppliers = [] }: { inventory: Medicine[], existingSuppliers?: string[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [cart, setCart] = useState<RestockCartItem[]>([]);

  // NAYE PAYMENT STATES
  const [paymentStatus, setPaymentStatus] = useState<"Paid" | "Pending" | "Partial">("Paid");
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Online" | "Cheque">("Cash");
  const [amountPaid, setAmountPaid] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const searchInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (searchInputRef.current) searchInputRef.current.focus();
  }, [cart.length]);

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.formula && item.formula.toLowerCase().includes(searchTerm.toLowerCase())) ||
    ((item as any).barcode && (item as any).barcode.includes(searchTerm)) ||
    ((item as any).item_code && (item as any).item_code.includes(searchTerm))
  );

  const getCategoryIcon = (category: string | undefined | null) => {
    switch (category) {
      case 'Tablet': case 'Capsule': return <Pill className="text-teal" size={32} strokeWidth={1.5} />;
      case 'Syrup': case 'Drops': return <Droplet className="text-terracotta" size={32} strokeWidth={1.5} />;
      case 'Injection': return <Syringe className="text-teal" size={32} strokeWidth={1.5} />;
      case 'Cream': case 'Cosmetics': return <FlaskConical className="text-terracotta-hover" size={32} strokeWidth={1.5} />;
      case 'Surgicals': return <Bandage className="text-teal" size={32} strokeWidth={1.5} />;
      default: return <PackageIcon className="text-ink-mute" size={32} strokeWidth={1.5} />;
    }
  };

  const addToCart = (medicine: Medicine) => {
    setError("");
    setSuccessMessage("");
    setCart((prev) => {
      const existing = prev.find((item) => item.medicine.id === medicine.id);
      if (existing) {
        return prev.map((item) =>
          item.medicine.id === medicine.id ? { ...item, packs: item.packs + 1 } : item
        );
      }
      return [...prev, { medicine, packs: 1, costPerPack: medicine.cost_price }];
    });
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = searchTerm.trim().toLowerCase();
    if (!term) return;

    const exactMatch = inventory.find(item => 
      ((item as any).barcode && (item as any).barcode.toLowerCase() === term) || 
      ((item as any).item_code && (item as any).item_code.toLowerCase() === term) ||
      item.name.toLowerCase() === term
    );

    if (exactMatch) {
      addToCart(exactMatch);
      setSearchTerm(""); 
    } else {
      setError(`Item not found in master database: "${searchTerm}"`);
      setTimeout(() => setError(""), 3000);
    }
  };

  const updateQuantity = (medicineId: string, delta: number) => {
    setCart((prev) => prev.map(item => {
      if (item.medicine.id === medicineId) return { ...item, packs: Math.max(1, item.packs + delta) };
      return item;
    }));
  };

  const updateCostPrice = (medicineId: string, newCost: number) => {
    setCart((prev) => prev.map(item => {
      if (item.medicine.id === medicineId) return { ...item, costPerPack: newCost };
      return item;
    }));
  };

  const removeFromCart = (medicineId: string) => {
    setCart((prev) => prev.filter(item => item.medicine.id !== medicineId));
  };

  const calculateTotal = () => cart.reduce((total, item) => total + (item.costPerPack * item.packs), 0);
  const totalBill = calculateTotal();

  // Auto-fill amount logic based on status
  useEffect(() => {
    if (paymentStatus === "Paid") setAmountPaid(totalBill.toString());
    else if (paymentStatus === "Pending") setAmountPaid("0");
  }, [paymentStatus, totalBill]);

  const handleRestock = async () => {
    if (!supplierName.trim()) { setError("Please enter a supplier name."); return; }
    if (paymentStatus === "Partial" && (!amountPaid || parseFloat(amountPaid) <= 0 || parseFloat(amountPaid) >= totalBill)) {
      setError("Partial payment amount must be greater than 0 and less than total bill."); return;
    }

    setIsProcessing(true);
    setError("");
    setSuccessMessage("");

    try {
      const paymentData = {
        status: paymentStatus,
        method: paymentMethod,
        amountPaid: paymentStatus === "Pending" ? 0 : parseFloat(amountPaid),
        dueDate: (paymentStatus === "Pending" || paymentStatus === "Partial") ? dueDate : null
      };

      const result = await processPurchase(supplierName, cart, totalBill, paymentData);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccessMessage(result.message || "Stock and Payments Successfully Logged!");
        setCart([]);
        setSupplierName("");
        setSearchTerm("");
        setPaymentStatus("Paid");
      }
    } catch (err) {
      setError("A network error occurred during restocking.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1 min-h-0">
      
      {/* SUPPLIER HISTORY DATALIST */}
      <datalist id="supplier-history">
        {existingSuppliers.map((sup, idx) => (
          <option key={idx} value={sup} />
        ))}
      </datalist>

      {/* LEFT SIDE: Inventory List */}
      <div className="w-full lg:w-3/5 flex flex-col gap-3 lg:gap-4 min-h-0 flex-1 lg:flex-none">
        <form onSubmit={handleBarcodeSubmit} className="relative flex-none">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <ScanBarcode className="text-teal" size={20} />
          </div>
          <input
            ref={searchInputRef}
            autoFocus
            type="text"
            placeholder="Scan barcode to restock or search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-border text-ink placeholder-ink-mute rounded-2xl py-3.5 md:py-4 pl-12 pr-24 focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-all shadow-sm text-base"
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
            <button type="submit" className="text-[10px] font-bold text-white bg-teal px-3 py-1.5 rounded-xl shadow-sm hover:bg-teal-hover transition-colors">
              ENTER ⏎
            </button>
          </div>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 overflow-y-auto pr-1 flex-1 min-h-[200px] lg:max-h-[75vh] custom-scrollbar">
          {filteredInventory.map((item) => (
            <button
              key={item.id}
              onClick={() => addToCart(item)}
              className="bg-white hover:bg-teal-soft border border-border hover:border-terracotta/50 rounded-2xl p-3 text-left transition-all group flex flex-col items-center text-center active:scale-95 shadow-sm"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 bg-cream rounded-xl mb-2 flex items-center justify-center border border-border group-hover:scale-105 transition-transform text-teal">
                {getCategoryIcon(item.category)}
              </div>
              <h3 className="font-bold text-ink text-xs md:text-sm line-clamp-2 w-full leading-tight">{item.name}</h3>
              <p className="text-[10px] text-teal font-bold mt-1">Curr Stock: {item.stock}</p>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE: Restock Cart & Payment Details */}
      <div className="w-full lg:w-2/5 bg-white border border-border rounded-3xl flex flex-col overflow-hidden min-h-[45vh] lg:min-h-0 flex-1 lg:flex-none shadow-sm">
        
        {/* Header & Supplier */}
        <div className="p-4 md:p-5 border-b border-border bg-cream/60 flex flex-col gap-4 flex-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Truck className="text-terracotta" />
              <h2 className="text-lg md:text-xl font-heading font-semibold text-teal">Incoming Stock</h2>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-ink-mute uppercase font-bold tracking-wider mb-1 block pl-1">Supplier / Distributor Name</label>
            <input
              type="text"
              list="supplier-history" // Links to datalist
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              placeholder="Start typing to see history..."
              className="w-full bg-white border border-border text-ink placeholder-ink-mute rounded-xl py-2 px-3 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/50 transition-all text-sm shadow-sm"
            />
          </div>
        </div>

        {error && <div className="mx-4 mt-4 p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs text-center font-bold">{error}</div>}
        {successMessage && <div className="mx-4 mt-4 p-2.5 bg-success-soft border border-success/30 rounded-xl text-success text-xs text-center font-bold flex items-center justify-center gap-2"><CheckCircle2 size={16} />{successMessage}</div>}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 min-h-0 custom-scrollbar bg-cream/20">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-ink-mute space-y-2">
              <Truck size={48} className="opacity-20 mb-2" />
              <p className="text-sm">No items selected.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.medicine.id} className="bg-white border border-border rounded-2xl p-3 flex flex-col gap-2 relative shadow-sm animate-rise">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h4 className="font-bold text-ink text-sm truncate">{item.medicine.name}</h4>
                    <p className="text-[10px] text-ink-dim mt-0.5">Adds <span className="text-teal font-bold">{item.packs * (item.medicine.pack_size || 1)}</span> units to stock</p>
                  </div>
                  <button onClick={() => removeFromCart(item.medicine.id)} className="text-ink-mute hover:text-red-600 p-1 bg-cream rounded-md"><Trash2 size={14} /></button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
                  <div className="flex items-center gap-1 bg-cream border border-border rounded-lg p-0.5">
                    <button onClick={() => updateQuantity(item.medicine.id, -1)} className="p-1.5 hover:text-terracotta text-ink-dim bg-white rounded shadow-sm"><Minus size={12} /></button>
                    <span className="text-xs font-bold w-6 text-center text-ink">{item.packs} <span className="text-[8px] font-normal block -mt-1">Packs</span></span>
                    <button onClick={() => updateQuantity(item.medicine.id, 1)} className="p-1.5 hover:text-terracotta text-ink-dim bg-white rounded shadow-sm"><Plus size={12} /></button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-ink-mute font-bold uppercase">Cost/Pack: Rs</span>
                    <input
                      type="number"
                      value={item.costPerPack || ""}
                      onChange={(e) => updateCostPrice(item.medicine.id, Number(e.target.value))}
                      className="w-20 bg-white border border-teal text-ink font-bold rounded-lg py-1 px-2 text-xs text-right focus:ring-1 focus:ring-teal outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* PAYMENT & CHECKOUT PANEL */}
        <div className="p-3 md:p-4 border-t border-border bg-white space-y-4 flex-none shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)] z-10">
          
          {/* Payment Status Tabs */}
          <div className="flex bg-cream border border-border rounded-lg p-1 w-full">
            {["Paid", "Pending", "Partial"].map(status => (
              <button 
                key={status}
                onClick={() => setPaymentStatus(status as any)} 
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${paymentStatus === status ? "bg-white shadow-sm border border-border text-teal" : "text-ink-mute hover:text-ink-dim"}`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Conditional Payment Details */}
          {paymentStatus !== "Pending" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-ink-dim uppercase">Amount Paid</label>
                <input 
                  type="number" 
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  disabled={paymentStatus === "Paid"} // If Paid, auto-fills full amount
                  className="w-full bg-white border border-border rounded-lg py-1.5 px-3 text-xs font-bold disabled:bg-cream disabled:text-ink-mute"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-ink-dim uppercase">Payment Mode</label>
                <select 
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-white border border-border rounded-lg py-1.5 px-2 text-xs font-bold outline-none focus:border-teal"
                >
                  <option value="Cash">Cash</option>
                  <option value="Online">Online / Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
            </div>
          )}

          {(paymentStatus === "Pending" || paymentStatus === "Partial") && (
            <div className="flex items-center gap-3 bg-red-50 p-2.5 rounded-xl border border-red-100">
              <CalendarClock className="text-red-500" size={18} />
              <div className="flex-1">
                <label className="text-[9px] font-bold text-red-600 uppercase block mb-1">Due Date for Remaining Rs {totalBill - parseFloat(amountPaid || '0')}</label>
                <input 
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-white border border-red-200 rounded-lg py-1 px-2 text-xs font-bold text-red-700 focus:outline-none focus:ring-1 focus:ring-red-400"
                />
              </div>
            </div>
          )}

          <div className="flex justify-between items-end border-t border-dashed border-border/50 pt-3">
            <span className="text-[10px] text-ink-mute font-bold uppercase tracking-wider mb-1">Total Purchase Value</span>
            <span className="text-2xl md:text-3xl font-heading font-extrabold text-teal leading-none">Rs {Math.round(totalBill)}</span>
          </div>

          <button
            onClick={handleRestock}
            disabled={cart.length === 0 || isProcessing || ((paymentStatus === "Pending" || paymentStatus === "Partial") && !dueDate)}
            className="w-full bg-teal hover:bg-teal-hover text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-teal/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-lg"
          >
            {isProcessing ? (
              <><Loader2 className="animate-spin" size={24} /> Processing...</>
            ) : (
              <>Confirm Restock <ArrowDownCircle size={24} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}