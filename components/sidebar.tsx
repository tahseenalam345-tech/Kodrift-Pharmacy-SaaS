"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Receipt,
  Truck,
  PieChart,
  Users,
  Settings,
  X,
  ShieldCheck,
  LogOut,
  LogIn
} from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { processLogout } from "@/lib/auth";

export function Sidebar({ userRole = "Guest" }: { userRole?: string }) {
  const pathname = usePathname();
  const { isSidebarOpen, closeSidebar } = useUIStore();

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, allowed: ["Guest", "Super Admin", "Admin", "Manager", "Cashier"] },
    { name: "Inventory", href: "/dashboard/inventory", icon: Package, allowed: ["Guest", "Super Admin", "Admin", "Manager", "Cashier"] },
    { name: "Sales POS", href: "/dashboard/sales", icon: ShoppingCart, allowed: ["Guest", "Super Admin", "Admin", "Manager", "Cashier"] },
    { name: "Purchases", href: "/dashboard/purchases", icon: Truck, allowed: ["Guest", "Super Admin", "Admin", "Manager"] },
    { name: "Expenses", href: "/dashboard/expenses", icon: Receipt, allowed: ["Guest", "Super Admin", "Admin", "Manager"] },
    { name: "Reports", href: "/dashboard/reports", icon: PieChart, allowed: ["Guest", "Super Admin", "Admin"] },
    { name: "Staff", href: "/dashboard/staff", icon: Users, allowed: ["Guest", "Super Admin", "Admin"] },
  ];

  const visibleLinks = navLinks.filter(link => link.allowed.includes(userRole));
  const showSettings = ["Guest", "Super Admin", "Admin"].includes(userRole);

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-72 bg-panel border-r border-border z-50
        transform transition-transform duration-300 ease-in-out flex flex-col shadow-xl
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div>
            <h2 className="text-xl font-heading font-semibold text-teal">
              Al-Azamat
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border flex items-center gap-1
                ${userRole === 'Guest' ? 'bg-cream text-ink-mute border-border' :
                  userRole === 'Super Admin' ? 'bg-terracotta-dim text-terracotta-hover border-terracotta/30' :
                  'bg-teal-soft text-teal border-teal/20'}
              `}>
                <ShieldCheck size={12} /> {userRole} Mode
              </span>
            </div>
          </div>
          <button onClick={closeSidebar} className="lg:hidden text-ink-mute hover:text-teal">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {visibleLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={closeSidebar}
                className={`
                  animate-wiggle-hover w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200
                  ${isActive
                    ? "bg-terracotta-dim text-terracotta-hover font-semibold"
                    : "text-ink-dim hover:bg-teal-soft hover:text-teal"}
                `}
              >
                <Icon size={20} className={`wiggle-target flex-shrink-0 ${isActive ? "animate-breathe" : ""}`} />
                <span className="text-sm font-semibold">
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-2">

          {showSettings && (
            <Link
              href="/dashboard/settings"
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-teal-soft text-ink-dim hover:text-teal transition-all text-sm font-semibold"
            >
              <Settings size={20} />
              System Settings
            </Link>
          )}

          {userRole === "Guest" ? (
            <Link
              href="/login"
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-terracotta-dim hover:bg-terracotta/20 text-terracotta-hover transition-all text-sm font-bold border border-terracotta/20"
            >
              <LogIn size={20} />
              Staff Login
            </Link>
          ) : (
            <form action={processLogout} className="w-full">
              <button
                type="submit"
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-all text-sm font-bold border border-red-200"
              >
                <LogOut size={20} />
                Secure Logout
              </button>
            </form>
          )}

          <div className="pt-4 mt-2 text-center border-t border-border">
            <p className="text-[10px] text-ink-mute font-bold uppercase tracking-widest">Powered by</p>
            <p className="text-xs text-terracotta font-bold mt-1">Aura Dept</p>
          </div>
        </div>
      </aside>
    </>
  );
}