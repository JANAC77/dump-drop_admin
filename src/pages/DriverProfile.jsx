import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Phone, Mail, MapPin, Calendar, Star, Car, CreditCard, Shield, Edit2, Save, X, ArrowLeft, CheckCircle, XCircle, AlertCircle, Clock, FileText, Eye } from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

function DriverProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('approved');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchDriverDetails();
  }, [id]);

  const fetchDriverDetails = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getDriverDetails(id);
      setDriver(response.data);
      setEditForm(response.data);
    } catch (error) {
      console.error('Error fetching driver:', error);
      toast.error('Failed to load driver details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await adminAPI.updateDriver(id, editForm);
      setDriver(editForm);
      setEditing(false);
      toast.success('Driver profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleVerifyDriver = async () => {
    try {
      await adminAPI.verifyDriver(id, verificationStatus, rejectionReason);
      toast.success(`Driver ${verificationStatus === 'approved' ? 'approved' : 'rejected'} successfully`);
      setShowVerifyModal(false);
      fetchDriverDetails();
    } catch (error) {
      toast.error('Failed to update verification status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Driver not found</h2>
        <button onClick={() => navigate('/drivers')} className="mt-4 text-blue-600 hover:underline">Back to Drivers</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/drivers')} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Driver Profile</h1>
            <p className="text-sm text-gray-500 mt-1">View and manage driver information</p>
          </div>
        </div>
        <div className="flex gap-3">
          {driver.verificationStatus !== 'approved' && (
            <button onClick={() => setShowVerifyModal(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Verify Driver
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2">
                {driver.verificationStatus === 'approved' ? (
                  <CheckCircle className="w-6 h-6 text-green-400 bg-white rounded-full" />
                ) : driver.verificationStatus === 'pending' ? (
                  <Clock className="w-6 h-6 text-yellow-400 bg-white rounded-full" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-400 bg-white rounded-full" />
                )}
              </div>
            </div>
            <div className="text-center sm:text-left">
              {editing ? (
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="text-2xl font-bold text-white bg-white/20 rounded-lg px-3 py-1 mb-2" />
              ) : (
                <h2 className="text-2xl font-bold text-white">{driver.name}</h2>
              )}
              <p className="text-purple-100">Driver since {new Date(driver.createdAt).toLocaleDateString()}</p>
              <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-white">{driver.rating || 4.8} rating</span>
                <span className="text-purple-200">•</span>
                <span className="text-purple-100">{driver.totalRides || 0} rides completed</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 border-b border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">₹{driver.totalEarnings || 0}</p>
            <p className="text-xs text-gray-500">Total Earnings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{driver.totalRides || 0}</p>
            <p className="text-xs text-gray-500">Rides Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{driver.acceptanceRate || 95}%</p>
            <p className="text-xs text-gray-500">Acceptance Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{driver.onTimeRate || 98}%</p>
            <p className="text-xs text-gray-500">On-Time Rate</p>
          </div>
        </div>

        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Phone Number</p>
                {editing ? <input type="tel" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className="text-sm text-gray-900 border rounded-lg px-2 py-1" /> : <p className="text-sm text-gray-900">{driver.phone}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Email Address</p>
                {editing ? <input type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="text-sm text-gray-900 border rounded-lg px-2 py-1" /> : <p className="text-sm text-gray-900">{driver.email || 'Not provided'}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Joined Date</p>
                <p className="text-sm text-gray-900">{new Date(driver.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Address</p>
                {editing ? <input type="text" value={editForm.address} onChange={(e) => setEditForm({...editForm, address: e.target.value})} className="text-sm text-gray-900 border rounded-lg px-2 py-1" /> : <p className="text-sm text-gray-900">{driver.address || 'Not set'}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Verify Driver</h3>
            <p className="text-sm text-gray-600 mb-4">Review {driver.name}'s documents and verify their status</p>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Verification Decision</label>
                <select value={verificationStatus} onChange={(e) => setVerificationStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="approved">✅ Approve Driver</option>
                  <option value="rejected">❌ Reject Driver</option>
                </select>
              </div>
              {verificationStatus === 'rejected' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason</label>
                  <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Why is this driver being rejected?" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3" />
                </div>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowVerifyModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleVerifyDriver} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">Confirm Verification</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DriverProfile;