import { useState, useEffect } from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { ListingTableToolbar } from '../components/ui/ListingTableToolbar';
import { ListingTable } from '../components/ui/ListingTable';
import { Toast } from '../components/common/Toast';
import { Modal } from '../components/common/Modal';
import { ListingForm } from '../components/ui/ListingForm';
import { listingsApi } from '../api/listings';
import type { Listing } from '../types';

export const ListingsList = () => {
  const [showCount, setShowCount] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    visible: false,
    message: '',
    type: 'success'
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const result = await listingsApi.getAll(searchQuery);
      setData(result);
    } catch (err) {
      console.error('Failed to fetch listings', err);
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
      setData(prevData => prevData.map(item => 
        item.id === id ? { ...item, status: newStatus } : item
      ));
      
      setToast({
        visible: true,
        message: `Product ${newStatus ? 'Active' : 'Inactive'} Status successfully`,
        type: 'success'
      });
    } catch (err) {
      console.error(err);
      setToast({
        visible: true,
        message: 'Failed to update status',
        type: 'error'
      });
    }
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
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await listingsApi.delete(id);
        fetchListings();
        setToast({ visible: true, message: 'Listing deleted successfully', type: 'success' });
      } catch (err) {
        console.error('Failed to delete listing', err);
        setToast({ visible: true, message: 'Failed to delete listing', type: 'error' });
      }
    }
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
    } catch (err) {
      console.error('Failed to save listing', err);
      setToast({ visible: true, message: 'Failed to save listing', type: 'error' });
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

      <Breadcrumb 
        title="Listing" 
        paths={[{ name: "List Listing" }]} 
      />
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex-1 flex flex-col mb-4 overflow-hidden">
        <ListingTableToolbar 
          showCount={showCount} 
          setShowCount={setShowCount}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onAdd={handleAdd}
        />
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <ListingTable 
            data={data.slice(0, showCount)} 
            onToggleStatus={handleToggleStatus}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
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

