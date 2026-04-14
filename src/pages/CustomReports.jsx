import React, { useState } from 'react';
import {
    FileText,
    Download,
    Calendar,
    TrendingUp,
    Users,
    Car,
    DollarSign,
    Package,
    Truck,
    Filter,
    X,
    RefreshCw,
    PieChart,
    BarChart3,
    Activity
} from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart,
    PieChart as RePieChart,
    Pie,
    Cell
} from 'recharts';

function Reports() {
    const [reportType, setReportType] = useState('revenue');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [generating, setGenerating] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [chartData, setChartData] = useState([]);

    const reportTypes = [
        { id: 'revenue', name: 'Revenue Report', icon: DollarSign, description: 'Platform revenue and commission breakdown', color: 'blue' },
        { id: 'rides', name: 'Rides Report', icon: Car, description: 'All rides statistics and analytics', color: 'green' },
        { id: 'users', name: 'Users Report', icon: Users, description: 'User registration and activity', color: 'purple' },
        { id: 'drivers', name: 'Drivers Report', icon: Truck, description: 'Driver performance and earnings', color: 'orange' },
        { id: 'commission', name: 'Commission Report', icon: TrendingUp, description: 'Commission and payout analysis', color: 'red' },
        { id: 'cancellation', name: 'Cancellation Report', icon: XCircle, description: 'Cancelled rides analysis', color: 'yellow' }
    ];

    const handleGenerate = async () => {
        if (!startDate || !endDate) {
            toast.error('Please select date range');
            return;
        }

        setGenerating(true);
        try {
            const response = await adminAPI.generateReport(reportType, startDate, endDate);
            if (response.data.success) {
                setReportData(response.data.report);
                setChartData(response.data.chartData || []);
                toast.success('Report generated successfully');
            }
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Failed to generate report');
            // Set mock data for demo
            setMockReportData();
        } finally {
            setGenerating(false);
        }
    };

    const setMockReportData = () => {
        setReportData({
            summary: {
                total: 125000,
                count: 438,
                average: 285,
                growth: 15.5
            },
            breakdown: [
                { name: 'Cab Rides', value: 75000, percentage: 60 },
                { name: 'Goods Delivery', value: 50000, percentage: 40 }
            ],
            details: []
        });
        setChartData([
            { name: 'Week 1', value: 25000, rides: 85 },
            { name: 'Week 2', value: 32000, rides: 110 },
            { name: 'Week 3', value: 28000, rides: 95 },
            { name: 'Week 4', value: 40000, rides: 148 }
        ]);
    };

    const handleExport = () => {
        if (!reportData) return;
        const dataStr = JSON.stringify(reportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}_report_${startDate}_to_${endDate}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Report exported');
    };

    const handleExportCSV = () => {
        if (!chartData.length) return;

        const headers = Object.keys(chartData[0]);
        const csvRows = [
            headers.join(','),
            ...chartData.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
        ];
        const csv = csvRows.join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}_report_${startDate}_to_${endDate}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('CSV exported');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    };

    const pieColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                    <p className="text-sm text-gray-500 mt-1">Generate and export platform reports</p>
                </div>
                {reportData && (
                    <div className="flex gap-3">
                        <button
                            onClick={handleExportCSV}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                        <button
                            onClick={handleExport}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Export JSON
                        </button>
                    </div>
                )}
            </div>

            {/* Report Type Selection */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {reportTypes.map((type) => (
                    <div
                        key={type.id}
                        onClick={() => setReportType(type.id)}
                        className={`cursor-pointer rounded-xl p-4 border-2 transition-all ${reportType === type.id
                                ? `border-${type.color}-500 bg-${type.color}-50`
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                    >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${reportType === type.id ? `bg-${type.color}-600` : 'bg-gray-100'
                            }`}>
                            <type.icon className={`w-5 h-5 ${reportType === type.id ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm">{type.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                    </div>
                ))}
            </div>

            {/* Date Range Selection */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Select Date Range</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                    >
                        {generating ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <FileText className="w-4 h-4" />}
                        Generate Report
                    </button>
                    {(startDate || endDate) && (
                        <button
                            onClick={() => { setStartDate(''); setEndDate(''); setReportData(null); }}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Report Results */}
            {reportData && (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <p className="text-xs text-gray-500">Total {reportType === 'revenue' ? 'Revenue' : reportType === 'rides' ? 'Rides' : 'Count'}</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {reportType === 'revenue' ? formatCurrency(reportData.summary?.total) : reportData.summary?.total?.toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <p className="text-xs text-gray-500">Average</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {reportType === 'revenue' ? formatCurrency(reportData.summary?.average) : reportData.summary?.average?.toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <p className="text-xs text-gray-500">Total Count</p>
                            <p className="text-2xl font-bold text-gray-900">{reportData.summary?.count?.toLocaleString()}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <p className="text-xs text-gray-500">Growth</p>
                            <p className={`text-2xl font-bold ${reportData.summary?.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {reportData.summary?.growth}%
                            </p>
                        </div>
                    </div>

                    {/* Charts */}
                    {chartData.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                                <h3 className="text-base font-semibold text-gray-800 mb-4">Trend Analysis</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                                        <YAxis stroke="#9ca3af" fontSize={12} />
                                        <Tooltip formatter={(value) => reportType === 'revenue' ? formatCurrency(value) : value} />
                                        <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                                <h3 className="text-base font-semibold text-gray-800 mb-4">Distribution</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <RePieChart>
                                        <Pie
                                            data={reportData.breakdown || []}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {(reportData.breakdown || []).map((entry, index) => (
                                                <Cell key={index} fill={pieColors[index % pieColors.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => reportType === 'revenue' ? formatCurrency(value) : value} />
                                    </RePieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Data Table */}
                    {reportData.details && reportData.details.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-5 border-b border-gray-100">
                                <h3 className="font-semibold text-gray-900">Detailed Report</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            {Object.keys(reportData.details[0]).map((key) => (
                                                <th key={key} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    {key.replace(/_/g, ' ')}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {reportData.details.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                {Object.values(row).map((value, i) => (
                                                    <td key={i} className="px-5 py-3 text-sm text-gray-600">
                                                        {typeof value === 'number' && reportType === 'revenue' ? formatCurrency(value) : value}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Reports;