import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { EnquiriesList } from './pages/EnquiriesList';
import { ListingsList } from './pages/ListingsList';
import { Dashboard } from './pages/Dashboard';
import { SampleLayout } from './sample/components/SampleLayout';
import { SampleDashboard } from './sample/pages/SampleDashboard';
import { SampleListing } from './sample/pages/SampleListing';
import { Sample2Layout } from './sample2/components/Sample2Layout';
import { Sample2Dashboard } from './sample2/pages/Sample2Dashboard';
import { Sample2Listing } from './sample2/pages/Sample2Listing';

function App() {
  return (
    <Router>
      <Routes>
        {/* PickBazar sample screens */}
        <Route path="/sample" element={<SampleLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SampleDashboard />} />
          <Route path="listings" element={<SampleListing />} />
        </Route>

        {/* AdminSuite sample2 screens */}
        <Route path="/sample2" element={<Sample2Layout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Sample2Dashboard />} />
          <Route path="listings" element={<Sample2Listing />} />
        </Route>

        {/* Existing app */}
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/enquiries/listing" element={<EnquiriesList />} />
                <Route path="/listings/list" element={<ListingsList />} />
                <Route path="*" element={<div className="p-4 text-gray-500">Page under construction</div>} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
