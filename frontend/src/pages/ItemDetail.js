import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../state/DataContext';
import '../styles/variables.css';
import '../styles/common.css';
import '../styles/components/ItemDetail.css';

function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, loading } = useData();

  const item = items.find(item => item.id === parseInt(id));

  if (loading) {
    return (
      <div className="loading-container" role="status" aria-label="Loading item details">
        <div className="skeleton-detail">
          <div className="skeleton-title"></div>
          <div className="skeleton-text"></div>
          <div className="skeleton-text"></div>
        </div>
      </div>
    );
  }

  if (!item) {
    navigate('/');
    return null;
  }

  return (
    <div className="item-detail-container">
      <button
        onClick={() => navigate('/')}
        className="back-button"
        aria-label="Go back to items list"
      >
        ← Back to Items
      </button>

      <div className="item-detail-card" role="article">
        <h1 className="heading-1">{item.name}</h1>
        <div className="item-info">
          <div className="info-group">
            <label>Category</label>
            <p>{item.category}</p>
          </div>
          <div className="info-group">
            <label>Price</label>
            <p className="price">${item.price.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .item-detail-container {
          padding: 24px;
          max-width: 800px;
          margin: 0 auto;
        }

        .back-button {
          background: none;
          border: none;
          color: #007bff;
          font-size: 1rem;
          cursor: pointer;
          padding: 8px 0;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }

        .back-button:hover {
          color: #0056b3;
        }

        .item-detail-card {
          background: white;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .item-detail-card h1 {
          margin: 0 0 24px 0;
          color: #2c3e50;
          font-size: 2rem;
        }

        .item-info {
          display: grid;
          gap: 24px;
        }

        .info-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .info-group label {
          font-size: 0.875rem;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-group p {
          margin: 0;
          font-size: 1.25rem;
          color: #2c3e50;
        }

        .price {
          font-weight: 600;
          color: #28a745 !important;
        }

        .loading-container {
          padding: 24px;
          max-width: 800px;
          margin: 0 auto;
        }

        .skeleton-detail {
          background: white;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .skeleton-title {
          height: 32px;
          background: #e0e0e0;
          border-radius: 4px;
          margin-bottom: 24px;
          width: 60%;
          animation: pulse 1.5s infinite;
        }

        .skeleton-text {
          height: 24px;
          background: #e0e0e0;
          border-radius: 4px;
          margin: 16px 0;
          width: 40%;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 0.8; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

export default ItemDetail;
