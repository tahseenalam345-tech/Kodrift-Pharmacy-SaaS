import { createServer } from "@/lib/supabase/server";
import { 
  TrendingUp, 
  PackageSearch, 
  Activity, 
  Wallet, 
  Receipt,
  AlertTriangle,
  Clock,
  ArrowRight,
  Users,
  ChevronDown,
  Truck
} from "lucide-react";
import Link from "next/link";
import RevenueChart from "./components/revenue-chart";

export default async function DashboardOverview() {
  const supabase = await createServer();

  // Date Calculations
  const today = new Date();
  const todayDateString = today.toISOString().split('T')[0];
  
  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfDayStr = startOfToday.toISOString();
  
  const endOfToday = new Date(today);
  endOfToday.setHours(23, 59, 59, 999);
  const endOfDayStr = endOfToday.toISOString();

  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();

  // Parallel Data Fetching with Nested Joins
  const [
    { data: weeklySales },
    { data: todayExpenses },
    { data: inventory },
    { data: recentSales },
    { data: staffActivity },
    { data: recentPurchases }
  ] = await Promise.all([
    supabase.from("sales").select("net_total, profit, created_at").gte("created_at", thirtyDaysAgoStr),
    supabase.from("expenses").select("amount").eq("expense_date", todayDateString),
    supabase.from("medicines").select("id, name, stock, cost_price"),
    // Fetching Sales WITH nested sold items inside them for the expandable accordion
    supabase.from("sales").select(`
      id, net_total, created_at,
      sale_items ( quantity, price, medicines ( name ) )
    `).order("created_at", { ascending: false }).limit(5),
    // Fetching Activity WITH Staff Details
    supabase.from("staff_activity").select(`
      staff_id, type, created_at,
      staff ( name, role )
    `).gte("created_at", startOfDayStr).order("created_at", { ascending: true }),
    // Fetching Purchases for Analytics
    supabase.from("purchases").select("id, supplier_name, total_amount, created_at").gte("created_at", thirtyDaysAgoStr)
  ]);

  // 1. Financial KPIs
  const todaySalesData = weeklySales?.filter(s => s.created_at >= startOfDayStr && s.created_at <= endOfDayStr) || [];
  const dailyRevenue = todaySalesData.reduce((sum, sale) => sum + Number(sale.net_total), 0);
  const grossProfit = todaySalesData.reduce((sum, sale) => sum + Number(sale.profit), 0);
  const dailyOutflow = todayExpenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
  const trueNetProfit = grossProfit - dailyOutflow;

  // 2. Inventory & Stock Alerts
  const totalInventoryValue = inventory?.reduce((sum, item) => sum + (Number(item.stock) * Number(item.cost_price)), 0) || 0;
  const lowStockItems = inventory?.filter(item => item.stock > 0 && item.stock <= 10).sort((a, b) => a.stock - b.stock) || [];
  const outOfStockItems = inventory?.filter(item => item.stock === 0) || [];
  const criticalItemsCount = lowStockItems.length + outOfStockItems.length;

  // 3. Chart Data (Last 7 Days)
  const chartDataMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    chartDataMap[dateStr] = 0;
  }
  weeklySales?.forEach(sale => {
    const saleDate = new Date(sale.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    if (chartDataMap[saleDate] !== undefined) {
      chartDataMap[saleDate] += Number(sale.net_total);
    }
  });
  const revenueChartData = Object.keys(chartDataMap).map(key => ({ date: key, revenue: chartDataMap[key] }));

  // 4. Live Staff Processing
  const activeStaffMap = new Map<string, { name: string, role: string, time: string }>();
  staffActivity?.forEach(activity => {
    if (activity.type === 'Login') {
      activeStaffMap.set(activity.staff_id, {
        name: (activity.staff as any)?.name || 'Unknown Staff',
        role: (activity.staff as any)?.role || 'Role N/A',
        time: activity.created_at
      });
    } else if (activity.type === 'Logout') {
      activeStaffMap.delete(activity.staff_id);
    }
  });
  const activeStaffList = Array.from(activeStaffMap.values());
  const activeStaffCount = activeStaffList.length;

  // 5. Deep Analytics (Top Suppliers / Cost Analysis)
  const supplierTotals: Record<string, number> = {};
  recentPurchases?.forEach(p => {
    const name = p.supplier_name || "Unknown Vendor";
    supplierTotals[name] = (supplierTotals[name] || 0) + Number(p.total_amount);
  });
  const topSuppliers = Object.entries(supplierTotals)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 3); // Top 3 costly suppliers

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 md:pb-10">

      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-semibold text-teal">Command Center</h1>
          <p className="text-ink-dim text-sm mt-1">Real-time financial health and operations overview.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Link href="/dashboard/sales" className="flex-1 md:flex-none text-center bg-terracotta hover:bg-terracotta-hover text-white text-sm font-bold py-2.5 px-6 rounded-xl transition-all shadow-md shadow-terracotta/20 active:scale-95">
            New Sale
          </Link>
          <Link href="/dashboard/purchases" className="flex-1 md:flex-none text-center bg-white border border-border hover:border-teal hover:bg-teal-soft text-teal text-sm font-bold py-2.5 px-6 rounded-xl transition-all active:scale-95">
            Restock
          </Link>
        </div>
      </header>

      {/* LAYER 1: KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ... (Existing KPI Cards remain exactly the same as previous) ... */}
        <div className="animate-rise bg-white border border-border p-5 rounded-2xl relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg hover:border-teal/40 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-[0.06] pointer-events-none text-teal"><Wallet size={64} /></div>
          <h3 className="text-[10px] font-bold text-ink-mute uppercase tracking-wider mb-2 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-teal"></span>Today's Revenue</h3>
          <p className="text-2xl md:text-3xl font-heading font-semibold text-teal truncate">Rs {Math.round(dailyRevenue).toLocaleString()}</p>
        </div>
        <div className="animate-rise bg-white border border-border p-5 rounded-2xl relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg hover:border-terracotta/40 transition-all" style={{ animationDelay: '0.1s' }}>
          <div className="absolute top-0 right-0 p-4 opacity-[0.06] pointer-events-none text-terracotta"><Receipt size={64} /></div>
          <h3 className="text-[10px] font-bold text-ink-mute uppercase tracking-wider mb-2 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-terracotta"></span>Today's Expenses</h3>
          <p className="text-2xl md:text-3xl font-heading font-semibold text-terracotta-hover truncate">Rs {Math.round(dailyOutflow).toLocaleString()}</p>
        </div>
        <div className="animate-rise bg-white border border-border p-5 rounded-2xl relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg hover:border-success/40 transition-all" style={{ animationDelay: '0.15s' }}>
          <div className="absolute top-0 right-0 p-4 opacity-[0.06] pointer-events-none text-success"><TrendingUp size={64} /></div>
          <h3 className="text-[10px] font-bold text-ink-mute uppercase tracking-wider mb-2 flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${trueNetProfit >= 0 ? 'bg-success' : 'bg-red-500'}`}></span>True Net Profit</h3>
          <p className={`text-2xl md:text-3xl font-heading font-semibold truncate ${trueNetProfit >= 0 ? 'text-success' : 'text-red-500'}`}>Rs {Math.round(trueNetProfit).toLocaleString()}</p>
        </div>
        <div className="animate-rise bg-white border border-border p-5 rounded-2xl relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg hover:border-teal/40 transition-all" style={{ animationDelay: '0.2s' }}>
          <div className="absolute top-0 right-0 p-4 opacity-[0.06] pointer-events-none text-teal"><PackageSearch size={64} /></div>
          <h3 className="text-[10px] font-bold text-ink-mute uppercase tracking-wider mb-2 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-teal"></span>Asset Value</h3>
          <p className="text-2xl md:text-3xl font-heading font-semibold text-teal truncate">Rs {Math.round(totalInventoryValue).toLocaleString()}</p>
        </div>
      </div>

      {/* LAYER 2: CHART & ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: 7-Day Chart */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm h-full">
            <h2 className="text-lg font-heading font-semibold text-teal">7-Day Revenue Trend</h2>
            <p className="text-xs text-ink-mute mb-2">Daily gross sales performance</p>
            <RevenueChart data={revenueChartData} />
          </div>
        </div>

        {/* Right Column: Alerts & Staff */}
        <div className="space-y-6">
          
          {/* Critical Inventory Alerts */}
          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm relative overflow-hidden">
            {criticalItemsCount > 0 && <div className="absolute top-0 left-0 w-full h-1 bg-terracotta animate-pulse"></div>}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-heading font-semibold text-teal flex items-center gap-2">
                <AlertTriangle size={20} className={criticalItemsCount > 0 ? "text-terracotta" : "text-ink-mute"} /> Stock Alerts
              </h2>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${criticalItemsCount > 0 ? 'bg-terracotta/10 text-terracotta' : 'bg-cream text-ink-mute'}`}>
                {criticalItemsCount} Issues
              </span>
            </div>

            <div className="space-y-3 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
              {outOfStockItems.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 rounded-xl border border-red-200 bg-red-50">
                  <div className="truncate pr-2">
                    <p className="text-sm font-bold text-red-700 truncate">{item.name}</p>
                    <p className="text-xs text-red-500 uppercase tracking-wider font-semibold">Out of Stock</p>
                  </div>
                  <Link href="/dashboard/purchases" className="text-[10px] font-bold bg-white text-red-600 px-2 py-1 rounded-md border border-red-200 hover:bg-red-600 hover:text-white transition-colors">Order</Link>
                </div>
              ))}
              {lowStockItems.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 rounded-xl border border-orange-200 bg-orange-50">
                  <div className="truncate pr-2">
                    <p className="text-sm font-bold text-orange-800 truncate">{item.name}</p>
                    <p className="text-xs text-orange-600 font-medium">Stock: {item.stock} left</p>
                  </div>
                  <Link href="/dashboard/purchases" className="text-[10px] font-bold bg-white text-orange-600 px-2 py-1 rounded-md border border-orange-200 hover:bg-orange-600 hover:text-white transition-colors">Order</Link>
                </div>
              ))}
              {criticalItemsCount === 0 && (
                <div className="text-center py-6">
                  <PackageSearch className="mx-auto text-ink-mute mb-2 opacity-50" size={28} />
                  <p className="text-sm text-ink-dim font-medium">Inventory is healthy!</p>
                </div>
              )}
            </div>
          </div>

          {/* Active Staff Monitor */}
          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-heading font-semibold text-teal flex items-center gap-2">
                <Users size={20} className="text-teal" /> Live Staff
              </h2>
              <span className="px-2 py-1 rounded-full text-xs font-bold bg-success/10 text-success flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                {activeStaffCount} Active
              </span>
            </div>
            
            <div className="space-y-2">
              {activeStaffCount > 0 ? (
                activeStaffList.map((staff, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-border bg-cream/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal text-white flex items-center justify-center text-xs font-bold">
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-ink leading-none">{staff.name}</p>
                        <p className="text-[10px] text-ink-mute mt-1 uppercase tracking-wider">{staff.role}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-teal font-semibold">Clocked In</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 bg-cream/50 rounded-xl border border-border border-dashed">
                  <p className="text-xs text-ink-mute">No staff members clocked in.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* LAYER 3: DEEP ANALYTICS & EXPANDABLE TRANSACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Expandable Live Transactions */}
        <div className="bg-white border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-heading font-semibold text-teal flex items-center gap-2">
              <Clock size={20} className="text-terracotta" /> Recent Sales
            </h2>
          </div>
          
          {recentSales && recentSales.length > 0 ? (
            <div className="space-y-3">
              {recentSales.map((sale) => (
                <details key={sale.id} className="group p-3 rounded-xl border border-border bg-cream/30 hover:bg-cream transition-colors cursor-pointer">
                  <summary className="flex justify-between items-center list-none outline-none">
                    <div className="flex items-center gap-2">
                      <ChevronDown size={16} className="text-ink-mute group-open:rotate-180 transition-transform" />
                      <div>
                        <p className="text-sm font-bold text-ink group-open:text-terracotta transition-colors">INV-{sale.id.slice(0,6).toUpperCase()}</p>
                        <p className="text-[10px] text-ink-mute">{new Date(sale.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-teal">Rs {sale.net_total}</p>
                      <span className="px-1.5 py-0.5 bg-success/10 text-success text-[8px] font-bold rounded uppercase">Completed</span>
                    </div>
                  </summary>
                  
                  {/* Expanded Receipt Details */}
                  <div className="mt-3 pt-3 border-t border-border/50 pl-6">
                    <table className="w-full text-xs text-ink-dim">
                      <tbody>
                        {sale.sale_items?.map((item: any, idx: number) => (
                          <tr key={idx} className="border-b border-border/30 last:border-0">
                            <td className="py-1.5 truncate pr-2">{(item.medicines as any)?.name || 'Unknown Item'}</td>
                            <td className="py-1.5 text-center">{item.quantity}x</td>
                            <td className="py-1.5 text-right font-medium text-ink">Rs {item.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-mute text-center py-6">No sales recorded yet.</p>
          )}
        </div>

        {/* Vendor Insights & Purchases Analytics */}
        <div className="bg-white border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-heading font-semibold text-teal flex items-center gap-2">
              <Truck size={20} className="text-teal" /> Vendor Insights (Last 30 Days)
            </h2>
          </div>
          
          {topSuppliers.length > 0 ? (
            <div className="space-y-4">
              <p className="text-xs text-ink-dim mb-3">Your most expensive suppliers based on restock amounts:</p>
              {topSuppliers.map((supplier, idx) => {
                const maxTotal = topSuppliers[0].total;
                const percentage = (supplier.total / maxTotal) * 100;
                
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-ink">{supplier.name}</span>
                      <span className="font-bold text-terracotta-hover">Rs {supplier.total.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-cream rounded-full h-2 overflow-hidden border border-border/50">
                      <div className="bg-teal h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
              
              <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
                <div>
                  <p className="text-xs text-ink-mute">Total Purchase Value</p>
                  <p className="text-lg font-heading font-bold text-teal">
                    Rs {recentPurchases?.reduce((sum, p) => sum + Number(p.total_amount), 0).toLocaleString()}
                  </p>
                </div>
                <Link href="/dashboard/purchases" className="text-xs font-bold text-teal hover:text-terracotta flex items-center gap-1 transition-colors">
                  View Purchase Logs <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 bg-cream/30 rounded-xl border border-border border-dashed">
              <p className="text-sm text-ink-dim font-medium">No purchase data found.</p>
              <p className="text-xs text-ink-mute mt-1">Add restocks to see vendor analytics.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}