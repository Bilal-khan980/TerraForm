import { useRef } from 'react';
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
              background: 'rgba(10, 10, 10, 0.6)',
              backdropFilter: 'blur(5px)',
              zIndex: 9999
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
              maxWidth: '450px',
              background: '#ffffff', // Explicit white
              boxShadow: '-10px 0 40px rgba(0,0,0,0.1)',
              zIndex: 10000,
              padding: '30px',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #efefef', paddingBottom: '20px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'Playfair Display, serif' }}>Shopping Bag ({cart.length})</h2>
              <button 
                onClick={() => setIsCartOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#0a0a0a' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {cart.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' }}>
                  <p style={{ marginBottom: '20px', fontSize: '1.1rem' }}>Your bag is empty.</p>
                  <button onClick={() => setIsCartOpen(false)} style={{ padding: '10px 20px', background: '#0a0a0a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Continue Shopping</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                  {cart.map(item => (
                    <div key={item._id} style={{ display: 'flex', gap: '20px' }}>
                      <div style={{ width: '90px', height: '110px', flexShrink: 0, background: '#f5f5f5', borderRadius: '8px', overflow: 'hidden' }}>
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '4px', color: '#0a0a0a' }}>{item.name}</h4>
                            <button 
                              onClick={() => removeFromCart(item._id)}
                              style={{ background: 'transparent', border: 'none', color: '#999', cursor: 'pointer', padding: '0' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <p style={{ fontSize: '0.85rem', color: '#666', textTransform: 'uppercase' }}>{item.category}</p>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #e5e5e5', borderRadius: '4px', padding: '4px 8px' }}>
                            <button 
                              onClick={() => updateQuantity(item._id, -1)}
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                              <Minus size={14} color="#0a0a0a" />
                            </button>
                            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item._id, 1)}
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                              <Plus size={14} color="#0a0a0a" />
                            </button>
                          </div>
                          <p style={{ fontWeight: '700', fontSize: '1.1rem', color: '#0a0a0a' }}>Rs. {(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ borderTop: '1px solid #efefef', paddingTop: '25px', marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '1.25rem', fontWeight: '700', color: '#0a0a0a', fontFamily: 'Playfair Display, serif' }}>
                  <span>Total</span>
                  <span>Rs. {cartTotal.toLocaleString()}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '20px', textAlign: 'center' }}>Shipping & taxes calculated at checkout</p>
                <button 
                  onClick={handleCheckout}
                  style={{ 
                    width: '100%', 
                    padding: '16px', 
                    background: '#0a0a0a', 
                    color: 'white', 
                    border: 'none', 
                    fontSize: '1rem', 
                    fontWeight: '600', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    transition: 'background 0.3s'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#c9a961'}
                  onMouseOut={(e) => e.target.style.background = '#0a0a0a'}
                >
                  Checkout Now
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
