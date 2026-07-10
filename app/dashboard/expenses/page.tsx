import { createServer } from "@/lib/supabase/server";
import { Expense } from "@/types";
import { ExpenseForm } from "./expense-form";
import { ExpenseList } from "./expense-list"; // Hamara naya component
import { WalletCards, TrendingDown, LayoutDashboard } from "lucide-react";

export default async function ExpensesPage() {
  const supabase = await createServer();

  // Load expenses
  const { data: rawExpenses, error } = await supabase
    .from("expenses")
    .select("*")
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="p-4 text-red-600">Failed to load expenses: {error.message}</div>;
  }

  const expenses = (rawExpenses as Expense[]) || [];
  
  // Basic Analytics
  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  
  // Calculate expenses for current month only
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthExpenses = expenses.reduce((sum, exp) => {
    const expDate = new Date(exp.expense_date);
    if (expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear) {
      return sum + Number(exp.amount);
    }
    return sum;
  }, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 md:pb-10">

      {/* HEADER WITH ANALYTICS CARDS */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-heading font-semibold text-teal flex items-center gap-3">
            <WalletCards className="text-terracotta" />
            Operating Expenses
          </h1>
          <p className="text-ink-dim text-sm mt-1">Track bills, salaries, and shop maintenance.</p>
        </div>
        
        <div className="flex gap-3 w-full lg:w-auto">
          <div className="flex-1 lg:flex-none bg-white border border-border px-5 py-3 rounded-2xl shadow-sm flex flex-col justify-center">
            <span className="text-[10px] text-ink-mute uppercase font-bold tracking-wider flex items-center gap-1"><TrendingDown size={12} className="text-terracotta"/> This Month</span>
            <span className="text-xl font-heading font-semibold text-terracotta-hover mt-1">Rs {thisMonthExpenses.toLocaleString()}</span>
          </div>
          <div className="flex-1 lg:flex-none bg-cream border border-border px-5 py-3 rounded-2xl shadow-sm flex flex-col justify-center">
            <span className="text-[10px] text-ink-mute uppercase font-bold tracking-wider flex items-center gap-1"><LayoutDashboard size={12}/> All Time</span>
            <span className="text-xl font-heading font-semibold text-ink mt-1">Rs {totalExpenses.toLocaleString()}</span>
          </div>
        </div>
      </header>

      {/* MAIN GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT: ADD EXPENSE FORM */}
        <div className="lg:col-span-1">
          {/* Note: In future update, we can add a file input here for receipt images */}
          <ExpenseForm />
        </div>

        {/* RIGHT: LIST & FILTERS */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-heading font-semibold text-teal px-1">Expense History</h3>
          <ExpenseList expenses={expenses} />
        </div>

      </div>
    </div>
  );
}