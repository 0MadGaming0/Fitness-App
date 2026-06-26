/**
 * App.jsx — Main router with lazy-loaded pages, protected routes,
 * and AnimatePresence page transitions.
 */
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import Spinner from './components/ui/Spinner';

// ─── Lazy-loaded pages ───
const Landing    = lazy(() => import('./pages/Landing'));
const Login      = lazy(() => import('./pages/Login'));
const Register   = lazy(() => import('./pages/Register'));
const Dashboard  = lazy(() => import('./pages/Dashboard'));
const Analytics  = lazy(() => import('./pages/Analytics'));
const Workouts   = lazy(() => import('./pages/Workouts'));
const AICoach    = lazy(() => import('./pages/AICoach'));
const Profile    = lazy(() => import('./pages/Profile'));
const Settings   = lazy(() => import('./pages/Settings'));
const NotFound   = lazy(() => import('./pages/NotFound'));

// ─── Full-screen loading fallback ───
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#050508]">
    <Spinner size="lg" />
  </div>
);

// ─── Protected Route wrapper ───
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

// ─── Public Route — redirect authenticated users away from login/register ───
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  const location = useLocation();

  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* Protected */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/workouts"  element={<ProtectedRoute><Workouts /></ProtectedRoute>} />
          <Route path="/ai-coach"  element={<ProtectedRoute><AICoach /></ProtectedRoute>} />
          <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings"  element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}
