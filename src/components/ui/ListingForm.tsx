import React, { useState, useEffect } from 'react';
import type { Listing } from '../../types';

interface ListingFormProps {
  initialData?: Listing | null;
  onSubmit: (data: Partial<Listing>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ListingForm: React.FC<ListingFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel,
  isLoading 
}) => {
  const [formData, setFormData] = useState<Partial<Listing>>({
    category: '',
    subCategory: '',
    product: '',
    email: '',
    image: 'https://placehold.co/60x30/e2e8f0/64748b', // Default placeholder
    createdBy: 'Admin', // Default for now
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    status: false,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
        <input 
          required 
          type="url" 
          name="image" 
          value={formData.image} 
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="status"
          name="status"
          checked={formData.status || false}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="status" className="ml-2 block text-sm text-gray-900">
          Active Status
        </label>
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
