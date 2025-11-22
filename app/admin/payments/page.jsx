"use client";

import React, { useEffect, useState } from "react";
import { Loader2, RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";

export default function AdminDashboard() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Fetch all payments
  const getPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/payment");
      const data = await res.json();
      if (data.success) {
        setPayments(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch payments", error);
    } finally {
      setLoading(false);
    }
  };

  // Update payment status
  const updateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/payment", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        // Update local state to reflect change without refetching
        setPayments((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
        );
        alert("Status updated successfully");
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status", error);
      alert("Error updating status");
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    getPayments();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "verified": return "text-green-600 bg-green-50 ring-green-500";
      case "rejected": return "text-red-600 bg-red-50 ring-red-500";
      default: return "text-amber-600 bg-amber-50 ring-amber-500";
    }
  };

  return (
    <div className="bg-zinc-50 min-h-screen py-10 px-4 lg:px-10 font-sans text-zinc-800">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Payment Overview</h1>
          <button 
            onClick={getPayments}
            className="flex items-center gap-2 px-4 py-2 bg-white ring-1 ring-zinc-300 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {loading && payments.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-zinc-400" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {payments.map((item) => (
              <div 
                key={item.id} 
                className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200 flex flex-col gap-4 relative overflow-hidden"
              >
                {/* Status Badge */}
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ring-1 flex items-center gap-1 ${getStatusColor(item.status)}`}>
                  {item.status === 'verified' && <CheckCircle size={12} />}
                  {item.status === 'rejected' && <XCircle size={12} />}
                  {item.status === 'pending' && <Clock size={12} />}
                  {item.status.toUpperCase()}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Transaction ID
                  </label>
                  <div className="font-mono text-lg font-medium truncate" title={item.transactionId}>
                    {item.transactionId}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Sender Name
                  </label>
                  <div className="text-lg">{item.senderName}</div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Amount
                  </label>
                  <div className="text-2xl font-bold text-zinc-900">${item.amount}</div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Date
                  </label>
                  <div className="text-sm text-zinc-500">
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-100 flex flex-col gap-2">
                  <label htmlFor={`status-${item.id}`} className="text-sm font-medium">
                    Update Status
                  </label>
                  <div className="flex gap-2">
                    <select
                      id={`status-${item.id}`}
                      defaultValue={item.status}
                      className="flex-1 p-2 bg-zinc-50 ring-2 ring-zinc-200 focus:ring-zinc-700 outline-none rounded-lg text-sm transition-all"
                      onChange={(e) => updateStatus(item.id, e.target.value)}
                      disabled={updatingId === item.id}
                    >
                      <option value="pending">Pending</option>
                      <option value="verified">Verified</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    {updatingId === item.id && (
                       <div className="flex items-center justify-center px-2">
                         <Loader2 className="animate-spin w-5 h-5 text-zinc-500" />
                       </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {payments.length === 0 && (
                <div className="col-span-full text-center py-10 text-zinc-400">
                    No payments found.
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}