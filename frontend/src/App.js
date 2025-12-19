import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { AuthProvider, AuthCallback, useAuth } from './context/AuthContext';
import { WalletProvider } from './context/WalletContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import SegmentsPage from './pages/SegmentsPage';
import SegmentDetailPage from './pages/SegmentDetailPage';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import { PaymentSuccess, PaymentCancel } from './pages/PaymentPages';
import '@/App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-gradient">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user data passed from AuthCallback via location state, use it
  if (location.state?.user) {
    return children;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// App Router with Auth Detection
const AppRouter = () => {
  const location = useLocation();

  // Check URL fragment for session_id - do this synchronously during render
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/segments" element={<SegmentsPage />} />
      <Route path="/segments/:segmentId" element={<SegmentDetailPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment/success"
        element={
          <ProtectedRoute>
            <PaymentSuccess />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment/cancel"
        element={
          <ProtectedRoute>
            <PaymentCancel />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Layout Component
const Layout = ({ children }) => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/profile');

  return (
    <div className={isDashboard ? 'dark' : ''}>
      <Navbar />
      <main>{children}</main>
      {!isDashboard && <Footer />}
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WalletProvider>
          <Layout>
            <AppRouter />
          </Layout>
          <Toaster position="top-right" richColors />
        </WalletProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
