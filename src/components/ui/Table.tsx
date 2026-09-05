import { ArrowDownUp, Trash2, Edit } from 'lucide-react';
import type { Enquiry, EnquiryStatus } from '../../types';
import { LifecycleFlagSelect } from './LifecycleFlagSelect';
import type { AdminLifecycleFlag } from '../../api/dashboard';

const STATUS_STYLES: Record<EnquiryStatus, string> = {
  NEW: 'bg-blue-50 text-blue-700',
  CONTACTED: 'bg-amber-50 text-amber-700',
  CLOSED: 'bg-green-50 text-green-700',
};

interface TableProps {
  data: Enquiry[];
  onEdit: (item: Enquiry) => void;
  onDelete: (id: string) => void;
  onStatusChange: (item: Enquiry, status: EnquiryStatus) => void;
  onFlagChange?: (item: Enquiry, flag: AdminLifecycleFlag) => void;
  onFlagError?: (message: string) => void;
}

export const Table = ({
  data,
  onEdit,
  onDelete,
  onStatusChange,
  onFlagChange,
  onFlagError,
}: TableProps) => {
  if (!data.length) {
    return <div className="p-10 text-center text-gray-500">No enquiries found.</div>;
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-[#f8fafc] text-gray-700 font-semibold border-y border-gray-200">
          <tr>
            <th className="px-4 py-4 whitespace-nowrap">
              <div className="flex items-center gap-2">
                S No <ArrowDownUp size={14} className="text-gray-400" />
              </div>
            </th>
            <th className="px-4 py-4 whitespace-nowrap">Category</th>
            <th className="px-4 py-4 whitespace-nowrap">SubCategory</th>
            <th className="px-4 py-4 whitespace-nowrap">Product</th>
            <th className="px-4 py-4 whitespace-nowrap">Name</th>
            <th className="px-4 py-4 whitespace-nowrap">Email</th>
            <th className="px-4 py-4 whitespace-nowrap">Status</th>
            <th className="px-4 py-4 whitespace-nowrap">Flag</th>
            <th className="px-4 py-4 whitespace-nowrap">Date</th>
            <th className="px-4 py-4 whitespace-nowrap">Created By</th>
            <th className="px-4 py-4 whitespace-nowrap text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {data.map((row) => {
            const status = (row.status || 'NEW') as EnquiryStatus;
            return (
              <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-4 text-gray-600">{row.sNo}</td>
                <td className="px-4 py-4 text-gray-600">{row.category}</td>
                <td className="px-4 py-4 text-gray-600">{row.subCategory}</td>
                <td className="px-4 py-4 text-gray-600">{row.product}</td>
                <td className="px-4 py-4 text-gray-600">{row.name ?? '—'}</td>
                <td className="px-4 py-4 text-gray-600">{row.email}</td>
                <td className="px-4 py-4">
                  <select
                    value={status}
                    onChange={(e) => onStatusChange(row, e.target.value as EnquiryStatus)}
                    className={`h-8 px-2 rounded border border-gray-200 text-xs font-semibold ${STATUS_STYLES[status]}`}
                  >
                    <option value="NEW">New</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </td>
                <td className="px-4 py-4">
                  <LifecycleFlagSelect
                    entity="enquiry"
                    id={row.id}
                    value={row.adminFlag}
                    onChanged={(flag) => onFlagChange?.(row, flag)}
                    onError={onFlagError}
                  />
                </td>
                <td className="px-4 py-4 text-gray-600 whitespace-nowrap">{row.date}</td>
                <td className="px-4 py-4 text-gray-600">{row.createdBy}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => onEdit(row)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 p-1.5 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={() => onDelete(row.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
