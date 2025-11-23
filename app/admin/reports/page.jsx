"use client";

import React, { useEffect, useState } from "react";
import { 
  Loader2, 
  Download,
  TrendingUp, 
  Clock, 
  Users, 
  BookOpen, 
  FileText,
  AlertCircle,
  RefreshCw,
  IndianRupee
} from "lucide-react";

export default function AdminReport() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/reports");
      const data = await res.json();
      
      if (data.success) {
        setReportData(data.data);
      } else {
        throw new Error(data.error || "Failed to fetch report");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to generate report. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p>Generating System Report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-600" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Error</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchReport}
            className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { summary, transactions, generatedAt } = reportData;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 font-sans text-gray-800 print:bg-white print:p-0">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Performance Report</h1>
            <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
              <Clock size={14} />
              Generated on: {new Date(generatedAt).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={fetchReport}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <FileText size={16} /> Executive Summary
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Revenue */}
            <div className="p-4 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Total Revenue</span>
                <div className="p-2 rounded-lg bg-green-50">
                  <IndianRupee className="text-green-600" size={18} />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {summary.financials.currency} {summary.financials.totalRevenue.toLocaleString()}
              </div>
            </div>

            {/* Pending Amount */}
            <div className="p-4 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Pending Verification</span>
                <div className="p-2 rounded-lg bg-amber-50">
                  <Clock className="text-amber-600" size={18} />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {summary.financials.currency} {summary.financials.pendingAmount.toLocaleString()}
              </div>
            </div>

            {/* Total Users */}
            <div className="p-4 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Total Users</span>
                <div className="p-2 rounded-lg bg-blue-50">
                  <Users className="text-blue-600" size={18} />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {summary.counts.users}
              </div>
            </div>

            {/* Batches & Tests */}
            <div className="p-4 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Content Stats</span>
                <div className="p-2 rounded-lg bg-purple-50">
                  <BookOpen className="text-purple-600" size={18} />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{summary.counts.batches}</div>
                  <div className="text-xs text-gray-500">Batches</div>
                </div>
                <div className="h-8 w-px bg-gray-200"></div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{summary.counts.activeTests}</div>
                  <div className="text-xs text-gray-500">Tests</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Recent Transactions</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Sender</th>
                  <th className="px-6 py-3">Transaction ID</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{tx.user}</td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{tx.id}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      {summary.financials.currency} {tx.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${tx.status === 'verified' ? 'bg-green-100 text-green-800' : ''}
                        ${tx.status === 'pending' ? 'bg-amber-100 text-amber-800' : ''}
                        ${tx.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                      No recent transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Print Footer */}
        <div className="hidden print:block mt-8 pt-8 border-t border-zinc-200 text-center text-xs text-zinc-400">
          <p>End of Report • Confidential • Generated automatically by Admin System</p>
        </div>
      </div>
    </div>
  );
}