import { useState } from 'react';

export default function CheckoutButton() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handlePayment = async () => {
        // 1. Lock the UI instantly
        setIsLoading(true);
        setError(null);

        try {
            // 2. Ping your live Nomba Express backend
            const response = await fetch('https://ajostack-backend.onrender.com/api/v1/create-live-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            // 3. Catch Backend Rejections
            if (!response.ok || !data.success) {
                throw new Error(data.error || "Failed to initialize Nomba checkout.");
            }

            // 4. The Handoff: Redirect to Nomba's secure page
            window.location.href = data.checkoutLink;

        } catch (err) {
            // 5. Graceful Recovery
            console.error("Payment Error:", err);
            setError(err.message);
            setIsLoading(false); // Unlock the button so they can try again
        }
    };

    return (
        <div style={{ marginTop: '20px' }}>
            <button 
                onClick={handlePayment} 
                disabled={isLoading}
                style={{
                    backgroundColor: isLoading ? '#ccc' : '#007bff',
                    color: '#fff',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontSize: '16px'
                }}
            >
                {isLoading ? "Processing secure connection..." : "Pay ₦10,000 Contribution"}
            </button>

            {/* Display error message if the network request fails */}
            {error && (
                <div style={{ color: 'red', marginTop: '10px', fontSize: '14px' }}>
                    {error}
                </div>
            )}
        </div>
    );
}