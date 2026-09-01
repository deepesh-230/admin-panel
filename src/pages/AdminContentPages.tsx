import { SimpleCrudPage } from './SimpleCrudPage';

export const FaqPage = () => (
  <SimpleCrudPage
    title="FAQ"
    parent="Content"
    endpoint="faqs"
    bulkImportEntity="faqs"
    fields={[
      { key: 'title', label: 'Title', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'isActive', label: 'Active', type: 'checkbox' },
    ]}
    listColumns={['title', 'description', 'isActive']}
  />
);

export const UsefulLinksPage = () => (
  <SimpleCrudPage
    title="Useful link"
    parent="Content"
    endpoint="useful-links"
    bulkImportEntity="useful-links"
    broadcast
    fields={[
      { key: 'title', label: 'Title', required: true },
      { key: 'url', label: 'URL', type: 'url', required: true },
      { key: 'isActive', label: 'Active', type: 'checkbox' },
    ]}
    listColumns={['title', 'url', 'broadcastAt', 'isActive']}
  />
);

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

export const PagesPage = () => (
  <SimpleCrudPage
    title="Pages"
    parent="Content"
    endpoint="pages"
    fields={[
      { key: 'slug', label: 'Slug', required: true },
      { key: 'title', label: 'Title', required: true },
      { key: 'content', label: 'Content', type: 'textarea', required: true },
      { key: 'isActive', label: 'Active', type: 'checkbox' },
    ]}
    listColumns={['slug', 'title', 'isActive']}
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

export const JobAlertsPage = () => (
  <SimpleCrudPage
    title="Job alerts"
    parent="Content"
    endpoint="job-alerts"
    bulkImportEntity="job-alerts"
    broadcast
    fields={[
      { key: 'title', label: 'Title', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'postDate', label: 'Post date' },
      { key: 'lastDate', label: 'Last date' },
      { key: 'isActive', label: 'Active', type: 'checkbox' },
    ]}
    listColumns={['title', 'postDate', 'lastDate', 'broadcastAt', 'isActive']}
  />
);

export const SuggestionsPage = () => (
  <SimpleCrudPage
    title="Suggestions"
    parent="Content"
    endpoint="suggestions"
    fields={[
      { key: 'title', label: 'Title', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'status', label: 'Status' },
    ]}
    listColumns={['title', 'status']}
    createDefaults={{ status: 'NEW' }}
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

export const MarketplaceProductsPage = () => (
  <SimpleCrudPage
    title="Product listing"
    parent="Market Place"
    endpoint="marketplace/products"
    bulkImportEntity="marketplace-products"
    fields={[
      { key: 'name', label: 'Product', required: true },
      { key: 'actualPrice', label: 'Actual price' },
      { key: 'offerPrice', label: 'Offer price' },
      { key: 'phone', label: 'Phone' },
      { key: 'listingIntent', label: 'Intent (sell/buy)' },
      { key: 'sellerName', label: 'Seller / buyer name' },
      { key: 'isActive', label: 'Active', type: 'checkbox' },
    ]}
    listColumns={['name', 'offerPrice', 'listingIntent', 'sellerName', 'isActive']}
  />
);

export const MarketplaceBuyersPage = () => (
  <SimpleCrudPage
    title="Buyer"
    parent="Market Place"
    endpoint="marketplace/parties"
    extraQuery={{ kind: 'BUYER' }}
    createDefaults={{ kind: 'BUYER' }}
    fields={[
      { key: 'name', label: 'Name', required: true },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'isActive', label: 'Active', type: 'checkbox' },
    ]}
    listColumns={['name', 'email', 'phone', 'isActive']}
  />
);

export const MarketplaceSellersPage = () => (
  <SimpleCrudPage
    title="Seller"
    parent="Market Place"
    endpoint="marketplace/parties"
    extraQuery={{ kind: 'SELLER' }}
    createDefaults={{ kind: 'SELLER' }}
    fields={[
      { key: 'name', label: 'Name', required: true },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'isActive', label: 'Active', type: 'checkbox' },
    ]}
    listColumns={['name', 'email', 'phone', 'isActive']}
  />
);
