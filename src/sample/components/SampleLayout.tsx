import { Outlet } from 'react-router-dom';
import { SampleSidebarProvider } from '../contexts/SampleSidebarContext';
import { SampleHeader } from './SampleHeader';
import { SampleSidebar } from './SampleSidebar';

const LayoutContent = () => {
  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      <SampleHeader />
      <SampleSidebar />
      <main className="pt-16 md:pl-64 transition-all duration-300 w-full">
        <div className="p-4 md:p-6 lg:p-8 overflow-x-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export const SampleLayout = () => {
  return (
    <SampleSidebarProvider>
      <LayoutContent />
    </SampleSidebarProvider>
  );
};
