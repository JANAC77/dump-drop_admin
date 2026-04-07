import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, CheckCircle, XCircle, User, Star, Car, Phone, Mail } from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

function Drivers() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getDrivers(1, 50, searchTerm);
      setDrivers(response.data.drivers || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDriver = (driverId) => {
    navigate(`/drivers/${driverId}`);
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
          <h1 className="text-2xl font-bold text-gray-900">Drivers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all registered drivers</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone or vehicle..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); fetchDrivers(); }}
            className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drivers.map((driver) => (
          <div key={driver._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition cursor-pointer" onClick={() => handleViewDriver(driver._id)}>
            <div className="p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                  <User className="w-7 h-7 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{driver.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm text-gray-600">{driver.rating || 4.8}</span>
                    <span className="text-xs text-gray-400">• {driver.totalRides || 0} rides</span>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  driver.verificationStatus === 'approved' ? 'bg-green-100 text-green-700' :
                  driver.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {driver.verificationStatus || 'pending'}
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600 flex items-center gap-2"><Phone className="w-4 h-4" /> {driver.phone}</p>
                <p className="text-sm text-gray-600 flex items-center gap-2"><Mail className="w-4 h-4" /> {driver.email || 'N/A'}</p>
                <p className="text-sm text-gray-600 flex items-center gap-2"><Car className="w-4 h-4" /> {driver.vehicle?.model || 'Not assigned'}</p>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">Total Earnings</p>
                  <p className="text-lg font-bold text-gray-900">₹{driver.totalEarnings || 0}</p>
                </div>
                <button className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Drivers;