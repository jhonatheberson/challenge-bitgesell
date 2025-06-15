import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../config/api';
import '../styles/variables.css';
import '../styles/common.css';
import '../styles/components/ItemForm.css';

function ItemForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || '' : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(getApiUrl('/api/items'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create item');
      }

      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="item-form-container">
      <button
        onClick={() => navigate('/')}
        className="back-button"
        aria-label="Go back to items list"
      >
        ← Back to Items
      </button>

      <div className="item-form-card">
        <h1 className="heading-1">Create New Item</h1>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="item-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              required
              maxLength={100}
              placeholder="Enter item name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input"
              required
              maxLength={50}
              placeholder="Enter item category"
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Price</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="input"
              required
              min="0"
              max="1000000"
              step="0.01"
              placeholder="Enter item price"
            />
          </div>

          <button
            type="submit"
            className="button button-primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Item'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ItemForm;
