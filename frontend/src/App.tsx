import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { PackagesList } from './components/PackagesList';
import { ItineraryBuilder } from './components/ItineraryBuilder';
import { ItineraryViewer } from './components/ItineraryViewer';
import { ItineraryViewerIframe } from './components/ItineraryViewerIframe';
import { Login } from './components/Login';
import { Register } from './components/Register';
import api from './services/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Verify token is still valid
      api.get('/user')
        .then(response => {
          setUser(response.data);
          setIsAuthenticated(true);
        })
        .catch(() => {
          localStorage.removeItem('auth_token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (token: string, userData: any) => {
    localStorage.setItem('auth_token', token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleRegister = (token: string, userData: any) => {
    localStorage.setItem('auth_token', token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          {/* Public routes - accessible without authentication */}
          <Route path="/share/:shareUuid" element={<ItineraryViewer />} />
          <Route path="/iframe/:shareUuid" element={<ItineraryViewerIframe />} />
          
          {/* Protected routes - require authentication */}
          {isAuthenticated ? (
            <>
              <Route 
                path="/" 
                element={
                  <PackagesList 
                    user={user}
                    onLogout={handleLogout}
                    onCreatePackage={() => window.location.href = '/create-package'}
                    onEditPackage={(packageId) => window.location.href = `/edit-package/${packageId}`}
                  />
                } 
              />
              <Route 
                path="/create-package" 
                element={<ItineraryBuilder onLogout={handleLogout} />} 
              />
              <Route 
                path="/edit-package/:packageId" 
                element={<ItineraryBuilder onLogout={handleLogout} />} 
              />
            </>
          ) : (
            <>
              <Route 
                path="/" 
                element={
                  showLogin ? (
                    <Login onLogin={handleLogin} onSwitchToRegister={() => setShowLogin(false)} />
                  ) : (
                    <Register onRegister={handleRegister} onSwitchToLogin={() => setShowLogin(true)} />
                  )
                } 
              />
              <Route 
                path="/create-package" 
                element={
                  showLogin ? (
                    <Login onLogin={handleLogin} onSwitchToRegister={() => setShowLogin(false)} />
                  ) : (
                    <Register onRegister={handleRegister} onSwitchToLogin={() => setShowLogin(true)} />
                  )
                } 
              />
              <Route 
                path="/edit-package/:packageId" 
                element={
                  showLogin ? (
                    <Login onLogin={handleLogin} onSwitchToRegister={() => setShowLogin(false)} />
                  ) : (
                    <Register onRegister={handleRegister} onSwitchToLogin={() => setShowLogin(true)} />
                  )
                } 
              />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App
