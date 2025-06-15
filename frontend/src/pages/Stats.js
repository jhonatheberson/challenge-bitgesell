import React, { useEffect, useState } from 'react';
import { getApiUrl } from '../config/api';
import '../styles/variables.css';
import '../styles/common.css';
import '../styles/components/Stats.css';

function Stats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(getApiUrl('/api/stats'));
        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="stats-container">
        <div className="stats-card">
          <div className="skeleton-title"></div>
          <div className="skeleton-text"></div>
          <div className="skeleton-text"></div>
          <div className="skeleton-text"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stats-container">
        <div className="error-message" role="alert">
          {error}
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="stats-container">
      <div className="stats-card">
        <h1 className="heading-1">Item Statistics</h1>

        <div className="stats-grid">
          <div className="stats-section">
            <h2 className="heading-2">Overview</h2>
            <div className="stat-item">
              <span className="stat-label">Total Items</span>
              <span className="stat-value">{stats.totalItems}</span>
            </div>
          </div>

          <div className="stats-section">
            <h2 className="heading-2">Price Range</h2>
            <div className="stat-item">
              <span className="stat-label">Minimum</span>
              <span className="stat-value">${stats.priceRange.min?.toFixed(2) || 'N/A'}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Maximum</span>
              <span className="stat-value">${stats.priceRange.max?.toFixed(2) || 'N/A'}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Average</span>
              <span className="stat-value">${stats.priceRange.average.toFixed(2)}</span>
            </div>
          </div>

          <div className="stats-section">
            <h2 className="heading-2">Categories</h2>
            <div className="categories-list">
              {Object.entries(stats.categories).map(([category, count]) => (
                <div key={category} className="category-item">
                  <span className="category-name">{category}</span>
                  <span className="category-count">{count} items</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="stats-footer">
          <p className="text-secondary">
            Last updated: {new Date(stats.metadata.lastModified).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Stats;
