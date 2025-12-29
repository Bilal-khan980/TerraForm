import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { cart, setIsCartOpen } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin' || user?.isAdmin;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="navbar-content">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <span className="logo-text">OUTFITTERS</span>
            <span className="logo-tagline">Premium Fashion</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="navbar-nav desktop-nav">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/#categories" className="nav-link">Categories</Link>
            <Link to="/#new-arrivals" className="nav-link">New Arrivals</Link>
            {isAdmin && <Link to="/admin" className="nav-link admin-link">Admin Panel</Link>}
          </div>

          {/* Right Side Actions */}
          <div className="navbar-actions">
            {user ? (
              <>
                <div className="user-info">
                  <span className="user-name">Hi, {user.name}</span>
                </div>
                <button onClick={handleLogout} className="btn-logout" aria-label="Logout">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-outline btn-login">Login</Link>
            )}
            
            <button onClick={() => setIsCartOpen(true)} className="cart-button" aria-label="Open Cart">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {cartItemsCount > 0 && (
                <span className="cart-badge">{cartItemsCount}</span>
              )}
            </button>

            <button 
              className="menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/#categories" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Categories</Link>
          <Link to="/#new-arrivals" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>New Arrivals</Link>
          {isAdmin && <Link to="/admin" className="mobile-nav-link admin-link" onClick={() => setMenuOpen(false)}>Admin Panel</Link>}
          {!user && <Link to="/login" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Login</Link>}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
