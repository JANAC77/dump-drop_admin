import React, { useState } from 'react';
import {
  FileText,
  Users,
  Car,
  DollarSign,
  Truck,
  X,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function Reports() {
  const [reportType, setReportType] = useState('revenue');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [exportData, setExportData] = useState(null);

  const reportTypes = [
    { id: 'revenue', name: 'Revenue Report', icon: DollarSign, description: 'Platform revenue and earnings', color: 'blue' },
    { id: 'rides', name: 'Rides Report', icon: Car, description: 'All rides statistics and analytics', color: 'green' },
    { id: 'users', name: 'Users Report', icon: Users, description: 'User registration and activity', color: 'purple' },
    { id: 'drivers', name: 'Drivers Report', icon: Truck, description: 'Driver performance and earnings', color: 'orange' }
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
        const data = {
          report: response.data.report,
          chartData: response.data.chartData || []
        };
        setReportData(data.report);
        setChartData(data.chartData);
        setExportData(data);
        setShowPreview(true);
        toast.success('Report generated successfully');
      } else {
        toast.error('Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const exportToExcel = () => {
    if (!exportData || !exportData.report) return;

    const rep = exportData.report;
    const currentDate = new Date().toLocaleString();

    const wsData = [];

    // Title
    wsData.push([`${reportType.toUpperCase()} REPORT`]);
    wsData.push([]);
    wsData.push(['Report Details']);
    wsData.push(['Report Type', reportType.toUpperCase()]);
    wsData.push(['Date Range', `${startDate} to ${endDate}`]);
    wsData.push(['Generated On', currentDate]);
    wsData.push([]);

    // Summary Section
    wsData.push(['SUMMARY']);
    wsData.push(['Metric', 'Value']);

    if (reportType === 'revenue') {
      wsData.push(['Total Revenue', rep.summary?.total || 0]);
      wsData.push(['Average Revenue', rep.summary?.average || 0]);
      wsData.push(['Total Transactions', rep.summary?.count || 0]);
      wsData.push(['Growth', `${rep.summary?.growth || 0}%`]);
    } else if (reportType === 'rides') {
      wsData.push(['Total Rides', rep.summary?.total || 0]);
      wsData.push(['Completed Rides', rep.summary?.completed || 0]);
      wsData.push(['Ongoing Rides', rep.summary?.ongoing || 0]);
      wsData.push(['Cancelled Rides', rep.summary?.cancelled || 0]);
      wsData.push(['Completion Rate', `${rep.summary?.completionRate?.toFixed(2) || 0}%`]);
    } else if (reportType === 'users') {
      wsData.push(['Total Users', rep.summary?.total || 0]);
      wsData.push(['Total Customers', rep.summary?.customers || 0]);
      wsData.push(['Total Drivers', rep.summary?.drivers || 0]);
      wsData.push(['Growth', `${rep.summary?.growth || 0}%`]);
    } else if (reportType === 'drivers') {
      wsData.push(['Total Drivers', rep.summary?.total || 0]);
      wsData.push(['Cab Drivers', rep.summary?.cabDrivers || 0]);
      wsData.push(['Goods Drivers', rep.summary?.goodsDrivers || 0]);
      wsData.push(['Approved', rep.summary?.approved || 0]);
      wsData.push(['Pending', rep.summary?.pending || 0]);
    }

    wsData.push([]);

    // Breakdown Section
    if (rep.breakdown && rep.breakdown.length > 0) {
      wsData.push(['BREAKDOWN']);
      wsData.push(['Category', 'Value', 'Percentage']);
      rep.breakdown.forEach(item => {
        wsData.push([item.name, item.value, `${item.percentage?.toFixed(2) || 0}%`]);
      });
      wsData.push([]);
    }

    // Detailed Data Section
    if (rep.details && rep.details.length > 0) {
      wsData.push(['DETAILED DATA']);
      const headers = Object.keys(rep.details[0]);
      wsData.push(headers);
      rep.details.forEach(row => {
        wsData.push(Object.values(row));
      });
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${reportType}_report`);
    XLSX.writeFile(wb, `${reportType}_report_${startDate}_to_${endDate}.xlsx`);
    toast.success('Excel file downloaded');
  };

  const exportToPDF = () => {
    if (!exportData || !exportData.report) return;

    const rep = exportData.report;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Title
    doc.setFontSize(20);
    doc.setTextColor(33, 33, 33);
    doc.text(`${reportType.toUpperCase()} REPORT`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Date range
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Period: ${startDate} to ${endDate}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 6;
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Summary Section
    doc.setFontSize(14);
    doc.setTextColor(33, 33, 33);
    doc.text('Summary', 14, yPos);
    yPos += 8;

    let summaryData = [];
    if (reportType === 'revenue') {
      summaryData = [
        ['Total Revenue', `₹${(rep.summary?.total || 0).toLocaleString()}`],
        ['Average Revenue', `₹${(rep.summary?.average || 0).toLocaleString()}`],
        ['Total Transactions', (rep.summary?.count || 0).toLocaleString()],
        ['Growth', `${rep.summary?.growth || 0}%`]
      ];
    } else if (reportType === 'rides') {
      summaryData = [
        ['Total Rides', (rep.summary?.total || 0).toLocaleString()],
        ['Completed Rides', (rep.summary?.completed || 0).toLocaleString()],
        ['Ongoing Rides', (rep.summary?.ongoing || 0).toLocaleString()],
        ['Cancelled Rides', (rep.summary?.cancelled || 0).toLocaleString()],
        ['Completion Rate', `${rep.summary?.completionRate?.toFixed(2) || 0}%`]
      ];
    } else if (reportType === 'users') {
      summaryData = [
        ['Total Users', (rep.summary?.total || 0).toLocaleString()],
        ['Total Customers', (rep.summary?.customers || 0).toLocaleString()],
        ['Total Drivers', (rep.summary?.drivers || 0).toLocaleString()],
        ['Growth', `${rep.summary?.growth || 0}%`]
      ];
    } else if (reportType === 'drivers') {
      summaryData = [
        ['Total Drivers', (rep.summary?.total || 0).toLocaleString()],
        ['Cab Drivers', (rep.summary?.cabDrivers || 0).toLocaleString()],
        ['Goods Drivers', (rep.summary?.goodsDrivers || 0).toLocaleString()],
        ['Approved', (rep.summary?.approved || 0).toLocaleString()],
        ['Pending', (rep.summary?.pending || 0).toLocaleString()]
      ];
    }

    // Use autoTable if available, otherwise use simple text
    if (typeof doc.autoTable === 'function') {
      doc.autoTable({
        startY: yPos,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: 14 }
      });
      yPos = doc.lastAutoTable.finalY + 10;
    } else {
      // Fallback without autoTable
      doc.setFontSize(10);
      summaryData.forEach(row => {
        doc.text(`${row[0]}: ${row[1]}`, 14, yPos);
        yPos += 7;
      });
      yPos += 5;
    }

    // Breakdown Section
    if (rep.breakdown && rep.breakdown.length > 0) {
      doc.setFontSize(14);
      doc.text('Breakdown', 14, yPos);
      yPos += 8;

      const breakdownData = rep.breakdown.map(item => [
        item.name,
        reportType === 'revenue' ? `₹${item.value.toLocaleString()}` : item.value.toLocaleString(),
        `${item.percentage?.toFixed(2) || 0}%`
      ]);

      if (typeof doc.autoTable === 'function') {
        doc.autoTable({
          startY: yPos,
          head: [['Category', 'Value', 'Percentage']],
          body: breakdownData,
          theme: 'striped',
          headStyles: { fillColor: [59, 130, 246] },
          margin: { left: 14 }
        });
        yPos = doc.lastAutoTable.finalY + 10;
      } else {
        doc.setFontSize(10);
        breakdownData.forEach(row => {
          doc.text(`${row[0]}: ${row[1]} (${row[2]})`, 14, yPos);
          yPos += 7;
        });
        yPos += 5;
      }
    }

    // Detailed Data Section
    if (rep.details && rep.details.length > 0) {
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.text('Detailed Data', 14, yPos);
      yPos += 8;

      const headers = Object.keys(rep.details[0]);
      const body = rep.details.map(row => Object.values(row));

      if (typeof doc.autoTable === 'function') {
        doc.autoTable({
          startY: yPos,
          head: [headers],
          body: body,
          theme: 'striped',
          headStyles: { fillColor: [59, 130, 246] },
          margin: { left: 14 }
        });
      } else {
        doc.setFontSize(8);
        // Print headers
        let headerText = headers.join(' | ');
        doc.text(headerText.substring(0, 80), 14, yPos);
        yPos += 6;
        
        // Print rows
        body.slice(0, 20).forEach(row => {
          let rowText = row.join(' | ');
          doc.text(rowText.substring(0, 80), 14, yPos);
          yPos += 5;
        });
      }
    }

    doc.save(`${reportType}_report_${startDate}_to_${endDate}.pdf`);
    toast.success('PDF file downloaded');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
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
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            {generating ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Eye className="w-4 h-4" />}
            Generate & View
          </button>
          {(startDate || endDate) && (
            <button
              onClick={() => { setStartDate(''); setEndDate(''); setReportData(null); setShowPreview(false); setExportData(null); }}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Report Preview Modal */}
      {showPreview && reportData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Report Preview - {reportType.toUpperCase()}</h3>
              <button onClick={() => setShowPreview(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Report Header */}
              <div className="text-center border-b pb-4">
                <h2 className="text-xl font-bold text-gray-900">{reportType.toUpperCase()} REPORT</h2>
                <p className="text-sm text-gray-500">Period: {startDate} to {endDate}</p>
                <p className="text-xs text-gray-400">Generated: {new Date().toLocaleString()}</p>
              </div>

              {/* Summary Cards */}
              <div>
                <h3 className="text-md font-semibold text-gray-800 mb-3">Summary</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {reportType === 'revenue' && (
                    <>
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Total Revenue</p>
                        <p className="text-lg font-bold text-blue-600">{formatCurrency(reportData.summary?.total)}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Average Revenue</p>
                        <p className="text-lg font-bold text-green-600">{formatCurrency(reportData.summary?.average)}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Total Transactions</p>
                        <p className="text-lg font-bold text-purple-600">{reportData.summary?.count?.toLocaleString()}</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Growth</p>
                        <p className="text-lg font-bold text-orange-600">{reportData.summary?.growth}%</p>
                      </div>
                    </>
                  )}

                  {reportType === 'rides' && (
                    <>
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Total Rides</p>
                        <p className="text-lg font-bold text-blue-600">{reportData.summary?.total?.toLocaleString()}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Completed</p>
                        <p className="text-lg font-bold text-green-600">{reportData.summary?.completed?.toLocaleString()}</p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Ongoing</p>
                        <p className="text-lg font-bold text-yellow-600">{reportData.summary?.ongoing?.toLocaleString()}</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Cancelled</p>
                        <p className="text-lg font-bold text-red-600">{reportData.summary?.cancelled?.toLocaleString()}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Completion Rate</p>
                        <p className="text-lg font-bold text-purple-600">{reportData.summary?.completionRate?.toFixed(1)}%</p>
                      </div>
                    </>
                  )}

                  {reportType === 'users' && (
                    <>
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Total Users</p>
                        <p className="text-lg font-bold text-blue-600">{reportData.summary?.total?.toLocaleString()}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Customers</p>
                        <p className="text-lg font-bold text-green-600">{reportData.summary?.customers?.toLocaleString()}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Drivers</p>
                        <p className="text-lg font-bold text-purple-600">{reportData.summary?.drivers?.toLocaleString()}</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Growth</p>
                        <p className="text-lg font-bold text-orange-600">{reportData.summary?.growth}%</p>
                      </div>
                    </>
                  )}

                  {reportType === 'drivers' && (
                    <>
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Total Drivers</p>
                        <p className="text-lg font-bold text-blue-600">{reportData.summary?.total?.toLocaleString()}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Cab Drivers</p>
                        <p className="text-lg font-bold text-green-600">{reportData.summary?.cabDrivers?.toLocaleString()}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Goods Drivers</p>
                        <p className="text-lg font-bold text-purple-600">{reportData.summary?.goodsDrivers?.toLocaleString()}</p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Approved</p>
                        <p className="text-lg font-bold text-yellow-600">{reportData.summary?.approved?.toLocaleString()}</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Pending</p>
                        <p className="text-lg font-bold text-red-600">{reportData.summary?.pending?.toLocaleString()}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Charts */}
              {chartData.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">Trend Analysis</h3>
                    <ResponsiveContainer width="100%" height={250}>
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
                        <Area type="monotone" dataKey={reportType === 'revenue' ? 'value' : reportType === 'rides' ? 'rides' : reportType === 'users' ? 'users' : 'drivers'} stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <RePieChart>
                        <Pie
                          data={reportData.breakdown || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
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
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <h3 className="font-semibold text-gray-900">Detailed Data</h3>
                  </div>
                  <div className="overflow-x-auto max-h-96">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          {Object.keys(reportData.details[0]).map((key) => (
                            <th key={key} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              {key.replace(/_/g, ' ')}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {reportData.details.map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            {Object.values(row).map((value, i) => (
                              <td key={i} className="px-4 py-2 text-sm text-gray-600">
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

              {/* Export Buttons in Modal */}
              <div className="flex gap-3 justify-end pt-4 border-t sticky bottom-0 bg-white">
                <button
                  onClick={exportToExcel}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Download Excel
                </button>
                <button
                  onClick={exportToPDF}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;