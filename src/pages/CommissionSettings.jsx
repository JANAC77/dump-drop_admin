import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Save,
  TrendingUp,
  AlertCircle,
  Car,
  Package,
  Percent,
  Gift,
  Shield,
  Info,
  Edit2,
  X,
  Calculator,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

function CommissionSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [settings, setSettings] = useState({
    cabCommission: 15,
    cabDriverCommission: 80,
    cabMinFare: 50,
    cabMaxCommissionCap: 500,
    goodsCommission: 12,
    goodsDriverCommission: 80,
    goodsMinFare: 100,
    goodsMaxCommissionCap: 1000,
    gstPercentage: 18,
    serviceTax: 5,
    cessTax: 2,
    convenienceFee: 10,
    cancellationFee: 50,
    cancellationTimeLimit: 10,
    promoCodeDiscount: 10,
    maxPromoDiscount: 200,
    referralBonus: 50,
    driverDailyLimit: 1000,
    driverWeeklyLimit: 5000,
  });

  const [tempSettings, setTempSettings] = useState(settings);
  const [calculation, setCalculation] = useState(null);
  const [calcType, setCalcType] = useState('cab');
  const [calcFare, setCalcFare] = useState(500);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    calculateCommission();
  }, [calcType, calcFare, tempSettings]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getCommissionSettings();
      if (response.data?.data) {
        setSettings(response.data.data);
        setTempSettings(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load commission settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await adminAPI.updateCommissionSettings(tempSettings);
      if (response.data.success) {
        setSettings(tempSettings);
        setEditing(false);
        toast.success('Commission settings saved successfully');
      }
    } catch (error) {
      toast.error('Failed to save commission settings');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setTempSettings(settings);
    setEditing(false);
  };

  const updateSetting = (key, value) => {
    setTempSettings(prev => ({ ...prev, [key]: value }));
  };

  const calculateCommission = async () => {
    try {
      const response = await adminAPI.calculateCommission({
        type: calcType,
        fare: calcFare
      });
      if (response.data?.calculation) {
        setCalculation(response.data.calculation);
      }
    } catch (error) {
      console.error('Calculation error:', error);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commission Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure platform commission and fee structures</p>
        </div>
        <div className="flex gap-3">
          {editing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit Settings
            </button>
          )}
          <button
            onClick={fetchSettings}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-800 font-medium">Real-time Commission Calculation</p>
          <p className="text-xs text-blue-600 mt-1">Changes made here will be saved to database and applied to all future rides in real-time.</p>
        </div>
      </div>

      {/* Live Calculator */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5" />
          <h3 className="font-semibold">Live Commission Calculator</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm text-white/80 mb-1">Ride Type</label>
            <select
              value={calcType}
              onChange={(e) => setCalcType(e.target.value)}
              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white"
            >
              <option value="cab" className="text-gray-900">Cab Ride</option>
              <option value="goods" className="text-gray-900">Goods Delivery</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Fare Amount (₹)</label>
            <input
              type="number"
              value={calcFare}
              onChange={(e) => setCalcFare(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={calculateCommission}
              className="w-full py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition"
            >
              Calculate
            </button>
          </div>
        </div>

        {calculation && (
          <div className="bg-white/10 rounded-lg p-4 mt-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-white/70">Commission</p>
                <p className="text-xl font-bold">₹{calculation.commission}</p>
                <p className="text-xs text-white/50">({calculation.settings.commissionPercentage}%)</p>
              </div>
              <div>
                <p className="text-xs text-white/70">Driver Earnings</p>
                <p className="text-xl font-bold">₹{calculation.driverEarning}</p>
                <p className="text-xs text-white/50">({calculation.settings.driverPercentage}%)</p>
              </div>
              <div>
                <p className="text-xs text-white/70">GST</p>
                <p className="text-xl font-bold">₹{calculation.gst}</p>
                <p className="text-xs text-white/50">({calculation.settings.gstPercentage}%)</p>
              </div>
              <div>
                <p className="text-xs text-white/70">Platform Earns</p>
                <p className="text-xl font-bold">₹{calculation.platformEarning}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cab Commission Card */}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Platform Commission (%)
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={tempSettings.cabCommission}
                  onChange={(e) => updateSetting('cabCommission', parseInt(e.target.value) || 0)}
                  disabled={!editing}
                  className={`w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!editing ? 'bg-gray-50' : ''}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Driver Commission (%)
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={tempSettings.cabDriverCommission}
                  onChange={(e) => updateSetting('cabDriverCommission', parseInt(e.target.value) || 0)}
                  disabled={!editing}
                  className={`w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!editing ? 'bg-gray-50' : ''}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Fare (₹)
                </label>
                <input
                  type="number"
                  value={tempSettings.cabMinFare}
                  onChange={(e) => updateSetting('cabMinFare', parseInt(e.target.value) || 0)}
                  disabled={!editing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!editing ? 'bg-gray-50' : ''}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Commission Cap (₹)
                </label>
                <input
                  type="number"
                  value={tempSettings.cabMaxCommissionCap}
                  onChange={(e) => updateSetting('cabMaxCommissionCap', parseInt(e.target.value) || 0)}
                  disabled={!editing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!editing ? 'bg-gray-50' : ''}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Goods Delivery Commission Card */}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Platform Commission (%)
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={tempSettings.goodsCommission}
                  onChange={(e) => updateSetting('goodsCommission', parseInt(e.target.value) || 0)}
                  disabled={!editing}
                  className={`w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!editing ? 'bg-gray-50' : ''}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Driver Commission (%)
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={tempSettings.goodsDriverCommission}
                  onChange={(e) => updateSetting('goodsDriverCommission', parseInt(e.target.value) || 0)}
                  disabled={!editing}
                  className={`w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!editing ? 'bg-gray-50' : ''}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Fare (₹)
                </label>
                <input
                  type="number"
                  value={tempSettings.goodsMinFare}
                  onChange={(e) => updateSetting('goodsMinFare', parseInt(e.target.value) || 0)}
                  disabled={!editing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!editing ? 'bg-gray-50' : ''}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Commission Cap (₹)
                </label>
                <input
                  type="number"
                  value={tempSettings.goodsMaxCommissionCap}
                  onChange={(e) => updateSetting('goodsMaxCommissionCap', parseInt(e.target.value) || 0)}
                  disabled={!editing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!editing ? 'bg-gray-50' : ''}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tax & Fee Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Tax & Fees</h3>
                <p className="text-xs text-gray-500">Configure GST, taxes and other fees</p>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GST (%)
                </label>
                <input
                  type="number"
                  value={tempSettings.gstPercentage}
                  onChange={(e) => updateSetting('gstPercentage', parseInt(e.target.value) || 0)}
                  disabled={!editing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!editing ? 'bg-gray-50' : ''}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Tax (%)
                </label>
                <input
                  type="number"
                  value={tempSettings.serviceTax}
                  onChange={(e) => updateSetting('serviceTax', parseInt(e.target.value) || 0)}
                  disabled={!editing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!editing ? 'bg-gray-50' : ''}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cess Tax (%)
                </label>
                <input
                  type="number"
                  value={tempSettings.cessTax}
                  onChange={(e) => updateSetting('cessTax', parseInt(e.target.value) || 0)}
                  disabled={!editing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!editing ? 'bg-gray-50' : ''}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Convenience Fee (₹)
                </label>
                <input
                  type="number"
                  value={tempSettings.convenienceFee}
                  onChange={(e) => updateSetting('convenienceFee', parseInt(e.target.value) || 0)}
                  disabled={!editing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!editing ? 'bg-gray-50' : ''}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cancellation Fee (₹)
                </label>
                <input
                  type="number"
                  value={tempSettings.cancellationFee}
                  onChange={(e) => updateSetting('cancellationFee', parseInt(e.target.value) || 0)}
                  disabled={!editing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!editing ? 'bg-gray-50' : ''}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cancellation Time Limit (min)
                </label>
                <input
                  type="number"
                  value={tempSettings.cancellationTimeLimit}
                  onChange={(e) => updateSetting('cancellationTimeLimit', parseInt(e.target.value) || 0)}
                  disabled={!editing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!editing ? 'bg-gray-50' : ''}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Promo & Referral Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-amber-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-600 rounded-xl flex items-center justify-center">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Promotions & Referrals</h3>
                <p className="text-xs text-gray-500">Configure promo codes and referral bonuses</p>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Promo Code Discount (%)
                </label>
                <input
                  type="number"
                  value={tempSettings.promoCodeDiscount}
                  onChange={(e) => updateSetting('promoCodeDiscount', parseInt(e.target.value) || 0)}
                  disabled={!editing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!editing ? 'bg-gray-50' : ''}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Promo Discount (₹)
                </label>
                <input
                  type="number"
                  value={tempSettings.maxPromoDiscount}
                  onChange={(e) => updateSetting('maxPromoDiscount', parseInt(e.target.value) || 0)}
                  disabled={!editing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!editing ? 'bg-gray-50' : ''}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referral Bonus (₹)
              </label>
              <input
                type="number"
                value={tempSettings.referralBonus}
                onChange={(e) => updateSetting('referralBonus', parseInt(e.target.value) || 0)}
                disabled={!editing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!editing ? 'bg-gray-50' : ''}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Driver Earnings Limits */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Driver Earnings Limits
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Daily Earnings Limit (₹)
            </label>
            <input
              type="number"
              value={tempSettings.driverDailyLimit}
              onChange={(e) => updateSetting('driverDailyLimit', parseInt(e.target.value) || 0)}
              disabled={!editing}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!editing ? 'bg-gray-50' : ''}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weekly Earnings Limit (₹)
            </label>
            <input
              type="number"
              value={tempSettings.driverWeeklyLimit}
              onChange={(e) => updateSetting('driverWeeklyLimit', parseInt(e.target.value) || 0)}
              disabled={!editing}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!editing ? 'bg-gray-50' : ''}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommissionSettings;