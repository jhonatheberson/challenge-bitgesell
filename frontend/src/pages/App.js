import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Items from './Items';
import ItemDetail from './ItemDetail';
import ItemForm from './ItemForm';
import Stats from './Stats';
import { DataProvider } from '../state/DataContext';

function App() {
  return (
    <DataProvider>
      <nav style={{ padding: 16, borderBottom: '1px solid #ddd' }}>
        <Link to="/">Items</Link>
        <Link to="/items/new" style={{ marginLeft: 16 }}>Add Item</Link>
        <Link to="/stats" style={{ marginLeft: 16 }}>Statistics</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Items />} />
        <Route path="/items/:id" element={<ItemDetail />} />
        <Route path="/items/new" element={<ItemForm />} />
        <Route path="/stats" element={<Stats />} />
      </Routes>
    </DataProvider>
  );
}

export default App;
