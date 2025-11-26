import React from 'react';

export default function PriceCard({ price }) {
  if (!price) return null;
  return (
    <div className="price-card">
      <h2>{price.ticker}</h2>
      <div className="price">${price.price.toFixed(2)}</div>
      <div className="meta">{price.source} • {new Date(price.timestamp).toLocaleString()}</div>
    </div>
  );
}
