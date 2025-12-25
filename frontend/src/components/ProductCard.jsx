import React from 'react';
import { Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      style={{
        background: 'var(--card-bg)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <div style={{ height: '250px', width: '100%', overflow: 'hidden' }}>
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      
      <div style={{ padding: '20px' }}>
        <p style={{ color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '5px' }}>
          {product.category.toUpperCase()}
        </p>
        <h3 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '10px' }}>{product.name}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '15px' }}>
          {product.description.substring(0, 60)}...
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'white' }}>${product.price}</span>
          <button 
            onClick={() => addToCart(product)}
            className="btn-primary"
            style={{ 
              borderRadius: '50%', 
              width: '40px', 
              height: '40px', 
              padding: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            <Plus size={24} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
