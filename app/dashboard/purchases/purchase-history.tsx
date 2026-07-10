"use client";

import { useState, useMemo } from "react";
import { Search, ChevronDown, Calendar, Banknote, Clock, AlertCircle, FileText } from "lucide-react";

type PurchaseRecord = {
  id: string;
  supplier_name: string;
  total_amount: number;
  payment_status: string;
  payment_method: string;
  amount_paid: number;
  due_date: string | null;
  created_at: string;
};

export function PurchaseHistory({ purchases }: { purchases: PurchaseRecord[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // 1. Filter Purchases based on search and status
  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => {
      const matchesSearch = p.supplier_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "All" || p.payment_status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [purchases, searchTerm, filterStatus]);

  // 2. Group filtered purchases by Supplier Name (Ledger System)
  const groupedBySupplier = useMemo(() => {
    const groups: Record<string, PurchaseRecord[]> = {};
    filteredPurchases.forEach(p => {
      if (!groups[p.supplier_name]) groups[p.supplier_name] = [];
      groups[p.supplier_name].push(p);
    });
    return groups;
  }, [filteredPurchases]);

  return (
    <div className="bg-white border border-border rounded-3xl p-5 md:p-6 shadow-sm mt-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-heading font-semibold text-teal flex items-center gap-2">
            <FileText className="text-terracotta" size={24} />
            Supplier Ledgers & History
          </h2>
          <p className="text-[10px] text-ink-mute font-bold uppercase tracking-wider mt-1">Track pending dues and past records</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-ink-mute" size={16} />
            <input
              type="text"
              placeholder="Search distributor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-3 py-2 bg-cream border border-border rounded-xl text-sm focus:outline-none focus:border-teal transition-colors"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-cream border border-border rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-teal font-medium"
          >
            <option value="All">All Payments</option>
            <option value="Paid">Fully Paid</option>
            <option value="Pending">Pending / Udhaar</option>
            <option value="Partial">Partial Paid</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {Object.keys(groupedBySupplier).length === 0 ? (
          <div className="text-center p-8 bg-cream/50 rounded-2xl border border-dashed border-border text-ink-mute">
            No history found for this filter.
          </div>
        ) : (
          Object.entries(groupedBySupplier).map(([supplierName, supplierPurchases]) => {
            
            // Calculate Supplier Totals for the Header
            const totalVolume = supplierPurchases.reduce((sum, p) => sum + Number(p.total_amount), 0);
            const totalPaid = supplierPurchases.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0);
            const totalPending = totalVolume - totalPaid;

            return (
              <details key={supplierName} className="group bg-white border border-border hover:border-teal/50 rounded-2xl overflow-hidden transition-all shadow-sm">
                
                {/* ACCORDION HEADER (Distributor Summary) */}
                <summary className="p-4 list-none outline-none cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 bg-cream/30 hover:bg-cream/60 transition-colors relative">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white border border-border rounded-xl flex items-center justify-center text-teal font-bold text-lg shadow-sm">
                      {supplierName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-ink text-base">{supplierName}</h3>
                      <p className="text-[10px] text-ink-mute font-bold uppercase tracking-wider">{supplierPurchases.length} Transactions</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 md:gap-8">
                    <div className="text-right">
                      <p className="text-[10px] text-ink-mute uppercase font-bold">Total Volume</p>
                      <p className="font-bold text-ink text-sm">Rs {totalVolume.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-ink-mute uppercase font-bold">Pending Dues</p>
                      <p className={`font-bold text-sm ${totalPending > 0 ? 'text-red-600' : 'text-success'}`}>
                        Rs {totalPending.toLocaleString()}
                      </p>
                    </div>
                    <ChevronDown size={20} className="text-ink-mute group-open:rotate-180 transition-transform ml-2" />
                  </div>
                </summary>

                {/* ACCORDION BODY (Detailed Table) */}
                <div className="p-0 md:p-4 bg-white border-t border-border/50">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-ink-dim min-w-[600px]">
                      <thead className="bg-cream/50 text-ink-mute uppercase text-[10px] font-bold tracking-wider">
                        <tr>
                          <th className="p-3 rounded-tl-lg">Date & Time</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Bill Amount</th>
                          <th className="p-3 text-right">Paid</th>
                          <th className="p-3 text-right">Balance</th>
                          <th className="p-3 rounded-tr-lg">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {supplierPurchases.map((purchase) => {
                          const balance = Number(purchase.total_amount) - Number(purchase.amount_paid || 0);
                          
                          return (
                            <tr key={purchase.id} className="hover:bg-cream/30 transition-colors">
                              <td className="p-3 whitespace-nowrap">
                                <div className="font-medium text-ink flex items-center gap-1.5">
                                  <Calendar size={12} className="text-teal"/> 
                                  {new Date(purchase.created_at).toLocaleDateString('en-GB')}
                                </div>
                                <div className="text-[10px] text-ink-mute mt-0.5 ml-4">
                                  {new Date(purchase.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider border ${
                                  purchase.payment_status === 'Paid' ? 'bg-success/10 text-success border-success/20' : 
                                  purchase.payment_status === 'Pending' ? 'bg-red-100 text-red-600 border-red-200' : 
                                  'bg-orange-100 text-orange-600 border-orange-200'
                                }`}>
                                  {purchase.payment_status}
                                </span>
                              </td>
                              <td className="p-3 text-right font-bold text-ink">
                                Rs {Number(purchase.total_amount).toLocaleString()}
                              </td>
                              <td className="p-3 text-right">
                                <div className="font-bold text-teal">Rs {Number(purchase.amount_paid || 0).toLocaleString()}</div>
                                <div className="text-[9px] text-ink-mute">{purchase.payment_method}</div>
                              </td>
                              <td className="p-3 text-right">
                                {balance > 0 ? (
                                  <span className="font-bold text-red-600">Rs {balance.toLocaleString()}</span>
                                ) : (
                                  <span className="text-[10px] text-ink-mute">-</span>
                                )}
                              </td>
                              <td className="p-3">
                                {balance > 0 && purchase.due_date && (
                                  <div className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100 w-max">
                                    <Clock size={10} /> Due: {new Date(purchase.due_date).toLocaleDateString('en-GB')}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </details>
            );
          })
        )}
      </div>
    </div>
  );
}