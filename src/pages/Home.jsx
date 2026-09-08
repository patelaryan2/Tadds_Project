import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../data/products";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: "",
    description: ""
  });

  const loadProducts = () => {
    setLoading(true);
    getProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === "price" ? Number(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
      } else {
        await createProduct(formData);
      }
      setShowForm(false);
      setEditingProduct(null);
      setFormData({ name: "", price: "", image: "", description: "" });
      loadProducts();
    } catch (error) {
      alert("Failed to save product: " + error.message + "\n\nMake sure your Supabase Row Level Security (RLS) policies allow inserts/updates!");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
        loadProducts();
      } catch (error) {
        alert("Failed to delete product: " + error.message + "\n\nMake sure your Supabase Row Level Security (RLS) policies allow deletes!");
      }
    }
  };

  return (
    <div className="page">
      <div className="home-hero">
        <h1 className="home-title">Welcome to ShopHub</h1>
        <p className="home-subtitle">
          Discover amazing products at great prices
        </p>
      </div>
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h2 className="page-title" style={{ marginBottom: 0 }}>Our Products</h2>
          <button className="btn btn-primary" onClick={() => {
            setShowForm(!showForm);
            setEditingProduct(null);
            setFormData({ name: "", price: "", image: "", description: "" });
          }}>
            {showForm ? "Cancel" : "+ Create Product"}
          </button>
        </div>

        {showForm && (
          <div className="auth-container" style={{ margin: "0 auto 2rem auto", maxWidth: "600px" }}>
            <h3>{editingProduct ? "Edit Product" : "Create Product"}</h3>
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input required type="text" name="name" className="form-input" value={formData.name} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Price</label>
                <input required type="number" name="price" className="form-input" value={formData.price} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input required type="text" name="image" className="form-input" value={formData.image} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea required name="description" className="form-input" value={formData.description} onChange={handleInputChange} rows="3" />
              </div>
              <button type="submit" className="btn btn-primary btn-block">
                {editingProduct ? "Update" : "Save"}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: "center", padding: "2rem" }}>
            Loading products...
          </p>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard 
                product={product} 
                key={product.id} 
                onEdit={() => handleEdit(product)}
                onDelete={() => handleDelete(product.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
