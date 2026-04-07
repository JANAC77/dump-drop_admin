import React, { useState, useEffect } from 'react';
import { Search, Eye, Car, Package, MapPin, User, Calendar as CalIcon, DollarSign } from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

function AllRides() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchRides();
  }, [typeFilter]);

  const fetchRides = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getRides(1, 100, { type: typeFilter !== 'all' ? typeFilter : undefined });
      
      // Log the response to debug
      console.log('All Rides API Response:', response);
      
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

  const getRideType = (ride) => {
    return ride.type || ride.role || (ride.pickupLocation ? 'goods' : 'cab');
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

  const filteredRides = rides.filter(ride => {
    const searchLower = searchTerm.toLowerCase();
    return (
      getCustomerName(ride).toLowerCase().includes(searchLower) ||
      getFromLocation(ride).toLowerCase().includes(searchLower) ||
      getToLocation(ride).toLowerCase().includes(searchLower)
    );
  });

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
          <h1 className="text-2xl font-bold text-gray-900">All Rides</h1>
          <p className="text-sm text-gray-500 mt-1">View all rides across the platform</p>
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
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="cab">Cab Rides</option>
            <option value="goods">Goods Delivery</option>
          </select>
        </div>
      </div>

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
                    {loading ? 'Loading...' : 'No rides found'}
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
    </div>
  );
}

export default AllRides;