import React, { useState, useEffect } from 'react';
import { DollarSign, Save, TrendingUp, AlertCircle, Car, Package, Percent } from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

function CommissionSettings() {
  const [settings, setSettings] = useState({
    cabCommission: 15,
    goodsCommission: 12,
    driverCommission: 80,
    cancellationFee: 50,
    minFareForCommission: 100,
    maxCommissionCap: 500,
    promoCodeDiscount: 10,
    referralBonus: 50,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getCommissionSettings();
      if (response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminAPI.updateCommissionSettings(settings);
      toast.success('Commission settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
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
          <h1 className="text-2xl font-bold text-gray-900">Commission Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure platform commission and fee structures</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2"
        >
          {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-800 font-medium">Commission Information</p>
          <p className="text-xs text-blue-600 mt-1">Commissions are calculated on the total ride/delivery fare before taxes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-cyan-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Cab Ride Commission</h3>
                <p className="text-xs text-gray-500">Commission earned from each cab ride</p>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Commission Percentage</label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={settings.cabCommission}
                  onChange={(e) => updateSetting('cabCommission', parseInt(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Example: ₹500 ride → Platform earns ₹{Math.round(500 * settings.cabCommission / 100)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Goods Delivery Commission</h3>
                <p className="text-xs text-gray-500">Commission earned from each goods delivery</p>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Commission Percentage</label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={settings.goodsCommission}
                  onChange={(e) => updateSetting('goodsCommission', parseInt(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Example: ₹800 delivery → Platform earns ₹{Math.round(800 * settings.goodsCommission / 100)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Driver Commission</h3>
                <p className="text-xs text-gray-500">Percentage drivers receive from each ride</p>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Driver Percentage</label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={settings.driverCommission}
                  onChange={(e) => updateSetting('driverCommission', parseInt(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Example: ₹500 ride → Driver earns ₹{Math.round(500 * settings.driverCommission / 100)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-red-50 to-orange-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Cancellation & Fees</h3>
                <p className="text-xs text-gray-500">Configure cancellation charges and limits</p>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cancellation Fee (₹)</label>
              <input
                type="number"
                value={settings.cancellationFee}
                onChange={(e) => updateSetting('cancellationFee', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Fare for Commission (₹)</label>
              <input
                type="number"
                value={settings.minFareForCommission}
                onChange={(e) => updateSetting('minFareForCommission', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Commission Cap (₹)</label>
              <input
                type="number"
                value={settings.maxCommissionCap}
                onChange={(e) => updateSetting('maxCommissionCap', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Commission Calculation Preview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Cab Ride Example</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Ride Fare:</span>
                <span className="font-medium">₹500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Platform Commission ({settings.cabCommission}%):</span>
                <span className="text-blue-600">- ₹{Math.round(500 * settings.cabCommission / 100)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">Driver Earnings:</span>
                <span className="font-semibold text-green-600">₹{Math.round(500 - (500 * settings.cabCommission / 100))}</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Goods Delivery Example</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery Fare:</span>
                <span className="font-medium">₹800</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Platform Commission ({settings.goodsCommission}%):</span>
                <span className="text-blue-600">- ₹{Math.round(800 * settings.goodsCommission / 100)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">Delivery Partner Earnings:</span>
                <span className="font-semibold text-green-600">₹{Math.round(800 - (800 * settings.goodsCommission / 100))}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommissionSettings;