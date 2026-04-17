import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Phone, Mail, MapPin, Calendar, Star, ArrowLeft, CheckCircle, XCircle, AlertCircle, RefreshCw, Ban } from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

function CustomerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  const fetchCustomerDetails = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getUserDetails(id);
      
      let customerData = null;
      if (response.data?.data) {
        customerData = response.data.data;
      } else if (response.data?.user) {
        customerData = response.data.user;
      } else if (response.data) {
        customerData = response.data;
      }

      setCustomer(customerData);
    } catch (error) {
      console.error('Error fetching customer:', error);
      toast.error('Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async () => {
    if (!blockReason) {
      toast.error('Please provide a reason for blocking');
      return;
    }
    try {
      await adminAPI.updateUserStatus(id, 'blocked', blockReason);
      toast.success('User blocked successfully');
      setShowBlockModal(false);
      setBlockReason('');
      fetchCustomerDetails();
    } catch (error) {
      toast.error('Failed to block user');
    }
  };

  const handleUnblockUser = async () => {
    try {
      await adminAPI.updateUserStatus(id, 'active');
      toast.success('User unblocked successfully');
      fetchCustomerDetails();
    } catch (error) {
      toast.error('Failed to unblock user');
    }
  };

  const getName = () => customer?.name || customer?.fullName || 'N/A';
  const getPhone = () => customer?.phone || 'N/A';
  const getEmail = () => customer?.email || 'Not provided';
  const getAddress = () => customer?.address || 'Not set';
  const getStatus = () => customer?.isAdminVerified !== false ? 'active' : 'blocked';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Customer not found</h2>
        <button onClick={() => navigate('/users')} className="mt-4 text-blue-600 hover:underline">Back to Users</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/users')} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Profile</h1>
            <p className="text-sm text-gray-500 mt-1">View customer information</p>
          </div>
        </div>
        <div className="flex gap-3">
          {getStatus() === 'blocked' ? (
            <button onClick={handleUnblockUser} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Unblock
            </button>
          ) : (
            <button onClick={() => setShowBlockModal(true)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition flex items-center gap-2">
              <Ban className="w-4 h-4" />
              Block
            </button>
          )}
          <button
            onClick={fetchCustomerDetails}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1">
                {getStatus() === 'active' ? (
                  <CheckCircle className="w-5 h-5 text-green-400 bg-white rounded-full" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400 bg-white rounded-full" />
                )}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{getName()}</h2>
              <p className="text-blue-100 text-sm">Customer since {customer?.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}</p>
              <div className="flex items-center gap-2 mt-1">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-white text-sm">{customer?.rating || 4.5}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Contact Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-900">{getPhone()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-900">{getEmail()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-900">{customer?.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-900 truncate">{getAddress()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Block Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Block User</h3>
            <p className="text-sm text-gray-600 mb-3">Are you sure you want to block {getName()}?</p>
            <textarea 
              value={blockReason} 
              onChange={(e) => setBlockReason(e.target.value)} 
              placeholder="Reason for blocking..." 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4" 
              rows="3" 
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowBlockModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleBlockUser} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Block</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerProfile;