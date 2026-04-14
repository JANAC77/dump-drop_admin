import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Search,
    Eye,
    Download,
    RefreshCw,
    Filter,
    X,
    User,
    MapPin,
    DollarSign,
    Clock,
    CheckCircle,
    XCircle,
    Truck,
    Car,
    FileText
} from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

function AllBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        pending: 0,
        cancelled: 0,
        ongoing: 0
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchBookings();
    }, [selectedType, selectedStatus, currentPage]);

    const fetchBookings = async () => {
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

            const response = await adminAPI.getBookings(params);

            if (response.data.success) {
                setBookings(response.data.bookings);
                setStats(response.data.stats);
                setTotalPages(response.data.pages);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Completed' },
            confirmed: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Confirmed' },
            pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Pending' },
            ongoing: { color: 'bg-blue-100 text-blue-700', icon: Clock, label: 'Ongoing' },
            cancelled: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Cancelled' },
            searching: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Searching' },
            accepted: { color: 'bg-blue-100 text-blue-700', icon: Clock, label: 'Accepted' }
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
            fetchBookings();
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedType('all');
        setSelectedStatus('all');
        setDateRange({ start: '', end: '' });
        setCurrentPage(1);
    };

    const handleExport = async () => {
        try {
            const response = await adminAPI.exportBookings({
                type: selectedType,
                status: selectedStatus,
                startDate: dateRange.start,
                endDate: dateRange.end,
                search: searchTerm
            });

            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bookings_export_${new Date().toISOString()}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Report exported successfully');
        } catch (error) {
            toast.error('Failed to export');
        }
    };

    if (loading && bookings.length === 0) {
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
                    <h1 className="text-2xl font-bold text-gray-900">All Bookings</h1>
                    <p className="text-sm text-gray-500 mt-1">View and manage all ride bookings</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button
                        onClick={fetchBookings}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    <p className="text-xs text-gray-500">Total Bookings</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                    <p className="text-xs text-gray-500">Completed</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    <p className="text-xs text-gray-500">Pending</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-2xl font-bold text-blue-600">{stats.ongoing}</p>
                    <p className="text-xs text-gray-500">Ongoing</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                    <p className="text-xs text-gray-500">Cancelled</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by booking ID, customer, driver..."
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
                        <option value="all">All Types</option>
                        <option value="cab">Cab Rides</option>
                        <option value="goods">Goods Delivery</option>
                    </select>

                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="cancelled">Cancelled</option>
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

            {/* Bookings Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {bookings.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-5 py-10 text-center text-gray-500">
                                        No bookings found
                                    </td>
                                </tr>
                            ) : (
                                bookings.map((booking) => (
                                    <tr key={booking._id} className="hover:bg-gray-50 transition">
                                        <td className="px-5 py-3">
                                            <p className="text-sm font-medium text-gray-900">#{booking._id?.slice(-8)}</p>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-1">
                                                {booking.rideType === 'cab' ?
                                                    <Car className="w-4 h-4 text-blue-600" /> :
                                                    <Truck className="w-4 h-4 text-green-600" />
                                                }
                                                <span className="text-sm text-gray-600">
                                                    {booking.rideType === 'cab' ? 'Cab' : 'Goods'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{booking.customer?.name || 'N/A'}</p>
                                                <p className="text-xs text-gray-500">{booking.customer?.phone || 'N/A'}</p>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div>
                                                <p className="text-sm text-gray-900">{booking.driver?.name || 'Not assigned'}</p>
                                                <p className="text-xs text-gray-500">{booking.driver?.phone || ''}</p>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3 text-gray-400" />
                                                <span className="text-sm text-gray-600">{booking.fromCity || 'N/A'}</span>
                                                <span className="text-gray-400">→</span>
                                                <span className="text-sm text-gray-600">{booking.toCity || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-sm font-semibold text-gray-900">{formatCurrency(booking.amount || 0)}</td>
                                        <td className="px-5 py-3 text-sm text-gray-500">{formatDate(booking.createdAt)}</td>
                                        <td className="px-5 py-3">{getStatusBadge(booking.status)}</td>
                                        <td className="px-5 py-3">
                                            <button
                                                onClick={() => {
                                                    setSelectedBooking(booking);
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

            {/* Booking Details Modal */}
            {showModal && selectedBooking && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Booking Details</h3>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Booking Summary */}
                            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl p-5 text-white">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-white/80">Booking ID</p>
                                        <p className="text-lg font-bold">#{selectedBooking._id?.slice(-8)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-white/80">Status</p>
                                        {getStatusBadge(selectedBooking.status)}
                                    </div>
                                    <div>
                                        <p className="text-sm text-white/80">Date & Time</p>
                                        <p className="text-sm">{formatDate(selectedBooking.createdAt)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-white/80">Amount</p>
                                        <p className="text-lg font-bold">{formatCurrency(selectedBooking.amount || 0)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Ride Details */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-blue-600" />
                                    Ride Details
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">From</span>
                                        <span className="font-medium">{selectedBooking.fromCity || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">To</span>
                                        <span className="font-medium">{selectedBooking.toCity || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Distance</span>
                                        <span className="font-medium">{selectedBooking.distance || 'N/A'} km</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Duration</span>
                                        <span className="font-medium">{selectedBooking.duration || 'N/A'} mins</span>
                                    </div>
                                </div>
                            </div>

                            {/* Customer & Driver Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Customer Details
                                    </h4>
                                    <div className="space-y-1">
                                        <p className="text-sm"><span className="text-gray-500">Name:</span> {selectedBooking.customer?.name || 'N/A'}</p>
                                        <p className="text-sm"><span className="text-gray-500">Phone:</span> {selectedBooking.customer?.phone || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Driver Details
                                    </h4>
                                    <div className="space-y-1">
                                        <p className="text-sm"><span className="text-gray-500">Name:</span> {selectedBooking.driver?.name || 'Not assigned'}</p>
                                        <p className="text-sm"><span className="text-gray-500">Phone:</span> {selectedBooking.driver?.phone || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Details */}
                            {selectedBooking.payment && (
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-green-600" />
                                        Payment Details
                                    </h4>
                                    <div className="space-y-1">
                                        <p className="text-sm"><span className="text-gray-500">Amount:</span> {formatCurrency(selectedBooking.payment.amount)}</p>
                                        <p className="text-sm"><span className="text-gray-500">Mode:</span> {selectedBooking.payment.mode || 'N/A'}</p>
                                        <p className="text-sm"><span className="text-gray-500">Status:</span> {selectedBooking.payment.status || 'N/A'}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AllBookings;