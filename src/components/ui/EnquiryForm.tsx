import React, { useState, useEffect } from 'react';
import type { Enquiry } from '../../types';

interface EnquiryFormProps {
  initialData?: Enquiry | null;
  onSubmit: (data: Partial<Enquiry>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const EnquiryForm: React.FC<EnquiryFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel,
  isLoading 
}) => {
  const [formData, setFormData] = useState<Partial<Enquiry>>({
    category: '',
    subCategory: '',
    product: '',
    name: '',
    email: '',
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' 00:00',
    createdBy: 'Admin', // Default for now
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <input 
          required 
          type="text" 
          name="category" 
          value={formData.category} 
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Category</label>
        <input 
          required 
          type="text" 
          name="subCategory" 
          value={formData.subCategory} 
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
        <input 
          required 
          type="text" 
          name="product" 
          value={formData.product} 
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input 
          type="text" 
          name="name" 
          value={formData.name || ''} 
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input 
          required 
          type="email" 
          name="email" 
          value={formData.email} 
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button 
          type="button" 
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};
