// RevenueReports.jsx - Complete Fixed Version

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    ArrowDown,
    Eye,
    AlertCircle
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
        goodsPercentage: 0,
        cabRides: 0,
        goodsRides: 0
    });
    const [monthlyData, setMonthlyData] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [error, setError] = useState(null);
    const intervalRef = useRef(null);

    const fetchRevenueData = useCallback(async (showToastMsg = false) => {
        setLoading(true);
        setError(null);

        try {
            console.log('Fetching revenue data for period:', period);
            const response = await adminAPI.getRevenueReports(period);

            console.log('API Response:', response.data);

            if (response.data && response.data.success) {
                // Set revenue trend data
                setRevenueData(response.data.revenueData || []);

                // Set summary stats - DIRECT from API
                setSummary({
                    totalRevenue: response.data.summary?.totalRevenue || 0,
                    totalPayout: response.data.summary?.totalPayout || 0,
                    totalRides: response.data.summary?.totalRides || 0,
                    avgRevenuePerRide: response.data.summary?.avgRevenuePerRide || 0,
                    driverCommission: response.data.summary?.driverCommission || 80,
                    growth: response.data.summary?.growth || 0
                });

                // Set breakdown - DIRECT from API (this should show your correct values)
                setBreakdown({
                    cabRevenue: response.data.breakdown?.cabRevenue || 0,
                    goodsRevenue: response.data.breakdown?.goodsRevenue || 0,
                    cabPercentage: response.data.breakdown?.cabPercentage || 0,
                    goodsPercentage: response.data.breakdown?.goodsPercentage || 0,
                    cabRides: response.data.breakdown?.cabRides || 0,
                    goodsRides: response.data.breakdown?.goodsRides || 0
                });

                setMonthlyData(response.data.monthlyData || []);
                setLastUpdated(new Date());

                console.log('Breakdown from API:', response.data.breakdown);
                console.log('Cab Revenue:', response.data.breakdown?.cabRevenue);
                console.log('Goods Revenue:', response.data.breakdown?.goodsRevenue);

                if (showToastMsg) {
                    toast.success('Revenue data refreshed!');
                }
            } else {
                throw new Error(response.data?.message || 'Invalid response');
            }
        } catch (error) {
            console.error('Error fetching revenue data:', error);
            setError(error.message || 'Failed to load revenue data');

            setRevenueData([]);
            setSummary({
                totalRevenue: 0,
                totalPayout: 0,
                totalRides: 0,
                avgRevenuePerRide: 0,
                driverCommission: 80,
                growth: 0
            });
            setBreakdown({
                cabRevenue: 0,
                goodsRevenue: 0,
                cabPercentage: 0,
                goodsPercentage: 0,
                cabRides: 0,
                goodsRides: 0
            });
            setMonthlyData([]);

            if (showToastMsg) {
                toast.error('Failed to load revenue data');
            }
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => {
        fetchRevenueData(false);
    }, [period, fetchRevenueData]);

    useEffect(() => {
        if (autoRefresh) {
            intervalRef.current = setInterval(() => {
                fetchRevenueData(false);
            }, 30000);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [autoRefresh, fetchRevenueData]);

    const handleManualRefresh = () => {
        fetchRevenueData(true);
    };

    const toggleAutoRefresh = () => {
        setAutoRefresh(!autoRefresh);
        toast.info(autoRefresh ? 'Auto-refresh stopped' : 'Auto-refresh started');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
    };

    const formatNumber = (num) => {
        return (num || 0).toLocaleString();
    };

    const handleExport = async () => {
        try {
            const response = await adminAPI.exportRevenueReport(period);
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `revenue_report_${period}_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Report exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export report');
        }
    };

    // Prepare pie chart data - USE DIRECT VALUES FROM API
    const pieData = [
        { name: 'Cab Rides', value: breakdown.cabRevenue, color: '#3b82f6' },
        { name: 'Goods Delivery', value: breakdown.goodsRevenue, color: '#10b981' }
    ].filter(item => item.value > 0);

    // Prepare ride count pie data
    const rideCountPieData = [
        { name: 'Cab Rides', value: breakdown.cabRides, color: '#3b82f6' },
        { name: 'Goods Delivery', value: breakdown.goodsRides, color: '#10b981' }
    ].filter(item => item.value > 0);

    if (loading && revenueData.length === 0) {
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
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                        Track platform revenue and driver payouts
                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            Live Data
                        </span>
                    </p>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <div className="flex items-center text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                        <Eye className="w-3 h-3 mr-1" />
                        Updated: {lastUpdated.toLocaleTimeString()}
                    </div>

                    <button
                        onClick={toggleAutoRefresh}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                        <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                        {autoRefresh ? 'Live ON' : 'Live OFF'}
                    </button>

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
                        onClick={handleManualRefresh}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>

                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <div>
                        <p className="text-sm font-medium text-red-700">Unable to load data</p>
                        <p className="text-xs text-red-600">{error}</p>
                    </div>
                    <button
                        onClick={handleManualRefresh}
                        className="ml-auto px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Stats Cards - Show Total Revenue */}
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
                    <p className="text-xs text-gray-400 mt-1">{summary.driverCommission}% to drivers</p>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(summary.totalRides)}</p>
                    <p className="text-xs text-gray-500">Total Completed Rides</p>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Banknote className="w-5 h-5 text-cyan-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.avgRevenuePerRide)}</p>
                    <p className="text-xs text-gray-500">Average per Ride</p>
                </div>
            </div>

            {/* Revenue Breakdown Cards - SHOW CAB AND GOODS REVENUE SEPARATELY */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-80">Cab Rides Revenue</p>
                            <p className="text-3xl font-bold">{formatCurrency(breakdown.cabRevenue)}</p>
                            <p className="text-xs opacity-80 mt-1">{formatNumber(breakdown.cabRides)} rides completed</p>
                        </div>
                        <Car className="w-12 h-12 opacity-50" />
                    </div>
                </div>
                <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-80">Goods Delivery Revenue</p>
                            <p className="text-3xl font-bold">{formatCurrency(breakdown.goodsRevenue)}</p>
                            <p className="text-xs opacity-80 mt-1">{formatNumber(breakdown.goodsRides)} deliveries completed</p>
                        </div>
                        <Truck className="w-12 h-12 opacity-50" />
                    </div>
                </div>
            </div>

            {/* Driver Commission Card */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-white/80 mb-1">Driver Commission Rate</p>
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

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">Revenue Trend</h3>
                    {revenueData.length > 0 && revenueData.some(d => d.revenue > 0) ? (
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
                                <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-72 text-gray-400">
                            <div className="text-center">
                                <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                <p>No revenue data available</p>
                                <p className="text-xs mt-1">Complete some rides to see data</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Revenue by Service - PIE CHART */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">Revenue by Service</h3>
                    {pieData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={250}>
                                <RePieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
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
                                    <span className="text-sm text-gray-600">Cab Rides: {formatCurrency(breakdown.cabRevenue)} ({breakdown.cabPercentage.toFixed(1)}%)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-600"></div>
                                    <span className="text-sm text-gray-600">Goods Delivery: {formatCurrency(breakdown.goodsRevenue)} ({breakdown.goodsPercentage.toFixed(1)}%)</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-72 text-gray-400">
                            <div className="text-center">
                                <Car className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                <p>No revenue data available</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Ride Count Bar Chart */}
            {rideCountPieData.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">Ride Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={[
                            { name: 'Cab Rides', count: breakdown.cabRides, revenue: breakdown.cabRevenue, color: '#3b82f6' },
                            { name: 'Goods Delivery', count: breakdown.goodsRides, revenue: breakdown.goodsRevenue, color: '#10b981' }
                        ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                            <YAxis stroke="#9ca3af" fontSize={12} />
                            <Tooltip formatter={(value, name) => {
                                if (name === 'count') return `${formatNumber(value)} rides`;
                                return formatCurrency(value);
                            }} />
                            <Legend />
                            <Bar dataKey="count" fill="#3b82f6" name="Number of Rides" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-6 mt-4 text-sm">
                        <div className="text-center">
                            <p className="text-gray-500">Cab Rides</p>
                            <p className="font-bold text-blue-600">{formatNumber(breakdown.cabRides)} rides</p>
                            <p className="text-xs text-gray-500">{formatCurrency(breakdown.cabRevenue)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-500">Goods Delivery</p>
                            <p className="font-bold text-green-600">{formatNumber(breakdown.goodsRides)} deliveries</p>
                            <p className="text-xs text-gray-500">{formatCurrency(breakdown.goodsRevenue)}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Monthly Trends */}
            {monthlyData.length > 0 && monthlyData.some(item => item.revenue > 0) && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">Monthly Revenue vs Payout</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyData.filter(item => item.revenue > 0)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                            <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Legend />
                            <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="payout" fill="#10b981" name="Driver Payout" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* No Data Message */}
            {!loading && revenueData.length === 0 && summary.totalRevenue === 0 && !error && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">No Revenue Data Available</h3>
                    <p className="text-gray-500 mt-2">Complete some rides to see revenue data here</p>
                </div>
            )}

            {/* Live Status Bar */}
            <div className="text-center text-xs text-gray-400 bg-gray-50 py-2 rounded-lg">
                {autoRefresh ? (
                    <span className="inline-flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        Live data • Auto-refreshing every 30 seconds • Last updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                        Auto-refresh OFF • Click Refresh to update
                    </span>
                )}
            </div>
        </div>
    );
}

export default RevenueReports;