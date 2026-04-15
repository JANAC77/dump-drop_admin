import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Eye, X, Car, User, Phone, Clock, DollarSign, MapPin } from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

function Rentals() {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRental, setSelectedRental] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState({ total: 0, totalRevenue: 0 });

    useEffect(() => {
        fetchRentals();
    }, [currentPage]);

    const fetchRentals = async () => {
        setLoading(true);
        try {
            const response = await adminAPI.getRentals({
                page: currentPage,
                limit: 20,
                search: searchTerm || undefined
            });

            if (response.data.success) {
                setRentals(response.data.rentals || []);
                setStats(response.data.stats || { total: 0, totalRevenue: 0 });
                setTotalPages(response.data.pages || 1);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to load rentals');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        fetchRentals();
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        try {
            return new Date(date).toLocaleString();
        } catch {
            return 'N/A';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
    };

    const getStatusBadge = (status) => {
        const colors = {
            completed: 'bg-green-100 text-green-700',
            ongoing: 'bg-blue-100 text-blue-700',
            accepted: 'bg-blue-100 text-blue-700',
            available: 'bg-purple-100 text-purple-700',
            searching: 'bg-yellow-100 text-yellow-700',
            pending: 'bg-yellow-100 text-yellow-700',
            cancelled: 'bg-red-100 text-red-700',
            draft: 'bg-gray-100 text-gray-700'
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || colors.pending}`}>
                {status || 'Pending'}
            </span>
        );
    };

    if (loading && rentals.length === 0) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Rentals / Rides</h1>
                    <p className="text-sm text-gray-500">View all ride bookings</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by vehicle or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="pl-9 pr-3 py-2 border rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        onClick={fetchRentals}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border">
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    <p className="text-xs text-gray-500">Total Rides</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border">
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
                    <p className="text-xs text-gray-500">Total Revenue</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rentals.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-4 py-10 text-center text-gray-500">
                                        No rides found
                                    </td>
                                </tr>
                            ) : (
                                rentals.map((rental) => (
                                    <tr key={rental._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => {
                                        setSelectedRental(rental);
                                        setShowModal(true);
                                    }}>
                                        <td className="px-4 py-3 text-sm font-medium">
                                            #{rental._id?.toString().slice(-6)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Car className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="text-sm font-medium">{rental.vehicleNumber}</p>
                                                    <p className="text-xs text-gray-500">{rental.vehicleType}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium">{rental.customerName}</p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <Phone className="w-3 h-3" /> {rental.customerNumber}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm">{rental.driverName}</p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <Phone className="w-3 h-3" /> {rental.driverNumber}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3 text-gray-400" />
                                                <span className="text-sm text-gray-600">
                                                    {rental.fromLocation || 'N/A'} → {rental.toLocation || 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-semibold text-green-600">
                                            {formatCurrency(rental.cost)}
                                        </td>
                                        <td className="px-4 py-3">
                                            {getStatusBadge(rental.status)}
                                        </td>
                                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => {
                                                    setSelectedRental(rental);
                                                    setShowModal(true);
                                                }}
                                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
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
                    <div className="flex justify-between items-center p-4 border-t">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-sm">Page {currentPage} of {totalPages}</span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Details Modal */}
            {showModal && selectedRental && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="font-bold text-lg">Ride Details</h3>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 space-y-3">
                            {/* ID */}
                            <div className="flex justify-between">
                                <span className="text-gray-500">Ride ID:</span>
                                <span className="font-medium">#{selectedRental._id?.toString().slice(-8)}</span>
                            </div>

                            {/* Vehicle */}
                            <div className="flex justify-between">
                                <span className="text-gray-500">Vehicle Number:</span>
                                <span className="font-medium">{selectedRental.vehicleNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Vehicle Type:</span>
                                <span>{selectedRental.vehicleType}</span>
                            </div>

                            {/* Customer */}
                            <div className="flex justify-between">
                                <span className="text-gray-500">Customer:</span>
                                <span>{selectedRental.customerName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Customer Phone:</span>
                                <span>{selectedRental.customerNumber}</span>
                            </div>

                            {/* Driver */}
                            <div className="flex justify-between">
                                <span className="text-gray-500">Driver:</span>
                                <span>{selectedRental.driverName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Driver Phone:</span>
                                <span>{selectedRental.driverNumber}</span>
                            </div>

                            {/* Route */}
                            <div className="flex justify-between">
                                <span className="text-gray-500">Route:</span>
                                <span>{selectedRental.fromLocation} → {selectedRental.toLocation}</span>
                            </div>

                            {/* Amount */}
                            <div className="flex justify-between">
                                <span className="text-gray-500">Amount:</span>
                                <span className="text-green-600 font-bold">{formatCurrency(selectedRental.cost)}</span>
                            </div>

                            {/* Seats */}
                            {selectedRental.seats && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Seats:</span>
                                    <span>{selectedRental.availableSeats}/{selectedRental.seats} available</span>
                                </div>
                            )}

                            {/* Status */}
                            <div className="flex justify-between">
                                <span className="text-gray-500">Status:</span>
                                {getStatusBadge(selectedRental.status)}
                            </div>

                            {/* Date */}
                            <div className="flex justify-between">
                                <span className="text-gray-500">Created:</span>
                                <span>{formatDate(selectedRental.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Rentals;