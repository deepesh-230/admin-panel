import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { EnquiriesList } from './pages/EnquiriesList';
import { ListingsList } from './pages/ListingsList';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { CategoriesList } from './pages/CategoriesList';
import { SubcategoriesList } from './pages/SubcategoriesList';
import { StatesList } from './pages/StatesList';
import { StateAdminsList } from './pages/StateAdminsList';
import { UsersList } from './pages/UsersList';
import { ServiceProvidersList } from './pages/ServiceProvidersList';
import { SampleLayout } from './sample/components/SampleLayout';
import { SampleDashboard } from './sample/pages/SampleDashboard';
import { SampleListing } from './sample/pages/SampleListing';
import { Sample2Layout } from './sample2/components/Sample2Layout';
import { Sample2Dashboard } from './sample2/pages/Sample2Dashboard';
import { Sample2Listing } from './sample2/pages/Sample2Listing';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/sample" element={<SampleLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<SampleDashboard />} />
            <Route path="listings" element={<SampleListing />} />
          </Route>

          <Route path="/sample2" element={<Sample2Layout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Sample2Dashboard />} />
            <Route path="listings" element={<Sample2Listing />} />
          </Route>

          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/listings/list" element={<ListingsList />} />
                    <Route path="/listings/providers" element={<ServiceProvidersList />} />
                    <Route path="/listings/category" element={<CategoriesList />} />
                    <Route path="/listings/sub-category" element={<SubcategoriesList />} />
                    <Route path="/master/states" element={<StatesList />} />
                    <Route path="/master/state-admins" element={<StateAdminsList />} />
                    <Route path="/user" element={<UsersList />} />
                    <Route path="/enquiries/listing" element={<EnquiriesList />} />
                    <Route
                      path="*"
                      element={<div className="p-4 text-gray-500">Page under construction</div>}
                    />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
