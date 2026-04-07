import React, { useState, useEffect } from 'react';
import { Users, Car, Calendar, DollarSign, TrendingUp, TrendingDown, ArrowRight, Download } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRides: 0,
    totalBookings: 0,
    totalRevenue: 0,
    userGrowth: 0,
    rideGrowth: 0,
    revenueGrowth: 0
  });
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, revenueRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getRevenueData(period)
      ]);
      
      // Handle both response structures
      const statsData = statsRes.data?.data || statsRes.data || {};
      setStats({
        totalUsers: statsData.totalUsers || 0,
        totalRides: statsData.totalRides || 0,
        totalBookings: statsData.totalBookings || 0,
        totalRevenue: statsData.totalRevenue || 0,
        userGrowth: statsData.userGrowth || 0,
        rideGrowth: statsData.rideGrowth || 0,
        revenueGrowth: statsData.revenueGrowth || 0,
      });
      
      const revenueArray = revenueRes.data?.data || revenueRes.data || [];
      setRevenueData(revenueArray);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue', growth: stats.userGrowth, prefix: '' },
    { title: 'Total Rides', value: stats.totalRides, icon: Car, color: 'green', growth: stats.rideGrowth, prefix: '' },
    { title: 'Total Bookings', value: stats.totalBookings, icon: Calendar, color: 'purple', growth: 12, prefix: '' },
    { title: 'Total Revenue', value: stats.totalRevenue, icon: DollarSign, color: 'orange', growth: stats.revenueGrowth, prefix: '₹' },
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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back! Here's what's happening with your platform.</p>
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
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 bg-${stat.color}-100 rounded-lg`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${stat.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stat.growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(stat.growth)}%
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.prefix}{stat.value.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Revenue Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
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
          <h3 className="text-base font-semibold text-gray-800 mb-4">Rides Statistics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip />
              <Bar dataKey="rides" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;