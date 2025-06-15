import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async (page = 1, limit = 10, searchQuery = '') => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(searchQuery && { q: searchQuery })
      });

      const res = await fetch(`http://localhost:3001/api/items?${queryParams}`);

      if (!res.ok) {
        throw new Error('Failed to fetch items');
      }

      const data = await res.json();
      setItems(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <DataContext.Provider value={{
      items,
      pagination,
      loading,
      error,
      fetchItems
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
