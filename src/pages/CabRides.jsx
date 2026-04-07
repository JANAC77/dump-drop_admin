import React, { useState, useEffect } from 'react';
import { Search, Eye, XCircle, CheckCircle, Clock, MapPin, User, Calendar as CalIcon, DollarSign } from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

function CabRides() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRide, setSelectedRide] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchRides();
  }, [statusFilter]);

  const fetchRides = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getRides(1, 50, { type: 'cab', status: statusFilter !== 'all' ? statusFilter : undefined });
      
      // Log the response to debug
      console.log('Cab Rides API Response:', response);
      
      // Handle different response structures
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
      
      console.log('Processed rides data:', ridesData);
      setRides(ridesData);
    } catch (error) {
      console.error('Error fetching rides:', error);
      toast.error('Failed to load rides');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRide = async () => {
    if (!cancelReason) {
      toast.error('Please provide a cancellation reason');
      return;
    }
    try {
      await adminAPI.cancelRide(selectedRide._id, cancelReason);
      toast.success('Ride cancelled successfully');
      setShowCancelModal(false);
      setCancelReason('');
      fetchRides();
    } catch (error) {
      toast.error('Failed to cancel ride');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Pending' },
      searching: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Searching' },
      accepted: { color: 'bg-blue-100 text-blue-700', icon: Clock, label: 'Accepted' },
      ongoing: { color: 'bg-blue-100 text-blue-700', icon: Clock, label: 'Ongoing' },
      completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Cancelled' },
    };
    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  // Safe getters for ride properties
  const getCustomerName = (ride) => {
    return ride.customer?.name || ride.customerName || ride.customerId?.name || 'N/A';
  };

  const getCustomerPhone = (ride) => {
    return ride.customer?.phone || ride.customerPhone || ride.customerId?.phone || '';
  };

  const getFromLocation = (ride) => {
    return ride.from || ride.fromCity || ride.pickupLocation?.address || 'N/A';
  };

  const getToLocation = (ride) => {
    return ride.to || ride.toCity || ride.dropLocation?.address || 'N/A';
  };

  const getDriverName = (ride) => {
    return ride.driver?.name || ride.driverName || ride.driverId?.name || 'Not assigned';
  };

  const getDriverPhone = (ride) => {
    return ride.driver?.phone || ride.driverPhone || ride.driverId?.phone || '';
  };

  const getFare = (ride) => {
    return ride.fare || ride.price || ride.amount || 0;
  };

  const getRideDate = (ride) => {
    return ride.date || ride.createdAt || ride.departureDate || new Date();
  };

  const filteredRides = rides.filter(ride => {
    const searchLower = searchTerm.toLowerCase();
    return (
      getCustomerName(ride).toLowerCase().includes(searchLower) ||
      getFromLocation(ride).toLowerCase().includes(searchLower) ||
      getToLocation(ride).toLowerCase().includes(searchLower)
    );
  });

  const stats = {
    pending: rides.filter(r => ['pending', 'searching'].includes(r.status?.toLowerCase())).length,
    ongoing: rides.filter(r => ['accepted', 'ongoing'].includes(r.status?.toLowerCase())).length,
    completed: rides.filter(r => r.status?.toLowerCase() === 'completed').length,
    cancelled: rides.filter(r => r.status?.toLowerCase() === 'cancelled').length,
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cab Rides</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all cab ride bookings</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search rides..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-sm text-gray-500">Pending Rides</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-blue-600">{stats.ongoing}</p>
          <p className="text-sm text-gray-500">Ongoing Rides</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          <p className="text-sm text-gray-500">Completed Rides</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
          <p className="text-sm text-gray-500">Cancelled Rides</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ride ID</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRides.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-5 py-10 text-center text-gray-500">
                    {loading ? 'Loading...' : 'No rides found'}
                  </td>
                </tr>
              ) : (
                filteredRides.map((ride) => (
                  <tr key={ride._id || ride.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3 text-sm font-medium text-gray-900">
                      #{ride._id?.slice(-6) || ride.id?.slice(-6) || 'N/A'}
                    </td>
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{getCustomerName(ride)}</p>
                        <p className="text-xs text-gray-500">{getCustomerPhone(ride)}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-600">{getFromLocation(ride)}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-sm text-gray-600">{getToLocation(ride)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {new Date(getRideDate(ride)).toLocaleDateString()} <br />
                      <span className="text-xs">{new Date(getRideDate(ride)).toLocaleTimeString()}</span>
                    </td>
                    <td className="px-5 py-3">
                      {getDriverName(ride) !== 'Not assigned' ? (
                        <div>
                          <p className="text-sm text-gray-900">{getDriverName(ride)}</p>
                          <p className="text-xs text-gray-500">{getDriverPhone(ride)}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not assigned</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-gray-900">₹{getFare(ride)}</td>
                    <td className="px-5 py-3">{getStatusBadge(ride.status)}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        {['pending', 'searching'].includes(ride.status?.toLowerCase()) && (
                          <button
                            onClick={() => {
                              setSelectedRide(ride);
                              setShowCancelModal(true);
                            }}
                            className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <XCircle className="w-4 h-4" />
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
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Cancel Ride</h3>
            <p className="text-sm text-gray-600 mb-3">Ride ID: #{selectedRide?._id?.slice(-6)}</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter cancellation reason..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              rows="3"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCancelRide}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CabRides;