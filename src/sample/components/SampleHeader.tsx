import { Menu, Search } from 'lucide-react';
import { useSampleSidebar } from '../contexts/SampleSidebarContext';

export const SampleHeader = () => {
  const { setIsMobileMenuOpen } = useSampleSidebar();

  return (
    <header className="h-16 bg-white border-b border-[#e5e7eb] flex items-center px-4 md:px-6 fixed top-0 left-0 right-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2 min-w-[180px] shrink-0">
        <div className="w-8 h-8 rounded-md bg-[#009f7f] flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 7h12l-1.2 10.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 7Z" stroke="white" strokeWidth="1.8" />
            <path d="M9 7a3 3 0 0 1 6 0" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
        <span className="text-[20px] font-bold text-[#1f2937] tracking-tight">DD</span>
      </div>
<div className='flex items-center justify-between w-full'>
      {/* Menu + Search */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl mx-2 md:mx-8">
        <button
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-md shrink-0"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <div className="relative flex-1 hidden sm:block">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search your route..."
            className="w-full h-10 pl-10 pr-4 rounded-full border border-[#e5e7eb] bg-[#f9fafb] text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#009f7f]/30 focus:border-[#009f7f]"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 shrink-0">
        

        <div className="flex items-center gap-2.5 pl-1 cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d1fae5] to-[#a7f3d0] border border-[#e5e7eb] flex items-center justify-center text-[#009f7f] font-semibold text-sm">
            A
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-sm font-semibold text-gray-800">Admin</p>
            <p className="text-xs text-gray-500">Super Admin</p>
          </div>
        </div>
      </div>
      </div>
    </header>
  );
};
