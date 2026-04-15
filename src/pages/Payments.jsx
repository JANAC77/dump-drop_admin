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
    Truck,
    Car,
    User,
    CreditCard,
    TrendingUp,
    FileText,
    X
} from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

function Payments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalPayout: 0,
        pendingCount: 0,
        completedCount: 0,
        failedCount: 0
    });
    const [commissionSettings, setCommissionSettings] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchPayments();
    }, [selectedType, selectedStatus, currentPage]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: 20,
                type: selectedType,
                status: selectedStatus,
                startDate: dateRange.start,
                endDate: dateRange.end,
                search: searchTerm
            };

            const response = await adminAPI.getPayments(params);

            if (response.data.success) {
                setPayments(response.data.payments);
                setStats(response.data.stats);
                setCommissionSettings(response.data.commissionSettings);
                setTotalPages(response.data.pages);
            }
        } catch (error) {
            console.error('Error fetching payments:', error);
            toast.error('Failed to load payments');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            paid: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Paid' },
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
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        if (e.target.value.length === 0 || e.target.value.length > 2) {
            fetchPayments();
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedType('all');
        setSelectedStatus('all');
        setDateRange({ start: '', end: '' });
        setCurrentPage(1);
    };

    if (loading && payments.length === 0) {
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
                    <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Track and manage all payments and payouts</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchPayments}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                    </div>
                    <p className="text-xs text-gray-500">Total Revenue</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="w-5 h-5 text-purple-600" />
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalPayout)}</p>
                    </div>
                    <p className="text-xs text-gray-500">Total Payout</p>
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

            {/* Commission Info Banner */}
            {commissionSettings && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex flex-wrap justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-blue-800">Current Commission Settings</p>
                            <div className="flex flex-wrap gap-4 mt-1 text-xs text-blue-600">
                                <span>Driver Commission: {commissionSettings.driverCommission}%</span>
                            </div>
                        </div>
                        <a href="/commission-settings" className="text-sm text-blue-600 hover:text-blue-700">Edit Settings →</a>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by Order ID, Transaction ID, Driver, Customer..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Ride Types</option>
                        <option value="cab">Cab Rides</option>
                        <option value="goods">Goods Delivery</option>
                    </select>

                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="paid">Paid</option>
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

                    {(searchTerm || selectedType !== 'all' || selectedStatus !== 'all' || dateRange.start || dateRange.end) && (
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

            {/* Payments Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payout</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-5 py-10 text-center text-gray-500">
                                        No payments found
                                    </td>
                                </tr>
                            ) : (
                                payments.map((payment) => (
                                    <tr key={payment._id} className="hover:bg-gray-50 transition">
                                        <td className="px-5 py-3">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{payment.orderId}</p>
                                                <p className="text-xs text-gray-500">{payment._id?.slice(-6)}</p>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-1">
                                                {payment.rideType === 'cab' ?
                                                    <Car className="w-4 h-4 text-blue-600" /> :
                                                    <Truck className="w-4 h-4 text-green-600" />
                                                }
                                                <span className="text-sm text-gray-600">
                                                    {payment.rideType === 'cab' ? 'Cab' : 'Goods'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{payment.driver?.name || 'N/A'}</p>
                                                <p className="text-xs text-gray-500">{payment.driver?.phone || 'N/A'}</p>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-sm font-semibold text-gray-900">{formatCurrency(payment.amount)}</td>
                                        <td className="px-5 py-3 text-sm font-semibold text-blue-600">{payment.commission}%</td>
                                        <td className="px-5 py-3 text-sm font-semibold text-green-600">{formatCurrency(payment.payout)}</td>
                                        <td className="px-5 py-3">{getStatusBadge(payment.status)}</td>
                                        <td className="px-5 py-3">
                                            <p className="text-sm font-mono text-gray-600">{payment.transactionId}</p>
                                            <p className="text-xs text-gray-400">{formatDate(payment.createdAt)}</p>
                                        </td>
                                        <td className="px-5 py-3">
                                            <button
                                                onClick={() => {
                                                    setSelectedPayment(payment);
                                                    setShowModal(true);
                                                }}
                                                className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
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

            {/* Payment Details Modal */}
            {showModal && selectedPayment && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Payment Details</h3>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Payment Summary */}
                            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl p-5 text-white">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-white/80">Order ID</p>
                                        <p className="text-lg font-bold">{selectedPayment.orderId}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-white/80">Payment ID</p>
                                        <p className="text-lg font-bold">{selectedPayment._id?.slice(-8)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-white/80">Date & Time</p>
                                        <p className="text-sm">{formatDate(selectedPayment.createdAt)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-white/80">Status</p>
                                        {getStatusBadge(selectedPayment.status)}
                                    </div>
                                </div>
                            </div>

                            {/* Amount Breakdown */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-3">Amount Breakdown</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Amount</span>
                                        <span className="font-semibold text-gray-900">{formatCurrency(selectedPayment.amount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Commission Rate</span>
                                        <span className="font-semibold text-blue-600">{selectedPayment.commission}%</span>
                                    </div>
                                    <div className="border-t pt-2 mt-2">
                                        <div className="flex justify-between font-bold">
                                            <span>Driver Payout</span>
                                            <span className="text-green-600">{formatCurrency(selectedPayment.payout)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Transaction Details */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-3">Transaction Details</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Transaction ID</span>
                                        <span className="font-mono text-sm">{selectedPayment.transactionId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Ride Type</span>
                                        <span>{selectedPayment.rideType === 'cab' ? 'Cab Ride' : 'Goods Delivery'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Payment Mode</span>
                                        <span>{selectedPayment.paymentMode === 'online' ? 'Online' : 'Cash'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Driver & Customer Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Driver Details
                                    </h4>
                                    <div className="space-y-1">
                                        <p className="text-sm"><span className="text-gray-500">Name:</span> {selectedPayment.driver?.name || 'N/A'}</p>
                                        <p className="text-sm"><span className="text-gray-500">Phone:</span> {selectedPayment.driver?.phone || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Customer Details
                                    </h4>
                                    <div className="space-y-1">
                                        <p className="text-sm"><span className="text-gray-500">Name:</span> {selectedPayment.customer?.name || 'N/A'}</p>
                                        <p className="text-sm"><span className="text-gray-500">Phone:</span> {selectedPayment.customer?.phone || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Ride Details */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Ride Details
                                </h4>
                                <div className="space-y-1">
                                    <p className="text-sm"><span className="text-gray-500">From:</span> {selectedPayment.rideFrom || 'N/A'}</p>
                                    <p className="text-sm"><span className="text-gray-500">To:</span> {selectedPayment.rideTo || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Payments;