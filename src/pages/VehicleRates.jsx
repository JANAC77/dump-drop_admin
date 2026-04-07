import React, { useState, useEffect } from 'react';
import { Save, Car, Package, TrendingUp, DollarSign } from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

function VehicleRates() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const updateRate = (vehicleId, field, value) => {
    setVehicles(prev => prev.map(v => v._id === vehicleId ? { ...v, [field]: parseInt(value) || 0 } : v));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const vehicle of vehicles) {
        await adminAPI.updateVehicle(vehicle._id, { basePrice: vehicle.basePrice, perKm: vehicle.perKm });
      }
      toast.success('Rates updated successfully');
    } catch (error) {
      toast.error('Failed to update rates');
    } finally {
      setSaving(false);
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Rate Management</h1>
          <p className="text-sm text-gray-500 mt-1">Configure pricing for different vehicle types</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2">
          {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Save className="w-4 h-4" />}
          Save All Changes
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base Price (₹)</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Per KM (₹)</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Example Fare (10km)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vehicles.map((vehicle) => (
                <tr key={vehicle._id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        {vehicle.type === 'cab' ? <Car className="w-4 h-4 text-blue-600" /> : <Package className="w-4 h-4 text-green-600" />}
                      </div>
                      <span className="font-medium text-gray-900">{vehicle.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm text-gray-600">{vehicle.type === 'cab' ? 'Cab Ride' : 'Goods Delivery'}</span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{vehicle.capacity} seats</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">₹</span>
                      <input type="number" value={vehicle.basePrice} onChange={(e) => updateRate(vehicle._id, 'basePrice', e.target.value)} className="w-24 px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">₹</span>
                      <input type="number" value={vehicle.perKm} onChange={(e) => updateRate(vehicle._id, 'perKm', e.target.value)} className="w-24 px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-medium text-gray-900">₹{vehicle.basePrice + (vehicle.perKm * 10)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-800 font-medium">Pricing Information</p>
          <p className="text-xs text-blue-600 mt-1">Base price is added to the per KM rate multiplied by distance. Example: 10km ride = Base Price + (10 × Per KM Rate)</p>
        </div>
      </div>
    </div>
  );
}

export default VehicleRates;