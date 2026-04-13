import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Car, Package, Calendar, Download } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, PieChart, Pie, Cell } from 'recharts';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

function Revenue() {
  const [revenueData, setRevenueData] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    cabRevenue: 0,
    goodsRevenue: 0,
    platformCommission: 0,
    driverPayouts: 0,
    growth: 0
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchRevenueData();
  }, [period]);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const [revenueRes, statsRes] = await Promise.all([
        adminAPI.getRevenueData(period),
        adminAPI.getDashboardStats()
      ]);

      console.log('Revenue API Response:', revenueRes);
      console.log('Stats API Response:', statsRes);

      // Handle different response structures for revenue data
      let revenueArray = [];
      if (revenueRes.data?.data && Array.isArray(revenueRes.data.data)) {
        revenueArray = revenueRes.data.data;
      } else if (revenueRes.data && Array.isArray(revenueRes.data)) {
        revenueArray = revenueRes.data;
      } else if (revenueRes.data?.revenueData && Array.isArray(revenueRes.data.revenueData)) {
        revenueArray = revenueRes.data.revenueData;
      }

      console.log('Processed revenue data:', revenueArray);
      setRevenueData(revenueArray);

      // Handle stats response structure
      const statsData = statsRes.data?.data || statsRes.data || {};
      setStats({
        totalRevenue: statsData.totalRevenue || 0,
        cabRevenue: statsData.cabRevenue || 0,
        goodsRevenue: statsData.goodsRevenue || 0,
        platformCommission: statsData.platformCommission || 0,
        driverPayouts: statsData.driverPayouts || 0,
        growth: statsData.revenueGrowth || 0
      });
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      toast.error('Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  };

  // If no data, use mock data for demo
  const displayData = revenueData.length > 0 ? revenueData : [
    { name: 'Mon', revenue: 12000, rides: 45 },
    { name: 'Tue', revenue: 15000, rides: 52 },
    { name: 'Wed', revenue: 18000, rides: 60 },
    { name: 'Thu', revenue: 14000, rides: 48 },
    { name: 'Fri', revenue: 22000, rides: 75 },
    { name: 'Sat', revenue: 28000, rides: 90 },
    { name: 'Sun', revenue: 20000, rides: 68 },
  ];

  const pieData = [
    { name: 'Cab Rides', value: stats.cabRevenue || 50000, color: '#3b82f6' },
    { name: 'Goods Delivery', value: stats.goodsRevenue || 30000, color: '#10b981' },
  ];

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
          <h1 className="text-2xl font-bold text-gray-900">Revenue Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Track platform revenue and earnings</p>
        </div>
        <div className="flex gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg"><DollarSign className="w-5 h-5 text-green-600" /></div>
            <span className={`text-xs font-medium ${stats.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.growth >= 0 ? '+' : ''}{stats.growth}%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">Total Revenue</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="p-2 bg-blue-100 rounded-lg w-fit mb-3"><Car className="w-5 h-5 text-blue-600" /></div>
          <p className="text-2xl font-bold text-gray-900">₹{stats.cabRevenue.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">Cab Rides Revenue</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="p-2 bg-green-100 rounded-lg w-fit mb-3"><Package className="w-5 h-5 text-green-600" /></div>
          <p className="text-2xl font-bold text-gray-900">₹{stats.goodsRevenue.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">Goods Delivery Revenue</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="p-2 bg-purple-100 rounded-lg w-fit mb-3"><TrendingUp className="w-5 h-5 text-purple-600" /></div>
          <p className="text-2xl font-bold text-gray-900">₹{stats.platformCommission.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">Platform Commission</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={displayData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Revenue by Service</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Revenue Breakdown</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Platform Commission</span>
              <span className="font-medium">₹{stats.platformCommission.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${stats.totalRevenue ? (stats.platformCommission / stats.totalRevenue) * 100 : 0}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Driver Payouts</span>
              <span className="font-medium">₹{stats.driverPayouts.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: `${stats.totalRevenue ? (stats.driverPayouts / stats.totalRevenue) * 100 : 0}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Revenue;