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
  const location = useLocation();

  // Don't show global nav on Landing page if not authenticated
  if (location.pathname === '/' && !isAuthenticated) return null;

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <>
      <nav className="glass-card" style={{
        margin: '1.5rem 2rem 2.5rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: '1.25rem',
        padding: '0.8rem 2rem',
        border: '1px solid var(--border-color)',
        position: 'sticky',
        top: '1.5rem',
        zIndex: 100,
        boxShadow: '0 20px 40px -15px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          <Link to="/" style={{ textDecoration: 'none' }} onClick={closeSidebar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Logo size={32} />
              <h1 style={{
                fontSize: '1.4rem',
                fontWeight: '900',
                letterSpacing: '-0.04em',
                background: 'linear-gradient(135deg, var(--text-primary), var(--primary))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0
              }}>EdgeForge</h1>
            </div>
          </Link>

          {/* Nav Links - Desktop */}
          <div className="nav-links-desktop" style={{ display: 'flex', gap: '1rem' }}>
            {isAuthenticated ? (
              <>
                <Link to="/" className="nav-link" style={{ fontSize: '0.9rem' }}><LayoutDashboard size={16} /> Dashboard</Link>
                <Link to="/trades" className="nav-link" style={{ fontSize: '0.9rem' }}><History size={16} /> Trades</Link>
              </>
            ) : (
              <>
                <a href="#features" className="nav-link" style={{ fontSize: '0.9rem' }}>Infrastructure</a>
                <a href="#about" className="nav-link" style={{ fontSize: '0.9rem' }}>Story</a>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={toggleTheme} className="theme-toggle">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <>
              {/* Desktop: avatar button opens sidebar for profile/logout */}
              <button onClick={() => setIsSidebarOpen(true)} className="btn btn-glass desktop-only" style={{ padding: '0.5rem 1rem', gap: '0.5rem', background: 'var(--surface-50)', fontSize: '0.85rem', fontWeight: '700' }}>
                <User size={16} /> {username || 'Account'}
              </button>
              {/* Mobile: burger menu opens sidebar */}
              <button onClick={() => setIsSidebarOpen(true)} className="btn btn-glass mobile-only" style={{ padding: '0.6rem', background: 'var(--surface-50)' }}>
                <Menu size={20} />
              </button>
            </>
          ) : (
            // Not logged in: just show Login + Register buttons, no burger needed
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <Link to="/login" className="btn btn-glass btn-login-secondary" style={{ padding: '0.6rem 1.4rem', fontSize: '0.85rem', borderRadius: '0.75rem', background: 'var(--surface-100)' }}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.6rem 1.4rem', fontSize: '0.85rem', borderRadius: '0.75rem' }}>Forge Access</Link>
            </div>
          )}
        </div>
      </nav>

      {/* Global Sidebar - Sovereign Edit */}
      {isSidebarOpen && (
        <>
          <div className="sidebar-overlay" onClick={closeSidebar} />
          <aside className="sidebar glass-card" style={{
            position: 'fixed', right: '1.5rem', top: '1.5rem', bottom: '1.5rem',
            width: '320px', zIndex: 1000, padding: '2.5rem',
            borderRadius: '2rem', display: 'flex', flexDirection: 'column',
            animation: 'slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px var(--primary-glow)' }}>
                  <User size={22} color="white" />
                </div>
                <div>
                  <div style={{ fontWeight: '900', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>{username || 'Trader'}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '1px' }}>Sovereign Node</div>
                </div>
              </div>
              <button onClick={closeSidebar} style={{ background: 'var(--surface-100)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.4rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
              {isAuthenticated ? (
                <>
                  <Link to="/" className="nav-link" style={{ padding: '1rem', borderRadius: '1rem' }} onClick={closeSidebar}><LayoutDashboard size={20} /><span>Dashboard</span> <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.3 }} /></Link>
                  <Link to="/trades" className="nav-link" style={{ padding: '1rem', borderRadius: '1rem' }} onClick={closeSidebar}><History size={20} /><span>Trade History</span> <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.3 }} /></Link>
                </>
              ) : (
                <>
                  <a href="#features" className="nav-link" style={{ padding: '1rem', borderRadius: '1rem' }} onClick={closeSidebar}><Zap size={20} /><span>Infrastructure</span> <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.3 }} /></a>
                  <a href="#about" className="nav-link" style={{ padding: '1rem', borderRadius: '1rem' }} onClick={closeSidebar}><User size={20} /><span>Story</span> <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.3 }} /></a>
                </>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
              <button onClick={() => { logout(); closeSidebar(); }} className="btn" style={{ width: '100%', background: 'rgba(239, 68, 68, 0.05)', color: 'var(--danger)', borderRadius: '1rem', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                <LogOut size={20} /> Sign Out Node
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div style={{ minHeight: '100vh', transition: 'all 0.3s ease' }}>
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
