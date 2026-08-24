import { useState, useEffect } from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { TableToolbar } from '../components/ui/TableToolbar';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/common/Modal';
import { EnquiryForm } from '../components/ui/EnquiryForm';
import { enquiriesApi } from '../api/enquiries';
import type { Enquiry } from '../types';

type Props = {
  kind: 'USER' | 'PROVIDER';
  title: string;
};

export const EnquiriesList = ({ kind, title }: Props) => {
  const [showCount, setShowCount] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [enquiriesData, setEnquiriesData] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEnquiry, setEditingEnquiry] = useState<Enquiry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const data = await enquiriesApi.getAll(searchQuery, kind);
      setEnquiriesData(data);
    } catch (err) {
      console.error('Failed to fetch enquiries', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(fetchEnquiries, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, kind]);

  const handleAdd = () => {
    setEditingEnquiry(null);
    setIsModalOpen(true);
  };

  const handleEdit = (enquiry: Enquiry) => {
    setEditingEnquiry(enquiry);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this enquiry?')) {
      try {
        await enquiriesApi.delete(id);
        fetchEnquiries();
      } catch (err) {
        console.error('Failed to delete enquiry', err);
      }
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
      fetchEnquiries();
    } catch (err) {
      console.error('Failed to save enquiry', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-full">
      <Breadcrumb
        title={title}
        paths={[{ name: 'Enquiry' }, { name: title }]}
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex-1 flex flex-col mb-4 overflow-hidden">
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
          />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEnquiry ? 'Edit Enquiry' : 'Add New Enquiry'}
      >
        <EnquiryForm 
          initialData={editingEnquiry}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
};

