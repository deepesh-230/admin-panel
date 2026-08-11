import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sample2SidebarProvider, useSample2Sidebar } from '../contexts/Sample2SidebarContext';
import { Sample2Sidebar } from './Sample2Sidebar';

const LayoutContent = () => {
  const { setIsMobileMenuOpen } = useSample2Sidebar();

  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      <Sample2Sidebar />

      <main className="md:pl-[260px] min-h-screen transition-all duration-300">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-30 h-14 bg-white border-b border-[#e5e7eb] flex items-center px-4">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            <Menu size={22} />
          </button>
          <span className="ml-2 font-semibold text-[#3b82f6]">AdminSuite</span>
        </div>

        <div className="p-5 md:p-8 overflow-x-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export const Sample2Layout = () => {
  return (
    <Sample2SidebarProvider>
      <LayoutContent />
    </Sample2SidebarProvider>
  );
};
