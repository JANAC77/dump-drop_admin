import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, Phone, Mail, MapPin, Calendar, Star, Car, 
  CreditCard, Shield, Edit2, Save, X, ArrowLeft, 
  CheckCircle, XCircle, AlertCircle, Clock, FileText, 
  Eye, Truck, Package, IdCard, Award, Wrench, Ban,
  Users, Weight, Box, Ruler, Fuel, Navigation,
  Info, Building, Hash, Calendar as CalIcon, DollarSign,
  TrendingUp, Activity, Smartphone, Home, CreditCard as CardIcon,
  Layers, Settings, Key, Camera, Image, File, CheckSquare,
  Sparkles, Briefcase
} from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

function DriverProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [driverType, setDriverType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showUnapproveModal, setShowUnapproveModal] = useState(false);
  const [unapproveReason, setUnapproveReason] = useState('');

  useEffect(() => {
    fetchDriverDetails();
  }, [id]);

  const fetchDriverDetails = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getDriverById(id);
      console.log('Driver API Response:', response);
      
      let driverData = null;
      if (response.data?.data) {
        driverData = response.data.data;
      } else if (response.data?.driver) {
        driverData = response.data.driver;
      } else if (response.data) {
        driverData = response.data;
      }
      
      console.log('Processed driver data:', driverData);
      
      // Determine driver type based on vehicleType and available fields
      if (driverData) {
        const vehicleType = (driverData.vehicleType || '').toLowerCase();
        const goodsTypes = ['truck', 'container', 'multi axle', 'multiaxle', 'pickup', 'goods', 'lorry', 'trailer'];
        const cabTypes = ['car', 'van', 'suv', 'cab', 'sedan', 'hatchback', 'muv'];
        
        if (goodsTypes.some(type => vehicleType.includes(type))) {
          setDriverType('goods');
        } else if (cabTypes.some(type => vehicleType.includes(type))) {
          setDriverType('cab');
        } else if (driverData.seatCapacity !== undefined && driverData.seatCapacity !== null) {
          setDriverType('cab');
        } else if (driverData.capacity !== undefined || driverData.vehicleSize !== undefined) {
          setDriverType('goods');
        } else {
          setDriverType('unknown');
        }
      }
      
      setDriver(driverData);
      setEditForm(driverData || {});
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

  const handleUnapproveDriver = async () => {
    try {
      await adminAPI.verifyDriver(id, 'pending', unapproveReason);
      toast.success('Driver has been unapproved successfully!');
      setShowUnapproveModal(false);
      setUnapproveReason('');
      fetchDriverDetails();
    } catch (error) {
      toast.error('Failed to unapprove driver');
    }
  };

  // Helper function to check if a value exists and is not empty
  const hasValue = (value) => {
    return value !== undefined && value !== null && value !== '' && value !== 'N/A';
  };

  // Common getters with fallback
  const getValue = (value, fallback = 'N/A') => {
    return (value !== undefined && value !== null && value !== '') ? value : fallback;
  };

  const getFullName = () => driver?.fullName || driver?.name || 'N/A';
  const getPhone = () => driver?.phone || driver?.userId?.phone || 'N/A';
  const getEmail = () => driver?.email || driver?.userId?.email || 'Not provided';
  const getAddress = () => driver?.address || 'Not set';
  const getStatus = () => driver?.status || 'pending';
  const getRating = () => driver?.rating || 4.5;
  const getTotalRides = () => driver?.totalRides || 0;
  const getTotalEarnings = () => driver?.totalEarnings || 0;
  const getIsOnline = () => driver?.isOnline || false;

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/drivers')} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Driver Profile</h1>
            <p className="text-sm text-gray-500 mt-1">
              {driverType === 'cab' ? '🚖 Cab Driver' : driverType === 'goods' ? '🚚 Goods Driver' : 'Driver'} 
              | ID: {driver.userId || driver._id?.slice(-8)}
            </p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          {getStatus() === 'approved' && (
            <button 
              onClick={() => setShowUnapproveModal(true)} 
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition flex items-center gap-2"
            >
              <Ban className="w-4 h-4" />
              Unapprove Driver
            </button>
          )}
          
          <span className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
            getStatus() === 'approved' ? 'bg-green-100 text-green-700' :
            getStatus() === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
          }`}>
            {getStatus() === 'approved' ? <CheckCircle className="w-4 h-4" /> :
             getStatus() === 'pending' ? <Clock className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {getStatus().charAt(0).toUpperCase() + getStatus().slice(1)}
          </span>
          
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

      {/* Profile Header Card */}
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden`}>
        <div className={`bg-gradient-to-r ${driverType === 'cab' ? 'from-purple-600 to-pink-500' : driverType === 'goods' ? 'from-green-600 to-emerald-500' : 'from-gray-600 to-gray-500'} px-6 py-8`}>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                {driverType === 'cab' ? 
                  <Car className="w-12 h-12 text-white" /> : 
                  driverType === 'goods' ?
                  <Truck className="w-12 h-12 text-white" /> :
                  <User className="w-12 h-12 text-white" />
                }
              </div>
              <div className="absolute -bottom-2 -right-2">
                {getStatus() === 'approved' ? (
                  <CheckCircle className="w-6 h-6 text-green-400 bg-white rounded-full" />
                ) : getStatus() === 'pending' ? (
                  <Clock className="w-6 h-6 text-yellow-400 bg-white rounded-full" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-400 bg-white rounded-full" />
                )}
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-white">{getFullName()}</h2>
              <p className="text-purple-100">Member since {driver.createdAt ? new Date(driver.createdAt).toLocaleDateString() : 'N/A'}</p>
              <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-white">{getRating()} ⭐</span>
                <span className="text-purple-200">•</span>
                <span className="text-purple-100">{getTotalRides()} rides</span>
                <span className="text-purple-200">•</span>
                <span className="text-purple-100">{getIsOnline() ? '🟢 Online' : '🔴 Offline'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 border-b border-gray-100 bg-gray-50">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">₹{getTotalEarnings().toLocaleString()}</p>
            <p className="text-xs text-gray-500">Total Earnings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{getTotalRides()}</p>
            <p className="text-xs text-gray-500">Total Rides</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">₹{getValue(driver.todayEarnings, 0).toLocaleString()}</p>
            <p className="text-xs text-gray-500">Today's Earnings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">₹{getValue(driver.monthlyEarnings, 0).toLocaleString()}</p>
            <p className="text-xs text-gray-500">Monthly Earnings</p>
          </div>
        </div>

        {/* Personal Information - Always Show */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Personal Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div><p className="text-xs text-gray-500">Full Name</p><p className="text-sm font-medium text-gray-900">{getFullName()}</p></div>
            <div><p className="text-xs text-gray-500">Phone Number</p><p className="text-sm text-gray-900">{getPhone()}</p></div>
            {hasValue(driver.email) && <div><p className="text-xs text-gray-500">Email</p><p className="text-sm text-gray-900">{getEmail()}</p></div>}
            {hasValue(driver.dob) && <div><p className="text-xs text-gray-500">Date of Birth</p><p className="text-sm text-gray-900">{new Date(driver.dob).toLocaleDateString()}</p></div>}
            {hasValue(driver.address) && <div><p className="text-xs text-gray-500">Address</p><p className="text-sm text-gray-900">{driver.address}</p></div>}
            {hasValue(driver.pincode) && <div><p className="text-xs text-gray-500">Pincode</p><p className="text-sm text-gray-900">{driver.pincode}</p></div>}
            {hasValue(driver.emergencyName) && <div><p className="text-xs text-gray-500">Emergency Contact</p><p className="text-sm text-gray-900">{driver.emergencyName} ({driver.emergencyPhone || 'N/A'})</p></div>}
          </div>
        </div>

        {/* Vehicle Information - Only if vehicle data exists */}
        {(hasValue(driver.vehicleType) || hasValue(driver.regNumber) || hasValue(driver.brand)) && (
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              {driverType === 'cab' ? <Car className="w-5 h-5 text-blue-600" /> : <Truck className="w-5 h-5 text-green-600" />}
              Vehicle Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {hasValue(driver.vehicleType) && <div><p className="text-xs text-gray-500">Vehicle Type</p><p className="text-sm font-medium text-gray-900">{driver.vehicleType}</p></div>}
              {hasValue(driver.regNumber) && <div><p className="text-xs text-gray-500">Registration Number</p><p className="text-sm text-gray-900">{driver.regNumber}</p></div>}
              {hasValue(driver.brand) && <div><p className="text-xs text-gray-500">Brand / Model</p><p className="text-sm text-gray-900">{driver.brand} {driver.model || ''}</p></div>}
              {hasValue(driver.year) && <div><p className="text-xs text-gray-500">Year / Color</p><p className="text-sm text-gray-900">{driver.year} / {driver.color || 'N/A'}</p></div>}
              {hasValue(driver.rcNumber) && <div><p className="text-xs text-gray-500">RC Number</p><p className="text-sm text-gray-900">{driver.rcNumber}</p></div>}
              
              {/* Cab Specific Fields */}
              {driverType === 'cab' && hasValue(driver.seatCapacity) && (
                <div><p className="text-xs text-gray-500">Seat Capacity</p><p className="text-sm text-gray-900">{driver.seatCapacity} seats</p></div>
              )}
              {driverType === 'cab' && hasValue(driver.isAC) && (
                <div><p className="text-xs text-gray-500">AC Available</p><p className="text-sm text-gray-900">{driver.isAC ? 'Yes' : 'No'}</p></div>
              )}
              
              {/* Goods Specific Fields - Show only if they exist in DB */}
              {driverType === 'goods' && hasValue(driver.capacity) && (
                <div><p className="text-xs text-gray-500">Capacity</p><p className="text-sm text-gray-900">{driver.capacity} tons</p></div>
              )}
              {driverType === 'goods' && hasValue(driver.vehicleSize) && (
                <div><p className="text-xs text-gray-500">Vehicle Size</p><p className="text-sm text-gray-900">{driver.vehicleSize}</p></div>
              )}
              {driverType === 'goods' && hasValue(driver.permitNumber) && (
                <div><p className="text-xs text-gray-500">Permit Number</p><p className="text-sm text-gray-900">{driver.permitNumber}</p></div>
              )}
              {driverType === 'goods' && hasValue(driver.vehicleTypeId) && (
                <div><p className="text-xs text-gray-500">Vehicle Type ID</p><p className="text-sm text-gray-900">{driver.vehicleTypeId}</p></div>
              )}
            </div>
          </div>
        )}

        {/* ID & License Documents - Only if data exists */}
        {(hasValue(driver.idType) || hasValue(driver.dlNumber)) && (
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <IdCard className="w-5 h-5 text-red-600" />
              ID & License Documents
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {hasValue(driver.idType) && <div><p className="text-xs text-gray-500">ID Type</p><p className="text-sm text-gray-900">{driver.idType}</p></div>}
              {hasValue(driver.idNumber) && <div><p className="text-xs text-gray-500">ID Number</p><p className="text-sm text-gray-900">{driver.idNumber}</p></div>}
              {hasValue(driver.dlNumber) && <div><p className="text-xs text-gray-500">Driving License No.</p><p className="text-sm text-gray-900">{driver.dlNumber}</p></div>}
              {hasValue(driver.dlValidFrom) && <div><p className="text-xs text-gray-500">License Valid From</p><p className="text-sm text-gray-900">{new Date(driver.dlValidFrom).toLocaleDateString()}</p></div>}
              {hasValue(driver.dlValidTo) && <div><p className="text-xs text-gray-500">License Valid To</p><p className="text-sm text-gray-900">{new Date(driver.dlValidTo).toLocaleDateString()}</p></div>}
            </div>
          </div>
        )}

        {/* Insurance & PUC - Only if data exists */}
        {(hasValue(driver.insuranceNumber) || hasValue(driver.pucExpiry)) && (
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-orange-600" />
              Insurance & PUC
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {hasValue(driver.insuranceNumber) && <div><p className="text-xs text-gray-500">Insurance Number</p><p className="text-sm text-gray-900">{driver.insuranceNumber}</p></div>}
              {hasValue(driver.insuranceExpiry) && <div><p className="text-xs text-gray-500">Insurance Expiry</p><p className="text-sm text-gray-900">{new Date(driver.insuranceExpiry).toLocaleDateString()}</p></div>}
              {hasValue(driver.pucExpiry) && <div><p className="text-xs text-gray-500">PUC Expiry</p><p className="text-sm text-gray-900">{new Date(driver.pucExpiry).toLocaleDateString()}</p></div>}
            </div>
          </div>
        )}

        {/* Location - Only if exists */}
        {hasValue(driver.location?.lat) && (
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-purple-600" />
              Current Location
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-500">Latitude</p><p className="text-sm font-mono text-gray-900">{driver.location.lat}</p></div>
              <div><p className="text-xs text-gray-500">Longitude</p><p className="text-sm font-mono text-gray-900">{driver.location.lng}</p></div>
            </div>
            <div className="mt-4">
              <a 
                href={`https://www.google.com/maps?q=${driver.location.lat},${driver.location.lng}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                <MapPin className="w-4 h-4" />
                View on Google Maps
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Unapprove Modal */}
      {showUnapproveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Unapprove Driver</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to unapprove {getFullName()}? This will change their status to pending.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for unapproving (optional)
              </label>
              <textarea 
                value={unapproveReason} 
                onChange={(e) => setUnapproveReason(e.target.value)} 
                placeholder="Optional: Enter reason for unapproving..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                rows="3"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowUnapproveModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button 
                onClick={handleUnapproveDriver} 
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700"
              >
                Confirm Unapprove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DriverProfile;