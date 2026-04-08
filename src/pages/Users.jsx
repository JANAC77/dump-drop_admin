import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Ban, CheckCircle, User, Mail, Phone, Calendar } from 'lucide-react';
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
      const response = await adminAPI.getUsers(1, 100, searchTerm);
      console.log('Users API Response:', response);
      
      // Handle different response structures
      let usersData = [];
      
      // Check various possible response structures
      if (response.data?.users && Array.isArray(response.data.users)) {
        usersData = response.data.users;
      } else if (response.data?.data?.users && Array.isArray(response.data.data.users)) {
        usersData = response.data.data.users;
      } else if (Array.isArray(response.data)) {
        usersData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        usersData = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        // If response is an object with users property
        if (response.data.users && Array.isArray(response.data.users)) {
          usersData = response.data.users;
        } else {
          // Try to extract any array from the response
          for (const key in response.data) {
            if (Array.isArray(response.data[key])) {
              usersData = response.data[key];
              break;
            }
          }
        }
      }
      
      // Ensure usersData is an array
      if (!Array.isArray(usersData)) {
        console.warn('usersData is not an array:', usersData);
        usersData = [];
      }
      
      // Filter only customers (role === 'customer')
      const customersOnly = usersData.filter(user => user && user.role === 'customer');
      
      console.log('All users:', usersData);
      console.log('Customers only:', customersOnly);
      setUsers(customersOnly);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = (user) => {
    console.log('Clicked user:', user);
    console.log('User _id:', user?._id);
    
    const userId = user?._id || user?.id || user?.userId;
    console.log('Navigating to user ID:', userId);
    
    if (userId) {
      navigate(`/users/${userId}`);
    } else {
      toast.error('Invalid user ID');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.length > 2 || e.target.value.length === 0) {
      fetchUsers();
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
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-10 text-center text-gray-500">
                    {loading ? 'Loading...' : 'No customers found'}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user?._id || user?.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => handleViewUser(user)}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user?.name || 'N/A'}</p>
                          <p className="text-xs text-gray-500">ID: {(user?._id || user?.id)?.slice(-6) || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {user?.phone || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Mail className="w-3 h-3" /> {user?.email || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        user?.isAdminVerified !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user?.isAdminVerified !== false ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => handleViewUser(user)} 
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
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

export default Users;