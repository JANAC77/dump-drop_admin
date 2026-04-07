import React, { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle, XCircle, Clock, User, Car, IdCard, Shield, AlertCircle } from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

function DriverVerification() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('approved');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingDrivers();
  }, []);

  const fetchPendingDrivers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getDrivers(1, 100, 'pending');
      setDrivers(response.data.drivers || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast.error('Failed to load pending drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      await adminAPI.verifyDriver(selectedDriver._id, verificationStatus, rejectionReason);
      toast.success(`Driver ${verificationStatus === 'approved' ? 'approved' : 'rejected'} successfully`);
      setShowModal(false);
      fetchPendingDrivers();
    } catch (error) {
      toast.error('Failed to update verification status');
    }
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Driver Verification</h1>
          <p className="text-sm text-gray-500 mt-1">Verify pending driver registrations</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search drivers..."
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
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documents</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
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
              ) : filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-10 text-center text-gray-500">No pending verification requests</td>
                </tr>
              ) : (
                filteredDrivers.map((driver) => (
                  <tr key={driver._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{driver.name}</p>
                          <p className="text-xs text-gray-500">ID: {driver._id?.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm text-gray-600">{driver.phone}</p>
                      <p className="text-xs text-gray-500">{driver.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm text-gray-600">{driver.vehicle?.model || 'Not added'}</p>
                      <p className="text-xs text-gray-500">{driver.vehicle?.number}</p>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1">
                        {driver.documents?.drivingLicense && <IdCard className="w-4 h-4 text-green-600" title="License" />}
                        {driver.documents?.vehicleRC && <Car className="w-4 h-4 text-blue-600" title="RC" />}
                        {driver.documents?.insurance && <Shield className="w-4 h-4 text-yellow-600" title="Insurance" />}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">{new Date(driver.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => { setSelectedDriver(driver); setShowModal(true); }}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification Modal */}
      {showModal && selectedDriver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Verify Driver</h3>
              
              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Personal Information</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500">Name:</span> {selectedDriver.name}</div>
                    <div><span className="text-gray-500">Phone:</span> {selectedDriver.phone}</div>
                    <div><span className="text-gray-500">Email:</span> {selectedDriver.email || 'N/A'}</div>
                    <div><span className="text-gray-500">Address:</span> {selectedDriver.address || 'N/A'}</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Vehicle Information</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500">Model:</span> {selectedDriver.vehicle?.model || 'N/A'}</div>
                    <div><span className="text-gray-500">Number:</span> {selectedDriver.vehicle?.number || 'N/A'}</div>
                    <div><span className="text-gray-500">Type:</span> {selectedDriver.vehicle?.type || 'N/A'}</div>
                    <div><span className="text-gray-500">Capacity:</span> {selectedDriver.vehicle?.capacity || 'N/A'} seats</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Verification Decision</h4>
                  <select
                    value={verificationStatus}
                    onChange={(e) => setVerificationStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                  >
                    <option value="approved">✅ Approve Driver</option>
                    <option value="rejected">❌ Reject Driver</option>
                  </select>
                  {verificationStatus === 'rejected' && (
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Reason for rejection..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button onClick={handleVerify} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">Confirm Verification</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DriverVerification;