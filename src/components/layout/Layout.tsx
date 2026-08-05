import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SidebarProvider, useSidebar } from '../../contexts/SidebarContext';
import { cn } from '../../utils/cn';

const LayoutContent = ({ children }: { children: React.ReactNode }) => {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className="min-h-screen bg-bg-light">
      <Sidebar />
      <Header />
      <main className={cn("pt-16 transition-all duration-300 w-full", isCollapsed ? "md:pl-20" : "md:pl-64")}>
        <div className="p-4 md:p-6 overflow-x-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
};

