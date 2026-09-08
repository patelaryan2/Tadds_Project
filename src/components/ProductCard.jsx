import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product, onEdit, onDelete }) {
  const { addToCart, cartItems } = useCart();
  const productInCart = cartItems.find((item) => item.id === product.id);

  const productQuantityLabel = productInCart
    ? `(${productInCart.quantity})`
    : "";
  return (
    <div className="product-card" style={{ position: "relative" }}>
      {onDelete && (
        <button
          onClick={onDelete}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            cursor: "pointer",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }}
          title="Delete Product"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
          </svg>
        </button>
      )}
      <img
        src={product.image}
        alt={product.name}
        className="product-card-image"
      />
      <div className="product-card-content">
        <h3 className="product-card-name">{product.name}</h3>
        <p className="product-card-price">Rs{product.price}</p>
        <div className="product-card-actions" style={{ flexWrap: "wrap", gap: "0.5rem" }}>
          <Link className="btn btn-secondary" to={`/products/${product.id}`} style={{ flex: 1, textAlign: "center" }}>
            View
          </Link>
          {onEdit && (
            <button className="btn btn-secondary" onClick={onEdit} style={{ flex: 1 }}>
              Edit
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={() => addToCart(product.id)}
            style={{ width: "100%", marginTop: "0.25rem" }}
          >
            Add to Cart {productQuantityLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
