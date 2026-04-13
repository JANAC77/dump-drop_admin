import React, { useState, useEffect } from 'react';
import { Search, Package, Truck, Eye, XCircle, CheckCircle, Clock } from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

function GoodsDelivery() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchDeliveries();
  }, [statusFilter]);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getRides(1, 50, { type: 'goods', status: statusFilter !== 'all' ? statusFilter : undefined });

      // Log the response to see the actual structure
      console.log('Goods Delivery API Response:', response);
      console.log('Response data:', response.data);

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

      setDeliveries(ridesData);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      toast.error('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Pending' },
      searching: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Searching' },
      ongoing: { color: 'bg-purple-100 text-purple-700', icon: Truck, label: 'In Transit' },
      completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Delivered' },
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

  // Safely get customer name
  const getCustomerName = (delivery) => {
    if (delivery.customer?.name) return delivery.customer.name;
    if (delivery.customerName) return delivery.customerName;
    if (delivery.customerId?.name) return delivery.customerId.name;
    return 'N/A';
  };

  // Safely get customer phone
  const getCustomerPhone = (delivery) => {
    if (delivery.customer?.phone) return delivery.customer.phone;
    if (delivery.customerPhone) return delivery.customerPhone;
    if (delivery.customerId?.phone) return delivery.customerId.phone;
    return '';
  };

  // Safely get from location
  const getFromLocation = (delivery) => {
    return delivery.from || delivery.fromCity || delivery.pickupLocation?.address || 'N/A';
  };

  // Safely get to location
  const getToLocation = (delivery) => {
    return delivery.to || delivery.toCity || delivery.dropLocation?.address || 'N/A';
  };

  // Safely get fare
  const getFare = (delivery) => {
    return delivery.fare || delivery.price || delivery.amount || 0;
  };

  // Safely get weight
  const getWeight = (delivery) => {
    return delivery.weight || delivery.packageWeight || 'N/A';
  };

  // Safely get package type
  const getPackageType = (delivery) => {
    return delivery.packageType || delivery.vehicleType || 'Standard';
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const searchLower = searchTerm.toLowerCase();
    return (
      getCustomerName(delivery).toLowerCase().includes(searchLower) ||
      getFromLocation(delivery).toLowerCase().includes(searchLower) ||
      getToLocation(delivery).toLowerCase().includes(searchLower)
    );
  });

  const stats = {
    pending: deliveries.filter(d => ['pending', 'searching'].includes(d.status?.toLowerCase())).length,
    inTransit: deliveries.filter(d => ['ongoing'].includes(d.status?.toLowerCase())).length,
    delivered: deliveries.filter(d => d.status?.toLowerCase() === 'completed').length,
    cancelled: deliveries.filter(d => d.status?.toLowerCase() === 'cancelled').length,
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
          <h1 className="text-2xl font-bold text-gray-900">Goods Delivery</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all goods delivery orders</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search deliveries..."
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
            <option value="ongoing">In Transit</option>
            <option value="completed">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-sm text-gray-500">Pending Orders</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-purple-600">{stats.inTransit}</p>
          <p className="text-sm text-gray-500">In Transit</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
          <p className="text-sm text-gray-500">Delivered</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
          <p className="text-sm text-gray-500">Cancelled</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pickup → Drop</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Package</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-10 text-center text-gray-500">
                    {loading ? 'Loading...' : 'No deliveries found'}
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((delivery) => (
                  <tr key={delivery._id || delivery.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3 text-sm font-medium text-gray-900">
                      #{delivery._id?.slice(-6) || delivery.id?.slice(-6) || 'N/A'}
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-gray-900">{getCustomerName(delivery)}</p>
                      <p className="text-xs text-gray-500">{getCustomerPhone(delivery)}</p>
                    </td>
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-sm text-gray-600">📦 {getFromLocation(delivery)}</p>
                        <p className="text-sm text-gray-600">📍 {getToLocation(delivery)}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{getWeight(delivery)} kg</span>
                        <span className="text-gray-300">|</span>
                        <span className="text-sm text-gray-600">{getPackageType(delivery)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-gray-900">₹{getFare(delivery)}</td>
                    <td className="px-5 py-3">{getStatusBadge(delivery.status)}</td>
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

export default GoodsDelivery;