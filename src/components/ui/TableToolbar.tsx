
import { Plus } from 'lucide-react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

interface TableToolbarProps {
  showCount: number;
  setShowCount: (count: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAdd?: () => void;
}

export const TableToolbar = ({
  showCount,
  setShowCount,
  searchQuery,
  setSearchQuery,
  onAdd
}: TableToolbarProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pt-4 px-6">
      <div className="flex items-end gap-6 flex-1">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Show</label>
          <select 
            value={showCount}
            onChange={(e) => setShowCount(Number(e.target.value))}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-600 w-24"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="flex flex-col gap-1 flex-1 max-w-md">
          <label className="text-sm font-semibold text-gray-700">Search</label>
          <Input 
            placeholder="Search by name, email, phone or message" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="primary" className="h-10">
          Filter
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="secondary" className="h-10">
          Reset
        </Button>
        <Button variant="success" className="h-10">
          Export
        </Button>
        {onAdd && (
          <Button onClick={onAdd} variant="primary" className="h-10" icon={<Plus size={16} />}>
            Add Enquiry
          </Button>
        )}
      </div>
    </div>
  );
};
