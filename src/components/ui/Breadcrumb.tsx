import React from 'react';
import { Home, ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface BreadcrumbProps {
  title: string;
  paths: { name: string; href?: string }[];
}

export const Breadcrumb = ({ title, paths }: BreadcrumbProps) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <h1 className="text-xl font-medium text-[#64748b] m-0 tracking-wide">{title}</h1>
      <div className="h-5 w-[1px] bg-gray-300"></div>
      <nav className="flex items-center gap-2 text-sm">
        <NavLink to="/" className="text-primary hover:text-primary-hover transition-colors flex items-center">
          <Home size={18} strokeWidth={2} />
        </NavLink>
        {paths.map((path, index) => (
          <React.Fragment key={index}>
            <ChevronRight size={16} className="text-gray-400" />
            {path.href ? (
              <NavLink to={path.href} className="text-primary hover:text-primary-hover font-medium tracking-wide">
                {path.name}
              </NavLink>
            ) : (
              <span className="text-gray-500 font-medium tracking-wide">{path.name}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
    </div>
  );
};
