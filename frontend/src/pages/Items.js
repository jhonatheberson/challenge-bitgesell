import React, { useEffect, useState } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';

function Items() {
  const { items, pagination, loading, error, fetchItems } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch items when page or search changes
  useEffect(() => {
    fetchItems(pagination.currentPage, pagination.itemsPerPage, debouncedSearch);
  }, [fetchItems, pagination.currentPage, debouncedSearch]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchItems(newPage, pagination.itemsPerPage, debouncedSearch);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="items-container">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {items.length === 0 ? (
        <p>No items found</p>
      ) : (
        <>
          <ul className="items-list">
            {items.map(item => (
              <li key={item.id} className="item-card">
                <Link to={`/items/${item.id}`}>
                  <h3>{item.name}</h3>
                  <p>Category: {item.category}</p>
                  <p>Price: ${item.price.toFixed(2)}</p>
                </Link>
              </li>
            ))}
          </ul>

          <div className="pagination">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPreviousPage}
              className="pagination-button"
            >
              Previous
            </button>

            <span className="pagination-info">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="pagination-button"
            >
              Next
            </button>
          </div>
        </>
      )}

      <style jsx>{`
        .items-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .search-container {
          margin-bottom: 20px;
        }

        .search-input {
          width: 100%;
          padding: 10px;
          font-size: 16px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .items-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
          list-style: none;
          padding: 0;
        }

        .item-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 15px;
          transition: transform 0.2s;
        }

        .item-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .item-card a {
          text-decoration: none;
          color: inherit;
        }

        .item-card h3 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .item-card p {
          margin: 5px 0;
          color: #666;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 20px;
          gap: 10px;
        }

        .pagination-button {
          padding: 8px 16px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          cursor: pointer;
        }

        .pagination-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-info {
          margin: 0 10px;
        }
      `}</style>
    </div>
  );
}

export default Items;
