import { useEffect, useState } from 'react';
import { Search, Plus, ArrowDownUp, Edit, Trash2, Eye } from 'lucide-react';
import { listingsApi } from '../../api/listings';
import type { Listing } from '../../types';
import { Toast } from '../../components/common/Toast';
import { Modal } from '../../components/common/Modal';
import { ListingForm } from '../../components/ui/ListingForm';
import { ToggleSwitch } from '../../components/common/ToggleSwitch';
import { cn } from '../../utils/cn';

const SAMPLE_LISTINGS: Listing[] = [
  {
    id: '1',
    sNo: 1,
    category: 'Electronics',
    subCategory: 'Phones',
    product: 'iPhone 15 Pro',
    email: 'vendor@shop.com',
    image: 'https://placehold.co/80x40/e5e7eb/9ca3af?text=IMG',
    createdBy: 'Admin',
    date: '2026-08-01',
    status: true,
  },
  {
    id: '2',
    sNo: 2,
    category: 'Grocery',
    subCategory: 'Snacks',
    product: 'Organic Nuts Mix',
    email: 'grocery@shop.com',
    image: 'https://placehold.co/80x40/e5e7eb/9ca3af?text=IMG',
    createdBy: 'Vendor',
    date: '2026-08-03',
    status: true,
  },
  {
    id: '3',
    sNo: 3,
    category: 'Fashion',
    subCategory: 'Men',
    product: 'Cotton Tee',
    email: 'fashion@shop.com',
    image: 'https://placehold.co/80x40/e5e7eb/9ca3af?text=IMG',
    createdBy: 'Admin',
    date: '2026-08-05',
    status: false,
  },
];

