import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  tip?: string;
}

export default function Layout({ children, title, subtitle, tip }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen">
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 md:relative absolute z-50 h-full`}>
        <Sidebar />
      </div>

      <div className="w-full md:ml-64 flex flex-col overflow-hidden">
        <Navbar toggleSidebar={toggleSidebar} />

        <div className="overflow-y-auto flex-1 bg-background">
          {(title || subtitle || tip) && (
            <div className="p-6 pb-0">
              {title && <h1 className="text-2xl font-semibold">{title}</h1>}
              {subtitle && <p className="text-gray-600">{subtitle}</p>}
              {tip && <p className="text-sm text-gray-500 italic">{tip}</p>}
            </div>
          )}
          
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
