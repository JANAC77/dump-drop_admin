import React, { useState, useEffect } from 'react';
import { Save, Globe, DollarSign, Shield, Bell, Mail, MapPin, Smartphone, Building, Users, Car, Package } from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

function Settings() {
  const [settings, setSettings] = useState({
    appName: 'Dump & Drop',
    supportEmail: 'support@dumpdrop.com',
    supportPhone: '+91 98765 43210',
    address: 'Ahmedabad, Gujarat, India',
    currency: 'INR',
    taxRate: 18,
    minRideFare: 50,
    maxDistanceKm: 100,
    cancellationTimeLimit: 10,
    enablePromoCodes: true,
    enableReferrals: true,
    enableSMSNotifications: true,
    enableEmailNotifications: true
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getSettings();
      if (response.data) setSettings({ ...settings, ...response.data });
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
      await adminAPI.updateSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><div><h1 className="text-2xl font-bold text-gray-900">Settings</h1><p className="text-sm text-gray-500 mt-1">Configure platform settings</p></div><button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2">{saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Save className="w-4 h-4" />}Save Changes</button></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"><h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Globe className="w-5 h-5 text-blue-600" />General Settings</h3><div className="space-y-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">App Name</label><input type="text" value={settings.appName} onChange={(e) => setSettings({...settings, appName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label><input type="email" value={settings.supportEmail} onChange={(e) => setSettings({...settings, supportEmail: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Support Phone</label><input type="text" value={settings.supportPhone} onChange={(e) => setSettings({...settings, supportPhone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Address</label><input type="text" value={settings.address} onChange={(e) => setSettings({...settings, address: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Currency</label><select value={settings.currency} onChange={(e) => setSettings({...settings, currency: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="INR">Indian Rupee (₹)</option><option value="USD">US Dollar ($)</option><option value="EUR">Euro (€)</option></select></div></div></div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"><h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-600" />Pricing Settings</h3><div className="space-y-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label><input type="number" value={settings.taxRate} onChange={(e) => setSettings({...settings, taxRate: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Minimum Ride Fare (₹)</label><input type="number" value={settings.minRideFare} onChange={(e) => setSettings({...settings, minRideFare: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Maximum Distance (km)</label><input type="number" value={settings.maxDistanceKm} onChange={(e) => setSettings({...settings, maxDistanceKm: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Cancellation Time Limit (minutes)</label><input type="number" value={settings.cancellationTimeLimit} onChange={(e) => setSettings({...settings, cancellationTimeLimit: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div></div></div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"><h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-purple-600" />Features</h3><div className="space-y-3"><label className="flex items-center justify-between cursor-pointer"><span className="text-sm text-gray-700">Enable Promo Codes</span><input type="checkbox" checked={settings.enablePromoCodes} onChange={(e) => setSettings({...settings, enablePromoCodes: e.target.checked})} className="w-4 h-4 text-blue-600 rounded" /></label><label className="flex items-center justify-between cursor-pointer"><span className="text-sm text-gray-700">Enable Referrals</span><input type="checkbox" checked={settings.enableReferrals} onChange={(e) => setSettings({...settings, enableReferrals: e.target.checked})} className="w-4 h-4 text-blue-600 rounded" /></label></div></div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"><h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Bell className="w-5 h-5 text-yellow-600" />Notifications</h3><div className="space-y-3"><label className="flex items-center justify-between cursor-pointer"><span className="text-sm text-gray-700">SMS Notifications</span><input type="checkbox" checked={settings.enableSMSNotifications} onChange={(e) => setSettings({...settings, enableSMSNotifications: e.target.checked})} className="w-4 h-4 text-blue-600 rounded" /></label><label className="flex items-center justify-between cursor-pointer"><span className="text-sm text-gray-700">Email Notifications</span><input type="checkbox" checked={settings.enableEmailNotifications} onChange={(e) => setSettings({...settings, enableEmailNotifications: e.target.checked})} className="w-4 h-4 text-blue-600 rounded" /></label></div></div>
      </div>
    </div>
  );
}

export default Settings;