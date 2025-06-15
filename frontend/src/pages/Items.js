import React, { useEffect, useState } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';
import { FixedSizeGrid as Grid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import '../styles/variables.css';
import '../styles/common.css';
import '../styles/components/Items.css';

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

  const ItemCard = ({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * 3 + columnIndex;
    if (index >= items.length) return null;

    const item = items[index];
    return (
      <div style={style}>
        <div className="item-card" role="article">
          <Link to={`/items/${item.id}`} aria-label={`View details for ${item.name}`}>
            <h3>{item.name}</h3>
            <p>Category: {item.category}</p>
            <p>Price: ${item.price.toFixed(2)}</p>
          </Link>
        </div>
      </div>
    );
  };

  const LoadingSkeleton = () => (
    <div className="skeleton-container">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="skeleton-card" role="status" aria-label="Loading item">
          <div className="skeleton-title"></div>
          <div className="skeleton-text"></div>
          <div className="skeleton-text"></div>
        </div>
      ))}
    </div>
  );

  if (error) return (
    <div className="error-container" role="alert">
      <p>Error: {error}</p>
      <button onClick={() => fetchItems(1, pagination.itemsPerPage, '')} className="button button-danger">
        Retry
      </button>
    </div>
  );

  return (
    <div className="items-container">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input"
          aria-label="Search items"
        />
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : items.length === 0 ? (
        <div className="no-items" role="status">
          <p>No items found</p>
          <button onClick={() => setSearchQuery('')} className="button button-secondary">
            Clear Search
          </button>
        </div>
      ) : (
        <>
          <div className="virtualized-grid-container">
            <AutoSizer>
              {({ height, width }) => {
                const columnCount = 3;
                const rowCount = Math.ceil(items.length / columnCount);
                const columnWidth = width / columnCount;
                const rowHeight = 200;

                return (
                  <Grid
                    columnCount={columnCount}
                    columnWidth={columnWidth}
                    height={height}
                    rowCount={rowCount}
                    rowHeight={rowHeight}
                    width={width}
                  >
                    {ItemCard}
                  </Grid>
                );
              }}
            </AutoSizer>
          </div>

          <div className="pagination" role="navigation" aria-label="Pagination">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPreviousPage}
              className="pagination-button"
              aria-label="Previous page"
            >
              Previous
            </button>

            <span className="pagination-info" aria-live="polite">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="pagination-button"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Items;
