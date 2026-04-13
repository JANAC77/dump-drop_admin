import React, { useState, useEffect } from 'react';
import {
  Users, Car, Calendar, DollarSign, TrendingUp, TrendingDown,
  ArrowRight, Download, RefreshCw, Activity, Package,
  UserCheck, Clock, CheckCircle, XCircle, Award
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRides: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingDrivers: 0,
    activeRides: 0,
    userGrowth: 0,
    rideGrowth: 0,
    revenueGrowth: 0
  });
  const [revenueData, setRevenueData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
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

      const statsData = statsRes.data?.data || statsRes.data || {};
      setStats({
        totalUsers: statsData.totalUsers || 0,
        totalRides: statsData.totalRides || 0,
        totalBookings: statsData.totalBookings || 0,
        totalRevenue: statsData.totalRevenue || 0,
        pendingDrivers: statsData.pendingDrivers || 0,
        activeRides: statsData.activeRides || 0,
        userGrowth: statsData.userGrowth || 8,
        rideGrowth: statsData.rideGrowth || 12,
        revenueGrowth: statsData.revenueGrowth || 15,
      });

      const revenueArray = revenueRes.data?.data || revenueRes.data || [];
      setRevenueData(revenueArray);

      // Mock recent activities
      setRecentActivities([
        { id: 1, type: 'user', message: 'New user registered', time: '2 min ago', icon: Users },
        { id: 2, type: 'ride', message: 'Ride #CAB123 completed', time: '15 min ago', icon: Car },
        { id: 3, type: 'booking', message: 'New booking request', time: '1 hour ago', icon: Calendar },
        { id: 4, type: 'driver', message: 'Driver verification approved', time: '2 hours ago', icon: UserCheck },
      ]);
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
    { title: 'Total Revenue', value: stats.totalRevenue, icon: DollarSign, color: 'orange', growth: stats.revenueGrowth, prefix: '₹' },
    { title: 'Pending Drivers', value: stats.pendingDrivers, icon: UserCheck, color: 'yellow', growth: 0, prefix: '' },
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
      {/* Header */}
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
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 bg-${stat.color}-100 rounded-lg`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
              </div>
              {stat.growth > 0 && (
                <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  {stat.growth}%
                </div>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.prefix}{stat.value.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-gray-800">Revenue Overview</h3>
            <span className="text-xs text-gray-400">Last {period}</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-gray-800">Rides Statistics</h3>
            <span className="text-xs text-gray-400">Last {period}</span>
          </div>
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

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-800">Recent Activities</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <activity.icon className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button className="bg-blue-50 text-blue-700 p-4 rounded-xl text-center hover:bg-blue-100 transition">
          <Users className="w-6 h-6 mx-auto mb-2" />
          <p className="text-sm font-medium">Manage Users</p>
        </button>
        <button className="bg-green-50 text-green-700 p-4 rounded-xl text-center hover:bg-green-100 transition">
          <Car className="w-6 h-6 mx-auto mb-2" />
          <p className="text-sm font-medium">View Rides</p>
        </button>
        <button className="bg-purple-50 text-purple-700 p-4 rounded-xl text-center hover:bg-purple-100 transition">
          <UserCheck className="w-6 h-6 mx-auto mb-2" />
          <p className="text-sm font-medium">Verify Drivers</p>
        </button>
        <button className="bg-orange-50 text-orange-700 p-4 rounded-xl text-center hover:bg-orange-100 transition">
          <DollarSign className="w-6 h-6 mx-auto mb-2" />
          <p className="text-sm font-medium">Revenue Report</p>
        </button>
      </div>
    </div>
  );
}

export default Dashboard;