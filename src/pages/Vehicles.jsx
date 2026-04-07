import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Car, Package, Truck, Save, X, AlertCircle } from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'cab',
    capacity: 4,
    basePrice: 100,
    perKm: 12,
    icon: 'car',
    description: '',
    image: ''
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getVehicles();
      setVehicles(response.data.vehicles || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingVehicle) {
        await adminAPI.updateVehicle(editingVehicle._id, formData);
        toast.success('Vehicle updated successfully');
      } else {
        await adminAPI.addVehicle(formData);
        toast.success('Vehicle added successfully');
      }
      setShowModal(false);
      setEditingVehicle(null);
      setFormData({ name: '', type: 'cab', capacity: 4, basePrice: 100, perKm: 12, icon: 'car', description: '', image: '' });
      fetchVehicles();
    } catch (error) {
      toast.error('Failed to save vehicle');
    }
  };

  const handleDelete = async (vehicleId) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await adminAPI.deleteVehicle(vehicleId);
        toast.success('Vehicle deleted successfully');
        fetchVehicles();
      } catch (error) {
        toast.error('Failed to delete vehicle');
      }
    }
  };

  const getTypeIcon = (type, iconName) => {
    if (iconName === 'car') return <Car className="w-5 h-5 text-blue-600" />;
    if (iconName === 'package') return <Package className="w-5 h-5 text-green-600" />;
    return <Truck className="w-5 h-5 text-purple-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicle Types</h1>
          <p className="text-sm text-gray-500 mt-1">Manage vehicle types and pricing</p>
        </div>
        <button
          onClick={() => { setEditingVehicle(null); setFormData({ name: '', type: 'cab', capacity: 4, basePrice: 100, perKm: 12, icon: 'car', description: '', image: '' }); setShowModal(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Vehicle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">No vehicles found</div>
        ) : (
          vehicles.map((vehicle) => (
            <div key={vehicle._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      {getTypeIcon(vehicle.type, vehicle.icon)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{vehicle.name}</h3>
                      <p className="text-xs text-gray-500">{vehicle.type === 'cab' ? 'Cab Ride' : 'Goods Delivery'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingVehicle(vehicle); setFormData(vehicle); setShowModal(true); }} className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(vehicle._id)} className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Capacity:</span>
                    <span className="font-medium text-gray-900">{vehicle.capacity} seats</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Base Price:</span>
                    <span className="font-medium text-gray-900">₹{vehicle.basePrice}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Per KM:</span>
                    <span className="font-medium text-gray-900">₹{vehicle.perKm}</span>
                  </div>
                </div>
                
                {vehicle.description && (
                  <p className="text-xs text-gray-500 border-t pt-3">{vehicle.description}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="cab">Cab Ride</option>
                  <option value="goods">Goods Delivery</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (seats)</label>
                <input type="number" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹)</label>
                <input type="number" value={formData.basePrice} onChange={(e) => setFormData({...formData, basePrice: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Per KM Rate (₹)</label>
                <input type="number" value={formData.perKm} onChange={(e) => setFormData({...formData, perKm: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows="2" />
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Vehicles;