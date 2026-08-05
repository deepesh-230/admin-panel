import { useState } from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { TableToolbar } from '../components/ui/TableToolbar';
import { Table } from '../components/ui/Table';
import { enquiriesData } from '../constants/mockData';

export const EnquiriesList = () => {
  const [showCount, setShowCount] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  // In a real app, filtering logic would go here based on searchQuery

  return (
    <div className="flex flex-col h-full max-w-full">
      <Breadcrumb 
        title="Enquiry List" 
        paths={[{ name: "List Enquiry" }]} 
      />

      
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex-1 flex flex-col mb-4 overflow-hidden">
        <TableToolbar 
          showCount={showCount} 
          setShowCount={setShowCount}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        
        <Table data={enquiriesData} />
      </div>
    </div>
  );
};
