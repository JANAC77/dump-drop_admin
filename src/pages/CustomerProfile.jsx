import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Phone, Mail, MapPin, Calendar, Star, Car, Package, CreditCard, Shield, Edit2, Save, X, ArrowLeft, CheckCircle, XCircle, AlertCircle, Clock, Ban } from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

function CustomerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  const fetchCustomerDetails = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getUserDetails(id);
      console.log('Customer API Response:', response);
      
      // Handle different response structures
      let customerData = null;
      if (response.data?.data) {
        customerData = response.data.data;
      } else if (response.data?.user) {
        customerData = response.data.user;
      } else if (response.data) {
        customerData = response.data;
      }
      
      console.log('Processed customer data:', customerData);
      setCustomer(customerData);
      setEditForm(customerData || {});
    } catch (error) {
      console.error('Error fetching customer:', error);
      toast.error('Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await adminAPI.updateUser(id, editForm);
      setCustomer(editForm);
      setEditing(false);
      toast.success('Customer profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
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

  // Safe getters
  const getName = () => customer?.name || customer?.fullName || 'N/A';
  const getPhone = () => customer?.phone || 'N/A';
  const getEmail = () => customer?.email || 'Not provided';
  const getAddress = () => customer?.address || 'Not set';
  const getStatus = () => customer?.status || customer?.isAdminVerified ? 'active' : 'pending';
  const getTotalRides = () => customer?.totalRides || 0;
  const getTotalSpent = () => customer?.totalSpent || 0;

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
            <p className="text-sm text-gray-500 mt-1">View and manage customer information</p>
          </div>
        </div>
        <div className="flex gap-3">
          {getStatus() === 'blocked' ? (
            <button onClick={handleUnblockUser} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Unblock User
            </button>
          ) : (
            <button onClick={() => setShowBlockModal(true)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition flex items-center gap-2">
              <Ban className="w-4 h-4" />
              Block User
            </button>
          )}
          {!editing ? (
            <button onClick={() => setEditing(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2">
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center gap-2">
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button onClick={handleSaveEdit} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2">
                {getStatus() === 'active' ? (
                  <CheckCircle className="w-6 h-6 text-green-400 bg-white rounded-full" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-400 bg-white rounded-full" />
                )}
              </div>
            </div>
            <div className="text-center sm:text-left">
              {editing ? (
                <input type="text" value={editForm.name || ''} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="text-2xl font-bold text-white bg-white/20 rounded-lg px-3 py-1 mb-2" />
              ) : (
                <h2 className="text-2xl font-bold text-white">{getName()}</h2>
              )}
              <p className="text-blue-100">Customer since {new Date(customer.createdAt).toLocaleDateString()}</p>
              <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-white">{customer.rating || 4.5} rating</span>
                <span className="text-blue-200">•</span>
                <span className="text-blue-100">{getTotalRides()} rides</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 border-b border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">₹{getTotalSpent()}</p>
            <p className="text-xs text-gray-500">Total Spent</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{getTotalRides()}</p>
            <p className="text-xs text-gray-500">Total Rides</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{customer.totalDeliveries || 0}</p>
            <p className="text-xs text-gray-500">Deliveries</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{customer.referralCount || 0}</p>
            <p className="text-xs text-gray-500">Referrals</p>
          </div>
        </div>

        {/* Personal Info */}
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Phone Number</p>
                {editing ? (
                  <input type="tel" value={editForm.phone || ''} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className="text-sm text-gray-900 border rounded-lg px-2 py-1" />
                ) : (
                  <p className="text-sm text-gray-900">{getPhone()}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Email Address</p>
                {editing ? (
                  <input type="email" value={editForm.email || ''} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="text-sm text-gray-900 border rounded-lg px-2 py-1" />
                ) : (
                  <p className="text-sm text-gray-900">{getEmail()}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Member Since</p>
                <p className="text-sm text-gray-900">{new Date(customer.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Default Address</p>
                {editing ? (
                  <input type="text" value={editForm.address || ''} onChange={(e) => setEditForm({...editForm, address: e.target.value})} className="text-sm text-gray-900 border rounded-lg px-2 py-1" />
                ) : (
                  <p className="text-sm text-gray-900">{getAddress()}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Rides */}
        {customer.rides && customer.rides.length > 0 && (
          <div className="p-6 border-t border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Rides</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Ride ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Route</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Fare</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customer.rides.map((ride) => (
                    <tr key={ride.id}>
                      <td className="px-4 py-2 text-sm text-gray-900">#{ride.id?.slice(-6)}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{ride.from} → {ride.to}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">{new Date(ride.date).toLocaleDateString()}</td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">₹{ride.fare}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          ride.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {ride.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Block Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Block User</h3>
            <p className="text-sm text-gray-600 mb-3">Are you sure you want to block {getName()}?</p>
            <textarea value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="Reason for blocking..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4" rows="3" />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowBlockModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleBlockUser} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Block User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerProfile;