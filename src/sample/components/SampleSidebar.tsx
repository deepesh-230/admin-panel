import { useState, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Tags,
  BookOpen,
  PenLine,
  Wallet,
  RotateCcw,
  ShoppingCart,
  CreditCard,
  ChevronRight,
  ChevronDown,
  X,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useSampleSidebar } from '../contexts/SampleSidebarContext';

interface NavItem {
  title: string;
  icon: ReactNode;
  href?: string;
  children?: NavItem[];
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const sections: NavSection[] = [
  {
    label: 'MAIN',
    items: [
      { title: 'Dashboard', icon: <LayoutDashboard size={18} />, href: '/sample/dashboard' },
    ],
  },
  {
    label: 'PRODUCT MANAGEMENT',
    items: [
      {
        title: 'Products',
        icon: <Package size={18} />,
        children: [
          { title: 'All Products', icon: null, href: '/sample/listings' },
          { title: 'Add Product', icon: null, href: '/sample/listings' },
        ],
      },
      { title: 'Inventory', icon: <Warehouse size={18} />, href: '#' },
      { title: 'Attributes', icon: <Tags size={18} />, href: '#' },
      { title: 'Manufacturers/Publications', icon: <BookOpen size={18} />, href: '#' },
      { title: 'Authors', icon: <PenLine size={18} />, href: '#' },
    ],
  },
  {
    label: 'FINANCIAL MANAGEMENT',
    items: [
      { title: 'Withdrawals', icon: <Wallet size={18} />, href: '#' },
      { title: 'Refunds', icon: <RotateCcw size={18} />, href: '#' },
    ],
  },
  {
    label: 'ORDER MANAGEMENT',
    items: [
      { title: 'Orders', icon: <ShoppingCart size={18} />, href: '#' },
      { title: 'Transactions', icon: <CreditCard size={18} />, href: '#' },
    ],
  },
];

export const SampleSidebar = () => {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useSampleSidebar();

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={cn(
          'bg-[#f9fafb] border-r border-[#e5e7eb] flex flex-col h-[calc(100vh-4rem)] fixed left-0 top-16 z-40 transition-transform duration-300 w-64',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 md:hidden border-b border-[#e5e7eb]">
          <span className="text-sm font-semibold text-gray-700">Menu</span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 rounded-md hover:bg-gray-200 text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="py-4 flex-1 overflow-y-auto">
          {sections.map((section) => (
            <div key={section.label} className="mb-5">
              <p className="px-5 mb-2 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                {section.label}
              </p>
              <nav className="space-y-0.5 px-3">
                {section.items.map((item) => (
                  <SidebarItem key={item.title} item={item} onNavigate={() => setIsMobileMenuOpen(false)} />
                ))}
              </nav>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
};

const SidebarItem = ({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) => {
  const hasChildren = Boolean(item.children?.length);
  const [isExpanded, setIsExpanded] = useState(item.title === 'Products');

  if (hasChildren) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2.5 rounded-md text-[14px] transition-colors',
            isExpanded
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:bg-white hover:text-gray-900'
          )}
        >
          <span className="flex items-center gap-3">
            <span className="text-gray-500">{item.icon}</span>
            <span className="font-medium">{item.title}</span>
          </span>
          {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        </button>
        {isExpanded && (
          <div className="mt-0.5 ml-4 space-y-0.5 border-l border-gray-200 pl-3">
            {item.children?.map((child) => (
              <NavLink
                key={child.title}
                to={child.href || '#'}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-3 py-2 rounded-md text-[13.5px] transition-colors',
                    isActive
                      ? 'bg-[#009f7f]/10 text-[#009f7f] font-semibold'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-white'
                  )
                }
              >
                {child.title}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.href || '#'}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-md text-[14px] transition-colors',
          isActive
            ? 'bg-white text-[#009f7f] font-semibold shadow-sm'
            : 'text-gray-600 hover:bg-white hover:text-gray-900'
        )
      }
    >
      <span className={cn('text-gray-500')}>{item.icon}</span>
      <span className="font-medium">{item.title}</span>
    </NavLink>
  );
};
