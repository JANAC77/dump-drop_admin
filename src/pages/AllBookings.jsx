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
import jsPDF from 'jspdf';
import autoTable from "jspdf-autotable";

function AllBookings() {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        draft: 0,
        searching: 0,
        available: 0,
        accepted: 0,
        ongoing: 0,
        completed: 0,
        cancelled: 0,
        totalAmount: 0
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchBookings();
    }, []);

    useEffect(() => {
        filterBookings();
    }, [searchTerm, selectedType, selectedStatus, dateRange, bookings]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await adminAPI.getBookings({
                page: currentPage,
                limit: 500,
            });

            if (response.data.success) {
                setBookings(response.data.bookings || []);
                const bookingsData = response.data.bookings || [];
                const calculatedStats = {
                    total: bookingsData.length,
                    draft: bookingsData.filter(b => b.status === 'draft').length,
                    searching: bookingsData.filter(b => b.status === 'searching').length,
                    available: bookingsData.filter(b => b.status === 'available').length,
                    accepted: bookingsData.filter(b => b.status === 'accepted').length,
                    ongoing: bookingsData.filter(b => b.status === 'ongoing').length,
                    completed: bookingsData.filter(b => b.status === 'completed').length,
                    cancelled: bookingsData.filter(b => b.status === 'cancelled').length,
                    totalAmount: bookingsData.reduce((sum, b) => sum + (b.amount || 0), 0)
                };
                setStats(calculatedStats);
                setTotalPages(response.data.pages || 1);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const filterBookings = () => {
        let filtered = [...bookings];

        if (searchTerm.trim() !== '') {
            const searchLower = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(booking =>
                (booking._id || '').toLowerCase().includes(searchLower) ||
                (booking.customer?.name || '').toLowerCase().includes(searchLower) ||
                (booking.customer?.phone || '').toLowerCase().includes(searchLower) ||
                (booking.driver?.name || '').toLowerCase().includes(searchLower) ||
                (booking.fromCity || '').toLowerCase().includes(searchLower) ||
                (booking.toCity || '').toLowerCase().includes(searchLower)
            );
        }

        if (selectedType !== 'all') {
            filtered = filtered.filter(booking => booking.rideType === selectedType);
        }

        if (selectedStatus !== 'all') {
            filtered = filtered.filter(booking => booking.status === selectedStatus);
        }

        if (dateRange.start && dateRange.end) {
            const startDate = new Date(dateRange.start);
            const endDate = new Date(dateRange.end);
            endDate.setHours(23, 59, 59, 999);
            
            filtered = filtered.filter(booking => {
                const bookingDate = new Date(booking.createdAt);
                return bookingDate >= startDate && bookingDate <= endDate;
            });
        }

        setFilteredBookings(filtered);
        
        const filteredStats = {
            total: filtered.length,
            draft: filtered.filter(b => b.status === 'draft').length,
            searching: filtered.filter(b => b.status === 'searching').length,
            available: filtered.filter(b => b.status === 'available').length,
            accepted: filtered.filter(b => b.status === 'accepted').length,
            ongoing: filtered.filter(b => b.status === 'ongoing').length,
            completed: filtered.filter(b => b.status === 'completed').length,
            cancelled: filtered.filter(b => b.status === 'cancelled').length,
            totalAmount: filtered.reduce((sum, b) => sum + (b.amount || 0), 0)
        };
        setStats(filteredStats);
    };

    const exportToPDF = () => {
        const doc = new jsPDF("p", "mm", "a4");
        const date = new Date().toLocaleString();

        // Header
        doc.setFillColor(41, 98, 255);
        doc.rect(0, 0, 210, 22, "F");
        doc.setTextColor(255);
        doc.setFontSize(16);
        doc.text("All Bookings Report", 105, 11, { align: "center" });
        doc.setFontSize(9);
        doc.text(`Generated: ${date}`, 105, 17, { align: "center" });

        // Stats Summary
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text("Statistics Summary", 14, 30);
        
        const statsData = [
            ["Total Bookings", stats.total],
            ["Draft", stats.draft],
            ["Searching", stats.searching],
            ["Available", stats.available],
            ["Accepted", stats.accepted],
            ["Ongoing", stats.ongoing],
            ["Completed", stats.completed],
            ["Cancelled", stats.cancelled],
            ["Total Revenue", `${(stats.totalAmount || 0).toLocaleString()}`]
        ];

        autoTable(doc, {
            startY: 35,
            body: statsData,
            theme: "grid",
            styles: { fontSize: 9, cellPadding: 3 },
            columnStyles: {
                0: { fontStyle: "bold", cellWidth: 80 },
                1: { halign: "right", cellWidth: 80 },
            },
        });

        // Table Data
        const tableData = filteredBookings.map((booking, i) => [
            i + 1,
            booking._id?.slice(-8) || 'N/A',
            booking.rideType === 'cab' ? 'Cab' : 'Goods',
            `${booking.customer?.name || 'N/A'}\n${booking.customer?.phone || 'N/A'}`,
            `${booking.driver?.name || 'Not assigned'}\n${booking.driver?.phone || 'N/A'}`,
            `${booking.fromCity || 'N/A'} -> ${booking.toCity || 'N/A'}`,
            `${booking.amount || 0}`,
            new Date(booking.createdAt).toLocaleDateString(),
            booking.status || 'N/A',
        ]);

        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 10,
            head: [["No", "ID", "Type", "Customer / Phone", "Driver / Phone", "Route", "Amount", "Date", "Status"]],
            body: tableData,
            theme: "striped",
            styles: { fontSize: 7, cellPadding: 2, valign: "middle" },
            headStyles: { fillColor: [41, 98, 255], textColor: 255, halign: "center", fontStyle: "bold" },
            columnStyles: {
                0: { cellWidth: 10, halign: "center" },
                1: { cellWidth: 22 },
                2: { cellWidth: 12, halign: "center" },
                3: { cellWidth: 20 },
                4: { cellWidth: 20 },
                5: { cellWidth: 40 },
                6: { cellWidth: 18, halign: "right" },
                7: { cellWidth: 20, halign: "center" },
                8: { cellWidth: 18, halign: "center" },
            },
            didDrawPage: () => {
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(`Page ${doc.internal.getNumberOfPages()}`, 200, 290, { align: "right" });
            },
        });

        doc.save(`all_bookings_report_${new Date().toISOString().split("T")[0]}.pdf`);
        toast.success("PDF downloaded successfully");
    };

    const getStatusBadge = (status) => {
        const config = {
            draft: { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Draft' },
            searching: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Searching' },
            available: { color: 'bg-blue-100 text-blue-700', icon: CheckCircle, label: 'Available' },
            accepted: { color: 'bg-cyan-100 text-cyan-700', icon: CheckCircle, label: 'Accepted' },
            ongoing: { color: 'bg-purple-100 text-purple-700', icon: Clock, label: 'Ongoing' },
            completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Completed' },
            cancelled: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Cancelled' }
        };
        const c = config[status] || config.draft;
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

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedType('all');
        setSelectedStatus('all');
        setDateRange({ start: '', end: '' });
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
                        onClick={exportToPDF}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export PDF
                    </button>
                    <button
                        onClick={fetchBookings}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Status Dashboard Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                <div className="bg-white rounded-xl p-3 shadow-sm text-center border-l-4 border-blue-500">
                    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                    <p className="text-xs text-gray-500">Total</p>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm text-center border-l-4 border-gray-500">
                    <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
                    <p className="text-xs text-gray-500">Draft</p>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm text-center border-l-4 border-yellow-500">
                    <p className="text-2xl font-bold text-yellow-600">{stats.searching}</p>
                    <p className="text-xs text-gray-500">Searching</p>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm text-center border-l-4 border-blue-500">
                    <p className="text-2xl font-bold text-blue-600">{stats.available}</p>
                    <p className="text-xs text-gray-500">Available</p>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm text-center border-l-4 border-cyan-500">
                    <p className="text-2xl font-bold text-cyan-600">{stats.accepted}</p>
                    <p className="text-xs text-gray-500">Accepted</p>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm text-center border-l-4 border-purple-500">
                    <p className="text-2xl font-bold text-purple-600">{stats.ongoing}</p>
                    <p className="text-xs text-gray-500">Ongoing</p>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm text-center border-l-4 border-green-500">
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                    <p className="text-xs text-gray-500">Completed</p>
                </div>
            </div>

            {/* Cancelled and Revenue Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-green-600 to-teal-500 rounded-xl p-4 text-white">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm opacity-80">Total Revenue</p>
                            <p className="text-2xl font-bold">{formatCurrency(stats.totalAmount || 0)}</p>
                        </div>
                        <DollarSign className="w-10 h-10 opacity-50" />
                    </div>
                </div>
                 <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-xl p-4 text-white">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm opacity-80">Cancelled Bookings</p>
                            <p className="text-2xl font-bold">{stats.cancelled}</p>
                        </div>
                        <XCircle className="w-10 h-10 opacity-50" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="relative flex-1 min-w-[250px]">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by ID, customer, phone, driver, route..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                        <option value="all">All Types</option>
                        <option value="cab">Cab</option>
                        <option value="goods">Goods</option>
                    </select>

                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                        <option value="all">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="searching">Searching</option>
                        <option value="available">Available</option>
                        <option value="accepted">Accepted</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    <input
                        type="date"
                        placeholder="Start"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-36"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                        type="date"
                        placeholder="End"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-36"
                    />

                    {(searchTerm || selectedType !== 'all' || selectedStatus !== 'all' || dateRange.start || dateRange.end) && (
                        <button
                            onClick={clearFilters}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition flex items-center gap-1"
                        >
                            <X className="w-4 h-4" />
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Bookings Table - Compact */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px]">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer / Phone</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Driver / Phone</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="px-3 py-8 text-center text-gray-500">
                                        No bookings found
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map((booking, index) => (
                                    <tr key={booking._id} className="hover:bg-gray-50 transition">
                                        <td className="px-3 py-2 text-sm text-gray-500">{index + 1}</td>
                                        <td className="px-3 py-2 text-sm font-medium text-gray-900">
                                            #{booking._id?.slice(-8)}
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="flex items-center gap-1">
                                                {booking.rideType === 'cab' ?
                                                    <Car className="w-3 h-3 text-blue-600" /> :
                                                    <Truck className="w-3 h-3 text-green-600" />
                                                }
                                                <span className="text-xs text-gray-600">
                                                    {booking.rideType === 'cab' ? 'Cab' : 'Goods'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="max-w-[140px]">
                                                <p className="text-sm font-medium text-gray-900 truncate">{booking.customer?.name || 'N/A'}</p>
                                                <p className="text-xs text-gray-500 truncate">{booking.customer?.phone || 'N/A'}</p>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="max-w-[140px]">
                                                <p className="text-sm text-gray-900 truncate">{booking.driver?.name || 'Not assigned'}</p>
                                                <p className="text-xs text-gray-500 truncate">{booking.driver?.phone || ''}</p>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="flex items-center gap-1 max-w-[180px]">
                                                <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                                <span className="text-xs text-gray-600 truncate">{booking.fromCity || 'N/A'}</span>
                                                <span className="text-gray-400 text-xs">→</span>
                                                <span className="text-xs text-gray-600 truncate">{booking.toCity || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-sm font-semibold text-green-600 whitespace-nowrap">
                                            {formatCurrency(booking.amount || 0)}
                                        </td>
                                        <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">
                                            {new Date(booking.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-3 py-2">{getStatusBadge(booking.status)}</td>
                                        <td className="px-3 py-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedBooking(booking);
                                                    setShowModal(true);
                                                }}
                                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
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
            </div>

            {/* Booking Details Modal */}
            {showModal && selectedBooking && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Booking Details</h3>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Booking Summary */}
                            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl p-4 text-white">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-xs text-white/80">Booking ID</p>
                                        <p className="text-base font-bold">#{selectedBooking._id?.slice(-8)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/80">Status</p>
                                        {getStatusBadge(selectedBooking.status)}
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/80">Date & Time</p>
                                        <p className="text-xs">{formatDate(selectedBooking.createdAt)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/80">Amount</p>
                                        <p className="text-base font-bold">{formatCurrency(selectedBooking.amount || 0)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Ride Details */}
                            <div className="border border-gray-200 rounded-lg p-3">
                                <h4 className="font-semibold text-gray-900 mb-2 text-sm flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-blue-600" />
                                    Ride Details
                                </h4>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">From</span>
                                        <span className="font-medium">{selectedBooking.fromCity || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">To</span>
                                        <span className="font-medium">{selectedBooking.toCity || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Customer & Driver Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="border border-gray-200 rounded-lg p-3">
                                    <h4 className="font-semibold text-gray-900 mb-2 text-sm flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Customer Details
                                    </h4>
                                    <div className="space-y-1">
                                        <p className="text-sm"><span className="text-gray-500">Name:</span> {selectedBooking.customer?.name || 'N/A'}</p>
                                        <p className="text-sm"><span className="text-gray-500">Phone:</span> {selectedBooking.customer?.phone || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="border border-gray-200 rounded-lg p-3">
                                    <h4 className="font-semibold text-gray-900 mb-2 text-sm flex items-center gap-2">
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
                                <div className="border border-gray-200 rounded-lg p-3">
                                    <h4 className="font-semibold text-gray-900 mb-2 text-sm flex items-center gap-2">
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