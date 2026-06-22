import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/treasury/dashboard')
      .then(response => {
        if (!response.ok) throw new Error("Backend unreachable");
        return response.json();
      })
      .then(res => {
        if (res.success) setData(res);
      })
      .catch(err => setError(err.message));
  }, []);

  if (error) return <div className="dashboard-container"><h2>Error: {error}</h2></div>;
  if (!data) return <div className="dashboard-container"><h2>Loading AjoStack Engine...</h2></div>;

  return (
    <div className="dashboard-container">
      <div className="header">
        <h1>{data.cooperative.name}</h1>
        <p>Treasurer Dashboard • {data.summary.currentMonth}</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-title">Collection Rate</div>
          <div className="kpi-value text-green">{data.summary.collectionRate}%</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Total Collected</div>
          <div className="kpi-value text-white">₦{data.summary.totalCollected.toLocaleString()}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Failed Collections</div>
          <div className="kpi-value text-red">₦{data.summary.totalFailed.toLocaleString()}</div>
        </div>
      </div>

      <div className="data-section">
        <h2>Action Required: Failed Charges</h2>
        {data.failedCharges.map((charge, index) => (
          <div className="data-row" key={index}>
            <div>
              <strong>{charge.memberName}</strong>
              <div style={{ color: '#8b949e', fontSize: '14px' }}>Reason: {charge.failureReason}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <strong className="text-red">₦{charge.amount.toLocaleString()}</strong>
              <div>
                {charge.updateCardUrl ? (
                  <button className="action-button">Send Update Link</button>
                ) : (
                  <span style={{ color: '#8b949e', fontSize: '14px' }}>Retrying {charge.nextRetryDate}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="data-section">
        <h2>Recent Successful Contributions</h2>
        {data.recentSuccessful.map((txn, index) => (
          <div className="data-row" key={index}>
            <div>
              <strong>{txn.memberName}</strong>
              <div style={{ color: '#8b949e', fontSize: '14px' }}>Txn: {txn.transactionId}</div>
            </div>
            <strong className="text-green">₦{txn.amount.toLocaleString()}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;