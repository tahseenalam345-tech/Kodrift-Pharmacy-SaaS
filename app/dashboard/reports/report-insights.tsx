"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { AlertTriangle, TrendingUp, CreditCard, Banknote, ShieldAlert, PackageX, Landmark, Users } from "lucide-react";

type InsightProps = {
  topSellers: { name: string; quantity: number; revenue: number }[];
  lowStockItems: { name: string; stock: number; expiry?: string }[];
  paymentBreakdown: { cash: number; online: number };
  taxPaid: number;
  pendingPayables: number;
  staffPerformance: { name: string; salesCount: number; revenue: number }[]; // NAYA PROP
};

export function ReportInsights({ topSellers, lowStockItems, paymentBreakdown, taxPaid, pendingPayables, staffPerformance }: InsightProps) {
  
  const paymentData = [
    { name: "Cash", value: paymentBreakdown.cash, color: "#14B8A6" },
    { name: "Online/Card", value: paymentBreakdown.online, color: "#F43F5E" } 
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 page-break">
      
      {/* 1. INVENTORY INTELLIGENCE & STAFF PERFORMANCE */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Top Sellers Table */}
        <div className="bg-white border border-border rounded-3xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-teal" size={20} />
            <h3 className="text-lg font-heading font-semibold text-ink">Top Selling Medicines</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-ink-dim">
              <thead className="bg-cream/50 text-ink-mute uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-3 rounded-tl-lg">Product Name</th>
                  <th className="p-3 text-center">Units Sold</th>
                  <th className="p-3 text-right rounded-tr-lg">Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {topSellers.length > 0 ? topSellers.map((item, idx) => (
                  <tr key={idx} className="hover:bg-cream/30 transition-colors">
                    <td className="p-3 font-bold text-ink">{item.name}</td>
                    <td className="p-3 text-center font-bold text-teal">{item.quantity}</td>
                    <td className="p-3 text-right text-ink">Rs {Math.round(item.revenue).toLocaleString()}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} className="p-4 text-center text-ink-mute text-xs">No sales data in this period.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* NAYA: STAFF PERFORMANCE LEADERBOARD */}
        <div className="bg-white border border-border rounded-3xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Users className="text-terracotta" size={20} />
            <h3 className="text-lg font-heading font-semibold text-ink">Staff Performance (Shift Sales)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staffPerformance.length > 0 ? staffPerformance.map((staff, idx) => (
              <div key={idx} className="bg-cream border border-border rounded-xl p-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-terracotta shadow-sm">
                    {staff.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-ink">{staff.name}</p>
                    <p className="text-[10px] text-ink-mute uppercase font-bold">{staff.salesCount} Invoices Billed</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-teal">Rs {Math.round(staff.revenue).toLocaleString()}</span>
                </div>
              </div>
            )) : (
              <div className="col-span-2 text-center p-4 text-ink-mute text-xs">No staff sales recorded yet.</div>
            )}
          </div>
        </div>

        {/* Expiry Warnings */}
        <div className="bg-red-50 border border-red-200 rounded-3xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="text-red-600" size={20} />
            <h3 className="text-lg font-heading font-semibold text-red-700">Action Required: Dead Stock & Near Expiry</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lowStockItems.length > 0 ? lowStockItems.map((item, idx) => (
              <div key={idx} className="bg-white border border-red-100 rounded-xl p-3 flex justify-between items-center shadow-sm">
                <div>
                  <p className="font-bold text-sm text-ink truncate max-w-[150px]">{item.name}</p>
                  {item.expiry && <p className="text-[10px] text-red-500 font-bold uppercase mt-0.5">Expires: {new Date(item.expiry).toLocaleDateString('en-GB')}</p>}
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-red-600">{item.stock}</span>
                  <span className="text-[9px] block text-ink-mute uppercase font-bold">In Stock</span>
                </div>
              </div>
            )) : (
              <div className="col-span-2 text-center p-4 text-success font-bold text-sm flex items-center justify-center gap-2">
                <PackageX size={16}/> Inventory looks healthy! No critical warnings.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. CASH FLOW & PAYABLES */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white border border-border rounded-3xl p-5 md:p-6 shadow-sm flex flex-col h-full max-h-[350px]">
          <h3 className="text-sm font-bold text-ink-dim uppercase tracking-wider mb-2">Payment Breakdown</h3>
          <div className="flex-1 min-h-[150px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: any) => `Rs ${Number(value).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-ink-mute font-bold uppercase">Total</span>
              <span className="text-lg font-bold text-ink">Rs {Math.round(paymentBreakdown.cash + paymentBreakdown.online).toLocaleString()}</span>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4 bg-cream p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <Banknote size={16} className="text-teal"/>
              <span className="text-xs font-bold text-ink-dim">Cash</span>
            </div>
            <span className="font-bold text-teal">Rs {Math.round(paymentBreakdown.cash).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center mt-2 bg-cream p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <CreditCard size={16} className="text-terracotta"/>
              <span className="text-xs font-bold text-ink-dim">Online</span>
            </div>
            <span className="font-bold text-terracotta">Rs {Math.round(paymentBreakdown.online).toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white border border-border rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><AlertTriangle size={18}/></div>
            <div>
              <h4 className="text-[10px] font-bold text-ink-mute uppercase tracking-wider">Supplier Payables</h4>
              <p className="text-lg font-bold text-ink">Rs {Math.round(pendingPayables).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-border rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-teal-soft rounded-lg text-teal"><Landmark size={18}/></div>
            <div>
              <h4 className="text-[10px] font-bold text-ink-mute uppercase tracking-wider">Tax / GST Paid</h4>
              <p className="text-lg font-bold text-teal">Rs {Math.round(taxPaid).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}