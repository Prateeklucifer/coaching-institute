"use client";

import React, { useEffect, useState } from "react";
import { 
  Loader2, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  ArrowUpDown,
  Calendar,
  User,
  IndianRupee,
  FileText,
  MoreHorizontal
} from "lucide-react";
import { format } from 'date-fns';
import { useToast } from "@/app/components/ToastContext";

export default function AdminDashboard() {
    const { showToast } = useToast();
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  // Fetch all payments
  const getPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/payment");
      const data = await res.json();
      if (data.success) {
        setPayments(data.data);
        setFilteredPayments(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch payments", error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and search
  useEffect(() => {
    let result = [...payments];
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(payment => 
        payment.transactionId.toLowerCase().includes(query) ||
        payment.senderName.toLowerCase().includes(query) ||
        payment.amount.toString().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(payment => payment.status === statusFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredPayments(result);
  }, [payments, searchQuery, statusFilter, sortConfig]);

  // Request sort
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get sort indicator
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
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
       
        showToast("Status updated successfully", "success");
      } else {
        showToast("Failed to update status", "error");
      }
    } catch (error) {
      console.error("Error updating status", error);
      showToast("Error updating status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    getPayments();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "verified": 
        return { 
          text: "Verified",
          bg: "bg-green-50", 
          textColor: "text-green-700",
          border: "border-green-200",
          icon: <CheckCircle className="w-4 h-4" />
        };
      case "rejected": 
        return { 
          text: "Rejected",
          bg: "bg-red-50", 
          textColor: "text-red-700",
          border: "border-red-200",
          icon: <XCircle className="w-4 h-4" />
        };
      default: 
        return { 
          text: "Pending",
          bg: "bg-amber-50", 
          textColor: "text-amber-700",
          border: "border-amber-200",
          icon: <Clock className="w-4 h-4" />
        };
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Payment Management</h1>
            <p className="text-gray-500 mt-1">View and manage all payment transactions</p>
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <button 
              onClick={getPayments}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium transition-colors shadow-sm" onClick={()=>{window.print()}}>
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className=" rounded-xl mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="my-auto ">
              <h1 className="text-2xl font-bold">Search here</h1>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { 
              title: 'Total Payments', 
              value: payments.length, 
              change: '+12%', 
              icon: <IndianRupee className="w-6 h-6 text-blue-600" />,
              bg: 'bg-blue-50'
            },
            { 
              title: 'Verified', 
              value: payments.filter(p => p.status === 'verified').length, 
              change: '+5%', 
              icon: <CheckCircle className="w-6 h-6 text-green-600" />,
              bg: 'bg-green-50'
            },
            { 
              title: 'Pending Review', 
              value: payments.filter(p => p.status === 'pending').length, 
              change: '-2%', 
              icon: <Clock className="w-6 h-6 text-amber-600" />,
              bg: 'bg-amber-50'
            },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  {/* <p className="text-xs text-gray-500 mt-1">
                    <span className={stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                      {stat.change}
                    </span> from last month
                  </p> */}
                </div>
                <div className={`p-3 rounded-full ${stat.bg}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => requestSort('transactionId')}
                  >
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      Transaction ID
                      {getSortIndicator('transactionId')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => requestSort('senderName')}
                  >
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      Student
                      {getSortIndicator('senderName')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => requestSort('amount')}
                  >
                    <div className="flex items-center gap-1">
                      <IndianRupee className="w-4 h-4" />
                      Amount
                      {getSortIndicator('amount')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => requestSort('createdAt')}
                  >
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Date
                      {getSortIndicator('createdAt')}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                        <p className="text-gray-500">Loading payments...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No payments found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((item) => {
                    const status = getStatusColor(item.status);
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 font-mono">
                            {item.transactionId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.senderName}</div>
                       
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(item.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {format(new Date(item.createdAt), 'dd MMM yyyy')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(item.createdAt), 'h:mm a')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${status.bg} ${status.textColor} ${status.border} flex items-center gap-1 w-fit`}>
                            {status.icon}
                            {status.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <select
                              value={item.status}
                              onChange={(e) => updateStatus(item.id, e.target.value)}
                              disabled={updatingId === item.id}
                              className={`text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                updatingId === item.id ? 'bg-gray-100' : 'bg-white'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="verified">Verified</option>
                              <option value="rejected">Rejected</option>
                            </select>
                            {updatingId === item.id && (
                              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            )}
                     
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          

        </div>
      </div>
    </div>
  );
}