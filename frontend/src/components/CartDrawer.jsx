import React from 'react';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const CartDrawer = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(5px)',
              zIndex: 999
            }}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: '400px',
              background: 'var(--card-bg)',
              borderLeft: '1px solid rgba(255,255,255,0.1)',
              zIndex: 1000,
              padding: '25px',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '1.5rem' }}>Your Cart</h2>
              <button 
                onClick={() => setIsCartOpen(false)}
                style={{ background: 'transparent', color: 'var(--text-secondary)' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {cart.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '50px' }}>
                  Your cart is empty.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {cart.map(item => (
                    <div key={item._id} style={{ display: 'flex', gap: '15px' }}>
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        style={{ width: '70px', height: '70px', borderRadius: '10px', objectFit: 'cover' }}
                      />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ marginBottom: '5px' }}>{item.name}</h4>
                        <p style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>${item.price}</p>
                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px', gap: '10px' }}>
                          <button 
                            onClick={() => updateQuantity(item._id, -1)}
                            style={{ background: 'rgba(255,255,255,0.1)', padding: '5px', borderRadius: '5px' }}
                          >
                            <Minus size={14} color="white" />
                          </button>
                          <span>{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item._id, 1)}
                            style={{ background: 'rgba(255,255,255,0.1)', padding: '5px', borderRadius: '5px' }}
                          >
                            <Plus size={14} color="white" />
                          </button>
                          <button 
                            onClick={() => removeFromCart(item._id)}
                            style={{ marginLeft: 'auto', background: 'transparent', color: '#ff4444' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                  <span>Total</span>
                  <span>${cartTotal}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="btn-primary"
                  style={{ width: '100%', fontSize: '1.1rem' }}
                >
                  Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
