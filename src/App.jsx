import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Receipt, AlertCircle, Building2 } from 'lucide-react';

function App() {
  // 1. ALL STATE HOOKS 
  const [data, setData] = useState(null);
  const [activeMessage, setActiveMessage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // 🟢 NEW: VIRTUAL ACCOUNT STATE 🟢
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [virtualAccount, setVirtualAccount] = useState(null);

  // 2. DATA FETCHING LOGIC
  const fetchDashboardData = () => {
    fetch('http://localhost:5000/api/treasury/dashboard')
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  };

  // 🟢 LIVE POLLING: Auto-refresh the dashboard every 3 seconds 🟢
  useEffect(() => {
    fetchDashboardData();
    const radar = setInterval(() => {
      fetchDashboardData();
    }, 3000); 
    return () => clearInterval(radar);
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

  // 4. LIVE NOMBA CARD TRANSACTION LOGIC 
  const processLivePayment = async () => {
    setIsProcessingPayment(true);
    try {
      const response = await fetch('http://localhost:5000/api/v1/create-live-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to secure Nomba checkout link.");
      }

      window.location.href = result.checkoutLink;
    } catch (error) {
      console.error("Live Transaction failed:", error);
      alert(`Payment Gateway Error: ${error.message}`);
      setIsProcessingPayment(false); 
    }
  };

  // 🟢 5. VIRTUAL ACCOUNT PROVISIONING ENGINE 🟢
  const provisionVirtualAccount = async () => {
    setIsProvisioning(true);
    setVirtualAccount(null);
    try {
      const response = await fetch('http://localhost:5000/api/v1/create-virtual-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            accountName: "AjoStack Member",
            email: "member@ajostack.com"
        })
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to provision bank account.");
      }
      setVirtualAccount(result.bankDetails);
    } catch (error) {
      console.error("Provisioning failed:", error);
      alert(`API Error: ${error.message}`);
    } finally {
      setIsProvisioning(false);
    }
  };

  // 🟢 6. SECRET DEMO BUTTON: Simulate End of Month 🟢
  const triggerMonthEnd = async () => {
    try {
      await fetch('http://localhost:5000/api/treasury/simulate-cron', { method: 'POST' });
    } catch (error) {
      console.error("Cron failed:", error);
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
        
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Treasury Overview</h2>
            <div className="flex items-center gap-4 mt-1">
                <p className="text-slate-500">Managing Cooperative Assets</p>
                {/* SECRET BUTTON PLACED HERE */}
                <button 
                    onClick={triggerMonthEnd} 
                    className="text-[10px] text-slate-300 hover:text-indigo-400 transition-colors px-2 py-1 border border-transparent hover:border-indigo-100 rounded"
                >
                    Trigger Auto-Deductions
                </button>
            </div>
          </div>
          
          <button 
            onClick={processLivePayment}
            disabled={isProcessingPayment}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:bg-slate-800 transition-colors disabled:opacity-70"
          >
            {isProcessingPayment ? "Securing Connection..." : "+ Process Live Card Payment"}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* 🟢 NEW: VIRTUAL ACCOUNT ONBOARDING UI 🟢 */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Building2 size={20} className="text-indigo-600"/> Provision Bank Account
                </h3>
                <p className="text-sm text-slate-500 mb-6">Assign a permanent Wema/Nomba account to a member for manual transfer auto-reconciliation.</p>
                
                {!virtualAccount ? (
                    <button 
                        onClick={provisionVirtualAccount}
                        disabled={isProvisioning}
                        className="w-full bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-3 rounded-xl font-semibold hover:bg-indigo-100 transition-colors disabled:opacity-50"
                    >
                        {isProvisioning ? "Contacting Nomba API..." : "Generate Virtual Account"}
                    </button>
                ) : (
                    <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-700">
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Bank Name</p>
                        <p className="text-lg font-semibold mb-4">{virtualAccount.bankName}</p>
                        
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Account Number</p>
                        <p className="text-3xl font-mono text-green-400 mb-4 tracking-widest">{virtualAccount.accountNumber}</p>
                        
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Account Name</p>
                        <p className="font-medium text-slate-200">{virtualAccount.accountName}</p>
                    </div>
                )}
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
                    className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-50 transition-colors"
                    >
                    {isGenerating ? "Thinking..." : "AI Reminder"}
                    </button>
                </div>
                ))}
            </div>
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
                      const encodedMessage = encodeURIComponent(activeMessage);
                      window.open(`https://wa.me/2348000000000?text=${encodedMessage}`, '_blank');
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