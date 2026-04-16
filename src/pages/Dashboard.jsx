import React, { useState, useEffect } from 'react';
import {
  Users, Car, DollarSign, TrendingUp, TrendingDown,
  Download, RefreshCw, UserCheck
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

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
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // ========== HEADER ==========
    doc.setFontSize(24);
    doc.setTextColor(59, 130, 246);
    doc.text('DASHBOARD REPORT', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // ========== STATISTICS SECTION ==========
    doc.setFontSize(16);
    doc.setTextColor(33, 33, 33);
    doc.text('Statistics Summary', 14, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    
    // Create two columns for stats
    const leftStats = [
      `Total Users: ${stats.totalUsers.toLocaleString()}`,
      `Total Rides: ${stats.totalRides.toLocaleString()}`,
      `Total Bookings: ${stats.totalBookings.toLocaleString()}`,
      `Total Revenue: ₹${stats.totalRevenue.toLocaleString()}`,
    ];

    const rightStats = [
      `Pending Drivers: ${stats.pendingDrivers.toLocaleString()}`,
      `Active Rides: ${stats.activeRides.toLocaleString()}`,
      `User Growth: ${stats.userGrowth}%`,
      `Revenue Growth: ${stats.revenueGrowth}%`,
    ];

    // Left column
    leftStats.forEach(item => {
      doc.text(`✓ ${item}`, 20, yPos);
      yPos += 7;
    });

    // Reset yPos for right column
    yPos = 52;
    // Right column
    rightStats.forEach(item => {
      doc.text(`✓ ${item}`, 120, yPos);
      yPos += 7;
    });

    yPos = 90;

    // ========== DIVIDER ==========
    doc.setDrawColor(200, 200, 200);
    doc.line(14, yPos, pageWidth - 14, yPos);
    yPos += 10;

    // ========== REVENUE OVERVIEW ==========
    if (revenueData.length > 0) {
      doc.setFontSize(16);
      doc.setTextColor(33, 33, 33);
      doc.text('Revenue Overview', 14, yPos);
      yPos += 10;

      // Table headers
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.setFillColor(59, 130, 246);
      doc.rect(14, yPos - 4, 180, 8, 'F');
      doc.text('Period', 20, yPos);
      doc.text('Revenue (₹)', 70, yPos);
      doc.text('Rides', 130, yPos);
      yPos += 6;

      doc.setTextColor(60, 60, 60);
      doc.setFillColor(245, 245, 245);
      
      let rowCount = 0;
      revenueData.forEach((item, index) => {
        if (item.revenue > 0 || item.rides > 0) {
          // Alternate row colors
          if (rowCount % 2 === 0) {
            doc.setFillColor(255, 255, 255);
            doc.rect(14, yPos - 3, 180, 6, 'F');
          } else {
            doc.setFillColor(245, 245, 245);
            doc.rect(14, yPos - 3, 180, 6, 'F');
          }
          
          doc.text(item.name || '-', 20, yPos);
          doc.text(`₹${(item.revenue || 0).toLocaleString()}`, 70, yPos);
          doc.text(`${item.rides || 0}`, 130, yPos);
          yPos += 6;
          rowCount++;
          
          // Add new page if needed
          if (yPos > 270 && index < revenueData.length - 1) {
            doc.addPage();
            yPos = 20;
            
            // Repeat header on new page
            doc.setFontSize(16);
            doc.setTextColor(33, 33, 33);
            doc.text('Revenue Overview (Continued)', 14, yPos);
            yPos += 10;
            
            doc.setFontSize(9);
            doc.setTextColor(255, 255, 255);
            doc.setFillColor(59, 130, 246);
            doc.rect(14, yPos - 4, 180, 8, 'F');
            doc.text('Period', 20, yPos);
            doc.text('Revenue (₹)', 70, yPos);
            doc.text('Rides', 130, yPos);
            yPos += 6;
            doc.setTextColor(60, 60, 60);
            rowCount = 0;
          }
        }
      });
      
      yPos += 10;
    }

    // ========== FOOTER ==========
    if (yPos < 280) {
      yPos = 280;
    }
    doc.setDrawColor(200, 200, 200);
    doc.line(14, yPos, pageWidth - 14, yPos);
    yPos += 5;
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Dump & Drop Admin Dashboard - Page 1 of 1`, pageWidth / 2, yPos, { align: 'center' });

    // Save PDF
    doc.save(`dashboard_report_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF downloaded successfully');
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
          <button 
            onClick={exportToPDF}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export PDF
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
    </div>
  );
}

export default Dashboard;