export const SampleListing = () => {
  const [showCount, setShowCount] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({ visible: false, message: '', type: 'success' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const result = await listingsApi.getAll(searchQuery);
      setData(result.length ? result : SAMPLE_LISTINGS);
    } catch {
      const filtered = SAMPLE_LISTINGS.filter(
        (item) =>
          item.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setData(filtered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(fetchListings, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleToggleStatus = async (id: string, newStatus: boolean) => {
    try {
      await listingsApi.updateStatus(id, newStatus);
    } catch {
      // sample fallback
    }
    setData((prev) => prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item)));
    setToast({
      visible: true,
      message: `Product ${newStatus ? 'Active' : 'Inactive'} Status successfully`,
      type: 'success',
    });
  };

  const handleAdd = () => {
    setEditingListing(null);
    setIsModalOpen(true);
  };

  const handleEdit = (listing: Listing) => {
    setEditingListing(listing);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await listingsApi.delete(id);
      fetchListings();
    } catch {
      setData((prev) => prev.filter((item) => item.id !== id));
    }
    setToast({ visible: true, message: 'Listing deleted successfully', type: 'success' });
  };

  const handleSubmit = async (formData: Partial<Listing>) => {
    setIsSubmitting(true);
    try {
      if (editingListing) {
        await listingsApi.update(editingListing.id, formData);
        setToast({ visible: true, message: 'Listing updated successfully', type: 'success' });
      } else {
        await listingsApi.create(formData);
        setToast({ visible: true, message: 'Listing created successfully', type: 'success' });
      }
      setIsModalOpen(false);
      fetchListings();
    } catch {
      if (editingListing) {
        setData((prev) =>
          prev.map((item) => (item.id === editingListing.id ? { ...item, ...formData } as Listing : item))
        );
        setToast({ visible: true, message: 'Listing updated successfully', type: 'success' });
      } else {
        const created: Listing = {
          id: String(Date.now()),
          sNo: data.length + 1,
          category: formData.category || 'General',
          subCategory: formData.subCategory || '-',
          product: formData.product || 'New Product',
          email: formData.email || 'admin@shop.com',
          image: formData.image || 'https://placehold.co/80x40/e5e7eb/9ca3af?text=IMG',
          createdBy: 'Admin',
          date: new Date().toISOString().slice(0, 10),
          status: formData.status ?? true,
        };
        setData((prev) => [created, ...prev]);
        setToast({ visible: true, message: 'Listing created successfully', type: 'success' });
      }
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-full">
      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, visible: false })}
        />
      )}

      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your product listings and necessary information from here.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-[#e5e7eb]">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <select
                value={showCount}
                onChange={(e) => setShowCount(Number(e.target.value))}
                className="h-10 rounded-md border border-[#e5e7eb] bg-white px-3 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#009f7f]/30 focus:border-[#009f7f] w-[72px]"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>

              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Product"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-48 pl-9 pr-3 rounded-md border border-[#e5e7eb] bg-white text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#009f7f]/30 focus:border-[#009f7f]"
                />
              </div>

              <select className="h-10 rounded-md border border-[#e5e7eb] bg-white px-3 text-sm text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#009f7f]/30 focus:border-[#009f7f] w-48">
                <option value="">Select Service Providers</option>
                <option value="provider1">Provider 1</option>
                <option value="provider2">Provider 2</option>
              </select>

              <button className="h-10 px-4 inline-flex items-center gap-2 rounded-md bg-[#009f7f] hover:bg-[#00856b] text-white text-sm font-semibold transition-colors">
                <Search size={15} />
                Filter
              </button>
            </div>

            <button
              onClick={handleAdd}
              className="h-10 px-4 inline-flex items-center gap-2 rounded-md bg-[#009f7f] hover:bg-[#00856b] text-white text-sm font-semibold transition-colors shrink-0"
            >
              <Plus size={17} />
              Add Product
            </button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-10 text-center text-gray-500 text-sm">Loading...</div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#f9fafb] text-gray-600 font-semibold border-b border-[#e5e7eb]">
                  <tr>
                    {[
                      'S No',
                      'Category',
                      'SubCategory',
                      'Product',
                      'Email',
                      'Image',
                      'Created By',
                      'Date',
                      'Status',
                    ].map((col) => (
                      <th key={col} className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 cursor-pointer">
                          {col}
                          {col !== 'Image' && (
                            <ArrowDownUp size={13} className="text-[#009f7f]/70" />
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="px-4 py-3.5 whitespace-nowrap text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3f4f6] bg-white">
                  {data.slice(0, showCount).map((row) => (
                    <tr key={row.id} className="hover:bg-[#f9fafb] transition-colors">
                      <td className="px-4 py-3.5 text-gray-600">{row.sNo}</td>
                      <td className="px-4 py-3.5 text-gray-600">{row.category}</td>
                      <td className="px-4 py-3.5 text-gray-600">{row.subCategory}</td>
                      <td className="px-4 py-3.5 text-gray-800 font-medium">{row.product}</td>
                      <td className="px-4 py-3.5 text-gray-600">{row.email}</td>
                      <td className="px-4 py-3.5">
                        <div className="w-16 h-8 rounded border border-[#e5e7eb] overflow-hidden bg-gray-50">
                          <img
                            src={row.image}
                            alt=""
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600">{row.createdBy}</td>
                      <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{row.date}</td>
                      <td className="px-4 py-3.5">
                        <ToggleSwitch
                          checked={row.status}
                          onChange={(checked) => handleToggleStatus(row.id, checked)}
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(row)}
                            className={cn(
                              'p-1.5 rounded-md text-[#009f7f] hover:bg-[#009f7f]/10 transition-colors'
                            )}
                            title="Edit"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(row.id)}
                            className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                          <button
                            className="p-1.5 rounded-md text-[#009f7f] hover:bg-[#009f7f]/10 transition-colors"
                            title="View"
                          >
                            <Eye size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!data.length && (
                    <tr>
                      <td colSpan={10} className="px-4 py-10 text-center text-gray-500">
                        No products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingListing ? 'Edit Listing' : 'Add New Listing'}
      >
        <ListingForm
          initialData={editingListing}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
};
