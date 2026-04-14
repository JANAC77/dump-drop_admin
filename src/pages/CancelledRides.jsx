import React, { useState, useEffect } from 'react';
import {
    XCircle,
    Search,
    Eye,
    Download,
    RefreshCw,
    Filter,
    X,
    User,
    MapPin,
    DollarSign,
    Calendar,
    Clock,
    Car,
    Truck,
    AlertCircle,
    MessageCircle
} from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

function CancelledRides() {
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedReason, setSelectedReason] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [selectedRide, setSelectedRide] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        totalAmount: 0,
        byDriver: 0,
        byCustomer: 0,
        byAdmin: 0
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchCancelledRides();
    }, [selectedType, selectedReason, currentPage]);

    const fetchCancelledRides = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: 20,
                type: selectedType,
                reason: selectedReason,
                startDate: dateRange.start,
                endDate: dateRange.end,
                search: searchTerm
            };

            const response = await adminAPI.getCancelledRides(params);

            if (response.data.success) {
                setRides(response.data.rides);
                setStats(response.data.stats);
                setTotalPages(response.data.pages);
            }
        } catch (error) {
            console.error('Error fetching cancelled rides:', error);
            toast.error('Failed to load cancelled rides');
            // Set mock data for demo
            setMockData();
        } finally {
            setLoading(false);
        }
    };

    const setMockData = () => {
        setRides([
            {
                _id: 'RIDE001',
                rideType: 'cab',
                customer: { name: 'John Doe', phone: '9876543210' },
                driver: { name: 'Rajesh Kumar', phone: '9876543211' },
                fromCity: 'Airport',
                toCity: 'City Center',
                amount: 350,
                cancelledBy: 'customer',
                cancelReason: 'Changed plans',
                cancelledAt: new Date(),
                createdAt: new Date()
            },
            {
                _id: 'RIDE002',
                rideType: 'goods',
                customer: { name: 'Jane Smith', phone: '9876543212' },
                driver: { name: 'Suresh Kumar', phone: '9876543213' },
                fromCity: 'Warehouse A',
                toCity: 'Mall B',
                amount: 1200,
                cancelledBy: 'driver',
                cancelReason: 'Vehicle issue',
                cancelledAt: new Date(),
                createdAt: new Date()
            }
        ]);
        setStats({
            total: 45,
            totalAmount: 18500,
            byDriver: 15,
            byCustomer: 25,
            byAdmin: 5
        });
    };

    const getCancelledByBadge = (cancelledBy) => {
        const config = {
            customer: { color: 'bg-yellow-100 text-yellow-700', label: 'By Customer' },
            driver: { color: 'bg-orange-100 text-orange-700', label: 'By Driver' },
            admin: { color: 'bg-red-100 text-red-700', label: 'By Admin' }
        };
        const c = config[cancelledBy] || config.customer;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${c.color}`}>
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
            fetchCancelledRides();
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedType('all');
        setSelectedReason('all');
        setDateRange({ start: '', end: '' });
        setCurrentPage(1);
    };

    const handleExport = async () => {
        try {
            const response = await adminAPI.exportCancelledRides({
                type: selectedType,
                reason: selectedReason,
                startDate: dateRange.start,
                endDate: dateRange.end,
                search: searchTerm
            });

            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cancelled_rides_${new Date().toISOString()}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Report exported successfully');
        } catch (error) {
            toast.error('Failed to export');
        }
    };

    if (loading && rides.length === 0) {
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
                    <h1 className="text-2xl font-bold text-gray-900">Cancelled Rides</h1>
                    <p className="text-sm text-gray-500 mt-1">View and analyse all cancelled rides</p>
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
                        onClick={fetchCancelledRides}
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
                        <XCircle className="w-5 h-5 text-red-600" />
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <p className="text-xs text-gray-500">Total Cancelled</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-5 h-5 text-orange-600" />
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</p>
                    </div>
                    <p className="text-xs text-gray-500">Lost Revenue</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                        <User className="w-5 h-5 text-yellow-600" />
                        <p className="text-2xl font-bold text-gray-900">{stats.byCustomer}</p>
                    </div>
                    <p className="text-xs text-gray-500">Cancelled by Customer</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Car className="w-5 h-5 text-orange-600" />
                        <p className="text-2xl font-bold text-gray-900">{stats.byDriver}</p>
                    </div>
                    <p className="text-xs text-gray-500">Cancelled by Driver</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by ride ID, customer, driver..."
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
                        value={selectedReason}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Reasons</option>
                        <option value="customer">By Customer</option>
                        <option value="driver">By Driver</option>
                        <option value="admin">By Admin</option>
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

                    {(searchTerm || selectedType !== 'all' || selectedReason !== 'all' || dateRange.start || dateRange.end) && (
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

            {/* Cancelled Rides Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ride ID</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cancelled By</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rides.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-5 py-10 text-center text-gray-500">
                                        No cancelled rides found
                                    </td>
                                </tr>
                            ) : (
                                rides.map((ride) => (
                                    <tr key={ride._id} className="hover:bg-gray-50 transition">
                                        <td className="px-5 py-3">
                                            <p className="text-sm font-medium text-gray-900">#{ride._id?.slice(-8)}</p>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-1">
                                                {ride.rideType === 'cab' ?
                                                    <Car className="w-4 h-4 text-blue-600" /> :
                                                    <Truck className="w-4 h-4 text-green-600" />
                                                }
                                                <span className="text-sm text-gray-600">
                                                    {ride.rideType === 'cab' ? 'Cab' : 'Goods'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{ride.customer?.name || 'N/A'}</p>
                                                <p className="text-xs text-gray-500">{ride.customer?.phone || 'N/A'}</p>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div>
                                                <p className="text-sm text-gray-900">{ride.driver?.name || 'N/A'}</p>
                                                <p className="text-xs text-gray-500">{ride.driver?.phone || 'N/A'}</p>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3 text-gray-400" />
                                                <span className="text-sm text-gray-600">{ride.fromCity || 'N/A'}</span>
                                                <span className="text-gray-400">→</span>
                                                <span className="text-sm text-gray-600">{ride.toCity || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-sm font-semibold text-gray-900">{formatCurrency(ride.amount)}</td>
                                        <td className="px-5 py-3">{getCancelledByBadge(ride.cancelledBy)}</td>
                                        <td className="px-5 py-3 text-sm text-gray-500">{formatDate(ride.cancelledAt || ride.createdAt)}</td>
                                        <td className="px-5 py-3">
                                            <button
                                                onClick={() => {
                                                    setSelectedRide(ride);
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

            {/* Cancelled Ride Details Modal */}
            {showModal && selectedRide && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Cancelled Ride Details</h3>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Warning Banner */}
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                    <span className="font-semibold text-red-700">Ride Cancelled</span>
                                </div>
                                <p className="text-sm text-red-600">
                                    This ride was cancelled on {formatDate(selectedRide.cancelledAt || selectedRide.createdAt)}
                                </p>
                            </div>

                            {/* Cancellation Details */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <XCircle className="w-4 h-4 text-red-600" />
                                    Cancellation Details
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Cancelled By</span>
                                        {getCancelledByBadge(selectedRide.cancelledBy)}
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Cancellation Time</span>
                                        <span className="font-medium">{formatDate(selectedRide.cancelledAt || selectedRide.createdAt)}</span>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-gray-100">
                                        <p className="text-gray-600 mb-1">Reason</p>
                                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-lg">
                                            {selectedRide.cancelReason || 'No reason provided'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Ride Details */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-blue-600" />
                                    Ride Details
                                </h4>
                                <div className="space-y-1">
                                    <p className="text-sm"><span className="text-gray-500">From:</span> {selectedRide.fromCity || 'N/A'}</p>
                                    <p className="text-sm"><span className="text-gray-500">To:</span> {selectedRide.toCity || 'N/A'}</p>
                                    <p className="text-sm"><span className="text-gray-500">Amount:</span> {formatCurrency(selectedRide.amount)}</p>
                                </div>
                            </div>

                            {/* Customer & Driver Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="border border-gray-200 rounded-lg p-3">
                                    <h4 className="font-semibold text-gray-900 mb-1 text-sm">Customer</h4>
                                    <p className="text-sm">{selectedRide.customer?.name || 'N/A'}</p>
                                    <p className="text-xs text-gray-500">{selectedRide.customer?.phone || 'N/A'}</p>
                                </div>
                                <div className="border border-gray-200 rounded-lg p-3">
                                    <h4 className="font-semibold text-gray-900 mb-1 text-sm">Driver</h4>
                                    <p className="text-sm">{selectedRide.driver?.name || 'N/A'}</p>
                                    <p className="text-xs text-gray-500">{selectedRide.driver?.phone || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CancelledRides;