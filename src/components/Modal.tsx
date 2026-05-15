import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus } from "lucide-react";
import "./styles/Modal.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  type?: "product" | "service" | "job";
}

export function Modal({ isOpen, onClose, onSubmit, type = "product" }: ModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    image: "",
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    const submittedData = {
      ...formData,
      price: parseFloat(formData.price).toFixed(2),
      stock: parseInt(formData.stock) || 0,
      image: formData.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    };

    onSubmit(submittedData);
    setFormData({ name: "", price: "", stock: "", image: "", description: "" });
    onClose();
  };

  const typeLabels = {
    product: "Product",
    service: "Service",
    job: "Job",
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal-container"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h3 className="modal-title">Add New {typeLabels[type]}</h3>
            <button className="modal-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">{typeLabels[type]} Name *</label>
                <input
                  className="form-input"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={`Enter ${typeLabels[type].toLowerCase()} name`}
                  required
                />
              </div>

              {type !== "job" && (
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Price *</label>
                    <input
                      className="form-input"
                      name="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="29.99"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Stock</label>
                    <input
                      className="form-input"
                      name="stock"
                      type="number"
                      value={formData.stock}
                      onChange={handleChange}
                      placeholder="10"
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter description..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input
                  className="form-input"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Plus size={16} />
                Add {typeLabels[type]}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
