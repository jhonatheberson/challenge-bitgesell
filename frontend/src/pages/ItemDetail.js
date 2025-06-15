import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../state/DataContext';

function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items } = useData();

  const item = items.find(item => item.id === parseInt(id));

  if (!item) {
    navigate('/');
    return null;
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>{item.name}</h2>
      <p><strong>Category:</strong> {item.category}</p>
      <p><strong>Price:</strong> ${item.price}</p>
    </div>
  );
}

export default ItemDetail;
