import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Receipt, AlertCircle } from 'lucide-react';

function App() {
  // 1. ALL STATE HOOKS AT THE TOP
  const [data, setData] = useState(null);
  const [activeMessage, setActiveMessage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // 2. DATA FETCHING LOGIC
  const fetchDashboardData = () => {
    fetch('http://localhost:5000/api/treasury/dashboard')
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // 3. AI DUNNING LOGIC
  const sendReminder = async (memberName, failureReason, amount) => {
    setIsGenerating(true); 
    try {
      const response = await fetch('http://localhost:5000/api/treasury/remind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberName, reason: failureReason, amount }),
      });

      const result = await response.json();
      
      if (result.success) {
        setActiveMessage(result.message); 
      } else {
        setActiveMessage("Error: Failed to compile AI message.");
      }
    } catch (err) {
      console.error("AI Error:", err);
      setActiveMessage("System Error: Backend unreachable.");
    } finally {
      setIsGenerating(false); 
    }
  };

  // 4. TRANSACTION LOGIC
  const processMockTransaction = async () => {
    setIsProcessingPayment(true);
    try {
      const response = await fetch('http://localhost:5000/api/members/tokenize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: "hackathon.judge@unilag.edu.ng" })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Transaction Successful!\n\nMember: ${result.member.name}\nAmount: ₦${result.contribution.amount.toLocaleString()}\n\nDashboard will now update.`);
        fetchDashboardData(); 
      }
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Transaction Error: Could not connect to backend.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (!data) return <div className="p-10 text-slate-500">Loading AjoStack Core...</div>;

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-6">
        <h1 className="text-2xl font-bold mb-10 text-indigo-400">AjoStack</h1>
        <nav className="space-y-4">
          <div className="flex items-center gap-3 text-indigo-400 font-medium"><LayoutDashboard size={20} /> Dashboard</div>
          <div className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors"><Receipt size={20} /> Transactions</div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto relative">
        
        {/* CORRECTED HEADER COMPONENT */}
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Treasury Overview</h2>
            <p className="text-slate-500">Managing Cooperative Assets</p>
          </div>
          
          <button 
            onClick={processMockTransaction}
            disabled={isProcessingPayment}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:bg-slate-800 transition-colors disabled:opacity-70"
          >
            {isProcessingPayment ? "Processing..." : "+ Process New Payment"}
          </button>
        </header>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Collected</p>
            <p className="text-3xl font-bold text-green-600 mt-2">₦{data.summary.totalCollected.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Collection Rate</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">{data.summary.collectionRate}%</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Failed Charges</p>
            <p className="text-3xl font-bold text-red-500 mt-2">{data.failedCharges.length}</p>
          </div>
        </div>

        {/* Failure Alerts */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2"><AlertCircle size={20} className="text-red-500"/> Action Required</h3>
          <div className="space-y-4">
            {data.failedCharges.map((fail, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-medium text-slate-700">{fail.memberName} - <span className="text-red-500 text-sm">{fail.failureReason}</span></span>
                <button 
                  onClick={() => sendReminder(fail.memberName, fail.failureReason, fail.amount)}
                  disabled={isGenerating}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {isGenerating ? "Thinking..." : "Remind"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* The AI Message Modal Overlay */}
        {activeMessage && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
              <div className="bg-green-600 p-4 text-white flex justify-between items-center">
                <h3 className="font-semibold">WhatsApp Preview</h3>
                <button 
                  onClick={() => setActiveMessage(null)}
                  className="text-white/80 hover:text-white"
                >
                  Close
                </button>
              </div>
              <div className="p-6">
                <div className="bg-green-50 text-slate-800 p-4 rounded-lg rounded-tl-none border border-green-100 shadow-sm whitespace-pre-wrap font-medium">
                  {activeMessage}
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button 
                    onClick={() => setActiveMessage(null)}
                    className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      alert("In production, this would trigger the Twilio/WhatsApp API!");
                      setActiveMessage(null);
                    }}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-green-700 shadow-sm transition-colors flex items-center gap-2"
                  >
                    Send to Member
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;