
import { ArrowDownUp, Trash2, Eye, MessageSquare, Edit } from 'lucide-react';
import type { Enquiry } from '../../types';

interface TableProps {
  data: Enquiry[];
  onEdit: (item: Enquiry) => void;
  onDelete: (id: string) => void;
}

export const Table = ({ data, onEdit, onDelete }: TableProps) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-[#f8fafc] text-gray-700 font-semibold border-y border-gray-200">
          <tr>
            <th className="px-4 py-4 whitespace-nowrap">
              <div className="flex items-center gap-2 cursor-pointer">
                S No <ArrowDownUp size={14} className="text-gray-400" />
              </div>
            </th>
            <th className="px-4 py-4 whitespace-nowrap">
              <div className="flex items-center gap-2 cursor-pointer">
                Category <ArrowDownUp size={14} className="text-gray-400" />
              </div>
            </th>
            <th className="px-4 py-4 whitespace-nowrap">
              <div className="flex items-center gap-2 cursor-pointer">
                SubCategory <ArrowDownUp size={14} className="text-gray-400" />
              </div>
            </th>
            <th className="px-4 py-4 whitespace-nowrap">
              <div className="flex items-center gap-2 cursor-pointer">
                Product <ArrowDownUp size={14} className="text-gray-400" />
              </div>
            </th>
            <th className="px-4 py-4 whitespace-nowrap">
              <div className="flex items-center gap-2 cursor-pointer">
                Name <ArrowDownUp size={14} className="text-gray-400" />
              </div>
            </th>
            <th className="px-4 py-4 whitespace-nowrap">
              <div className="flex items-center gap-2 cursor-pointer">
                Email <ArrowDownUp size={14} className="text-gray-400" />
              </div>
            </th>
            <th className="px-4 py-4 whitespace-nowrap">
              <div className="flex items-center gap-2 cursor-pointer">
                Date <ArrowDownUp size={14} className="text-gray-400" />
              </div>
            </th>
            <th className="px-4 py-4 whitespace-nowrap">
              <div className="flex items-center gap-2 cursor-pointer">
                Created By <ArrowDownUp size={14} className="text-gray-400" />
              </div>
            </th>
            <th className="px-4 py-4 whitespace-nowrap text-center">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {data.map((row, idx) => (
            <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-4 py-4 text-gray-600">{row.sNo}</td>
              <td className="px-4 py-4 text-gray-600">{row.category}</td>
              <td className="px-4 py-4 text-gray-600">{row.subCategory}</td>
              <td className="px-4 py-4 text-gray-600">{row.product}</td>
              <td className="px-4 py-4 text-gray-600">{row.name === null ? 'null' : row.name}</td>
              <td className="px-4 py-4 text-gray-600">{row.email}</td>
              <td className="px-4 py-4 text-gray-600 whitespace-nowrap">{row.date}</td>
              <td className="px-4 py-4 text-gray-600">{row.createdBy}</td>
              <td className="px-4 py-4">
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => onEdit(row)} className="text-green-600 hover:text-green-700 hover:bg-green-50 p-1.5 rounded transition-colors" title="Edit">
                    <Edit size={16} strokeWidth={2.5} />
                  </button>
                  <button onClick={() => onDelete(row.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors" title="Delete">
                    <Trash2 size={16} strokeWidth={2.5} />
                  </button>
                  <button className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded transition-colors" title="View">
                    <Eye size={16} strokeWidth={2.5} />
                  </button>
                  {idx === 0 && (
                    <button className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1.5 rounded transition-colors" title="Reply">
                      <MessageSquare size={16} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
