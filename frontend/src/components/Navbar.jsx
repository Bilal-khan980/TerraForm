import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Settings, Store } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { setIsCartOpen, cartCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      padding: '20px 0',
      background: 'rgba(5, 5, 5, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'var(--gradient-main)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)'
          }}>
            <Store color="white" size={24} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>LuxeStore</h1>
        </Link>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Welcome, {user.name}</span>
            
            {user.isAdmin && (
              <Link to="/admin" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Settings size={20} />
                <span>Admin</span>
              </Link>
            )}
            
            {!user.isAdmin && (
               <button 
               onClick={() => setIsCartOpen(true)}
               style={{ 
                 background: 'rgba(255, 255, 255, 0.1)', 
                 padding: '10px', 
                 borderRadius: '12px',
                 position: 'relative',
                 color: 'white'
               }}
             >
               <ShoppingBag size={24} />
               {cartCount > 0 && (
                 <span style={{
                   position: 'absolute',
                   top: '-5px',
                   right: '-5px',
                   background: 'var(--accent-secondary)',
                   width: '18px',
                   height: '18px',
                   borderRadius: '50%',
                   fontSize: '11px',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   fontWeight: 'bold'
                 }}>
                   {cartCount}
                 </span>
               )}
             </button>
            )}

            <button 
              onClick={handleLogout}
              style={{
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                padding: '8px 16px',
                border: '1px solid var(--border-color)'
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/login" style={{ color: 'white', textDecoration: 'none', fontWeight: 600 }}>Login</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
