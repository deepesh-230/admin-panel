
import { ArrowDownUp, Edit, Trash2, Eye } from 'lucide-react';
import type { Listing } from '../../types';
import { ToggleSwitch } from '../common/ToggleSwitch';

interface ListingTableProps {
  data: Listing[];
  onToggleStatus: (id: string, newStatus: boolean) => void;
  onEdit: (item: Listing) => void;
  onDelete: (id: string) => void;
}

export const ListingTable = ({ data, onToggleStatus, onEdit, onDelete }: ListingTableProps) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-[#f8fafc] text-gray-700 font-semibold border-y border-gray-200">
          <tr>
            <th className="px-4 py-4 whitespace-nowrap">
              <div className="flex items-center gap-2 cursor-pointer">
                S No <ArrowDownUp size={14} className="text-primary/70" />
              </div>
            </th>
            <th className="px-4 py-4 whitespace-nowrap">
              <div className="flex items-center gap-2 cursor-pointer">
                Category <ArrowDownUp size={14} className="text-primary/70" />
              </div>
            </th>
            <th className="px-4 py-4 whitespace-nowrap">
              <div className="flex items-center gap-2 cursor-pointer">
                SubCategory <ArrowDownUp size={14} className="text-primary/70" />
              </div>
            </th>
            <th className="px-4 py-4 whitespace-nowrap">
              <div className="flex items-center gap-2 cursor-pointer">
                Product <ArrowDownUp size={14} className="text-primary/70" />
              </div>
            </th>
            <th className="px-4 py-4 whitespace-nowrap">
              <div className="flex items-center gap-2 cursor-pointer">
                Email <ArrowDownUp size={14} className="text-primary/70" />
              </div>
            </th>
            <th className="px-4 py-4 whitespace-nowrap">
              Image
            </th>
            <th className="px-4 py-4 whitespace-nowrap">
              <div className="flex items-center gap-2 cursor-pointer">
                Created By <ArrowDownUp size={14} className="text-primary/70" />
              </div>
            </th>
            <th className="px-4 py-4 whitespace-nowrap">
              <div className="flex items-center gap-2 cursor-pointer">
                Date <ArrowDownUp size={14} className="text-primary/70" />
              </div>
            </th>
            <th className="px-4 py-4 whitespace-nowrap">
              <div className="flex items-center gap-2 cursor-pointer">
                Status <ArrowDownUp size={14} className="text-primary/70" />
              </div>
            </th>
            <th className="px-4 py-4 whitespace-nowrap text-center">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-4 py-4 text-gray-600">{row.sNo}</td>
              <td className="px-4 py-4 text-gray-600">{row.category}</td>
              <td className="px-4 py-4 text-gray-600">{row.subCategory}</td>
              <td className="px-4 py-4 text-gray-600">{row.product}</td>
              <td className="px-4 py-4 text-gray-600">{row.email}</td>
              <td className="px-4 py-4">
                <div className="w-16 h-8 rounded border border-gray-200 overflow-hidden flex items-center justify-center bg-gray-50">
                  <img src={row.image} alt="Product Thumbnail" className="object-cover w-full h-full" />
                </div>
              </td>
              <td className="px-4 py-4 text-gray-600">{row.createdBy}</td>
              <td className="px-4 py-4 text-gray-600 whitespace-nowrap">{row.date}</td>
              <td className="px-4 py-4">
                <ToggleSwitch 
                  checked={row.status} 
                  onChange={(checked) => onToggleStatus(row.id, checked)} 
                />
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => onEdit(row)} className="text-green-600 hover:text-green-700 p-1 rounded transition-colors" title="Edit">
                    <Edit size={16} strokeWidth={2} />
                  </button>
                  <button onClick={() => onDelete(row.id)} className="text-red-500 hover:text-red-600 p-1 rounded transition-colors" title="Delete">
                    <Trash2 size={16} strokeWidth={2} />
                  </button>
                  <button className="text-green-600 hover:text-green-700 p-1 rounded transition-colors" title="View">
                    <Eye size={16} strokeWidth={2} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
