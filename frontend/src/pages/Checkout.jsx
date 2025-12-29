import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Checkout.css';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // If cart is empty, redirect home (unless success)
  if (cart.length === 0 && !success) {
    return (
      <div className="checkout-page empty-cart">
        <div className="container">
          <svg className="empty-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <h2>Your bag is currently empty.</h2>
          <p className="mb-lg">Discover our new arrivals and find something you love.</p>
          <button onClick={() => navigate('/')} className="btn btn-primary btn-large">
            Start Shopping
          </button>
        </div>
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
      <div className="checkout-page success-container animate-fade-in">
        <div className="container">
          <svg className="success-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <h2 className="success-title">Order Confirmed!</h2>
          <p className="success-message">Thank you, {customerName}. Your order is being processed.</p>
          <button onClick={() => navigate('/')} className="btn btn-primary btn-large">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="section-title text-left mb-xl">Secure Checkout</h1>
        
        <div className="checkout-grid">
          {/* Left Column: Order Details */}
          <div className="checkout-left">
            <div className="checkout-section">
              <h2 className="checkout-title">Your Order ({cart.length} items)</h2>
              <div className="checkout-items">
                {cart.map(item => (
                  <div key={item._id} className="checkout-item">
                    <img src={item.imageUrl} alt={item.name} className="item-image" />
                    <div className="item-details">
                      <div className="item-header">
                        <div>
                          <h3 className="item-name">{item.name}</h3>
                          <p className="item-meta">Category: {item.category}</p>
                        </div>
                        <span className="item-price">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                      <div className="item-meta">
                        Qty: {item.quantity} × Rs. {item.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="checkout-section">
              <h2 className="checkout-title">Shipping Information</h2>
              <div className="form-group mb-md">
                 <label htmlFor="customerName" className="mb-sm d-block fw-semibold">Receivers Name</label>
                  <input 
                    id="customerName"
                    type="text" 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="input-field"
                    placeholder="Enter full name"
                    required
                  />
              </div>
               <div className="form-group">
                 <label className="mb-sm d-block fw-semibold">Address (Mock)</label>
                  <input 
                    type="text" 
                    className="input-field"
                    placeholder="123 Fashion Street, Style City"
                    disabled
                  />
              </div>
            </div>
          </div>

          {/* Right Column: Payment & Summary */}
          <div className="checkout-right">
             <div className="checkout-section summary-card">
              <h2 className="checkout-title summary-title">Order Summary</h2>
              
              <div className="summary-row">
                <span>Subtotal</span>
                <span>Rs. {cartTotal.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>Calculated at next step</span>
              </div>
              <div className="summary-row">
                <span>Tax</span>
                <span>Included</span>
              </div>

              <div className="summary-total">
                <span>Total</span>
                <span>Rs. {cartTotal.toLocaleString()}</span>
              </div>

               <div className="payment-form">
                <div className="mock-card">
                  <div className="flex-between mb-lg">
                    <span>Credit Card</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                  </div>
                  <div className="card-number">**** **** **** 4242</div>
                  <div className="flex-between">
                    <span>{customerName || 'YOUR NAME'}</span>
                    <span>12/25</span>
                  </div>
                </div>

                <button 
                  onClick={handlePay}
                  className="btn btn-gold btn-block"
                  disabled={loading}
                >
                  {loading ? 'Processing Payment...' : `Pay Rs. ${cartTotal.toLocaleString()}`}
                </button>
                
                <p className="text-center mt-sm text-small" style={{ opacity: 0.7, fontSize: '0.8rem' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '5px' }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  Secure encrypted payment
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
