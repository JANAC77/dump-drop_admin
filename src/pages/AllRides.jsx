import React, { useState, useEffect } from 'react';
import { Search, Eye, Car, Package, MapPin, User, Calendar as CalIcon, DollarSign, Filter, X, Calendar } from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

function AllRides() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month, year
  const [selectedDate, setSelectedDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    fetchRides();
  }, [typeFilter, dateFilter, selectedDate]);

  const fetchRides = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getRides(1, 100, { type: typeFilter !== 'all' ? typeFilter : undefined });
      
      let ridesData = [];
      if (response.data?.rides) {
        ridesData = response.data.rides;
      } else if (response.data?.data?.rides) {
        ridesData = response.data.data.rides;
      } else if (Array.isArray(response.data)) {
        ridesData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        ridesData = response.data.data;
      }
      
      setRides(ridesData);
    } catch (error) {
      console.error('Error fetching rides:', error);
      toast.error('Failed to load rides');
    } finally {
      setLoading(false);
    }
  };

  // Filter rides by date
  const filterByDate = (ride) => {
    if (dateFilter === 'all') return true;
    
    const rideDate = new Date(ride.date || ride.createdAt || ride.departureDate);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    
    switch(dateFilter) {
      case 'today':
        return rideDate.toDateString() === today.toDateString();
      case 'week':
        return rideDate >= weekStart;
      case 'month':
        return rideDate >= monthStart;
      case 'year':
        return rideDate >= yearStart;
      case 'selected':
        if (selectedDate) {
          const selected = new Date(selectedDate);
          return rideDate.toDateString() === selected.toDateString();
        }
        return true;
      default:
        return true;
    }
  };

  const getTypeIcon = (ride) => {
    const type = ride.type || ride.role;
    if (type === 'cab' || type === 'cab_ride') {
      return <Car className="w-4 h-4 text-blue-600" />;
    }
    return <Package className="w-4 h-4 text-green-600" />;
  };

  // Safe getters
  const getCustomerName = (ride) => {
    return ride.customer?.name || ride.customerName || ride.customerId?.name || 'N/A';
  };

  const getFromLocation = (ride) => {
    return ride.from || ride.fromCity || ride.pickupLocation?.address || 'N/A';
  };

  const getToLocation = (ride) => {
    return ride.to || ride.toCity || ride.dropLocation?.address || 'N/A';
  };

  const getRideDate = (ride) => {
    return ride.date || ride.createdAt || ride.departureDate || new Date();
  };

  const getFare = (ride) => {
    return ride.fare || ride.price || ride.amount || 0;
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-700',
      searching: 'bg-yellow-100 text-yellow-700',
      accepted: 'bg-blue-100 text-blue-700',
      ongoing: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    const color = statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
    return <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${color}`}>{status || 'N/A'}</span>;
  };

  // Apply all filters
  const filteredRides = rides.filter(ride => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      getCustomerName(ride).toLowerCase().includes(searchLower) ||
      getFromLocation(ride).toLowerCase().includes(searchLower) ||
      getToLocation(ride).toLowerCase().includes(searchLower);
    
    const matchesDate = filterByDate(ride);
    
    return matchesSearch && matchesDate;
  });

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setDateFilter('all');
    setSelectedDate('');
    setShowCalendar(false);
  };

  // Get stats for filtered rides
  const stats = {
    total: filteredRides.length,
    totalAmount: filteredRides.reduce((sum, ride) => sum + getFare(ride), 0),
    completed: filteredRides.filter(r => r.status === 'completed').length,
    pending: filteredRides.filter(r => r.status === 'pending' || r.status === 'searching').length,
    cancelled: filteredRides.filter(r => r.status === 'cancelled').length,
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
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
          <h1 className="text-2xl font-bold text-gray-900">All Rides</h1>
          <p className="text-sm text-gray-500 mt-1">View all rides across the platform</p>
        </div>
        {(searchTerm || typeFilter !== 'all' || dateFilter !== 'all') && (
          <button 
            onClick={clearFilters}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-500">Total Rides</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-green-600">₹{stats.totalAmount.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Total Revenue</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          <p className="text-sm text-gray-500">Completed</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-sm text-gray-500">Pending</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Ride Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="cab">Cab Rides</option>
            <option value="goods">Goods Delivery</option>
          </select>

          {/* Date Filter */}
          <div className="relative">
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                if (e.target.value === 'selected') {
                  setShowCalendar(true);
                } else {
                  setShowCalendar(false);
                  setSelectedDate('');
                }
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="selected">Select Date</option>
            </select>
          </div>

          {/* Calendar Date Picker */}
          {showCalendar && (
            <div className="relative">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    if (e.target.value) {
                      setDateFilter('selected');
                    }
                  }}
                  className="bg-transparent outline-none text-sm"
                  placeholder="Select date"
                />
                {selectedDate && (
                  <button
                    onClick={() => {
                      setSelectedDate('');
                      setDateFilter('all');
                      setShowCalendar(false);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              {selectedDate && (
                <div className="mt-2 text-xs text-blue-600">
                  Showing rides for: {formatDate(selectedDate)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Rides Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ride ID</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRides.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-10 text-center text-gray-500">
                    No rides found
                  </td>
                </tr>
              ) : (
                filteredRides.map((ride) => (
                  <tr key={ride._id || ride.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3">{getTypeIcon(ride)}</td>
                    <td className="px-5 py-3 text-sm font-medium text-gray-900">
                      #{ride._id?.slice(-6) || ride.id?.slice(-6) || 'N/A'}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">{getCustomerName(ride)}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">
                      {getFromLocation(ride)} → {getToLocation(ride)}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {new Date(getRideDate(ride)).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-gray-900">₹{getFare(ride)}</td>
                    <td className="px-5 py-3">{getStatusBadge(ride.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Footer */}
      {filteredRides.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredRides.length}</span> rides
            </p>
            <p className="text-sm font-semibold text-gray-900">
              Total: ₹{stats.totalAmount.toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllRides;