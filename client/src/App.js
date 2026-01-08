import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import MainLayout from './layouts/MainLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Map from './pages/Map';
import AccommodationList from './pages/AccommodationList';
import AccommodationDetail from './pages/AccommodationDetail';
import AccommodationForm from './pages/AccommodationForm';
import SavedAccommodations from './pages/SavedAccommodations';
import ProtectedRoute from './components/ProtectedRoute';

// Dashboard Pages
import AdminDashboard from './pages/dashboard/AdminDashboard';
import LandlordDashboard from './pages/dashboard/LandlordDashboard';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Main Application Routes - Unified Layout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/map" element={<Map />} />
              <Route path="/accommodations" element={<AccommodationList />} />
              <Route path="/accommodations/:id" element={<AccommodationDetail />} />

              {/* Unified Profile/Dashboard Routes */}
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/saved-accommodations" element={<ProtectedRoute><SavedAccommodations /></ProtectedRoute>} />

              {/* Landlord Routes */}
              <Route
                path="/admin"
                element={<ProtectedRoute roles={['admin']}><Profile /></ProtectedRoute>}
              />
              <Route
                path="/landlord"
                element={<ProtectedRoute roles={['landlord', 'admin']}><Profile /></ProtectedRoute>}
              />
              <Route
                path="/sale"
                element={<ProtectedRoute roles={['sale', 'admin']}><Profile /></ProtectedRoute>}
              />
              <Route
                path="/dashboard"
                element={<ProtectedRoute><Profile /></ProtectedRoute>}
              />

              <Route
                path="/accommodations/new"
                element={<ProtectedRoute><AccommodationForm /></ProtectedRoute>}
              />
              <Route
                path="/accommodations/edit/:id"
                element={<ProtectedRoute><AccommodationForm /></ProtectedRoute>}
              />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;