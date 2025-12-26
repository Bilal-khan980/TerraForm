import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CreditCard, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // If cart is empty, redirect home (unless success)
  if (cart.length === 0 && !success) {
    return (
      <div className="container" style={{ paddingTop: '150px', textAlign: 'center' }}>
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate('/')} className="btn-primary" style={{ marginTop: '20px' }}>Go Shopping</button>
      </div>
    );
  }

  const handlePay = async () => {
    if (!customerName) return alert("Please enter your name");
    
    setLoading(true);
    const orderData = {
      customerName,
      items: cart.map(item => ({
        productId: item._id,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: cartTotal
    };

    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders`, orderData);
      setSuccess(true);
      clearCart();
    } catch (err) {
      alert('Payment failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container" style={{ paddingTop: '150px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <motion.div
           initial={{ scale: 0 }}
           animate={{ scale: 1 }}
           transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <CheckCircle size={80} color="var(--accent-secondary)" />
        </motion.div>
        <h2 style={{ fontSize: '2.5rem', marginTop: '20px' }}>Payment Successful!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>Thank you for your order, {customerName}.</p>
        <button onClick={() => navigate('/')} className="btn-primary">Return Home</button>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '120px', maxWidth: '800px' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '30px' }}>Checkout</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        <div className="glass-panel" style={{ padding: '30px' }}>
          <h3 style={{ marginBottom: '20px' }}>Order Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '300px', overflowY: 'auto' }}>
            {cart.map(item => (
              <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{item.quantity}x {item.name}</span>
                <span>${item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '20px', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold' }}>
            <span>Total</span>
            <span>${cartTotal}</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '30px' }}>
          <h3 style={{ marginBottom: '20px' }}>Payment Details</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Name on Card</label>
            <input 
              type="text" 
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="input-field"
              placeholder="John Doe"
              required
            />
          </div>

          <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>Mock Payment Integration</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <CreditCard size={24} color="var(--accent-primary)" />
              <span>**** **** **** 4242</span>
            </div>
          </div>

          <button 
            onClick={handlePay}
            className="btn-primary"
            style={{ width: '100%', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : `Pay $${cartTotal}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
