import React, { useState, useEffect } from 'react';
import { Search, Eye, DollarSign, CheckCircle, Clock, AlertCircle, Download } from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

function Payouts() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchPayouts();
  }, [statusFilter]);

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getPayouts(1, 100, statusFilter !== 'all' ? statusFilter : '');
      setPayouts(response.data.payouts || []);
    } catch (error) {
      console.error('Error fetching payouts:', error);
      toast.error('Failed to load payouts');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayout = async (payoutId) => {
    try {
      await adminAPI.processPayout(payoutId);
      toast.success('Payout processed successfully');
      fetchPayouts();
    } catch (error) {
      toast.error('Failed to process payout');
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
      pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      failed: { color: 'bg-red-100 text-red-700', icon: AlertCircle },
    };
    const c = config[status] || config.pending;
    const Icon = c.icon;
    return (<span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${c.color}`}><Icon className="w-3 h-3" />{status}</span>);
  };

  const filteredPayouts = payouts.filter(p => p.driver?.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Driver Payouts</h1><p className="text-sm text-gray-500 mt-1">Manage driver earnings and payouts</p></div>
        <div className="flex gap-3">
          <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Search by driver..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" /></div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="all">All Status</option><option value="pending">Pending</option><option value="completed">Completed</option><option value="failed">Failed</option></select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2"><Download className="w-4 h-4" />Export</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr><th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payout ID</th><th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th><th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th><th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Rides</th><th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th><th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan="7" className="px-5 py-10 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></td></tr> : filteredPayouts.length === 0 ? <tr><td colSpan="7" className="px-5 py-10 text-center text-gray-500">No payouts found</td></tr> : filteredPayouts.map((payout) => (<tr key={payout._id} className="hover:bg-gray-50 transition"><td className="px-5 py-3 text-sm font-medium text-gray-900">#{payout._id?.slice(-6)}</td><td className="px-5 py-3"><div><p className="text-sm font-medium text-gray-900">{payout.driver?.name}</p><p className="text-xs text-gray-500">{payout.driver?.phone}</p></div></td><td className="px-5 py-3 text-sm text-gray-500">{payout.period || 'Monthly'}</td><td className="px-5 py-3 text-sm text-gray-600">{payout.totalRides || 0}</td><td className="px-5 py-3 text-sm font-bold text-gray-900">₹{payout.amount}</td><td className="px-5 py-3">{getStatusBadge(payout.status)}</td><td className="px-5 py-3">{payout.status === 'pending' && <button onClick={() => handleProcessPayout(payout._id)} className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700">Process</button>}</td></tr>))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Payouts;