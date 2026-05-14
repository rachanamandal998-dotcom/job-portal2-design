import { useState } from "react";
import { Search, Plus, ShoppingCart, Star, Package } from "lucide-react";
import { ListingFormModal } from "./ListingFormModal";
import "./productlisting.css";

const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: "Handmade Leather Bag",
    price: "89.99",
    stock: 12,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa",
    rating: 4.8,
    category: "Accessories",
  },
  {
    id: 2,
    name: "Organic Cotton T-Shirt",
    price: "24.99",
    stock: 45,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
    rating: 4.5,
    category: "Clothing",
  },
  {
    id: 3,
    name: "Ceramic Coffee Mug",
    price: "15.99",
    stock: 8,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d",
    rating: 4.9,
    category: "Home",
  },
  {
    id: 4,
    name: "Wireless Headphones",
    price: "129.99",
    stock: 20,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    rating: 4.7,
    category: "Electronics",
  },
];

export default function ProductListing() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = (newProduct) => {
    setProducts([
      ...products,
      {
        ...newProduct,
        id: Date.now(),
        rating: 4.5,
        category: "New",
      },
    ]);
    setShowModal(false);
  };

  return (
    <div className="product-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="page-title">
              <ShoppingCart className="title-icon" />
              Product Marketplace
            </h1>
            <p className="page-subtitle">Discover amazing products from local sellers</p>
          </div>
          <button className="add-button" onClick={() => setShowModal(true)}>
            <Plus size={20} />
            Add Product
          </button>
        </div>
      </div>

      <div className="page-container">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-blue">
            <Package size={24} className="stat-icon" />
            <div className="stat-info">
              <div className="stat-value">{products.length}</div>
              <div className="stat-label">Total Products</div>
            </div>
          </div>
          <div className="stat-card stat-green">
            <ShoppingCart size={24} className="stat-icon" />
            <div className="stat-info">
              <div className="stat-value">{products.reduce((sum, p) => sum + p.stock, 0)}</div>
              <div className="stat-label">In Stock</div>
            </div>
          </div>
          <div className="stat-card stat-purple">
            <Star size={24} className="stat-icon" />
            <div className="stat-info">
              <div className="stat-value">4.7</div>
              <div className="stat-label">Avg Rating</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="category-filters">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-chip ${selectedCategory === category ? "active" : ""}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image-wrapper">
                <img src={product.image} alt={product.name} className="product-image" />
                <span className="product-badge">{product.category}</span>
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <div className="product-rating">
                  <Star size={16} className="star-icon" fill="currentColor" />
                  <span>{product.rating}</span>
                </div>
                <div className="product-footer">
                  <div className="product-price">${product.price}</div>
                  <div className="product-stock">
                    <Package size={14} />
                    {product.stock} left
                  </div>
                </div>
                <button className="product-add-btn">Add to Cart</button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="empty-state">
            <Package size={64} className="empty-icon" />
            <h3>No products found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {showModal && (
        <ListingFormModal
          kind="Product"
          onClose={() => setShowModal(false)}
          onSubmit={handleAddProduct}
        />
      )}
    </div>
  );
}