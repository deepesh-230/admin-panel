import { createContext, useContext, useState, type ReactNode } from 'react';

interface SampleSidebarContextValue {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const SampleSidebarContext = createContext<SampleSidebarContextValue | null>(null);

export const SampleSidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <SampleSidebarContext.Provider
      value={{
        isCollapsed,
        toggleSidebar: () => setIsCollapsed((v) => !v),
        isMobileMenuOpen,
        setIsMobileMenuOpen,
      }}
    >
      {children}
    </SampleSidebarContext.Provider>
  );
};

export const useSampleSidebar = () => {
  const ctx = useContext(SampleSidebarContext);
  if (!ctx) throw new Error('useSampleSidebar must be used within SampleSidebarProvider');
  return ctx;
};
