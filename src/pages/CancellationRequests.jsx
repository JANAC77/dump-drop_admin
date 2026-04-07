import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, AlertCircle, Clock, User, MapPin, DollarSign, MessageCircle } from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

function CancellationRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCancellationRequests();
  }, []);

  const fetchCancellationRequests = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getRides(1, 100, { status: 'cancellation_requested' });
      setRequests(response.data.rides || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load cancellation requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request) => {
    try {
      await adminAPI.cancelRide(request._id, request.cancelReason);
      toast.success('Cancellation approved');
      fetchCancellationRequests();
    } catch (error) {
      toast.error('Failed to approve cancellation');
    }
  };

  const handleReject = async (request) => {
    try {
      await adminAPI.updateRideStatus(request._id, 'ongoing');
      toast.success('Cancellation rejected');
      fetchCancellationRequests();
    } catch (error) {
      toast.error('Failed to reject cancellation');
    }
  };

  const filteredRequests = requests.filter(req =>
    req.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req._id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cancellation Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Review and manage cancellation requests</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request ID</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ride Details</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-10 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-10 text-center text-gray-500">No cancellation requests found</td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3 text-sm font-medium text-gray-900">#{req._id?.slice(-6)}</td>
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{req.customer?.name}</p>
                        <p className="text-xs text-gray-500">{req.customer?.phone}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm text-gray-600">{req.from} → {req.to}</p>
                      <p className="text-xs text-gray-500">{new Date(req.date).toLocaleString()}</p>
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-gray-900">₹{req.fare}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => { setSelectedRequest(req); setShowModal(true); }}
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3" />
                        View Reason
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(req)} className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Approve
                        </button>
                        <button onClick={() => handleReject(req)} className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reason Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Cancellation Reason</h3>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700">{selectedRequest.cancelReason || 'No reason provided'}</p>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CancellationRequests;