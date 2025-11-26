import React from 'react';

export default function DividendTable({ dividends = [], price = 0 }) {
  return (
    <table className="dividends-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Amount ($)</th>
          <th>Yield Est.</th>
        </tr>
      </thead>
      <tbody>
        {dividends.length > 0 ? (
          dividends.map((d, i) => (
            <tr key={i}>
              <td>{new Date(d.date).toLocaleDateString()}</td>
              <td>{d.amount.toFixed(4)}</td>
              <td>{price ? ((d.amount / price) * 100).toFixed(2) + '%' : '-'}</td>
            </tr>
          ))
        ) : (
          <tr><td colSpan={3}>No dividends found.</td></tr>
        )}
      </tbody>
    </table>
  );
}
