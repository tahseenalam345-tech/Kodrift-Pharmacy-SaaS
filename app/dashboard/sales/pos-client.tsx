"use client";

import { useState, useRef, useEffect } from "react";
import { Medicine } from "@/types";
import { 
  ShoppingCart, Plus, Minus, Trash2, Search, ArrowRight, Loader2, CheckCircle2,
  Pill, Droplet, Syringe, Bandage, FlaskConical, Package as PackageIcon, Printer,
  ScanBarcode, Banknote, CreditCard, AlertTriangle, Percent
} from "lucide-react";
import { processCheckout } from "./actions";

export type CartItem = {
  medicine: Medicine;
  quantity: number;
  saleType: "Pack" | "Unit";
  discountType: "None" | "Percentage" | "Fixed";
  discountValue: number;
};

type ReceiptData = {
  items: CartItem[];
  subtotal: number;
  globalDiscount: number;
  total: number;
  paymentMethod: "Cash" | "Online";
  cashTendered: number;
  changeDue: number;
  date: Date;
  invoiceNo: string;
};

export function POSClient({ inventory }: { inventory: Medicine[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Online">("Cash");
  const [cashTendered, setCashTendered] = useState<string>("");
  const [globalDiscountType, setGlobalDiscountType] = useState<"None" | "Percentage" | "Fixed">("None");
  const [globalDiscountValue, setGlobalDiscountValue] = useState<string>("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [lowStockAlerts, setLowStockAlerts] = useState<string[]>([]);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!receiptData && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [cart.length, receiptData]);

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
    setLowStockAlerts([]);
    setCart((prev) => {
      const existing = prev.find((item) => item.medicine.id === medicine.id);
      if (existing) {
        return prev.map((item) =>
          item.medicine.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { medicine, quantity: 1, saleType: "Pack", discountType: "None", discountValue: 0 }];
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
      setError(`Item not found: "${searchTerm}"`);
      setTimeout(() => setError(""), 3000);
    }
  };

  const updateQuantity = (medicineId: string, delta: number) => {
    setCart((prev) => prev.map(item => {
      if (item.medicine.id === medicineId) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const toggleSaleType = (medicineId: string) => {
    setCart((prev) => prev.map(item => {
      if (item.medicine.id === medicineId) {
        return { ...item, saleType: item.saleType === "Pack" ? "Unit" : "Pack" };
      }
      return item;
    }));
  };

  const updateItemDiscount = (medicineId: string, type: "None" | "Percentage" | "Fixed", value: number) => {
    setCart((prev) => prev.map(item => {
      if (item.medicine.id === medicineId) {
        return { ...item, discountType: type, discountValue: value };
      }
      return item;
    }));
  };

  const removeFromCart = (medicineId: string) => {
    setCart((prev) => prev.filter(item => item.medicine.id !== medicineId));
  };

  const getItemBasePrice = (item: CartItem) => {
    return item.saleType === "Pack" 
      ? item.medicine.sale_price 
      : (item.medicine.sale_price / (item.medicine.pack_size || 1));
  };

  const getItemDiscountAmount = (item: CartItem, basePriceTotal: number) => {
    if (item.discountType === "Fixed") return item.discountValue;
    if (item.discountType === "Percentage") return basePriceTotal * (item.discountValue / 100);
    return 0;
  };

  const getTotals = () => {
    let subtotal = 0;
    cart.forEach(item => {
      const baseGross = getItemBasePrice(item) * item.quantity;
      const itemDisc = getItemDiscountAmount(item, baseGross);
      subtotal += (baseGross - itemDisc);
    });

    let overallDiscountAmount = 0;
    const gDiscVal = parseFloat(globalDiscountValue) || 0;
    if (globalDiscountType === "Fixed") overallDiscountAmount = gDiscVal;
    if (globalDiscountType === "Percentage") overallDiscountAmount = subtotal * (gDiscVal / 100);

    const netTotal = Math.max(0, subtotal - overallDiscountAmount);
    return { subtotal, overallDiscountAmount, netTotal };
  };

  const { subtotal, overallDiscountAmount, netTotal } = getTotals();
  const changeAmount = paymentMethod === "Cash" && parseFloat(cashTendered) > netTotal 
    ? parseFloat(cashTendered) - netTotal 
    : 0;
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (paymentMethod === "Cash" && parseFloat(cashTendered) < netTotal && netTotal > 0) {
      setError("Cash tendered is less than total amount!");
      return;
    }

    setIsProcessing(true);
    setError("");
    setSuccessMessage("");
    setLowStockAlerts([]);

    try {
      const currentCartItems = [...cart]; 
      const stockWarnings: string[] = [];
      
      currentCartItems.forEach(item => {
        const isPack = item.saleType === "Pack";
        const packSize = item.medicine.pack_size || 1;
        const unitsDeducted = isPack ? (item.quantity * packSize) : item.quantity;
        if ((item.medicine.stock - unitsDeducted) <= 0) {
          stockWarnings.push(`${item.medicine.name} is now out of stock.`);
        }
      });

      const result = await processCheckout(cart, netTotal);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccessMessage("Checkout completed successfully!");
        if (stockWarnings.length > 0) setLowStockAlerts(stockWarnings);
        
        const invoiceNo = `INV-${Math.floor(100000 + Math.random() * 900000)}`;

        setReceiptData({ 
          items: currentCartItems, 
          subtotal: subtotal,
          globalDiscount: overallDiscountAmount,
          total: netTotal, 
          paymentMethod: paymentMethod,
          cashTendered: paymentMethod === "Cash" ? (parseFloat(cashTendered) || netTotal) : netTotal,
          changeDue: changeAmount,
          date: new Date(),
          invoiceNo: invoiceNo
        });
        
        setCart([]);
        setSearchTerm("");
        setCashTendered("");
        setGlobalDiscountType("None");
        setGlobalDiscountValue("");
      }
    } catch (err) {
      setError("A network error occurred during checkout.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #printable-receipt, #printable-receipt * { visibility: visible; }
          #printable-receipt { 
            position: absolute; 
            left: 0; top: 0; 
            width: 76mm;
            margin: 0; padding: 0; 
            font-family: 'Courier New', Courier, monospace;
            color: #000;
          }
          @page { margin: 0; }
        }
      `}} />

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1 min-h-0 relative">
        <div className="w-full lg:w-3/5 flex flex-col gap-3 lg:gap-4 min-h-0 flex-1 lg:flex-none">
          <form onSubmit={handleBarcodeSubmit} className="relative flex-none">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <ScanBarcode className="text-teal" size={20} />
            </div>
            <input
              ref={searchInputRef}
              autoFocus 
              type="text"
              placeholder="Scan barcode, short code, or search..."
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
                <span className="text-xs font-bold text-terracotta mt-1">Rs {item.sale_price}</span>
                <span className="text-[9px] text-ink-mute mt-0.5">Stock: {item.stock}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-2/5 bg-white border border-border rounded-3xl flex flex-col overflow-hidden min-h-[45vh] lg:min-h-0 flex-1 lg:flex-none shadow-sm">
          <div className="p-3 md:p-4 border-b border-border bg-cream/60 flex justify-between items-center flex-none">
            <div className="flex items-center gap-2">
              <ShoppingCart className="text-terracotta" size={20} />
              <h2 className="text-lg font-heading font-semibold text-teal">Current Bill</h2>
            </div>
            <span className="text-[10px] font-bold text-ink-mute bg-white px-2 py-1 border border-border rounded-lg">
              Items: {totalItemsCount}
            </span>
          </div>

          {error && <div className="mx-4 mt-4 p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs text-center font-bold">{error}</div>}
          
          {successMessage && !receiptData && (
            <div className="mx-4 mt-4 p-2.5 bg-success-soft border border-success/30 rounded-xl text-success text-xs text-center font-bold flex flex-col items-center justify-center gap-1">
              <div className="flex items-center gap-2"><CheckCircle2 size={16} />{successMessage}</div>
              {lowStockAlerts.length > 0 && (
                <div className="mt-2 w-full text-left bg-orange-100/50 text-orange-700 p-2 rounded-lg border border-orange-200/50">
                  <p className="flex items-center gap-1 text-[10px] uppercase mb-1 font-bold"><AlertTriangle size={12}/> Low Stock Warning</p>
                  <ul className="list-disc pl-4 text-[10px]">
                    {lowStockAlerts.map((msg, idx) => <li key={idx}>{msg}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto p-2 md:p-3 space-y-2 min-h-0 custom-scrollbar bg-cream/20">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-ink-mute space-y-2">
                <ScanBarcode size={48} className="opacity-20 mb-2" />
                <p className="text-sm">Cart is empty.</p>
                <p className="text-xs">Scan items to start billing.</p>
              </div>
            ) : (
              cart.map((item) => {
                const baseGross = getItemBasePrice(item) * item.quantity;
                const discountAmt = getItemDiscountAmount(item, baseGross);
                const netItemPrice = baseGross - discountAmt;

                return (
                  <div key={item.medicine.id} className="bg-white border border-border rounded-xl p-3 flex flex-col gap-2 relative shadow-sm animate-rise">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h4 className="font-bold text-ink text-xs truncate">{item.medicine.name}</h4>
                        <div className="flex gap-2 items-center mt-1">
                          <span className="text-[9px] text-ink-mute bg-cream px-1.5 py-0.5 rounded border border-border">
                            {item.saleType}
                          </span>
                          <span className="text-[10px] font-bold text-teal">Base: Rs {Math.round(getItemBasePrice(item))}</span>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.medicine.id)} className="text-ink-mute hover:text-red-600 p-1 transition-colors bg-cream rounded-md">
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1 bg-cream border border-border rounded-lg p-0.5">
                        <button onClick={() => updateQuantity(item.medicine.id, -1)} className="p-1 hover:text-terracotta text-ink-dim bg-white rounded shadow-sm"><Minus size={10} /></button>
                        <span className="text-xs font-bold w-5 text-center text-ink">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.medicine.id, 1)} className="p-1 hover:text-terracotta text-ink-dim bg-white rounded shadow-sm"><Plus size={10} /></button>
                      </div>
                      
                      <button onClick={() => toggleSaleType(item.medicine.id)} className="text-[9px] text-ink-mute hover:text-teal underline underline-offset-2">
                        Switch to {item.saleType === "Pack" ? "Unit" : "Pack"}
                      </button>

                      <div className="text-right">
                        {discountAmt > 0 && <span className="line-through text-[9px] text-ink-mute mr-1">Rs{Math.round(baseGross)}</span>}
                        <span className="font-bold text-ink text-xs">Rs {Math.round(netItemPrice)}</span>
                      </div>
                    </div>

                    <div className="mt-1 pt-2 border-t border-dashed border-border/50 flex items-center justify-between">
                      <span className="text-[9px] font-bold text-ink-dim uppercase flex items-center gap-1"><Percent size={10} /> Discount</span>
                      <div className="flex items-center gap-1">
                        <select 
                          value={item.discountType} 
                          onChange={(e) => updateItemDiscount(item.medicine.id, e.target.value as any, 0)} 
                          className="text-[9px] border border-border bg-cream rounded p-1 outline-none"
                        >
                          <option value="None">None</option>
                          <option value="Percentage">% Off</option>
                          <option value="Fixed">Rs Off</option>
                        </select>
                        {item.discountType !== "None" && (
                          <input 
                            type="number" 
                            placeholder="Amt"
                            value={item.discountValue || ''}
                            onChange={(e) => updateItemDiscount(item.medicine.id, item.discountType, parseFloat(e.target.value) || 0)}
                            className="w-12 text-[9px] border border-teal rounded p-1 outline-none text-right"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3 md:p-4 border-t border-border bg-white space-y-3 flex-none shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)] z-10">
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-ink-dim uppercase tracking-wider">Overall Discount</label>
                <div className="flex gap-1">
                  <select 
                    value={globalDiscountType} 
                    onChange={(e) => { setGlobalDiscountType(e.target.value as any); setGlobalDiscountValue(""); }} 
                    className="text-xs border border-border bg-cream rounded-lg p-1.5 flex-1 outline-none font-medium"
                  >
                    <option value="None">None</option>
                    <option value="Percentage">% Off</option>
                    <option value="Fixed">Rs Off</option>
                  </select>
                  {globalDiscountType !== "None" && (
                    <input 
                      type="number" 
                      value={globalDiscountValue}
                      onChange={(e) => setGlobalDiscountValue(e.target.value)}
                      className="w-14 text-xs border border-teal rounded-lg p-1.5 outline-none text-right font-bold"
                      placeholder="Amt"
                    />
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-ink-dim uppercase tracking-wider text-right">Payment Mode</label>
                <div className="flex bg-cream border border-border rounded-lg p-0.5 w-full">
                  <button 
                    onClick={() => setPaymentMethod("Cash")} 
                    className={`flex-1 py-1 text-[10px] font-bold rounded-md flex justify-center items-center gap-1 transition-colors ${paymentMethod === "Cash" ? "bg-white shadow-sm border border-border text-teal" : "text-ink-mute"}`}
                  >
                    <Banknote size={12} /> Cash
                  </button>
                  <button 
                    onClick={() => setPaymentMethod("Online")} 
                    className={`flex-1 py-1 text-[10px] font-bold rounded-md flex justify-center items-center gap-1 transition-colors ${paymentMethod === "Online" ? "bg-white shadow-sm border border-border text-teal" : "text-ink-mute"}`}
                  >
                    <CreditCard size={12} /> Online
                  </button>
                </div>
              </div>
            </div>

            {paymentMethod === "Cash" && (
              <div className="flex justify-between items-center gap-4 bg-cream/50 p-2.5 rounded-xl border border-border">
                <div className="flex items-center gap-2 text-ink-dim">
                  <Banknote size={16} className="text-teal" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Cash Given</span>
                </div>
                <input 
                  type="number" 
                  placeholder="0.00"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                  className="w-24 text-right bg-white border border-border rounded-lg py-1 px-2 text-sm font-bold focus:border-teal focus:ring-1 focus:ring-teal outline-none"
                />
              </div>
            )}

            <div className="flex justify-between items-end border-t border-dashed border-border/50 pt-2">
              <div>
                <p className="text-[9px] text-ink-mute font-bold uppercase mb-0.5">Subtotal: Rs {Math.round(subtotal)}</p>
                {overallDiscountAmount > 0 && <p className="text-[9px] text-terracotta font-bold uppercase mb-1">Disc: -Rs {Math.round(overallDiscountAmount)}</p>}
                {paymentMethod === "Cash" && (
                  <p className={`text-xs font-bold ${changeAmount > 0 ? 'text-terracotta' : 'text-ink-mute'}`}>
                    Change: Rs {changeAmount.toFixed(0)}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-[10px] text-ink-mute font-bold uppercase mb-0.5">Net Payable</p>
                <span className="text-2xl font-heading font-extrabold text-teal leading-none">
                  Rs {Math.round(netTotal)}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || isProcessing || (paymentMethod === "Cash" && cashTendered !== "" && parseFloat(cashTendered) < netTotal)}
              className="w-full bg-terracotta hover:bg-terracotta-hover text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-terracotta/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-base"
            >
              {isProcessing ? (
                <><Loader2 className="animate-spin" size={20} /> Processing...</>
              ) : (
                <>Charge Rs {Math.round(netTotal)} <ArrowRight size={20} /></>
              )}
            </button>
          </div>
        </div>
      </div>

      {receiptData && (
        <div className="fixed inset-0 z-[100] bg-ink/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-[400px] overflow-hidden shadow-2xl animate-rise flex flex-col max-h-[90vh]">
            <div className="overflow-y-auto flex-1 custom-scrollbar p-6 bg-cream/10">
              <div id="printable-receipt" className="bg-white text-black text-xs mx-auto" style={{ fontFamily: "'Courier New', Courier, monospace", maxWidth: "300px" }}>
                
                <div className="text-center mb-4">
                  <h1 className="font-extrabold text-xl mb-1 uppercase tracking-wider">Kodrift Pharmacy</h1>
                  <p className="text-[10px] uppercase font-bold leading-tight">
                    Main Bazar, Kharian<br />
                    Ph: +92 3XX XXXXXXX<br />
                    NTN # 1234567-8
                  </p>
                </div>

                <div className="text-[10px] mb-3 border-b border-black border-dashed pb-2">
                  <p>Invoice #: {receiptData.invoiceNo}</p>
                  <p>Payment: {receiptData.paymentMethod.toUpperCase()}</p>
                  <div className="flex justify-between mt-1">
                    <span>Date: {receiptData.date.toLocaleDateString('en-GB')}</span>
                    <span>Time: {receiptData.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>

                <div className="text-center font-bold text-[11px] uppercase mb-2 border-b border-black pb-1">
                  Sales Receipt
                </div>

                <div className="flex justify-between font-bold text-[10px] uppercase border-b border-black pb-1 mb-2">
                  <span className="w-1/2">Product Desc</span>
                  <span className="w-1/4 text-center">Qty x Prc</span>
                  <span className="w-1/4 text-right">Total</span>
                </div>

                <div className="space-y-3 mb-4">
                  {receiptData.items.map((item) => {
                    const baseGross = getItemBasePrice(item) * item.quantity;
                    const discountAmt = getItemDiscountAmount(item, baseGross);
                    const netItemPrice = baseGross - discountAmt;

                    return (
                      <div key={item.medicine.id} className="text-[10px]">
                        <div className="font-bold truncate">{item.medicine.name} {item.saleType === "Unit" && "(Unit)"}</div>
                        <div className="flex justify-between mt-0.5">
                          <span className="w-1/2 text-[9px]">
                            {discountAmt > 0 && `(Disc: -Rs${Math.round(discountAmt)})`}
                          </span>
                          <span className="w-1/4 text-center">{item.quantity} x {Math.round(getItemBasePrice(item))}</span>
                          <span className="w-1/4 text-right">Rs{Math.round(netItemPrice)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-black border-dashed pt-2 space-y-1 mb-4 text-[10px]">
                  <div className="flex justify-between">
                    <span>Total Items/Quantity</span>
                    <span>{receiptData.items.length} / {receiptData.items.reduce((sum, i)=>sum+i.quantity,0)}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Subtotal</span>
                    <span>Rs {Math.round(receiptData.subtotal)}</span>
                  </div>
                  {receiptData.globalDiscount > 0 && (
                    <div className="flex justify-between">
                      <span>Overall Discount</span>
                      <span>-Rs {Math.round(receiptData.globalDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-sm mt-1 pt-1 border-t border-black">
                    <span>NET INVOICE VALUE</span>
                    <span>Rs {Math.round(receiptData.total)}</span>
                  </div>
                </div>

                <div className="border-t border-black pt-2 space-y-1 text-[10px] mb-6">
                  <div className="text-center uppercase font-bold mb-1">Payments</div>
                  <div className="flex justify-between">
                    <span>TENDERED ({receiptData.paymentMethod})</span>
                    <span>Rs {Math.round(receiptData.cashTendered)}</span>
                  </div>
                  {receiptData.paymentMethod === "Cash" && (
                    <div className="flex justify-between">
                      <span>Change Due</span>
                      <span>Rs {Math.round(receiptData.changeDue)}</span>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <div className="mb-2">
                    <div className="w-full flex justify-center gap-[1px] h-8 opacity-80">
                       {Array.from({length: 40}).map((_, i) => (
                         <div key={i} className="bg-black" style={{ width: Math.random() > 0.5 ? '2px' : '1px' }}></div>
                       ))}
                    </div>
                    <span className="text-[8px] tracking-[0.2em]">{receiptData.invoiceNo.replace('INV-', '')}123</span>
                  </div>
                  <p className="text-[9px] uppercase">
                    Software by Kodrift<br/>
                    No Return Without Invoice
                  </p>
                </div>

              </div>
            </div>

            <div className="p-4 bg-white flex gap-3 border-t border-border flex-none z-10">
              <button 
                onClick={handlePrint} 
                className="flex-1 bg-teal hover:bg-teal-hover text-white py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Printer size={20} /> Print Bill
              </button>
              <button 
                onClick={() => setReceiptData(null)} 
                className="flex-1 bg-cream hover:bg-border text-ink-dim py-3.5 rounded-xl font-bold transition-all active:scale-95 border border-border"
              >
                Next Customer
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}