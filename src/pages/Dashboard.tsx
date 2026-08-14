import { useEffect, useState, type ReactNode } from 'react';
import { ShoppingCart } from 'lucide-react';
import { cn } from '../utils/cn';
import { apiClient } from '../utils/apiClient';

interface StatCardProps {
  title: string;
  count: number | string;
  gradient: string;
  icon?: ReactNode;
}

const StatCard = ({ title, count, gradient, icon }: StatCardProps) => {
  return (
    <div className={cn("rounded-lg p-5 text-white shadow-sm relative overflow-hidden flex flex-col justify-between h-[120px]", gradient)}>
      <div>
        <p className="text-sm font-medium opacity-90 mb-1">{title}</p>
        <h3 className="text-3xl font-bold">{count}</h3>
      </div>
      
      {/* Decorative faded line */}
      <div className="absolute bottom-4 left-5 right-5 h-[2px] bg-white/20 rounded-full"></div>
      
      {/* Optional icon positioned at bottom right */}
      {icon && (
        <div className="absolute bottom-3 right-4 opacity-80">
          {icon}
        </div>
      )}
    </div>
  );
};

export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalServiceProviders: 0,
    activeServiceProviders: 0,
    inactiveServiceProviders: 0,
    listings: 0,
    activeListings: 0,
    listEnquiries: 0,
    productEnquiries: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<{
        totalUsers: number;
        activeUsers: number;
        inactiveUsers: number;
        totalServiceProviders: number;
        activeServiceProviders: number;
        inactiveServiceProviders: number;
        listings: number;
        activeListings: number;
        listEnquiries: number;
        productEnquiries: number;
      }>('/api/v1/dashboard/stats')
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch stats', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col gap-8 max-w-full">
      {/* Top Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Users" count={loading ? '...' : stats.totalUsers} gradient="bg-gradient-to-br from-[#71638e] to-[#6b5889]" />
        <StatCard title="Active Users" count={loading ? '...' : stats.activeUsers} gradient="bg-gradient-to-br from-[#71638e] to-[#6b5889]" />
        <StatCard title="Inactive Users" count={loading ? '...' : stats.inactiveUsers} gradient="bg-gradient-to-br from-[#71638e] to-[#6b5889]" />
        
        <StatCard title="Total Service Providers" count={loading ? '...' : stats.totalServiceProviders} gradient="bg-gradient-to-br from-[#71638e] to-[#6b5889]" />
        <StatCard title="Active Service Providers" count={loading ? '...' : stats.activeServiceProviders} gradient="bg-gradient-to-br from-[#71638e] to-[#6b5889]" />
        <StatCard title="Inactive Service Providers" count={loading ? '...' : stats.inactiveServiceProviders} gradient="bg-gradient-to-br from-[#71638e] to-[#6b5889]" />
        
        <StatCard title="Listings" count={loading ? '...' : stats.listings} gradient="bg-gradient-to-br from-[#71638e] to-[#6b5889]" />
        <StatCard title="List Enquiry" count={loading ? '...' : stats.listEnquiries} gradient="bg-gradient-to-br from-[#f59e0b] to-[#eab308]" />
        <StatCard title="Product Enquiries" count={loading ? '...' : stats.productEnquiries} gradient="bg-gradient-to-br from-[#1e3a5f] to-[#152c4a]" />
      </div>

      {/* Latest 7 days Section */}
      <div>
        <h2 className="text-xl font-medium text-gray-700 mb-4 tracking-wide">Lastest 7 days</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard 
            title="Active Users" 
            count="" 
            gradient="bg-gradient-to-br from-[#0f172a] to-[#1e293b]" 
            icon={<ShoppingCart size={24} />} 
          />
          <StatCard 
            title="Active Service Providers" 
            count="" 
            gradient="bg-gradient-to-br from-[#10b981] to-[#34d399]" 
            icon={<ShoppingCart size={24} />} 
          />
          <StatCard 
            title="Active Listings" 
            count="" 
            gradient="bg-gradient-to-br from-[#f59e0b] to-[#fbbf24]" 
            icon={<ShoppingCart size={24} />} 
          />
        </div>
      </div>
    </div>
  );
};
