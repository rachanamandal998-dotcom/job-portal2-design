import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, ImageIcon, Tag, Hash, DollarSign } from "lucide-react";
import { useState } from "react";
import "./ListingFormModal.css";

export function ListingFormModal({ kind = "Product", onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    image: "",
  });
  const [focused, setFocused] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    onSubmit({
      ...form,
      price: parseFloat(form.price).toFixed(2),
      stock: parseInt(form.stock) || 0,
      image:
        form.image ||
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        className="lm-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="lm-panel"
          initial={{ y: 40, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 340, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── HEADER ── */}
          <div className="lm-header">
            <div className="lm-header-left">
              <div className="lm-header-icon">
                <Plus size={18} />
              </div>
              <div>
                <h3 className="lm-title">Add New {kind}</h3>
                <p className="lm-subtitle">Fill in the details below</p>
              </div>
            </div>
            <button className="lm-close" onClick={onClose} aria-label="Close">
              <X size={16} />
            </button>
          </div>

          {/* ── FORM ── */}
          <form className="lm-form" onSubmit={handleSubmit}>

            {/* Name */}
            <div className={`lm-field ${focused === "name" ? "lm-field--focus" : ""} ${form.name ? "lm-field--filled" : ""}`}>
              <label className="lm-label">
                <Tag size={13} /> {kind} Name <span>*</span>
              </label>
              <input
                className="lm-input"
                name="name"
                value={form.name}
                onChange={handleChange}
                onFocus={() => setFocused("name")}
                onBlur={() => setFocused(null)}
                placeholder="e.g. Handmade Bag"
                required
                autoComplete="off"
              />
              <div className="lm-field-bar" />
            </div>

            {/* Price + Stock */}
            <div className="lm-row">
              <div className={`lm-field ${focused === "price" ? "lm-field--focus" : ""} ${form.price ? "lm-field--filled" : ""}`}>
                <label className="lm-label">
                  <DollarSign size={13} /> Price <span>*</span>
                </label>
                <div className="lm-input-wrap">
                  <span className="lm-prefix">Rs.</span>
                  <input
                    className="lm-input lm-input--prefix"
                    name="price"
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    onFocus={() => setFocused("price")}
                    onBlur={() => setFocused(null)}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="lm-field-bar" />
              </div>

              <div className={`lm-field ${focused === "stock" ? "lm-field--focus" : ""} ${form.stock ? "lm-field--filled" : ""}`}>
                <label className="lm-label">
                  <Hash size={13} /> Stock
                </label>
                <input
                  className="lm-input"
                  name="stock"
                  type="number"
                  value={form.stock}
                  onChange={handleChange}
                  onFocus={() => setFocused("stock")}
                  onBlur={() => setFocused(null)}
                  placeholder="0"
                />
                <div className="lm-field-bar" />
              </div>
            </div>

            {/* Image URL */}
            <div className={`lm-field ${focused === "image" ? "lm-field--focus" : ""} ${form.image ? "lm-field--filled" : ""}`}>
              <label className="lm-label">
                <ImageIcon size={13} /> Image URL
              </label>
              <input
                className="lm-input"
                name="image"
                value={form.image}
                onChange={handleChange}
                onFocus={() => setFocused("image")}
                onBlur={() => setFocused(null)}
                placeholder="https://..."
              />
              <div className="lm-field-bar" />
              {form.image && (
                <motion.div
                  className="lm-preview"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                >
                  <img
                    src={form.image}
                    alt="preview"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                  <span>Preview</span>
                </motion.div>
              )}
            </div>

            {/* ── ACTIONS ── */}
            <div className="lm-actions">
              <button type="button" className="lm-btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="lm-btn-submit"
                disabled={!form.name || !form.price}
              >
                <Plus size={15} />
                Add {kind}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}