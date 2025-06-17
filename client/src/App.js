import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Map from './pages/Map';
import AccommodationList from './pages/AccommodationList';
import AccommodationDetail from './pages/AccommodationDetail';
import AccommodationForm from './pages/AccommodationForm';
import ProtectedRoute from './components/ProtectedRoute';
import Chatbot from './components/Chatbot';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/map" element={<Map />} />
            <Route path="/accommodations" element={<AccommodationList />} />
            <Route path="/accommodations/:id" element={<AccommodationDetail />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/accommodations/new"
              element={
                <ProtectedRoute>
                  <AccommodationForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/accommodations/edit/:id"
              element={
                <ProtectedRoute>
                  <AccommodationForm />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Chatbot />
      </div>
    </Router>
  );
}

export default App; 