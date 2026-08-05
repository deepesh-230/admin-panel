import React, { useState } from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { ListingTableToolbar } from '../components/ui/ListingTableToolbar';
import { ListingTable } from '../components/ui/ListingTable';
import { listingsData } from '../constants/mockData';
import { Toast } from '../components/common/Toast';

export const ListingsList = () => {
  const [showCount, setShowCount] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState(listingsData);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    visible: false,
    message: '',
    type: 'success'
  });

  const handleToggleStatus = (id: string, newStatus: boolean) => {
    setData(prevData => prevData.map(item => 
      item.id === id ? { ...item, status: newStatus } : item
    ));
    
    // Show the toast according to the design
    setToast({
      visible: true,
      message: `Product ${newStatus ? 'Active' : 'Inactive'} Status successfully`,
      type: 'success'
    });
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
        />
        
        <ListingTable data={data} onToggleStatus={handleToggleStatus} />
      </div>
    </div>
  );
};
