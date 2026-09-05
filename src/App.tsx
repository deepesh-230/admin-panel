import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { EnquiriesList } from './pages/EnquiriesList';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { StatesList } from './pages/StatesList';
import { NotFoundPage } from './pages/NotFoundPage';
import { CategoriesList } from './pages/CategoriesList';
import { SubcategoriesList } from './pages/SubcategoriesList';
import { StateAdminsList } from './pages/StateAdminsList';
import { UsersList } from './pages/UsersList';
import { ServiceProvidersList } from './pages/ServiceProvidersList';
import { PaymentsList } from './pages/PaymentsList';
import { FaqsList } from './pages/FaqsList';
import { MarketplaceProductsList } from './pages/MarketplaceProductsList';
import { PagesList } from './pages/PagesList';
import { JobAlertsList } from './pages/JobAlertsList';
import { SuggestionsList } from './pages/SuggestionsList';
import { UsefulLinksList } from './pages/UsefulLinksList';
import { EventsList } from './pages/EventsList';
import { PermissionsConfigPage } from './pages/PermissionsConfigPage';
import {
  BlogsPage,
  HelpSupportPage,
  VolunteersPage,
} from './pages/AdminContentPages';
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
                    <Route path="/states" element={<StatesList />} />
                    <Route path="/service-provider/category" element={<CategoriesList />} />
                    <Route path="/service-provider/sub-category" element={<SubcategoriesList />} />
                    <Route path="/service-provider/listing" element={<ServiceProvidersList />} />
                    <Route path="/emergency/category" element={<Navigate to="/service-provider/category" replace />} />
                    <Route path="/emergency/sub-category" element={<Navigate to="/service-provider/sub-category" replace />} />
                    <Route path="/emergency/listing" element={<Navigate to="/service-provider/listing" replace />} />
                    <Route path="/app-users" element={<UsersList lockedRole="END_USER" />} />
                    <Route
                      path="/app-volunteers"
                      element={
                        <UsersList lockedRole="VOLUNTEER" title="Volunteers" parent="App user" />
                      }
                    />
                    <Route path="/provider-admins" element={<UsersList lockedRole="SERVICE_PROVIDER_ADMIN" title="Provider admins" parent="Service Provider" />} />
                    <Route path="/state-admins" element={<StateAdminsList />} />
                    <Route path="/volunteer-admins" element={<Navigate to="/volunteers" replace />} />
                    <Route path="/enquiries/user" element={<EnquiriesList kind="USER" title="User enquiry" />} />
                    <Route
                      path="/enquiries/provider"
                      element={<EnquiriesList kind="PROVIDER" title="Service provider" />}
                    />
                    <Route
                      path="/enquiries/volunteer"
                      element={<EnquiriesList kind="VOLUNTEER" title="Volunteer" />}
                    />
                    <Route
                      path="/enquiries/state-admin"
                      element={<EnquiriesList kind="STATE_ADMIN" title="State admin" />}
                    />
                    <Route
                      path="/enquiries/product"
                      element={<EnquiriesList kind="PRODUCT" title="Product enquiry" />}
                    />
                    <Route path="/marketplace/products" element={<MarketplaceProductsList />} />
                    <Route path="/marketplace/buyers" element={<Navigate to="/marketplace/products" replace />} />
                    <Route path="/marketplace/sellers" element={<Navigate to="/marketplace/products" replace />} />
                    <Route path="/volunteers" element={<VolunteersPage />} />
                    <Route path="/payments" element={<PaymentsList />} />
                    <Route path="/faq" element={<FaqsList />} />
                    <Route path="/useful-links" element={<UsefulLinksList />} />
                    <Route path="/support" element={<HelpSupportPage />} />
                    <Route path="/pages" element={<PagesList />} />
                    <Route path="/blogs" element={<BlogsPage />} />
                    <Route path="/jobs" element={<JobAlertsList />} />
                    <Route path="/events" element={<EventsList />} />
                    <Route path="/suggestions" element={<SuggestionsList />} />
                    <Route path="/settings/permissions" element={<PermissionsConfigPage />} />
                    <Route path="*" element={<NotFoundPage />} />
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
