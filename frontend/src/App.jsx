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

  // Handle scroll for sticky nav effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Don't show global nav on Landing page if not authenticated
  if (location.pathname === '/' && !isAuthenticated) return null;

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <>
      <nav className={`glass-nav ${scrolled ? 'scrolled' : ''}`} style={{
        padding: '0 2rem',
        background: scrolled ? 'var(--glass-bg)' : 'transparent',
        borderBottom: scrolled ? '1px solid var(--border-color)' : '1px solid transparent',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '100%',
          maxWidth: 'var(--container-max)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
            <Link to="/" style={{ textDecoration: 'none' }} onClick={closeSidebar}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Logo size={scrolled ? 32 : 36} />
                <h1 style={{
                  fontSize: scrolled ? '1.25rem' : '1.4rem',
                  fontWeight: '900',
                  letterSpacing: '-0.04em',
                  color: 'var(--text-primary)',
                  margin: 0,
                  transition: 'all 0.3s ease'
                }}>EdgeForge</h1>
              </div>
            </Link>

            {/* Nav Links - Desktop */}
            <div className="nav-links-desktop" style={{ display: 'flex', gap: '0.5rem' }}>
              {isAuthenticated ? (
                <>
                  <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}><LayoutDashboard size={16} /> Dashboard</Link>
                  <Link to="/trades" className={`nav-link ${location.pathname === '/trades' ? 'active' : ''}`}><History size={16} /> Trades</Link>
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
                {/* Desktop: avatar button */}
                <button onClick={() => setIsSidebarOpen(true)} className="btn btn-glass desktop-only" style={{
                  padding: '0.5rem 1rem',
                  gap: '0.6rem',
                  background: 'rgba(255,255,255,0.03)',
                  fontSize: '0.85rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px'
                }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={14} color="white" />
                  </div>
                  <span style={{ fontWeight: '700' }}>{username || 'Account'}</span>
                </button>
                {/* Mobile: burger menu */}
                <button onClick={() => setIsSidebarOpen(true)} className="btn btn-glass mobile-only" style={{ padding: '0.6rem', background: 'var(--surface-50)' }}>
                  <Menu size={20} />
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <Link to="/login" className="btn btn-glass btn-login-secondary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}>Login</Link>
                <Link to="/register" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}>Forge Access</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Sovereign Sidebar */}
      {isSidebarOpen && (
        <>
          <div className="sidebar-overlay" onClick={closeSidebar} />
          <aside className="sidebar" style={{
            position: 'fixed', right: '1.25rem', top: '1.25rem', bottom: '1.25rem',
            width: '320px', zIndex: 1001, padding: '2.5rem',
            borderRadius: '2rem', display: 'flex', flexDirection: 'column',
            animation: 'slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            background: 'rgba(10, 10, 12, 0.85)', backdropFilter: 'blur(40px)', border: '1px solid var(--border-color)',
            boxShadow: '0 40px 100px -20px rgba(0,0,0,0.8)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px var(--primary-glow)' }}>
                  <User size={24} color="white" />
                </div>
                <div>
                  <div style={{ fontWeight: '900', fontSize: '1.1rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>{username || 'Trader'}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '1px' }}>Sovereign Node</div>
                </div>
              </div>
              <button onClick={closeSidebar} className="theme-toggle" style={{ border: 'none', background: 'var(--surface-100)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
              {isAuthenticated ? (
                <>
                  <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} style={{ padding: '1rem', borderRadius: '1.25rem' }} onClick={closeSidebar}><LayoutDashboard size={20} /><span>Dashboard</span> <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.3 }} /></Link>
                  <Link to="/trades" className={`nav-link ${location.pathname === '/trades' ? 'active' : ''}`} style={{ padding: '1rem', borderRadius: '1.25rem' }} onClick={closeSidebar}><History size={20} /><span>Trade History</span> <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.3 }} /></Link>
                  <Link to="/profile" className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`} style={{ padding: '1rem', borderRadius: '1.25rem' }} onClick={closeSidebar}><User size={20} /><span>Identity Settings</span> <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.3 }} /></Link>
                </>
              ) : (
                <>
                  <a href="#features" className="nav-link" style={{ padding: '1rem', borderRadius: '1.25rem' }} onClick={closeSidebar}><Zap size={20} /><span>Infrastructure</span> <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.3 }} /></a>
                  <a href="#about" className="nav-link" style={{ padding: '1rem', borderRadius: '1.25rem' }} onClick={closeSidebar}><Users size={20} /><span>Story</span> <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.3 }} /></a>
                </>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
              <button onClick={() => { logout(); closeSidebar(); }} className="btn" style={{ width: '100%', background: 'rgba(244, 63, 94, 0.08)', color: 'var(--danger)', borderRadius: '1.25rem', border: '1px solid rgba(244, 63, 94, 0.1)', fontSize: '0.9rem' }}>
                <LogOut size={18} /> Sign Out Node
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
