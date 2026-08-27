
import { Search, Plus } from 'lucide-react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

interface ListingTableToolbarProps {
  showCount: number;
  setShowCount: (count: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAdd?: () => void;
}

export const ListingTableToolbar = ({
  showCount,
  setShowCount,
  searchQuery,
  setSearchQuery,
  onAdd
}: ListingTableToolbarProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pt-4 px-6">
      <div className="flex items-center gap-4 flex-1">
        <select 
          value={showCount}
          onChange={(e) => setShowCount(Number(e.target.value))}
          className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-600 w-20"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
        
        <Input 
          placeholder="Search Product" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-48"
        />
        
        <select className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-400 w-48">
          <option value="">Select Service Providers</option>
          <option value="provider1">Provider 1</option>
          <option value="provider2">Provider 2</option>
        </select>

        <Button variant="primary" className="h-10" icon={<Search size={16} />}>
          Filter
        </Button>
      </div>
      
      <div className="flex items-center">
        {onAdd && (
          <Button onClick={onAdd} variant="primary" className="h-10" icon={<Plus size={18} />}>
            Add Product
          </Button>
        )}
      </div>
    </div>
  );
};

