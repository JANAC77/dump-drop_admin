import React, { useState, useEffect } from 'react';
import { Search, Eye, MapPin, User, Calendar, DollarSign, XCircle, AlertCircle } from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

function CancelledOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchCancelledOrders();
  }, [typeFilter]);

  const fetchCancelledOrders = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getRides(1, 100, { status: 'cancelled', type: typeFilter !== 'all' ? typeFilter : undefined });
      setOrders(response.data.rides || []);
    } catch (error) {
      console.error('Error fetching cancelled orders:', error);
      toast.error('Failed to load cancelled orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order =>
    order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order._id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cancelled Orders</h1>
          <p className="text-sm text-gray-500 mt-1">View all cancelled rides and deliveries</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search cancelled orders..."
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">No cancelled orders found</div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
              <div className="bg-red-50 px-5 py-3 border-b border-red-100">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-700">Cancelled</span>
                  <span className="text-xs text-red-500 ml-auto">{new Date(order.cancelledAt || order.date).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Order ID</p>
                    <p className="text-sm font-medium text-gray-900">#{order._id?.slice(-8)}</p>
                  </div>
                  <span className="text-xs text-gray-500">{order.type === 'cab' ? 'Cab Ride' : 'Goods Delivery'}</span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.customer?.name || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{order.customer?.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-600">{order.from} → {order.to}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-500">{new Date(order.date).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <p className="text-lg font-bold text-gray-900">₹{order.fare}</p>
                  </div>
                </div>

                {order.cancelReason && (
                  <div className="bg-red-50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-red-600 font-medium mb-1">Cancellation Reason:</p>
                    <p className="text-xs text-red-700">{order.cancelReason}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CancelledOrders;