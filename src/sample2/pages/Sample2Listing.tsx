import { useMemo, useState } from 'react';
import { Search, Eye, MessageCircle, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

interface EnquiryRow {
  id: string;
  sNo: number;
  category: string;
  subCategory: string;
  product: string;
  name: string;
  email: string;
  date: string;
  createdBy: 'System' | 'User';
}

const SAMPLE_DATA: EnquiryRow[] = [
  {
    id: '1',
    sNo: 1,
    category: 'Hardware',
    subCategory: 'Laptops',
    product: 'ThinkPad X1',
    name: 'John Doe',
    email: 'john@example.com',
    date: '2024-05-12',
    createdBy: 'System',
  },
  {
    id: '2',
    sNo: 2,
    category: 'Software',
    subCategory: 'Licenses',
    product: 'Office 365',
    name: 'Jane Smith',
    email: 'jane@example.com',
    date: '2024-05-14',
    createdBy: 'User',
  },
  {
    id: '3',
    sNo: 3,
    category: 'Services',
    subCategory: 'Support',
    product: 'Premium Care',
    name: 'Robert Brown',
    email: 'robert@example.com',
    date: '2024-05-15',
    createdBy: 'System',
  },
  {
    id: '4',
    sNo: 4,
    category: 'Hardware',
    subCategory: 'Monitors',
    product: 'UltraSharp 27',
    name: 'Emily Davis',
    email: 'emily@example.com',
    date: '2024-05-18',
    createdBy: 'User',
  },
  {
    id: '5',
    sNo: 5,
    category: 'Accessories',
    subCategory: 'Cables',
    product: 'USB-C Hub',
    name: 'Michael Wilson',
    email: 'michael@example.com',
    date: '2024-05-20',
    createdBy: 'System',
  },
];

const TOTAL_ENTRIES = 50;
const TOTAL_PAGES = 10;

export const Sample2Listing = () => {
  const [showCount, setShowCount] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState(SAMPLE_DATA);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q) ||
        row.product.toLowerCase().includes(q) ||
        row.category.toLowerCase().includes(q)
    );
  }, [data, searchQuery]);

  const visible = filtered.slice(0, Math.min(showCount, filtered.length));

  const handleDelete = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this enquiry?')) return;
    setData((prev) => prev.filter((row) => row.id !== id));
  };

  const pages = [1, 2, 3, '...', TOTAL_PAGES] as const;

  return (
    <div className="flex flex-col gap-5 max-w-full">
      <div>
        <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Enquiry List</h1>
        <p className="text-sm text-gray-400 mt-1">
          Home <span className="mx-1">&gt;</span> Enquiries
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#eef0f3] overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Show</span>
            <select
              value={showCount}
              onChange={(e) => setShowCount(Number(e.target.value))}
              className="h-9 rounded-md border border-[#e5e7eb] bg-white px-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/30 focus:border-[#3b82f6]"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>entries</span>
          </div>

          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-56 pl-9 pr-3 rounded-lg border border-[#e5e7eb] bg-white text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/30 focus:border-[#3b82f6]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f3f4f6] text-gray-800 font-semibold border-y border-[#e5e7eb]">
              <tr>
                {[
                  'S No',
                  'Category',
                  'SubCategory',
                  'Product',
                  'Name',
                  'Email',
                  'Date',
                  'Created By',
                  'Actions',
                ].map((col) => (
                  <th
                    key={col}
                    className={cn(
                      'px-5 py-3.5 whitespace-nowrap',
                      col === 'Actions' && 'text-center'
                    )}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6] bg-white">
              {visible.map((row) => (
                <tr key={row.id} className="hover:bg-[#fafafa] transition-colors">
                  <td className="px-5 py-4 text-gray-600">{row.sNo}</td>
                  <td className="px-5 py-4 text-gray-700">{row.category}</td>
                  <td className="px-5 py-4 text-gray-700">{row.subCategory}</td>
                  <td className="px-5 py-4 text-gray-700">{row.product}</td>
                  <td className="px-5 py-4">
                    <button type="button" className="text-[#3b82f6] font-medium hover:underline">
                      {row.name}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{row.email}</td>
                  <td className="px-5 py-4 text-gray-600 whitespace-nowrap">{row.date}</td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold',
                        row.createdBy === 'System'
                          ? 'bg-[#3b82f6] text-white'
                          : 'bg-[#dbeafe] text-[#1d4ed8]'
                      )}
                    >
                      {row.createdBy}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-3 text-gray-400">
                      <button className="hover:text-[#3b82f6] transition-colors" title="View">
                        <Eye size={16} />
                      </button>
                      <button className="hover:text-[#3b82f6] transition-colors" title="Message">
                        <MessageCircle size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!visible.length && (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-gray-500">
                    No enquiries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 border-t border-[#e5e7eb]">
          <p className="text-sm text-gray-500">
            Showing 1 to {visible.length} of {TOTAL_ENTRIES} entries
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-9 px-3 rounded-md border border-[#e5e7eb] text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
            >
              <ChevronLeft size={14} />
              Previous
            </button>

            {pages.map((page, idx) =>
              page === '...' ? (
                <span key={`dots-${idx}`} className="h-9 w-9 inline-flex items-center justify-center text-sm text-gray-400">
                  …
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    'h-9 w-9 rounded-md border text-sm font-medium transition-colors',
                    currentPage === page
                      ? 'bg-[#3b82f6] border-[#3b82f6] text-white'
                      : 'border-[#e5e7eb] text-gray-600 hover:bg-gray-50'
                  )}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={() => setCurrentPage((p) => Math.min(TOTAL_PAGES, p + 1))}
              disabled={currentPage === TOTAL_PAGES}
              className="h-9 px-3 rounded-md border border-[#e5e7eb] text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
