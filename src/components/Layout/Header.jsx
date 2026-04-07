import React from 'react';
import { Menu, Bell, User, Search, LogOut } from 'lucide-react';

function Header({ sidebarOpen, setSidebarOpen, adminUser, onLogout }) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden md:block">
            <h3 className="text-xl font-semibold text-gray-800">Admin Dashboard</h3>
          </div>
        </div>

        <div className="hidden md:flex items-center bg-gray-50 rounded-lg px-3 py-2 w-80">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none ml-2 text-sm w-full"
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-700">{adminUser?.name || 'Admin'}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;