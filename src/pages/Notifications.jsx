import React, { useState } from 'react';
import { Bell, Send, Users, UserCog, Car, Package, X, CheckCircle, AlertCircle } from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

function Notifications() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('all');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!title || !message) {
      toast.error('Please enter both title and message');
      return;
    }
    setSending(true);
    try {
      await adminAPI.sendNotification({ title, message, targetAudience });
      toast.success(`Notification sent to ${targetAudience} successfully`);
      setTitle('');
      setMessage('');
    } catch (error) {
      toast.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Notifications</h1><p className="text-sm text-gray-500 mt-1">Send push notifications to users</p></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Compose Notification</h3>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notification title..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Message</label><textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Notification message..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows="5" /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Target Audience</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition"><input type="radio" name="audience" value="all" checked={targetAudience === 'all'} onChange={(e) => setTargetAudience(e.target.value)} className="w-4 h-4 text-blue-600" /><Users className="w-5 h-5 text-gray-400" /><div><p className="font-medium text-gray-900">All Users</p><p className="text-xs text-gray-500">Send to all customers and drivers</p></div></label>
            <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition"><input type="radio" name="audience" value="customers" checked={targetAudience === 'customers'} onChange={(e) => setTargetAudience(e.target.value)} className="w-4 h-4 text-blue-600" /><UserCog className="w-5 h-5 text-gray-400" /><div><p className="font-medium text-gray-900">Customers Only</p><p className="text-xs text-gray-500">Send only to customers</p></div></label>
            <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition"><input type="radio" name="audience" value="drivers" checked={targetAudience === 'drivers'} onChange={(e) => setTargetAudience(e.target.value)} className="w-4 h-4 text-blue-600" /><UserCog className="w-5 h-5 text-gray-400" /><div><p className="font-medium text-gray-900">Drivers Only</p><p className="text-xs text-gray-500">Send only to drivers</p></div></label>
          </div>
          <button onClick={handleSend} disabled={sending} className="w-full mt-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-medium hover:opacity-90 transition flex items-center justify-center gap-2">{sending ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Send className="w-4 h-4" />}Send Notification</button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3"><Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" /><div><p className="text-sm text-blue-800 font-medium">Notification Info</p><p className="text-xs text-blue-600 mt-1">Notifications will be sent to all users via push notification. Make sure users have enabled notifications.</p></div></div>
    </div>
  );
}

export default Notifications;