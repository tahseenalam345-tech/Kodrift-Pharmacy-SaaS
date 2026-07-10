import { Sidebar } from "@/components/sidebar";
import { MobileMenuButton } from "@/components/mobile-menu-button";
import { getSession } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="flex h-screen overflow-hidden bg-cream">
      <Sidebar userRole={session.role} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden lg:pl-72 transition-all duration-300">
        <header className="lg:hidden flex items-center justify-between p-4 bg-panel/90 backdrop-blur-md border-b border-border z-30">
          <h1 className="text-lg font-heading font-semibold text-teal">
            Al-Azamat
          </h1>
          <MobileMenuButton />
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 relative">
          {children}
        </main>
      </div>
    </div>
  );
}