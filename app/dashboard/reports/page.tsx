import { createServer } from "@/lib/supabase/server";
import { ReportFilter } from "./report-filter";
import { ReportCharts } from "./report-charts"; 
import { ReportInsights } from "./report-insights";
import { ExportPdfBtn } from "./export-pdf-btn"; 
import { BarChart3, TrendingUp, Receipt, Truck, WalletCards, ArrowUpRight, ArrowDownRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ from?: string, to?: string }> }) {
  const { from, to } = await searchParams;
  const supabase = await createServer();

  const date = new Date();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString();

  const startDate = from ? new Date(from).toISOString() : firstDay;
  const endDateObj = to ? new Date(to) : new Date(lastDay);
  if (to) endDateObj.setHours(23, 59, 59, 999);
  const endDate = endDateObj.toISOString();

  const displayStart = new Date(startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const displayEnd = new Date(endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  // 1. Fetch Sales (With Cashier Name)
  const { data: sales } = await supabase
    .from("sales")
    .select("net_total, profit, created_at, payment_method, cashier_name")
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  // 2. Fetch Expenses (With Tax)
  const expenseStart = startDate.split('T')[0];
  const expenseEnd = endDate.split('T')[0];
  const { data: expenses } = await supabase
    .from("expenses")
    .select("amount, expense_date, tax_amount")
    .gte("expense_date", expenseStart)
    .lte("expense_date", expenseEnd);

  // 3. Fetch Purchases
  const { data: purchases } = await supabase
    .from("purchases")
    .select("total_amount, amount_paid, created_at")
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  // 4. Fetch Sale Items
  const { data: saleItemsRaw } = await supabase
    .from("sale_items")
    .select(`quantity, total_price, medicines ( name )`);

  // 5. Fetch Critical Inventory
  const { data: inventoryWarnings } = await supabase
    .from("medicines")
    .select("name, stock, expiry_date")
    .or('stock.lte.5,expiry_date.lte.2026-12-31') 
    .limit(4);

  // Totals Calculation (FIXED: Added tax_amount to totalExpenses)
  const totalRevenue = sales?.reduce((sum, sale) => sum + Number(sale.net_total), 0) || 0;
  const grossProfit = sales?.reduce((sum, sale) => sum + Number(sale.profit), 0) || 0;
  const totalExpenses = expenses?.reduce((sum, exp) => sum + Number(exp.amount) + Number(exp.tax_amount || 0), 0) || 0;
  const totalPurchases = purchases?.reduce((sum, p) => sum + Number(p.total_amount), 0) || 0;
  
  const trueNetProfit = grossProfit - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (trueNetProfit / totalRevenue) * 100 : 0;

  // Insights Calculations
  let cashTotal = 0;
  let onlineTotal = 0;
  const staffMap = new Map(); 

  sales?.forEach(sale => {
    // Payment breakdown
    if (sale.payment_method === 'Online' || sale.payment_method === 'Online Wallet' || sale.payment_method === 'Bank Transfer') {
      onlineTotal += Number(sale.net_total);
    } else {
      cashTotal += Number(sale.net_total);
    }

    // Staff breakdown
    const cName = sale.cashier_name || "Admin";
    if (!staffMap.has(cName)) {
      staffMap.set(cName, { name: cName, salesCount: 0, revenue: 0 });
    }
    const staff = staffMap.get(cName);
    staff.salesCount += 1;
    staff.revenue += Number(sale.net_total);
  });

  const staffPerformance = Array.from(staffMap.values()).sort((a, b) => b.revenue - a.revenue);
  const totalTaxPaid = expenses?.reduce((sum, exp) => sum + Number(exp.tax_amount || 0), 0) || 0;
  const pendingPayables = purchases?.reduce((sum, p) => sum + (Number(p.total_amount) - Number(p.amount_paid || 0)), 0) || 0;

  // Process Top Sellers
  const sellerMap = new Map();
  saleItemsRaw?.forEach((item: any) => {
    const name = item.medicines?.name || "Unknown";
    if (!sellerMap.has(name)) {
      sellerMap.set(name, { name, quantity: 0, revenue: 0 });
    }
    const current = sellerMap.get(name);
    current.quantity += Number(item.quantity);
    current.revenue += Number(item.total_price || 0);
  });
  const topSellers = Array.from(sellerMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const lowStockItems = inventoryWarnings?.map(i => ({ name: i.name, stock: i.stock, expiry: i.expiry_date })) || [];

  // Chart Data (FIXED: Added tax_amount to daily expense and profit calculations)
  const dailyDataMap = new Map();
  let currentDay = new Date(startDate);
  const end = new Date(endDate);
  while (currentDay <= end) {
    const dateStr = currentDay.toISOString().split('T')[0];
    dailyDataMap.set(dateStr, { date: dateStr, revenue: 0, profit: 0, expense: 0 });
    currentDay.setDate(currentDay.getDate() + 1);
  }

  sales?.forEach(sale => {
    const dateStr = sale.created_at.split('T')[0];
    if (dailyDataMap.has(dateStr)) {
      const dayData = dailyDataMap.get(dateStr);
      dayData.revenue += Number(sale.net_total);
      dayData.profit += Number(sale.profit);
    }
  });

  expenses?.forEach(exp => {
    const dateStr = exp.expense_date.split('T')[0];
    if (dailyDataMap.has(dateStr)) {
      const dayData = dailyDataMap.get(dateStr);
      const dailyTotalExpense = Number(exp.amount) + Number(exp.tax_amount || 0);
      dayData.expense += dailyTotalExpense;
      dayData.profit -= dailyTotalExpense;
    }
  });

  const chartData = Array.from(dailyDataMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div id="report-container" className="max-w-7xl mx-auto space-y-6 pb-20 md:pb-10">
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-semibold text-teal flex items-center gap-3">
            <BarChart3 className="text-terracotta" />
            Financial Analytics
          </h1>
          <p className="text-ink-dim text-sm mt-1">
            Showing performance from <strong className="text-ink">{displayStart}</strong> to <strong className="text-ink">{displayEnd}</strong>
          </p>
        </div>
        
        <div className="flex gap-2">
          <ExportPdfBtn />
        </div>
      </header>

      <ReportFilter />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-border p-5 rounded-3xl relative overflow-hidden group shadow-sm transition-all hover:shadow-md">
          <div className="absolute top-4 right-4 text-teal/20 group-hover:text-teal/40 transition-colors"><WalletCards size={48} /></div>
          <h3 className="text-[10px] font-bold text-ink-mute uppercase tracking-wider mb-2">Total Revenue</h3>
          <p className="text-2xl md:text-3xl font-heading font-bold text-teal">Rs {Math.round(totalRevenue).toLocaleString()}</p>
        </div>
        <div className="bg-white border border-border p-5 rounded-3xl relative overflow-hidden group shadow-sm transition-all hover:shadow-md">
          <div className="absolute top-4 right-4 text-success/20 group-hover:text-success/40 transition-colors"><TrendingUp size={48} /></div>
          <h3 className="text-[10px] font-bold text-ink-mute uppercase tracking-wider mb-2">Gross Sales Profit</h3>
          <p className="text-2xl md:text-3xl font-heading font-bold text-success">Rs {Math.round(grossProfit).toLocaleString()}</p>
        </div>
        <div className="bg-white border border-border p-5 rounded-3xl relative overflow-hidden group shadow-sm transition-all hover:shadow-md">
          <div className="absolute top-4 right-4 text-terracotta/20 group-hover:text-terracotta/40 transition-colors"><Receipt size={48} /></div>
          <h3 className="text-[10px] font-bold text-ink-mute uppercase tracking-wider mb-2">Total Expenses</h3>
          <p className="text-2xl md:text-3xl font-heading font-bold text-terracotta-hover">Rs {Math.round(totalExpenses).toLocaleString()}</p>
        </div>
        <div className="bg-white border border-border p-5 rounded-3xl relative overflow-hidden group shadow-sm transition-all hover:shadow-md">
          <div className="absolute top-4 right-4 text-ink-mute/20 group-hover:text-ink-mute/40 transition-colors"><Truck size={48} /></div>
          <h3 className="text-[10px] font-bold text-ink-mute uppercase tracking-wider mb-2">Inventory Purchases</h3>
          <p className="text-2xl md:text-3xl font-heading font-bold text-ink-dim">Rs {Math.round(totalPurchases).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 page-break">
        <div className={`lg:col-span-2 border p-6 md:p-8 rounded-3xl relative overflow-hidden flex flex-col justify-center shadow-sm ${trueNetProfit >= 0 ? 'bg-success-soft border-success/30' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xs font-bold text-ink-mute uppercase tracking-widest">Actual Net Cash Flow</h3>
            <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${trueNetProfit >= 0 ? 'bg-success/20 text-success' : 'bg-red-200 text-red-600'}`}>After Expenses</span>
          </div>
          <div className="flex items-end gap-4">
            <p className={`text-4xl md:text-6xl font-heading font-extrabold tracking-tight ${trueNetProfit >= 0 ? 'text-success' : 'text-red-600'}`}>
              Rs {Math.round(trueNetProfit).toLocaleString()}
            </p>
            {trueNetProfit >= 0 ? <ArrowUpRight className="text-success mb-2" size={40} /> : <ArrowDownRight className="text-red-600 mb-2" size={40} />}
          </div>
        </div>

        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-[10px] font-bold text-ink-mute uppercase tracking-wider mb-1">Net Profit Margin</h3>
            <span className="text-4xl font-heading font-bold text-teal">{profitMargin.toFixed(1)}%</span>
          </div>
          <div className="mt-6 pt-6 border-t border-dashed border-border">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-ink-dim">Expense Ratio</span>
              <span className="text-xs font-bold text-terracotta">{totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(1) : 0}%</span>
            </div>
            <div className="w-full bg-cream h-2 rounded-full overflow-hidden">
              <div className="bg-terracotta h-full rounded-full" style={{ width: `${Math.min(100, totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0)}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-break">
        <ReportCharts data={chartData} />
      </div>

      <ReportInsights 
        topSellers={topSellers} 
        lowStockItems={lowStockItems} 
        paymentBreakdown={{ cash: cashTotal, online: onlineTotal }} 
        taxPaid={totalTaxPaid} 
        pendingPayables={pendingPayables} 
        staffPerformance={staffPerformance}
      />

    </div>
  );
}
