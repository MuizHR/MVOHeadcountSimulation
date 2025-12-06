import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Users, Search, Crown, ChevronUp, ChevronDown, MoreVertical, UserPlus, X, AlertTriangle, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'user';
  company: string | null;
  department: string | null;
  job_title: string | null;
  created_at: string;
  last_active_at: string | null;
  is_active: boolean;
}

type SortColumn = 'full_name' | 'company' | 'role' | 'created_at';
type SortDirection = 'asc' | 'desc';
type DateFilter = 'all' | 'last7days' | 'last30days' | 'thisyear';

export const UserManagement: React.FC = () => {
  const { isAdmin, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Sorting
  const [sortColumn, setSortColumn] = useState<SortColumn>(() => {
    return (localStorage.getItem('userManagement_sortColumn') as SortColumn) || 'full_name';
  });
  const [sortDirection, setSortDirection] = useState<SortDirection>(() => {
    return (localStorage.getItem('userManagement_sortDirection') as SortDirection) || 'asc';
  });

  // Filters
  const [userFilter, setUserFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'super_admin' | 'admin' | 'user'>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  // Bulk actions
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // Modals
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangeRoleModal, setShowChangeRoleModal] = useState(false);
  const [showBulkRoleModal, setShowBulkRoleModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [activeMenuUserId, setActiveMenuUserId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Form states
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'user' as const, company: '', department: '' });
  const [editForm, setEditForm] = useState({ full_name: '', company: '', department: '', job_title: '' });
  const [newRole, setNewRole] = useState<'super_admin' | 'admin' | 'user'>('user');
  const [bulkRole, setBulkRole] = useState<'super_admin' | 'admin' | 'user'>('user');

  useEffect(() => {
    if (!isAdmin()) {
      return;
    }
    loadUsers();
  }, [isAdmin]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, role, company, department, job_title, created_at, last_active_at, is_active');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: SortColumn) => {
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
    localStorage.setItem('userManagement_sortColumn', column);
    localStorage.setItem('userManagement_sortDirection', newDirection);
  };

  const handleUpdateRole = async (userId: string, role: 'super_admin' | 'admin' | 'user') => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role })
        .eq('id', userId);

      if (error) throw error;

      await loadUsers();
      setShowChangeRoleModal(false);
      setEditingUser(null);
    } catch (error: any) {
      console.error('Error updating role:', error);
      alert(`Failed to update user role: ${error.message || 'Unknown error'}`);
    }
  };

  const handleBulkUpdateRole = async () => {
    try {
      const userIds = Array.from(selectedUsers);
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: bulkRole })
        .in('id', userIds);

      if (error) throw error;

      await loadUsers();
      setSelectedUsers(new Set());
      setShowBulkRoleModal(false);
    } catch (error: any) {
      console.error('Error updating roles:', error);
      alert(`Failed to update roles: ${error.message || 'Unknown error'}`);
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      await loadUsers();
      setShowDeactivateModal(false);
      setEditingUser(null);
    } catch (error: any) {
      console.error('Error updating user status:', error);
      alert(`Failed to update user status: ${error.message || 'Unknown error'}`);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editingUser) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: editForm.full_name,
          company: editForm.company,
          department: editForm.department,
          job_title: editForm.job_title
        })
        .eq('id', editingUser.id);

      if (error) throw error;

      await loadUsers();
      setShowEditModal(false);
      setEditingUser(null);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert(`Failed to update profile: ${error.message || 'Unknown error'}`);
    }
  };

  const isUserOnline = (lastActive: string | null): boolean => {
    if (!lastActive) return false;
    const diff = Date.now() - new Date(lastActive).getTime();
    return diff < 10 * 60 * 1000;
  };

  const getLastActiveText = (lastActive: string | null): string => {
    if (!lastActive) return 'Never active';
    const date = new Date(lastActive);
    const now = Date.now();
    const diff = now - date.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return date.toLocaleDateString();
  };

  const uniqueCompanies = useMemo(() => {
    const companies = users
      .map(u => u.company)
      .filter((c): c is string => !!c);
    return Array.from(new Set(companies)).sort();
  }, [users]);

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const globalMatch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const userMatch = userFilter === '' ||
                       user.full_name.toLowerCase().includes(userFilter.toLowerCase()) ||
                       user.email.toLowerCase().includes(userFilter.toLowerCase());

      const companyMatch = companyFilter === 'all' || user.company === companyFilter;

      const roleMatch = roleFilter === 'all' || user.role === roleFilter;

      let dateMatch = true;
      if (dateFilter !== 'all') {
        const created = new Date(user.created_at).getTime();
        const now = Date.now();
        switch (dateFilter) {
          case 'last7days':
            dateMatch = now - created < 7 * 86400000;
            break;
          case 'last30days':
            dateMatch = now - created < 30 * 86400000;
            break;
          case 'thisyear':
            dateMatch = new Date(user.created_at).getFullYear() === new Date().getFullYear();
            break;
        }
      }

      return globalMatch && userMatch && companyMatch && roleMatch && dateMatch;
    });

    filtered.sort((a, b) => {
      let aVal: any, bVal: any;

      switch (sortColumn) {
        case 'full_name':
          aVal = a.full_name.toLowerCase();
          bVal = b.full_name.toLowerCase();
          break;
        case 'company':
          aVal = (a.company || '').toLowerCase();
          bVal = (b.company || '').toLowerCase();
          break;
        case 'role':
          const roleOrder = { super_admin: 3, admin: 2, user: 1 };
          aVal = roleOrder[a.role];
          bVal = roleOrder[b.role];
          break;
        case 'created_at':
          aVal = new Date(a.created_at).getTime();
          bVal = new Date(b.created_at).getTime();
          break;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [users, searchTerm, userFilter, companyFilter, roleFilter, dateFilter, sortColumn, sortDirection]);

  const stats = useMemo(() => ({
    total: users.length,
    superAdmins: users.filter(u => u.role === 'super_admin').length,
    admins: users.filter(u => u.role === 'admin').length,
    regularUsers: users.filter(u => u.role === 'user').length
  }), [users]);

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredAndSortedUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredAndSortedUsers.map(u => u.id)));
    }
  };

  const toggleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const openEditModal = (user: UserProfile) => {
    setEditingUser(user);
    setEditForm({
      full_name: user.full_name,
      company: user.company || '',
      department: user.department || '',
      job_title: user.job_title || ''
    });
    setShowEditModal(true);
    setActiveMenuUserId(null);
  };

  const openChangeRoleModal = (user: UserProfile) => {
    setEditingUser(user);
    setNewRole(user.role);
    setShowChangeRoleModal(true);
    setActiveMenuUserId(null);
  };

  const openDeactivateModal = (user: UserProfile) => {
    setEditingUser(user);
    setShowDeactivateModal(true);
    setActiveMenuUserId(null);
  };

  if (!isAdmin()) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          Access denied. Administrator privileges required.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading users...</div>
      </div>
    );
  }

  const SortableHeader = ({ column, children }: { column: SortColumn; children: React.ReactNode }) => (
    <th
      onClick={() => handleSort(column)}
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-center gap-2">
        {children}
        {sortColumn === column && (
          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
        )}
      </div>
    </th>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="px-6 py-3 bg-primary text-white font-semibold rounded-button hover:bg-primary-hover transition-all shadow-card hover:shadow-card-hover flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Invite User
        </button>
      </div>

      <div className={`${isSuperAdmin() ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4 mb-6`}>
        <p className={`text-sm ${isSuperAdmin() ? 'text-amber-800' : 'text-blue-800'}`}>
          {isSuperAdmin() ? (
            <>
              <strong className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                Super Admin Mode:
              </strong>
              You have full control over all users and can assign admin roles.
            </>
          ) : (
            <>
              <strong>Admin Mode:</strong> You can manage regular users and assign admin roles. You cannot modify super admin accounts.
            </>
          )}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-700 flex items-center gap-4">
        <span>
          Total users: <strong>{stats.total}</strong>
        </span>
        {stats.superAdmins > 0 && (
          <>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => setRoleFilter(roleFilter === 'super_admin' ? 'all' : 'super_admin')}
              className={`hover:underline ${roleFilter === 'super_admin' ? 'font-bold text-amber-700' : 'text-amber-600'}`}
            >
              {stats.superAdmins} super admin{stats.superAdmins !== 1 ? 's' : ''}
            </button>
          </>
        )}
        <span className="text-gray-300">|</span>
        <button
          onClick={() => setRoleFilter(roleFilter === 'admin' ? 'all' : 'admin')}
          className={`hover:underline ${roleFilter === 'admin' ? 'font-bold text-amber-700' : 'text-amber-600'}`}
        >
          {stats.admins} admin{stats.admins !== 1 ? 's' : ''}
        </button>
        <span className="text-gray-300">|</span>
        <button
          onClick={() => setRoleFilter(roleFilter === 'user' ? 'all' : 'user')}
          className={`hover:underline ${roleFilter === 'user' ? 'font-bold text-blue-700' : 'text-blue-600'}`}
        >
          {stats.regularUsers} user{stats.regularUsers !== 1 ? 's' : ''}
        </button>
      </div>

      {selectedUsers.size > 0 && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-teal-600" />
            <span className="font-semibold text-teal-900">
              {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowBulkRoleModal(true)}
              className="px-4 py-2 bg-teal-600 text-white rounded-button hover:bg-teal-700 transition-colors text-sm font-medium"
            >
              Change Role
            </button>
            <button
              onClick={() => setSelectedUsers(new Set())}
              className="px-4 py-2 bg-white border border-teal-300 text-teal-700 rounded-button hover:bg-teal-50 transition-colors text-sm font-medium"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === filteredAndSortedUsers.length && filteredAndSortedUsers.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                </th>
                <SortableHeader column="full_name">User</SortableHeader>
                <SortableHeader column="company">Company / Department</SortableHeader>
                <SortableHeader column="role">Role</SortableHeader>
                <SortableHeader column="created_at">Joined</SortableHeader>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
              <tr className="bg-gray-100">
                <td className="px-6 py-2"></td>
                <td className="px-6 py-2">
                  <input
                    type="text"
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    placeholder="Filter by name or email"
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-transparent"
                  />
                </td>
                <td className="px-6 py-2">
                  <select
                    value={companyFilter}
                    onChange={(e) => setCompanyFilter(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-primary"
                  >
                    <option value="all">All Companies</option>
                    {uniqueCompanies.map(company => (
                      <option key={company} value={company}>{company}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-2">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as any)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-primary"
                  >
                    <option value="all">All Roles</option>
                    <option value="user">User</option>
                    <option value="admin">Administrator</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </td>
                <td className="px-6 py-2">
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-primary"
                  >
                    <option value="all">All Time</option>
                    <option value="last7days">Last 7 Days</option>
                    <option value="last30days">Last 30 Days</option>
                    <option value="thisyear">This Year</option>
                  </select>
                </td>
                <td className="px-6 py-2"></td>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedUsers.map((user) => (
                <tr key={user.id} className={!user.is_active ? 'opacity-50 bg-gray-50' : ''}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => toggleSelectUser(user.id)}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="flex-shrink-0 h-10 w-10 bg-teal-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-teal-600" />
                        </div>
                        <div
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                            isUserOnline(user.last_active_at) ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                          title={isUserOnline(user.last_active_at) ? 'Online now' : `Last active: ${getLastActiveText(user.last_active_at)}`}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.company || '-'}</div>
                    <div className="text-sm text-gray-500">{user.department || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'super_admin'
                          ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-900 border border-amber-300'
                          : user.role === 'admin'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {user.role === 'super_admin' && <Crown className="w-3 h-3" />}
                      {user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin' ? 'Administrator' : 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {user.role === 'super_admin' && !isSuperAdmin() ? (
                      <span className="text-gray-400 flex items-center gap-1 text-xs">
                        <Shield className="w-3 h-3" />
                        Protected
                      </span>
                    ) : (
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenuUserId(activeMenuUserId === user.id ? null : user.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {activeMenuUserId === user.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setActiveMenuUserId(null)}
                            />
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                              <button
                                onClick={() => openEditModal(user)}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                View / Edit Profile
                              </button>
                              <button
                                onClick={() => openChangeRoleModal(user)}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                Change Role
                              </button>
                              <button
                                onClick={() => openDeactivateModal(user)}
                                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${
                                  user.is_active ? 'text-red-600' : 'text-green-600'
                                }`}
                              >
                                {user.is_active ? 'Deactivate User' : 'Reactivate User'}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedUsers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No users found matching your filters.
          </div>
        )}
      </div>

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Invite User</h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="user">User</option>
                  <option value="admin">Administrator</option>
                  {isSuperAdmin() && <option value="super_admin">Super Admin</option>}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={inviteForm.company}
                  onChange={(e) => setInviteForm({ ...inviteForm, company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={inviteForm.department}
                  onChange={(e) => setInviteForm({ ...inviteForm, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Department name"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-button hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Invite functionality requires email service integration');
                  setShowInviteModal(false);
                }}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-button hover:bg-primary-hover transition-colors"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={editForm.company}
                  onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input
                  type="text"
                  value={editForm.job_title}
                  onChange={(e) => setEditForm({ ...editForm, job_title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Role</label>
                <div className="px-3 py-2 bg-gray-100 rounded-lg">
                  <span
                    className={`px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${
                      editingUser.role === 'super_admin'
                        ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-900 border border-amber-300'
                        : editingUser.role === 'admin'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}
                  >
                    {editingUser.role === 'super_admin' && <Crown className="w-3 h-3" />}
                    {editingUser.role === 'super_admin' ? 'Super Admin' : editingUser.role === 'admin' ? 'Administrator' : 'User'}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-button hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProfile}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-button hover:bg-primary-hover transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {showChangeRoleModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Change User Role</h2>
              <button
                onClick={() => setShowChangeRoleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Change role for <strong>{editingUser.full_name}</strong>
              </p>
              <div className="space-y-2">
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="user"
                    checked={newRole === 'user'}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900">User</span>
                </label>
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="admin"
                    checked={newRole === 'admin'}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900">Administrator</span>
                </label>
                {isSuperAdmin() && (
                  <label className="flex items-center p-3 border border-amber-300 bg-amber-50 rounded-lg cursor-pointer hover:bg-amber-100">
                    <input
                      type="radio"
                      value="super_admin"
                      checked={newRole === 'super_admin'}
                      onChange={(e) => setNewRole(e.target.value as any)}
                      className="w-4 h-4 text-amber-600"
                    />
                    <span className="ml-3 text-sm font-medium text-amber-900 flex items-center gap-1">
                      <Crown className="w-4 h-4" />
                      Super Admin
                    </span>
                  </label>
                )}
              </div>
              {newRole === 'super_admin' && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800">
                    Super Admins have full system access and cannot be modified by regular admins.
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowChangeRoleModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-button hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateRole(editingUser.id, newRole)}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-button hover:bg-primary-hover transition-colors"
              >
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Role Change Modal */}
      {showBulkRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Change Role for Selected Users</h2>
              <button
                onClick={() => setShowBulkRoleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Change role for <strong>{selectedUsers.size}</strong> selected user{selectedUsers.size !== 1 ? 's' : ''}
              </p>
              <div className="space-y-2">
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="user"
                    checked={bulkRole === 'user'}
                    onChange={(e) => setBulkRole(e.target.value as any)}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900">User</span>
                </label>
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="admin"
                    checked={bulkRole === 'admin'}
                    onChange={(e) => setBulkRole(e.target.value as any)}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900">Administrator</span>
                </label>
                {isSuperAdmin() && (
                  <label className="flex items-center p-3 border border-amber-300 bg-amber-50 rounded-lg cursor-pointer hover:bg-amber-100">
                    <input
                      type="radio"
                      value="super_admin"
                      checked={bulkRole === 'super_admin'}
                      onChange={(e) => setBulkRole(e.target.value as any)}
                      className="w-4 h-4 text-amber-600"
                    />
                    <span className="ml-3 text-sm font-medium text-amber-900 flex items-center gap-1">
                      <Crown className="w-4 h-4" />
                      Super Admin
                    </span>
                  </label>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBulkRoleModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-button hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkUpdateRole}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-button hover:bg-primary-hover transition-colors"
              >
                Update Roles
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate/Reactivate Modal */}
      {showDeactivateModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingUser.is_active ? 'Deactivate User' : 'Reactivate User'}
              </h2>
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  {editingUser.is_active
                    ? `Are you sure you want to deactivate ${editingUser.full_name}? They will lose access to the application.`
                    : `Are you sure you want to reactivate ${editingUser.full_name}? They will regain access to the application.`
                  }
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-button hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleToggleActive(editingUser.id, editingUser.is_active)}
                className={`flex-1 px-4 py-2 rounded-button transition-colors ${
                  editingUser.is_active
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {editingUser.is_active ? 'Deactivate' : 'Reactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
