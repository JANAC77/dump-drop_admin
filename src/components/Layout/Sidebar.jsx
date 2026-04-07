import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  Calendar, 
  Truck,
  FileText, 
  Settings, 
  LogOut,
  UserCog,
  Package,
  XCircle,
  DollarSign,
  TrendingUp,
  ClipboardList,
  Bell,
  Shield,
  CreditCard,
  AlertCircle
} from 'lucide-react';

const menuItems = [
  { category: "MAIN", items: [{ path: '/', name: 'Dashboard', icon: LayoutDashboard }] },
  { 
    category: "RIDE MANAGEMENT", 
    items: [
      { path: '/cab-rides', name: 'Cab Rides', icon: Car },
      { path: '/goods-delivery', name: 'Goods Delivery', icon: Package },
      { path: '/all-rides', name: 'All Rides', icon: ClipboardList },
    ]
  },
  { 
    category: "BOOKING & CANCELLATION", 
    items: [
      { path: '/bookings', name: 'All Bookings', icon: Calendar },
      { path: '/cancellation-requests', name: 'Cancellation Requests', icon: XCircle },
      { path: '/cancelled-orders', name: 'Cancelled Orders', icon: AlertCircle },
    ]
  },
  { 
    category: "FINANCIAL", 
    items: [
      { path: '/commission-settings', name: 'Commission Settings', icon: DollarSign },
      { path: '/payouts', name: 'Payouts', icon: CreditCard },
      { path: '/revenue', name: 'Revenue Reports', icon: TrendingUp },
    ]
  },
  { 
    category: "USER MANAGEMENT", 
    items: [
      { path: '/users', name: 'Customers', icon: Users },
      { path: '/drivers', name: 'Drivers', icon: UserCog },
      { path: '/driver-verification', name: 'Driver Verification', icon: Shield },
    ]
  },
  { 
    category: "VEHICLE MANAGEMENT", 
    items: [
      { path: '/vehicles', name: 'Vehicle Types', icon: Truck },
      { path: '/vehicle-rates', name: 'Rate Management', icon: TrendingUp },
    ]
  },
  { 
    category: "SYSTEM", 
    items: [
      { path: '/reports', name: 'Reports', icon: FileText },
      { path: '/notifications', name: 'Notifications', icon: Bell },
      { path: '/settings', name: 'Settings', icon: Settings },
    ]
  },
];

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/login';
  };

  return (
    <>
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`
        fixed top-0 left-0 z-30 h-screen w-72 bg-gradient-to-b from-gray-900 to-gray-800 
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 overflow-y-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-center border-b border-gray-700 sticky top-0 bg-gray-900">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-lg">Dump & Drop Admin</span>
            </div>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-6">
            {menuItems.map((category, catIdx) => (
              <div key={catIdx}>
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {category.category}
                </p>
                <div className="space-y-1">
                  {category.items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                        ${isActive 
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg' 
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }
                      `}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>
          <div className="border-t border-gray-700 p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;