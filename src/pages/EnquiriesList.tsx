import { useEffect, useState } from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { TableToolbar } from '../components/ui/TableToolbar';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/common/Modal';
import { EnquiryForm } from '../components/ui/EnquiryForm';
import { Toast } from '../components/common/Toast';
import { enquiriesApi } from '../api/enquiries';
import type { Enquiry, EnquiryKind, EnquiryStatus } from '../types';

type Props = {
  kind: EnquiryKind;
  title: string;
};

const STATUS_TABS: { label: string; value: EnquiryStatus | '' }[] = [
  { label: 'All', value: '' },
  { label: 'New', value: 'NEW' },
  { label: 'Contacted', value: 'CONTACTED' },
  { label: 'Closed', value: 'CLOSED' },
];

export const EnquiriesList = ({ kind, title }: Props) => {
  const [showCount, setShowCount] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EnquiryStatus | ''>('');
  const [enquiriesData, setEnquiriesData] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEnquiry, setEditingEnquiry] = useState<Enquiry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const data = await enquiriesApi.getAll(searchQuery, kind, statusFilter);
      setEnquiriesData(data);
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Failed to load enquiries',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(fetchEnquiries, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, kind, statusFilter]);

  const handleAdd = () => {
    setEditingEnquiry(null);
    setIsModalOpen(true);
  };

  const handleEdit = (enquiry: Enquiry) => {
    setEditingEnquiry(enquiry);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this enquiry?')) return;
    try {
      await enquiriesApi.delete(id);
      setToast({ visible: true, message: 'Enquiry deleted', type: 'success' });
      fetchEnquiries();
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Delete failed',
        type: 'error',
      });
    }
  };

  const handleStatusChange = async (enquiry: Enquiry, status: EnquiryStatus) => {
    try {
      await enquiriesApi.update(enquiry.id, { status });
      setEnquiriesData((rows) => rows.map((r) => (r.id === enquiry.id ? { ...r, status } : r)));
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Status update failed',
        type: 'error',
      });
    }
  };

  const handleSubmit = async (data: Partial<Enquiry>) => {
    setIsSubmitting(true);
    try {
      if (editingEnquiry) {
        await enquiriesApi.update(editingEnquiry.id, data);
      } else {
        await enquiriesApi.create({ ...data, kind });
      }
      setIsModalOpen(false);
      setToast({ visible: true, message: 'Enquiry saved', type: 'success' });
      fetchEnquiries();
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Save failed',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-full">
      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, visible: false })}
        />
      )}
      <Breadcrumb title={title} paths={[{ name: 'Enquiry' }, { name: title }]} />

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex-1 flex flex-col mb-4 overflow-hidden">
        <div className="flex flex-wrap gap-2 px-4 pt-4">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                statusFilter === tab.value
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <TableToolbar
          showCount={showCount}
          setShowCount={setShowCount}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onAdd={handleAdd}
        />

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <Table
            data={enquiriesData.slice(0, showCount)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEnquiry ? 'Edit Enquiry' : 'Add New Enquiry'}
      >
        <EnquiryForm
          kind={kind}
          initialData={editingEnquiry}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
};
