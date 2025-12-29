import { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

const CATEGORIES = [
  { id: 'mens', label: "Men's Wear" },
  { id: 'womens', label: "Women's Wear" },
  { id: 'kids', label: "Kids' Wear" },
  { id: 'accessories', label: 'Accessories' },
  { id: 'jackets', label: 'Jackets & Coats' },
  { id: 'sweaters', label: 'Sweaters' },
  { id: 'hoodies', label: 'Hoodies & Sweatshirts' },
  { id: 'footwear', label: 'Footwear' },
];

const Admin = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [products, setProducts] = useState([]);
  const [showProducts, setShowProducts] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      await axios.post(`${API_URL}/products`, formData);
      setMessage({ text: 'Product added successfully! 🎉', type: 'success' });
      setFormData({ name: '', description: '', price: '', category: '', imageUrl: '' });
      fetchProducts();
      
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setMessage({ text: 'Error adding product. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await axios.delete(`${API_URL}/products/${productId}`);
      setMessage({ text: 'Product deleted successfully!', type: 'success' });
      fetchProducts();
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setMessage({ text: 'Error deleting product.', type: 'error' });
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="container">
          <h1 className="admin-title">Admin Panel</h1>
          <p className="admin-subtitle">Manage your Outfitters store products</p>
        </div>
      </div>

      <div className="container admin-container">
        <div className="admin-grid">
          {/* Add Product Form */}
          <div className="admin-card">
            <div className="card-header">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <h2>Add New Product</h2>
            </div>

            {message.text && (
              <div className={`alert alert-${message.type}`}>
                {message.type === 'success' ? '✓' : '✕'} {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label htmlFor="name">Product Name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the product"
                  rows="4"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Price (Rs.)</label>
                  <input
                    id="price"
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="imageUrl">Image URL</label>
                <input
                  id="imageUrl"
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  required
                />
                {formData.imageUrl && (
                  <div className="image-preview">
                    <img src={formData.imageUrl} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary btn-submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                      <polyline points="17 21 17 13 7 13 7 21"></polyline>
                      <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                    Add Product
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Products List */}
          <div className="admin-card">
            <div className="card-header">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
              <h2>Products ({products.length})</h2>
              <button 
                className="toggle-btn"
                onClick={() => setShowProducts(!showProducts)}
              >
                {showProducts ? 'Hide' : 'Show'}
              </button>
            </div>

            {showProducts && (
              <div className="products-list">
                {products.length === 0 ? (
                  <div className="empty-products">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <p>No products yet. Add your first product!</p>
                  </div>
                ) : (
                  products.map((product) => (
                    <div key={product._id} className="product-item">
                      <div className="product-item-image">
                        <img src={product.imageUrl} alt={product.name} />
                      </div>
                      <div className="product-item-info">
                        <h3>{product.name}</h3>
                        <p className="product-item-category">{product.category}</p>
                        <p className="product-item-price">Rs. {product.price.toLocaleString()}</p>
                      </div>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(product._id)}
                        aria-label="Delete product"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
