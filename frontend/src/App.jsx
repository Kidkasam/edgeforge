import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Trades from './pages/Trades';
import Profile from './pages/Profile';
import Landing from './pages/Landing';
import Footer from './components/Footer';
import Logo from './components/Logo';
import {
  LayoutDashboard, History, LogOut, TrendingUp, User,
  Menu, X, Sun, Moon, Zap, ChevronRight
} from 'lucide-react';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const Navigation = () => {
  const { logout, isAuthenticated, username } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (location.pathname === '/' && !isAuthenticated) return null;

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <>
      <nav className={`glass-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
            <Link to="/" className="nav-brand" onClick={closeSidebar}>
              <Logo size={scrolled ? 32 : 36} />
              <h1>EdgeForge</h1>
            </Link>

            <div className="nav-links-desktop" style={{ display: 'flex', gap: '0.25rem' }}>
              {isAuthenticated ? (
                <>
                  <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <Link to="/trades" className={`nav-link ${location.pathname === '/trades' ? 'active' : ''}`}>
                    <History size={16} /> Trades
                  </Link>
                </>
              ) : (
                <>
                  <a href="#features" className="nav-link">Infrastructure</a>
                  <a href="#about" className="nav-link">Story</a>
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={toggleTheme} className="theme-toggle">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isAuthenticated ? (
              <>
                <div onClick={() => setIsSidebarOpen(true)} className="user-pill desktop-only">
                  <div className="user-avatar">
                    <User size={14} color="white" />
                  </div>
                  <span className="user-name">{username || 'Account'}</span>
                </div>
                <button onClick={() => setIsSidebarOpen(true)} className="theme-toggle mobile-only">
                  <Menu size={20} />
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <Link to="/login" className="btn btn-glass btn-login-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>Login</Link>
                <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.85rem' }}>Forge Access</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {isSidebarOpen && (
        <>
          <div className="sidebar-overlay" onClick={closeSidebar} />
          <aside className="sidebar">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px var(--primary-glow)' }}>
                  <User size={24} color="white" />
                </div>
                <div>
                  <div style={{ fontWeight: '900', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{username || 'Trader'}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '1px' }}>Sovereign Node</div>
                </div>
              </div>
              <button onClick={closeSidebar} className="theme-toggle" style={{ border: 'none' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} style={{ padding: '1rem' }} onClick={closeSidebar}>
                <LayoutDashboard size={20} /><span>Dashboard</span>
                <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.3 }} />
              </Link>
              <Link to="/trades" className={`nav-link ${location.pathname === '/trades' ? 'active' : ''}`} style={{ padding: '1rem' }} onClick={closeSidebar}>
                <History size={20} /><span>Trade History</span>
                <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.3 }} />
              </Link>
              <Link to="/profile" className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`} style={{ padding: '1rem' }} onClick={closeSidebar}>
                <User size={20} /><span>Identity Settings</span>
                <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.3 }} />
              </Link>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
              <button onClick={() => { logout(); closeSidebar(); }} className="btn" style={{ width: '100%', background: 'rgba(244, 63, 94, 0.08)', color: 'var(--danger)', fontSize: '0.9rem', padding: '0.8rem' }}>
                <LogOut size={18} /> Sign Out Node
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isLandingPage = location.pathname === '/' && !isAuthenticated;

  return (
    <div className={!isLandingPage ? 'main-content' : ''} style={{ transition: 'all 0.3s ease' }}>
      <Navigation />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<HomeLoader />} />
        <Route path="/trades" element={<PrivateRoute><Trades /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      </Routes>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

const HomeLoader = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Dashboard /> : <Landing />;
};

export default App;
