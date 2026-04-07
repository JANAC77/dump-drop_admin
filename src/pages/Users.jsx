import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Ban, CheckCircle, MoreVertical, User, Mail, Phone, Calendar } from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getUsers(1, 50, searchTerm);
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.length > 2 || e.target.value.length === 0) {
      fetchUsers();
    }
  };

  const handleViewUser = (userId) => {
    navigate(`/users/${userId}`);
  };

  const handleBlockUser = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    try {
      await adminAPI.updateUserStatus(userId, newStatus);
      toast.success(`User ${newStatus === 'active' ? 'unblocked' : 'blocked'} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all registered customers</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rides</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spent</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => handleViewUser(user._id)}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">ID: {user._id?.slice(-6)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div>
                      <p className="text-sm text-gray-600 flex items-center gap-1"><Mail className="w-3 h-3" /> {user.email || 'N/A'}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Phone className="w-3 h-3" /> {user.phone}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-sm font-medium text-gray-900">{user.totalRides || 0}</td>
                  <td className="px-5 py-3 text-sm font-medium text-gray-900">₹{user.totalSpent || 0}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.status || 'active'}
                    </span>
                  </td>
                  <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2">
                      <button onClick={() => handleViewUser(user._id)} className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleBlockUser(user._id, user.status)} className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition">
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Users;