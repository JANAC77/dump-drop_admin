import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    TrendingUp,
    Calendar,
    Download,
    RefreshCw,
    Car,
    Truck,
    Users,
    Wallet,
    Banknote,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import {
    BarChart,
    Bar,
    PieChart as RePieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

function RevenueReports() {
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month');
    const [revenueData, setRevenueData] = useState([]);
    const [summary, setSummary] = useState({
        totalRevenue: 0,
        totalPayout: 0,
        totalRides: 0,
        avgRevenuePerRide: 0,
        driverCommission: 80,
        growth: 0
    });
    const [breakdown, setBreakdown] = useState({
        cabRevenue: 0,
        goodsRevenue: 0,
        cabPercentage: 0,
        goodsPercentage: 0
    });
    const [monthlyData, setMonthlyData] = useState([]);

    useEffect(() => {
        fetchRevenueData();
    }, [period]);

    const fetchRevenueData = async () => {
        setLoading(true);
        try {
            const response = await adminAPI.getRevenueReports(period);
            if (response.data.success) {
                setRevenueData(response.data.revenueData);
                setSummary(response.data.summary);
                setBreakdown(response.data.breakdown);
                setMonthlyData(response.data.monthlyData || []);
            }
        } catch (error) {
            console.error('Error fetching revenue data:', error);
            toast.error('Failed to load revenue data');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
    };

    const handleExport = async () => {
        try {
            const response = await adminAPI.exportRevenueReport(period);
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `revenue_report_${period}_${new Date().toISOString()}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Report exported successfully');
        } catch (error) {
            toast.error('Failed to export report');
        }
    };

    const pieData = [
        { name: 'Cab Rides', value: breakdown.cabRevenue, color: '#3b82f6' },
        { name: 'Goods Delivery', value: breakdown.goodsRevenue, color: '#10b981' }
    ];

    // Filter data with revenue > 0 for chart
    const filteredChartData = revenueData.filter(item => item.revenue > 0);

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
                    <h1 className="text-2xl font-bold text-gray-900">Revenue Reports</h1>
                    <p className="text-sm text-gray-500 mt-1">Track platform revenue and driver payouts</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="quarter">This Quarter</option>
                        <option value="year">This Year</option>
                    </select>
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button
                        onClick={fetchRevenueData}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <span className={`text-xs font-medium ${summary.growth >= 0 ? 'text-green-600' : 'text-red-600'} flex items-center gap-1`}>
                            {summary.growth >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                            {Math.abs(summary.growth)}%
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalRevenue)}</p>
                    <p className="text-xs text-gray-500">Total Revenue</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Wallet className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalPayout)}</p>
                    <p className="text-xs text-gray-500">Driver Payouts</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{summary.totalRides}</p>
                    <p className="text-xs text-gray-500">Total Rides</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Banknote className="w-5 h-5 text-cyan-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.avgRevenuePerRide)}</p>
                    <p className="text-xs text-gray-500">Avg per Ride</p>
                </div>
            </div>

            {/* Driver Commission Card */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-white/80 mb-1">Driver Commission</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-5xl font-bold">{summary.driverCommission}</p>
                            <p className="text-2xl font-semibold">%</p>
                        </div>
                        <p className="text-sm text-white/70 mt-2">
                            Driver gets <span className="font-bold">{summary.driverCommission}%</span> of each ride fare
                        </p>
                    </div>
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-10 h-10 text-white" />
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">Revenue Trend</h3>
                    {filteredChartData.length > 0 ? (
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
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-72 text-gray-400">
                            No data available for selected period
                        </div>
                    )}
                </div>

                {/* Revenue by Service */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">Revenue by Service</h3>
                    {breakdown.cabRevenue > 0 || breakdown.goodsRevenue > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={300}>
                                <RePieChart>
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
                                        {pieData.map((entry, index) => (
                                            <Cell key={index} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                </RePieChart>
                            </ResponsiveContainer>
                            <div className="flex justify-center gap-6 mt-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                                    <span className="text-sm text-gray-600">Cab Rides ({breakdown.cabPercentage.toFixed(1)}%)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-600"></div>
                                    <span className="text-sm text-gray-600">Goods Delivery ({breakdown.goodsPercentage.toFixed(1)}%)</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-72 text-gray-400">
                            No data available for selected period
                        </div>
                    )}
                </div>
            </div>

            {/* Revenue vs Driver Payout */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-base font-semibold text-gray-800 mb-4">Revenue vs Driver Payout</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(summary.totalRevenue)}</p>
                        <p className="text-xs text-gray-500">100% of rides</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Driver Payouts</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalPayout)}</p>
                        <p className="text-xs text-gray-500">{summary.driverCommission}% of total revenue</p>
                    </div>
                </div>
            </div>

            {/* Monthly Trends */}
            {monthlyData.length > 0 && monthlyData.some(item => item.revenue > 0) && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">Monthly Revenue Trends</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyData.filter(item => item.revenue > 0)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                            <YAxis stroke="#9ca3af" fontSize={12} />
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Legend />
                            <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="payout" fill="#10b981" name="Driver Payout" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}

export default RevenueReports;