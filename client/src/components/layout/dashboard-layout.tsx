import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  
  return (
    <div className="min-h-screen">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      
      <div className="content-with-sidebar flex flex-col min-h-screen">
        <Header setMobileOpen={setMobileOpen} />
        
        <main className="flex-1 overflow-y-auto main-content p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
