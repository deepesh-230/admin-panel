import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { EnquiriesList } from './pages/EnquiriesList';
import { ListingsList } from './pages/ListingsList';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/enquiries/listing" element={<EnquiriesList />} />
          <Route path="/listings/list" element={<ListingsList />} />
          {/* Placeholder route for testing navigation */}
          <Route path="*" element={<div className="p-4 text-gray-500">Page under construction</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;


