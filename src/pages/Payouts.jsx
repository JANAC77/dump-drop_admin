import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Search,
  Download,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  CreditCard,
  TrendingUp,
  Calendar,
  Wallet,
  Banknote,
  ChevronDown,
  ChevronUp,
  X,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Plus
} from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

function Payouts() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [stats, setStats] = useState({
    totalPayout: 0,
    totalCount: 0,
    avgPayout: 0,
    pendingCount: 0,
    completedCount: 0
  });
  const [summary, setSummary] = useState({
    monthly: { total: 0, count: 0 },
    weekly: { total: 0, count: 0 },
    topDrivers: []
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [createForm, setCreateForm] = useState({
    driverId: '',
    amount: '',
    description: '',
    paymentMode: 'bank_transfer'
  });

  useEffect(() => {
    fetchPayouts();
    fetchDrivers();
    fetchSummary();
  }, [selectedDriver, selectedStatus, currentPage]);

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 20,
        driverId: selectedDriver !== 'all' ? selectedDriver : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        startDate: dateRange.start,
        endDate: dateRange.end,
        search: searchTerm
      };

      const response = await adminAPI.getPayouts(params);

      if (response.data.success) {
        setPayouts(response.data.payouts);
        setStats(response.data.stats);
        setTotalPages(response.data.pages);
      }
    } catch (error) {
      console.error('Error fetching payouts:', error);
      toast.error('Failed to load payouts');
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await adminAPI.getDrivers();
      if (response.data.drivers) {
        setDrivers(response.data.drivers);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await adminAPI.getPayoutSummary();
      if (response.data.success) {
        setSummary(response.data.summary);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const handleProcessPayout = async (payoutId) => {
    if (window.confirm('Are you sure you want to process this payout?')) {
      try {
        await adminAPI.processPayout(payoutId);
        toast.success('Payout processed successfully');
        fetchPayouts();
        fetchSummary();
      } catch (error) {
        toast.error('Failed to process payout');
      }
    }
  };

  const handleCreatePayout = async () => {
    if (!createForm.driverId || !createForm.amount) {
      toast.error('Please select driver and enter amount');
      return;
    }

    try {
      await adminAPI.createPayout(createForm);
      toast.success('Payout created successfully');
      setShowCreateModal(false);
      setCreateForm({ driverId: '', amount: '', description: '', paymentMode: 'bank_transfer' });
      fetchPayouts();
      fetchSummary();
    } catch (error) {
      toast.error('Failed to create payout');
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Completed' },
      pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Pending' },
      failed: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Failed' }
    };
    const c = config[status] || config.pending;
    const Icon = c.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${c.color}`}>
        <Icon className="w-3 h-3" />
        {c.label}
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.length === 0 || e.target.value.length > 2) {
      fetchPayouts();
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDriver('all');
    setSelectedStatus('all');
    setDateRange({ start: '', end: '' });
    setCurrentPage(1);
  };

  if (loading && payouts.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Driver Payouts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage driver earnings and payout requests</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Payout
          </button>
          <button
            onClick={fetchPayouts}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalPayout)}</p>
          </div>
          <p className="text-xs text-gray-500">Total Payouts</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <p className="text-2xl font-bold text-gray-900">{stats.totalCount}</p>
          </div>
          <p className="text-xs text-gray-500">Total Transactions</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Banknote className="w-5 h-5 text-purple-600" />
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.avgPayout)}</p>
          </div>
          <p className="text-xs text-gray-500">Average Payout</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <p className="text-2xl font-bold text-gray-900">{stats.pendingCount}</p>
          </div>
          <p className="text-xs text-gray-500">Pending</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-2xl font-bold text-gray-900">{stats.completedCount}</p>
          </div>
          <p className="text-xs text-gray-500">Completed</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Period Summary
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">This Week</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(summary.weekly.total)}</p>
              <p className="text-xs text-gray-500">{summary.weekly.count} payouts</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">This Month</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(summary.monthly.total)}</p>
              <p className="text-xs text-gray-500">{summary.monthly.count} payouts</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Top Earning Drivers
          </h3>
          <div className="space-y-3">
            {summary.topDrivers.slice(0, 3).map((driver, idx) => (
              <div key={driver.driverId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{driver.driverName}</p>
                    <p className="text-xs text-gray-500">{driver.driverPhone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">{formatCurrency(driver.totalEarnings)}</p>
                  <p className="text-xs text-gray-500">{driver.payoutCount} payouts</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by driver name, phone..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedDriver}
            onChange={(e) => setSelectedDriver(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Drivers</option>
            {drivers.map(driver => (
              <option key={driver._id} value={driver.userId || driver._id}>
                {driver.fullName || driver.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <input
            type="date"
            placeholder="Start Date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-400">to</span>
          <input
            type="date"
            placeholder="End Date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {(searchTerm || selectedDriver !== 'all' || selectedStatus !== 'all' || dateRange.start || dateRange.end) && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Payouts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payout ID</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-10 text-center text-gray-500">
                    No payouts found
                  </td>
                </tr>
              ) : (
                payouts.map((payout) => (
                  <tr key={payout._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-gray-900">{payout.payoutId}</p>
                      <p className="text-xs text-gray-500">{payout._id?.slice(-6)}</p>
                    </td>
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{payout.driver?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{payout.driver?.phone || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-lg font-bold text-green-600">{formatCurrency(payout.amount)}</p>
                    </td>
                    <td className="px-5 py-3">{getStatusBadge(payout.status)}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{formatDate(payout.createdAt)}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{payout.description}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedPayout(payout);
                            setShowModal(true);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {payout.status === 'pending' && (
                          <button
                            onClick={() => handleProcessPayout(payout._id)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Process Payout"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t border-gray-100">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Payout Details Modal */}
      {showModal && selectedPayout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Payout Details</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl p-5 text-white">
                <p className="text-sm text-white/80">Amount</p>
                <p className="text-3xl font-bold">{formatCurrency(selectedPayout.amount)}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Payout ID</span>
                  <span className="font-medium">{selectedPayout.payoutId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Driver Name</span>
                  <span className="font-medium">{selectedPayout.driver?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Driver Phone</span>
                  <span className="font-medium">{selectedPayout.driver?.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  {getStatusBadge(selectedPayout.status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium">{formatDate(selectedPayout.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Description</span>
                  <span className="font-medium">{selectedPayout.description}</span>
                </div>
                {selectedPayout.rideDetails && (
                  <>
                    <div className="border-t pt-3 mt-2">
                      <p className="font-medium text-gray-900 mb-2">Ride Details</p>
                      <div className="space-y-1">
                        <p className="text-sm"><span className="text-gray-500">From:</span> {selectedPayout.rideDetails.from}</p>
                        <p className="text-sm"><span className="text-gray-500">To:</span> {selectedPayout.rideDetails.to}</p>
                        <p className="text-sm"><span className="text-gray-500">Fare:</span> {formatCurrency(selectedPayout.rideDetails.fare)}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Payout Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Create Manual Payout</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Driver *</label>
                <select
                  value={createForm.driverId}
                  onChange={(e) => setCreateForm({ ...createForm, driverId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a driver</option>
                  {drivers.map(driver => (
                    <option key={driver._id} value={driver.userId || driver._id}>
                      {driver.fullName || driver.name} - {driver.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  value={createForm.amount}
                  onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Enter description (optional)"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                <select
                  value={createForm.paymentMode}
                  onChange={(e) => setCreateForm({ ...createForm, paymentMode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="upi">UPI</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePayout}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                >
                  Create Payout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payouts;