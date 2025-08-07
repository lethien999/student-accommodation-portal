import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AccommodationList from './pages/AccommodationList';
import AccommodationForm from './pages/AccommodationForm';
import AccommodationDetailPage from './pages/AccommodationDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
import CompareAccommodations from './pages/CompareAccommodations';
import ChatList from './pages/ChatList';
import Chat from './pages/Chat';
import Favorites from './pages/Favorites';
import Search from './pages/Search';
import LandlordVerificationPage from './pages/LandlordVerificationPage';
import PaymentHistory from './pages/PaymentHistory';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailedPage from './pages/PaymentFailedPage';
import AdminDashboard from './pages/AdminDashboard';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import NewsManagementPage from './pages/NewsManagementPage';
import CentralAdminDashboard from './pages/CentralAdminDashboard';
import LandlordDashboard from './pages/LandlordDashboard';
import TenantDashboard from './pages/TenantDashboard';
import ModeratorDashboard from './pages/ModeratorDashboard';
import ModeratorReviewsPage from './pages/ModeratorReviewsPage';
import ReportManagementPage from './pages/ReportManagementPage';
import EventManagementPage from './pages/EventManagementPage';
import MaintenanceManagementPage from './pages/MaintenanceManagementPage';
import { HelmetProvider } from 'react-helmet-async';
import './App.css'; // Import a new CSS file for global styles
import { ThemeProvider } from './contexts/ThemeContext';
import PushNotificationSettingsPage from './pages/PushNotificationSettingsPage';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';
import DocumentManagementPage from './pages/DocumentManagementPage';

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <ThemeProvider>
          <Header />
          <main className="container py-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/search" element={<Search />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/news/:slug" element={<NewsDetailPage />} />
              <Route path="/accommodations/:id" element={<AccommodationDetailPage />} />

              {/* Protected Routes */}
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/accommodations" element={<ProtectedRoute><AccommodationList /></ProtectedRoute>} />
              <Route path="/accommodations/new" element={<ProtectedRoute><AccommodationForm /></ProtectedRoute>} />
              <Route path="/accommodations/edit/:id" element={<ProtectedRoute><AccommodationForm /></ProtectedRoute>} />
              <Route path="/chat/:conversationId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
              <Route path="/compare" element={<ProtectedRoute><CompareAccommodations /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><ChatList /></ProtectedRoute>} />
              <Route path="/verify-landlord" element={<ProtectedRoute><LandlordVerificationPage /></ProtectedRoute>} />
              <Route path="/payments" element={<ProtectedRoute><PaymentHistory /></ProtectedRoute>} />
              <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />
              <Route path="/payment/failed" element={<ProtectedRoute><PaymentFailedPage /></ProtectedRoute>} />

              {/* Role-based Dashboards */}
              <Route path="/dashboard/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/dashboard/admin/news" element={<ProtectedRoute requiredRole="admin"><NewsManagementPage /></ProtectedRoute>} />
              <Route path="/dashboard/admin/reports" element={<ProtectedRoute requiredRole="admin"><ReportManagementPage /></ProtectedRoute>} />
              <Route path="/dashboard/admin/central" element={<ProtectedRoute requiredRole="admin"><CentralAdminDashboard /></ProtectedRoute>} />
              <Route path="/dashboard/landlord" element={<ProtectedRoute requiredRole="landlord"><LandlordDashboard /></ProtectedRoute>} />
              <Route path="/dashboard/tenant" element={<ProtectedRoute requiredRole="tenant"><TenantDashboard /></ProtectedRoute>} />
              <Route path="/dashboard/moderator" element={<ProtectedRoute requiredRole="moderator"><ModeratorDashboard /></ProtectedRoute>} />
              <Route path="/dashboard/moderator/reports" element={<ProtectedRoute requiredRole="moderator"><ReportManagementPage /></ProtectedRoute>} />
              <Route path="/dashboard/moderator/reviews" element={<ProtectedRoute requiredRole="moderator"><ModeratorReviewsPage /></ProtectedRoute>} />

              <Route path="/events" element={<ProtectedRoute><EventManagementPage /></ProtectedRoute>} />

              <Route path="/maintenance" element={<ProtectedRoute><MaintenanceManagementPage /></ProtectedRoute>} />

              <Route path="/push-settings" element={<ProtectedRoute><PushNotificationSettingsPage /></ProtectedRoute>} />

              <Route path="/analytics" element={<ProtectedRoute><AnalyticsDashboardPage /></ProtectedRoute>} />

              <Route path="/documents" element={<ProtectedRoute><DocumentManagementPage /></ProtectedRoute>} />

            </Routes>
          </main>
        </ThemeProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;