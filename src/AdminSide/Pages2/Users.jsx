import React, { useState, useEffect } from 'react';
import { FiUsers, FiTrash2, FiUserX, FiUserCheck, FiAlertTriangle } from 'react-icons/fi';
import toast, { Toaster } from "react-hot-toast";
import axios from "axios"; 

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  
  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/users'); 
      setUsers(response.data);
    } catch (error) {
      toast.error(<span className="flex items-center gap-2"><FiAlertTriangle /> Failed to fetch users</span>);
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  //  Delete user 
  const deleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:3000/users/${id}`); 
        toast.success(<span className="flex items-center gap-2"><FiTrash2 /> User deleted successfully</span>);
        fetchUsers();
      } catch (error) {
        toast.error(<span className="flex items-center gap-2"><FiAlertTriangle /> Failed to delete user</span>);
        console.error('Error deleting user:', error);
      }
    }
  };

  // Toggle Active / Inactive 
  const toggleUserStatus = async (user) => {
    try {
      await axios.patch(`http://localhost:3000/users/${user.id}`, { 
        active: !user.active
      });

      toast.success(
        <span className="flex items-center gap-2">
          {user.active ? <FiUserX /> : <FiUserCheck />}
          {user.active ? "User deactivated" : "User activated"}
        </span>
      );

      fetchUsers();
    } catch (error) {
      toast.error(<span className="flex items-center gap-2"><FiAlertTriangle /> Failed to update status</span>);
      console.error('Error updating user:', error);
    }
  };

  const filteredUsers = users
    .filter((user) => {
      const term = search.toLowerCase();
      return (
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.role?.toLowerCase().includes(term) ||
        (user.active ? "active" : "inactive").includes(term) ||
        user.id.toString().includes(term) ||
        user.joinDate?.toLowerCase().includes(term)
      );
    })
    .reverse();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Toaster position="top-right" />

      {/* Header + Search */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Users Management</h1>

        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-400 focus:outline-none"
        />
      </div>

      <div className="text-sm text-gray-600 mb-4">
        Total Users: <span className="font-bold">{filteredUsers.length}</span>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <p className="font-medium">{user.name || 'Unknown User'}</p>
                        <p className="text-gray-500 text-sm">User ID: {user.id}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">{user.email || 'No email'}</td>

                  <td className="px-6 py-4">
                    <span className="px-2 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                      {user.role || 'Customer'}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`px-2 text-xs font-semibold rounded-full ${
                      user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm font-medium">
                    <button
                      onClick={() => toggleUserStatus(user)}
                      className={`mr-3 ${
                        user.active ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'
                      }`}
                    >
                      {user.active ? 'Deactivate' : 'Activate'}
                    </button>

                    <button
                      onClick={() => deleteUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <FiUsers className="text-6xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-500">Try searching with another keyword.</p>
        </div>
      )}
    </div>
  );
};

export default Users;
