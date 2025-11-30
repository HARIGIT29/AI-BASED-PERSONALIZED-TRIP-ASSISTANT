import React, { Suspense } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import IntroductionPage from './components/IntroductionPage';
import { TripPlanningProvider } from './context/TripPlanningContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './components/ui/NotificationSystem';
import AnimatedBackground from './components/ui/AnimatedBackground';
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Loading component
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="spinner soft-shadow"></div>
  </div>
);

// Lazy load components with error handling
const TripDetailsForm = React.lazy(() => 
  import('./components/TripDetailsForm').catch(err => {
    console.error('Failed to load TripDetailsForm:', err);
    return { default: () => <div>Failed to load component. Please refresh the page.</div> };
  })
);

const TripPlanningDashboard = React.lazy(() => 
  import('./components/dashboard/TripPlanningDashboard')
);

const ItineraryGenerator = React.lazy(() =>
  import('./components/dashboard/ItineraryGenerator').catch(err => {
    console.error('Failed to load ItineraryGenerator:', err);
    return { default: () => <div>Failed to load component. Please refresh the page.</div> };
  })
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

function AppContent() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FAF5F0', position: 'relative' }}>
      <AnimatedBackground />
      <nav className="premium-nav" style={{ position: 'relative', zIndex: 100 }}>
        <div className="premium-nav-content">
          <Link to="/" className="premium-nav-logo">
            AI Trip Planner
          </Link>
          <div className="premium-nav-links">
            {user && (
              <>
                <Link 
                  to="/plan" 
                  className={`premium-nav-link ${isActive('/plan') ? 'active' : ''}`}
                >
                  Plan Trip
                </Link>
                <Link 
                  to="/dashboard" 
                  className={`premium-nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/itinerary" 
                  className={`premium-nav-link ${isActive('/itinerary') ? 'active' : ''}`}
                >
                  Itinerary
                </Link>
                <div className="nav-separator" style={{ width: '1px', height: '20px', background: 'rgba(15, 76, 76, 0.2)' }}></div>
              </>
            )}
            {user ? (
              <>
                <span className="muted-text" style={{ whiteSpace: 'nowrap' }}>
                  {user.name || user.email}
                </span>
                <button
                  onClick={logout}
                  className="micro-btn"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`premium-nav-link ${isActive('/login') ? 'active' : ''}`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="micro-btn"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full" style={{ position: 'relative', zIndex: 1 }}>
        <div className="relative w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-10" style={{ zIndex: 1, position: 'relative' }}>
          <div className="travel-app-shell" style={{ background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', position: 'relative', zIndex: 1 }}>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<IntroductionPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/plan"
                  element={
                    <ProtectedRoute>
                      <TripDetailsForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <TripPlanningDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/itinerary"
                  element={
                    <ProtectedRoute>
                      <ItineraryGenerator />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <AuthProvider>
          <TripPlanningProvider>
            <AppContent />
          </TripPlanningProvider>
        </AuthProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;
