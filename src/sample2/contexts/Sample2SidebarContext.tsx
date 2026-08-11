import { createContext, useContext, useState, type ReactNode } from 'react';

interface Sample2SidebarContextValue {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const Sample2SidebarContext = createContext<Sample2SidebarContextValue | null>(null);

export const Sample2SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <Sample2SidebarContext.Provider value={{ isMobileMenuOpen, setIsMobileMenuOpen }}>
      {children}
    </Sample2SidebarContext.Provider>
  );
};

export const useSample2Sidebar = () => {
  const ctx = useContext(Sample2SidebarContext);
  if (!ctx) throw new Error('useSample2Sidebar must be used within Sample2SidebarProvider');
  return ctx;
};
