import React, { useState, useEffect } from 'react';
import { Search, Package, Truck, Eye, XCircle, CheckCircle, Clock, Download, RefreshCw } from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from "jspdf-autotable";

function GoodsDelivery() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchDeliveries();
  }, [statusFilter]);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getRides(1, 500, { 
        type: 'goods', 
        status: statusFilter !== 'all' ? statusFilter : undefined 
      });

      let ridesData = [];
      if (response.data?.rides) {
        ridesData = response.data.rides;
      } else if (response.data?.data?.rides) {
        ridesData = response.data.data.rides;
      } else if (Array.isArray(response.data)) {
        ridesData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        ridesData = response.data.data;
      }

      setDeliveries(ridesData);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      toast.error('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const date = new Date().toLocaleString();

    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, 210, 20, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("Goods Delivery Report", 105, 12, { align: "center" });
    doc.setFontSize(9);
    doc.text(`Generated: ${date}`, 105, 17, { align: "center" });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    let startY = 30;

    const statsData = [
      ["Draft", stats.draft],
      ["Searching", stats.searching],
      ["Available", stats.available],
      ["Accepted", stats.accepted],
      ["Ongoing", stats.ongoing],
      ["Completed", stats.completed],
      ["Cancelled", stats.cancelled],
      ["Total Orders", filteredDeliveries.length],
      ["Total Revenue", `₹${stats.totalAmount.toLocaleString()}`],
    ];

    autoTable(doc, {
      startY,
      body: statsData,
      theme: "grid",
      styles: { fontSize: 9 },
      columnStyles: { 0: { fontStyle: "bold" } },
    });

    const tableData = filteredDeliveries.map((d) => [
      `#${d._id?.slice(-5) || "N/A"}`,
      `${getCustomerName(d)}\n${getCustomerPhone(d)}`,
      `${getFromLocation(d)}\n→\n${getToLocation(d)}`,
      `${getVehicleType(d)}\n${getGoodsType(d)}\n${getGoodsWeight(d)}`,
      `₹${getFare(d)}`,
      getStatusLabel(d.status),
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["ID", "Customer / Mobile", "Pickup → Drop", "Vehicle / Goods", "Amount", "Status"]],
      body: tableData,
      theme: "striped",
      styles: { fontSize: 8, cellPadding: 3, valign: "middle" },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, halign: "center", fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 40 },
        2: { cellWidth: 50 },
        3: { cellWidth: 40 },
        4: { cellWidth: 20, halign: "right" },
        5: { cellWidth: 20, halign: "center" },
      },
      didDrawPage: () => {
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, 200, 290, { align: "right" });
      },
    });

    doc.save(`goods_delivery_report_${new Date().toISOString().split("T")[0]}.pdf`);
    toast.success("PDF downloaded successfully");
  };

  const getStatusLabel = (status) => {
    const statusConfig = {
      draft: 'Draft',
      searching: 'Searching',
      available: 'Available',
      accepted: 'Accepted',
      ongoing: 'In Transit',
      completed: 'Delivered',
      cancelled: 'Cancelled',
    };
    return statusConfig[status?.toLowerCase()] || status || 'Pending';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Draft' },
      searching: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Searching' },
      available: { color: 'bg-blue-100 text-blue-700', icon: Truck, label: 'Available' },
      accepted: { color: 'bg-cyan-100 text-cyan-700', icon: CheckCircle, label: 'Accepted' },
      ongoing: { color: 'bg-purple-100 text-purple-700', icon: Truck, label: 'In Transit' },
      completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Delivered' },
      cancelled: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Cancelled' },
    };
    const config = statusConfig[status?.toLowerCase()] || statusConfig.searching;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  // Safely get customer name
  const getCustomerName = (delivery) => {
    if (delivery.customer?.name) return delivery.customer.name;
    if (delivery.customerName) return delivery.customerName;
    if (delivery.customerId?.name) return delivery.customerId.name;
    return 'N/A';
  };

  // Safely get customer phone
  const getCustomerPhone = (delivery) => {
    if (delivery.customer?.phone) return delivery.customer.phone;
    if (delivery.customerPhone) return delivery.customerPhone;
    if (delivery.customerId?.phone) return delivery.customerId.phone;
    return '';
  };

  // Safely get from location
  const getFromLocation = (delivery) => {
    return delivery.from || delivery.fromCity || delivery.pickupLocation?.address || 'N/A';
  };

  // Safely get to location
  const getToLocation = (delivery) => {
    return delivery.to || delivery.toCity || delivery.dropLocation?.address || 'N/A';
  };

  // Safely get fare
  const getFare = (delivery) => {
    return delivery.fare || delivery.price || delivery.amount || 0;
  };

  // Get vehicle type from existing field
  const getVehicleType = (delivery) => {
    return delivery.vehicleType || delivery.carModel || 'N/A';
  };

  // Get goods type from goods object
  const getGoodsType = (delivery) => {
    if (delivery.goods?.type) return delivery.goods.type;
    if (delivery.packageType) return delivery.packageType;
    return 'N/A';
  };

  // Get goods weight from goods object
  const getGoodsWeight = (delivery) => {
    if (delivery.goods?.weight) return delivery.goods.weight;
    if (delivery.weight) return `${delivery.weight}`;
    if (delivery.packageWeight) return `${delivery.packageWeight} kg`;
    return 'N/A';
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const searchLower = searchTerm.toLowerCase();
    return (
      getCustomerName(delivery).toLowerCase().includes(searchLower) ||
      getCustomerPhone(delivery).toLowerCase().includes(searchLower) ||
      getFromLocation(delivery).toLowerCase().includes(searchLower) ||
      getToLocation(delivery).toLowerCase().includes(searchLower) ||
      getVehicleType(delivery).toLowerCase().includes(searchLower) ||
      getGoodsType(delivery).toLowerCase().includes(searchLower)
    );
  });

  const stats = {
    draft: deliveries.filter(d => d.status?.toLowerCase() === 'draft').length,
    searching: deliveries.filter(d => d.status?.toLowerCase() === 'searching').length,
    available: deliveries.filter(d => d.status?.toLowerCase() === 'available').length,
    accepted: deliveries.filter(d => d.status?.toLowerCase() === 'accepted').length,
    ongoing: deliveries.filter(d => d.status?.toLowerCase() === 'ongoing').length,
    completed: deliveries.filter(d => d.status?.toLowerCase() === 'completed').length,
    cancelled: deliveries.filter(d => d.status?.toLowerCase() === 'cancelled').length,
    totalAmount: deliveries.reduce((sum, d) => sum + getFare(d), 0)
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Goods Delivery</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all goods delivery orders</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer, vehicle, goods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="searching">Searching</option>
            <option value="available">Available</option>
            <option value="accepted">Accepted</option>
            <option value="ongoing">In Transit</option>
            <option value="completed">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={fetchDeliveries}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
        <div className="bg-white rounded-xl p-3 shadow-sm text-center">
          <p className="text-xl font-bold text-gray-600">{stats.draft}</p>
          <p className="text-xs text-gray-500">Draft</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center">
          <p className="text-xl font-bold text-yellow-600">{stats.searching}</p>
          <p className="text-xs text-gray-500">Searching</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center">
          <p className="text-xl font-bold text-blue-600">{stats.available}</p>
          <p className="text-xs text-gray-500">Available</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center">
          <p className="text-xl font-bold text-cyan-600">{stats.accepted}</p>
          <p className="text-xs text-gray-500">Accepted</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center">
          <p className="text-xl font-bold text-purple-600">{stats.ongoing}</p>
          <p className="text-xs text-gray-500">In Transit</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center">
          <p className="text-xl font-bold text-green-600">{stats.completed}</p>
          <p className="text-xs text-gray-500">Delivered</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center">
          <p className="text-xl font-bold text-red-600">{stats.cancelled}</p>
          <p className="text-xs text-gray-500">Cancelled</p>
        </div>
      </div>

      {/* Total Amount Card */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4 text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm opacity-80">Total Revenue</p>
            <p className="text-3xl font-bold">₹{stats.totalAmount.toLocaleString()}</p>
          </div>
          <Package className="w-12 h-12 opacity-50" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer / Mobile</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pickup → Drop</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle / Goods</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-10 text-center text-gray-500">
                    No deliveries found
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((delivery) => (
                  <tr key={delivery._id || delivery.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3 text-sm font-medium text-gray-900">
                      #{delivery._id?.slice(-6) || 'N/A'}
                    </td>
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{getCustomerName(delivery)}</p>
                        <p className="text-xs text-gray-500">{getCustomerPhone(delivery)}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-sm text-gray-600 max-w-[150px] truncate">{getFromLocation(delivery)}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-sm text-gray-600 max-w-[150px] truncate">{getToLocation(delivery)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{getVehicleType(delivery)}</p>
                        <p className="text-xs text-gray-500">{getGoodsType(delivery)} - {getGoodsWeight(delivery)}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-gray-900">₹{getFare(delivery)}</td>
                    <td className="px-5 py-3">{getStatusBadge(delivery.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default GoodsDelivery;