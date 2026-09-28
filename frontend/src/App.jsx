import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Trades from './pages/Trades';
import Landing from './pages/Landing';
import Profile from './pages/Profile';
import Footer from './components/Footer';
import Logo from './components/Logo';
import AddTradeModal from './components/AddTradeModal';
import { tradeService } from './services/api';
import {
  LayoutDashboard, History, LogOut, User,
  Menu, X, Sun, Moon, Zap, ChevronRight, Shield, Plus,
  TrendingUp, Sparkles, SlidersHorizontal
} from 'lucide-react';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const Navigation = ({ onOpenAddTrade }) => {
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

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <>
      <nav className={`glass-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
            <Link to="/" className="nav-brand" onClick={closeSidebar}>
              <Logo size={scrolled ? 30 : 34} />
              <h1>EdgeForge</h1>
            </Link>

            <div className="desktop-only" style={{ alignItems: 'center', gap: '0.4rem' }}>
              {isAuthenticated ? (
                <>
                  <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <Link to="/trades" className={`nav-link ${location.pathname === '/trades' ? 'active' : ''}`}>
                    <History size={16} /> Trade Journal
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {isAuthenticated && (
              <div className="desktop-only nav-status-badge">
                <span className="nav-pulse-dot" />
                <span>Live Node</span>
              </div>
            )}

            <button onClick={toggleTheme} className="theme-toggle" title="Toggle Theme" aria-label="Toggle Theme">
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {isAuthenticated ? (
              <>
                <button
                  onClick={() => onOpenAddTrade?.()}
                  className="btn btn-primary desktop-only"
                  style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', gap: '0.4rem' }}
                >
                  <Plus size={15} strokeWidth={2.5} /> Log Trade
                </button>

                <Link to="/profile" className="user-pill desktop-only" title="Profile & Settings">
                  <div className="user-avatar">
                    <User size={13} color="white" />
                  </div>
                  <span className="user-name">{username || 'Trader'}</span>
                </Link>
              </>
            ) : (
              <div className="desktop-only" style={{ display: 'flex', gap: '0.65rem' }}>
                <Link to="/login" className="btn btn-glass" style={{ padding: '0.45rem 1.15rem', fontSize: '0.85rem' }}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary" style={{ padding: '0.45rem 1.35rem', fontSize: '0.85rem' }}>
                  Forge Access
                </Link>
              </div>
            )}

            <button onClick={() => setIsSidebarOpen(true)} className="theme-toggle mobile-only" aria-label="Open Menu">
              <Menu size={19} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <>
          <div className="sidebar-overlay" onClick={closeSidebar} />
          <aside className="sidebar">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 16px var(--primary-glow)'
                }}>
                  <User size={20} color="white" />
                </div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-primary)' }}>{username || 'Trader'}</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sovereign Node</div>
                </div>
              </div>
              <button onClick={closeSidebar} className="theme-toggle" style={{ border: 'none' }}>
                <X size={19} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => { closeSidebar(); onOpenAddTrade?.(); }}
                    className="btn btn-primary"
                    style={{ width: '100%', marginBottom: '1rem', padding: '0.75rem', justifyContent: 'center' }}
                  >
                    <Plus size={16} /> Quick Log Trade
                  </button>
                  <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} style={{ padding: '0.85rem 1rem' }} onClick={closeSidebar}>
                    <LayoutDashboard size={18} /><span>Dashboard</span>
                    <ChevronRight size={15} style={{ marginLeft: 'auto', opacity: 0.4 }} />
                  </Link>
                  <Link to="/trades" className={`nav-link ${location.pathname === '/trades' ? 'active' : ''}`} style={{ padding: '0.85rem 1rem' }} onClick={closeSidebar}>
                    <History size={18} /><span>Trade History</span>
                    <ChevronRight size={15} style={{ marginLeft: 'auto', opacity: 0.4 }} />
                  </Link>
                  <Link to="/profile" className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`} style={{ padding: '0.85rem 1rem' }} onClick={closeSidebar}>
                    <User size={18} /><span>Profile & Account</span>
                    <ChevronRight size={15} style={{ marginLeft: 'auto', opacity: 0.4 }} />
                  </Link>
                </>
              ) : (
                <>
                  <a href="#features" className="nav-link" style={{ padding: '0.85rem 1rem' }} onClick={closeSidebar}>
                    <Zap size={18} /><span>Infrastructure</span>
                    <ChevronRight size={15} style={{ marginLeft: 'auto', opacity: 0.4 }} />
                  </a>
                  <a href="#about" className="nav-link" style={{ padding: '0.85rem 1rem' }} onClick={closeSidebar}>
                    <Sparkles size={18} /><span>Story</span>
                    <ChevronRight size={15} style={{ marginLeft: 'auto', opacity: 0.4 }} />
                  </a>
                  <Link to="/login" className="nav-link" style={{ padding: '0.85rem 1rem' }} onClick={closeSidebar}>
                    <Shield size={18} /><span>Login Node</span>
                    <ChevronRight size={15} style={{ marginLeft: 'auto', opacity: 0.4 }} />
                  </Link>
                </>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: 'auto' }}>
              {isAuthenticated ? (
                <button
                  onClick={() => { logout(); closeSidebar(); }}
                  className="btn"
                  style={{ width: '100%', background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '0.85rem', padding: '0.75rem', justifyContent: 'center' }}
                >
                  <LogOut size={16} /> Sign Out Node
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <Link to="/login" onClick={closeSidebar} className="btn btn-glass" style={{ width: '100%', padding: '0.75rem', justifyContent: 'center' }}>
                    Login Node
                  </Link>
                  <Link to="/register" onClick={closeSidebar} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', justifyContent: 'center' }}>
                    Forge Access
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </>
      )}
    </>
  );
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const [isGlobalModalOpen, setIsGlobalModalOpen] = useState(false);
  const [isSavingTrade, setIsSavingTrade] = useState(false);

  const handleGlobalSaveTrade = async (tradeData) => {
    try {
      setIsSavingTrade(true);
      const hasNewScreenshot = tradeData.screenshot instanceof File;
      const ignoredFields = ['id', 'user', 'pips', 'profit_loss', 'risk_reward', 'risk_amount', 'is_winner', 'outcome', 'created_at', 'updated_at'];

      let dataToSend;
      if (hasNewScreenshot) {
        const formData = new FormData();
        for (const key in tradeData) {
          if (ignoredFields.includes(key)) continue;
          if (key === 'strategies') {
            if (Array.isArray(tradeData[key])) {
              tradeData[key].forEach(val => formData.append('strategies', val));
            }
          } else if (key === 'screenshot') {
            if (tradeData[key] instanceof File) {
              formData.append('screenshot', tradeData[key]);
            }
          } else {
            const value = tradeData[key];
            if (value !== '' && value !== null && value !== undefined) {
              formData.append(key, value);
            } else if (value === '' && ['commission', 'swap_fees'].includes(key)) {
              formData.append(key, '0');
            }
          }
        }
        dataToSend = formData;
      } else {
        const jsonData = {};
        for (const key in tradeData) {
          if (ignoredFields.includes(key) || key === 'screenshot') continue;
          if (key === 'strategies') {
            jsonData[key] = Array.isArray(tradeData[key]) ? tradeData[key] : [];
          } else {
            const value = tradeData[key];
            if (['entry_price', 'exit_price', 'stop_loss', 'take_profit', 'lot_size', 'commission', 'swap_fees'].includes(key)) {
              jsonData[key] = (value === '' || value === null || value === undefined) ? (['commission', 'swap_fees'].includes(key) ? 0 : 0) : parseFloat(value);
            } else {
              jsonData[key] = value;
            }
          }
        }
        dataToSend = jsonData;
      }

      await tradeService.createTrade(dataToSend);
      setIsGlobalModalOpen(false);
      window.location.reload(); // Refresh state cleanly
    } catch (err) {
      console.error('Failed to save trade:', err);
      alert('Failed to save trade.');
    } finally {
      setIsSavingTrade(false);
    }
  };

  return (
    <div className="main-content">
      <Navigation onOpenAddTrade={() => setIsGlobalModalOpen(true)} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<HomeLoader onOpenAddTrade={() => setIsGlobalModalOpen(true)} />} />
        <Route path="/trades" element={<PrivateRoute><Trades onOpenAddTrade={() => setIsGlobalModalOpen(true)} /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      </Routes>
      <Footer />

      {isAuthenticated && (
        <AddTradeModal
          isOpen={isGlobalModalOpen}
          onClose={() => setIsGlobalModalOpen(false)}
          onSave={handleGlobalSaveTrade}
          isSaving={isSavingTrade}
        />
      )}
    </div>
  );
};

const HomeLoader = ({ onOpenAddTrade }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Dashboard onOpenAddTrade={onOpenAddTrade} /> : <Landing />;
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

export default App;
