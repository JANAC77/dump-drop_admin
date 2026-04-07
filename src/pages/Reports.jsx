import React, { useState } from 'react';
import { FileText, Download, Calendar, TrendingUp, Users, Car, DollarSign, Package } from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

function Reports() {
  const [reportType, setReportType] = useState('revenue');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);

  const reportTypes = [
    { id: 'revenue', name: 'Revenue Report', icon: DollarSign, description: 'Platform revenue and commission breakdown' },
    { id: 'rides', name: 'Rides Report', icon: Car, description: 'All rides statistics and analytics' },
    { id: 'users', name: 'Users Report', icon: Users, description: 'User registration and activity' },
    { id: 'drivers', name: 'Drivers Report', icon: Users, description: 'Driver performance and earnings' },
  ];

  const handleGenerate = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select date range');
      return;
    }
    setGenerating(true);
    try {
      const response = await adminAPI.generateReport(reportType, startDate, endDate);
      setReportData(response.data);
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
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

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Reports</h1><p className="text-sm text-gray-500 mt-1">Generate and export platform reports</p></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {reportTypes.map((type) => (
          <div key={type.id} onClick={() => setReportType(type.id)} className={`cursor-pointer rounded-xl p-5 border-2 transition-all ${reportType === type.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'}`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${reportType === type.id ? 'bg-blue-600' : 'bg-gray-100'}`}><type.icon className={`w-5 h-5 ${reportType === type.id ? 'text-white' : 'text-gray-600'}`} /></div>
            <h3 className="font-semibold text-gray-900">{type.name}</h3>
            <p className="text-xs text-gray-500 mt-1">{type.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Date Range</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">End Date</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
        </div>
        <div className="flex gap-3"><button onClick={handleGenerate} disabled={generating} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2">{generating ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <FileText className="w-4 h-4" />}Generate Report</button>{reportData && <button onClick={handleExport} className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center gap-2"><Download className="w-4 h-4" />Export</button>}</div>
      </div>

      {reportData && (<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"><div className="p-5 border-b border-gray-100 bg-gray-50"><h3 className="font-semibold text-gray-900">Report Summary</h3></div><div className="p-5"><pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded-lg overflow-x-auto">{JSON.stringify(reportData, null, 2)}</pre></div></div>)}
    </div>
  );
}

export default Reports;