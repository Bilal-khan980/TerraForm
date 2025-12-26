import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Sparkles } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products`);
        setProducts(res.data);
      } catch (err) {
        console.error("Error fetching products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div style={{ paddingBottom: '50px' }}>
      {/* Hero Section */}
      <div style={{ 
        height: '60vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        textAlign: 'center',
        background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.15) 0%, rgba(5, 5, 5, 0) 70%)',
        marginBottom: '50px'
      }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '8px 16px', 
          background: 'rgba(255,255,255,0.05)', 
          borderRadius: '20px', 
          marginBottom: '20px',
          border: '1px solid rgba(255,255,255,0.1)' 
        }}>
          <Sparkles size={16} color="var(--accent-secondary)" />
          <span style={{ fontSize: '0.9rem', color: 'var(--accent-secondary)', fontWeight: 600 }}>New Collection Drop</span>
        </div>
        <h1 style={{ 
          fontSize: '4rem', 
          fontWeight: 800, 
          lineHeight: 1.1, 
          marginBottom: '20px',
          maxWidth: '800px'
        }}>
          Designed for the <br /> 
          <span className="gradient-text">Future of Fashion</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px' }}>
          Discover our exclusive collection of premium items. Curated for those who demand excellence and style.
        </p>
      </div>

      <div className="container">
        <h2 style={{ fontSize: '2rem', marginBottom: '30px' }}>Latest Products</h2>
        
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
             <p>Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <p>No products found. Admin should add some.</p>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '30px' 
          }}>
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
