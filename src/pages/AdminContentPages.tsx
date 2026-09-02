import { SimpleCrudPage } from './SimpleCrudPage';

export const HelpSupportPage = () => (
  <SimpleCrudPage
    title="Help & support"
    parent="Content"
    endpoint="help-tickets"
    fields={[
      { key: 'name', label: 'Name', required: true },
      { key: 'email', label: 'Email', required: true },
      { key: 'phone', label: 'Phone' },
      { key: 'message', label: 'Message', type: 'textarea', required: true },
      { key: 'status', label: 'Status' },
    ]}
    listColumns={['name', 'email', 'phone', 'status']}
  />
);

export const BlogsPage = () => (
  <SimpleCrudPage
    title="Blogs"
    parent="Content"
    endpoint="blogs"
    bulkImportEntity="blogs"
    fields={[
      { key: 'title', label: 'Title', required: true },
      { key: 'shortDescription', label: 'Short description', type: 'textarea' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'image', label: 'Image', type: 'image' },
      { key: 'isActive', label: 'Active', type: 'checkbox' },
    ]}
    listColumns={['title', 'shortDescription', 'isActive']}
  />
);

export const VolunteersPage = () => (
  <SimpleCrudPage
    title="Listing"
    parent="Volunteers"
    endpoint="volunteers"
    bulkImportEntity="volunteers"
    fields={[
      { key: 'name', label: 'Name', required: true },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'location', label: 'Location' },
      { key: 'isActive', label: 'Active', type: 'checkbox' },
    ]}
    listColumns={['name', 'email', 'phone', 'location', 'isActive']}
  />
);
