import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import './Home.css';

// Import banner images
import heroBannerMain from '../assets/images/hero_banner.png';
import categoryMens from '../assets/images/mens_wear.png';
import categoryWomens from '../assets/images/womens_wear.png';
import categoryKids from '../assets/images/kids_wear.png';
import bannerWinter from '../assets/images/winter_collection.png';
import bannerAccessories from '../assets/images/accessories.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CATEGORIES = [
  { id: 'mens', name: "Men's Wear", image: categoryMens, description: 'Premium collection for men' },
  { id: 'womens', name: "Women's Wear", image: categoryWomens, description: 'Elegant styles for women' },
  { id: 'kids', name: "Kids' Wear", image: categoryKids, description: 'Trendy outfits for kids' },
  { id: 'accessories', name: 'Accessories', image: bannerAccessories, description: 'Complete your look' },
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const { addToCart } = useCart();

  const banners = [
    {
      image: heroBannerMain,
      title: 'New Season Collection',
      subtitle: 'Discover the latest trends in premium fashion',
      cta: 'Shop Now'
    },
    {
      image: bannerWinter,
      title: 'Winter Essentials',
      subtitle: 'Stay warm in style with our winter collection',
      cta: 'Explore Winter'
    },
    {
      image: bannerAccessories,
      title: 'Complete Your Look',
      subtitle: 'Premium accessories for every occasion',
      cta: 'Shop Accessories'
    }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category.toLowerCase() === selectedCategory));
    }
  }, [selectedCategory, products]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    
    // Show toast notification
    const toast = document.createElement('div');
    toast.className = 'cart-toast';
    toast.textContent = `${product.name} added to cart!`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 2000);
  };

  return (
    <div className="home">
      {/* Hero Banner Slider */}
      <section className="hero-banner">
        {banners.map((banner, index) => (
          <div
            key={index}
            className={`banner-slide ${index === currentBannerIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url(${banner.image})` }}
          >
            <div className="banner-overlay"></div>
            <div className="container banner-content">
              <div className="banner-text animate-fade-in">
                <h1 className="banner-title">{banner.title}</h1>
                <p className="banner-subtitle">{banner.subtitle}</p>
                <a href="#products" className="btn btn-gold btn-large">
                  {banner.cta}
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        ))}
        
        {/* Banner Indicators */}
        <div className="banner-indicators">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentBannerIndex ? 'active' : ''}`}
              onClick={() => setCurrentBannerIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="categories-section section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Find your perfect style</p>
          </div>
          
          <div className="categories-grid">
            {CATEGORIES.map((category) => (
              <div
                key={category.id}
                className="category-card"
                onClick={() => {
                  setSelectedCategory(category.id);
                  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <div className="category-image-wrapper">
                  <img src={category.image} alt={category.name} className="category-image" />
                  <div className="category-overlay">
                    <span className="category-cta">Shop Now →</span>
                  </div>
                </div>
                <div className="category-info">
                  <h3 className="category-name">{category.name}</h3>
                  <p className="category-description">{category.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="products-section section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              {selectedCategory === 'all' ? 'All Products' : CATEGORIES.find(c => c.id === selectedCategory)?.name}
            </h2>
            <p className="section-subtitle">Premium quality, exceptional style</p>
          </div>

          {/* Category Filter */}
          <div className="category-filter">
            <button
              className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              All
            </button>
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                className={`filter-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="products-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="product-card skeleton-card">
                  <div className="skeleton skeleton-image"></div>
                  <div className="skeleton skeleton-text"></div>
                  <div className="skeleton skeleton-text short"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <h3>No products found</h3>
              <p>Try selecting a different category or check back later</p>
            </div>
          ) : (
           <div className="products-grid">
              {filteredProducts.map((product) => (
                <div key={product._id} className="product-card">
                  <div className="product-image-wrapper">
                    <img src={product.imageUrl} alt={product.name} className="product-image" />
                    <div className="product-overlay">
                      <button
                        className="btn btn-primary quick-add"
                        onClick={() => handleAddToCart(product)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="9" cy="21" r="1"></circle>
                          <circle cx="20" cy="21" r="1"></circle>
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                  <div className="product-info">
                    <span className="product-category">{product.category}</span>
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                    <div className="product-footer">
                      <span className="product-price">Rs. {product.price.toLocaleString()}</span>
                      <button
                        className="btn-add-cart"
                        onClick={() => handleAddToCart(product)}
                        aria-label="Add to cart"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <h2 className="newsletter-title">Stay Updated</h2>
            <p className="newsletter-subtitle">Subscribe to get special offers and exclusive updates</p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="newsletter-input"
                required
              />
              <button type="submit" className="btn btn-primary">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3 className="footer-logo">OUTFITTERS</h3>
              <p>Premium fashion for the modern individual</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#categories">Categories</a></li>
                <li><a href="#products">Products</a></li>
                <li><a href="/checkout">Cart</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Customer Service</h4>
              <ul>
                <li><a href="#contact">Contact Us</a></li>
                <li><a href="#shipping">Shipping Info</a></li>
                <li><a href="#returns">Returns</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Follow Us</h4>
              <div className="social-links">
                <a href="#facebook" aria-label="Facebook">FB</a>
                <a href="#instagram" aria-label="Instagram">IG</a>
                <a href="#twitter" aria-label="Twitter">TW</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 OUTFITTERS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
