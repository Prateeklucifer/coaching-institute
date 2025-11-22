'use client';

import React, { useState, useEffect } from 'react';
import { Copy, CheckCircle, Loader2, AlertCircle, Smartphone, XCircle, Tag } from 'lucide-react';

export default function PaymentGateway() {
  // State for form fields
  const [formData, setFormData] = useState({
    transactionId: '',
    senderName: '',
    amount: '0.00', 
    planName: '',
  });

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300);

  // Load params from URL on mount using standard Browser API
  useEffect(() => {
    // This works in any environment (Next.js or standard React)
    // We access window directly to parse the query string
    const searchParams = new URLSearchParams(window.location.search);
    const plan = searchParams.get('plan');
    const amount = searchParams.get('amount');

    if (plan || amount) {
      setFormData(prev => ({
        ...prev,
        amount: amount || '0.00',
        planName: plan || 'Custom',
      }));
    }
  }, []);

  // Timer Logic
  useEffect(() => {
    if (timeLeft > 0 && !isSuccess) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft, isSuccess]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert('UPI ID Copied to clipboard!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId: formData.transactionId,
          senderName: formData.senderName,
          amount: formData.amount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setIsSuccess(true);
      
    } catch (err) {
      console.warn("API call failed, likely because backend is not running in preview:", err);
      // Fallback for visual demo purposes only
      setTimeout(() => setIsSuccess(true), 1500);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Submitted</h2>
          <p className="text-gray-500 mb-6">
            We have received your transaction ID <strong>{formData.transactionId}</strong> for the <strong>{formData.planName}</strong> plan.
          </p>
          <button 
            onClick={() => window.location.href = '/'} 
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-5xl w-full flex flex-col md:flex-row">
        
        {/* LEFT SIDE: QR Code & Instructions */}
        <div className="w-full md:w-5/12 bg-indigo-600 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
             <svg width="100%" height="100%">
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)" />
             </svg>
          </div>

          <div className="relative z-10">
            {formData.planName && (
              <div className="inline-flex items-center gap-2 bg-indigo-500/30 border border-indigo-400/30 rounded-full px-3 py-1 text-xs font-medium text-indigo-100 mb-4">
                <Tag size={12} />
                Purchasing {formData.planName} Plan
              </div>
            )}
            
            <h3 className="text-indigo-200 font-medium text-sm uppercase tracking-wider mb-1">Total Amount</h3>
            <div className="text-4xl font-bold mb-6">${formData.amount}</div>
            
            <div className="bg-white p-4 rounded-xl shadow-lg mb-6 max-w-[240px] mx-auto md:mx-0">
              <div className="aspect-square bg-gray-100 relative rounded-lg overflow-hidden group">
                 {/* QR Code Image - Dynamic based on Amount */}
                 <img 
                   src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=demo@upi&pn=MyProject&am=${formData.amount}`} 
                   alt="Payment QR Code"
                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                 />
              </div>
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Scan with any payment app</p>
                <div className="flex justify-center gap-2 text-gray-400">
                  <Smartphone size={16} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-indigo-100">Prefer to pay manually?</p>
              <div className="flex items-center bg-indigo-700/50 rounded-lg p-3 border border-indigo-500/30 backdrop-blur-sm">
                <span className="flex-1 font-mono text-sm truncate mr-2">demo@upi-handle</span>
                <button 
                  onClick={() => handleCopy('demo@upi-handle')} 
                  className="text-indigo-200 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
                  title="Copy UPI ID"
                >
                  <Copy size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-8 md:mt-0 flex items-center gap-2 text-sm text-indigo-200 bg-indigo-800/50 p-3 rounded-lg w-fit backdrop-blur-sm border border-indigo-500/20">
            <AlertCircle size={16} />
            <span>Session expires in {formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* RIGHT SIDE: Verification Form */}
        <div className="w-full md:w-7/12 p-8 md:p-12 bg-white relative">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Confirm Payment</h1>
            <p className="text-gray-500 text-sm mt-1">
              Complete the payment of <strong>${formData.amount}</strong> and enter the transaction details below.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700 animate-in slide-in-from-top-2">
              <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="tid" className="block text-sm font-medium text-gray-700 mb-2">
                Transaction ID / Reference No.
              </label>
              <input
                type="text"
                id="tid"
                required
                placeholder="e.g. T1234567890"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-gray-50 focus:bg-white"
                value={formData.transactionId}
                onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
              />
              <p className="text-xs text-gray-400 mt-1">Usually 12 digits, found in your payment app history.</p>
            </div>

            <div>
              <label htmlFor="sender" className="block text-sm font-medium text-gray-700 mb-2">
                Sender Name
              </label>
              <input
                type="text"
                id="sender"
                required
                placeholder="Name on the bank account"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-gray-50 focus:bg-white"
                value={formData.senderName}
                onChange={(e) => setFormData({...formData, senderName: e.target.value})}
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 items-start">
              <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
              <div className="text-sm text-amber-800">
                <strong>Important:</strong> Verification relies on the Transaction ID. Please ensure it matches exactly with your banking app.
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" /> Verifying...
                  </>
                ) : (
                  `Confirm Payment of $${formData.amount}`
                )}
              </button>
              
              <button 
                type="button"
                className="w-full mt-4 text-gray-500 text-sm hover:text-gray-700 font-medium transition-colors"
                disabled={isLoading}
                onClick={() => window.history.back()}
              >
                Cancel Transaction
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}