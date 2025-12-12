import { useState, useEffect } from 'react';
import { Building2, Briefcase, Mail, Calendar, Save, Shield, RefreshCw, Crown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  company: string | null;
  department: string | null;
  job_title: string | null;
  role: string;
  created_at: string;
}

interface ProfilePageProps {
  currentView: string;
  userName: string;
  onNavigate: (view: string) => void;
  onSignOut: () => void;
}

export function ProfilePage({ currentView, userName, onNavigate, onSignOut }: ProfilePageProps) {
  const { user, appUser, isAdmin, isSuperAdmin, refreshProfile } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    company: '',
    department: '',
    job_title: '',
  });

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const timestamp = Date.now();
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`*, _cache_buster:created_at`)
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        console.log('Loaded profile data:', data);
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          company: data.company || '',
          department: data.department || '',
          job_title: data.job_title || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: formData.full_name,
          company: formData.company || null,
          department: formData.department || null,
          job_title: formData.job_title || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      await loadProfile();
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        alert('Error refreshing profile: ' + error.message);
        return;
      }

      if (data) {
        console.log('Fresh profile data from database:', data);
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          company: data.company || '',
          department: data.department || '',
          job_title: data.job_title || '',
        });

        await refreshProfile();

        alert(`Profile refreshed!\nRole: ${data.role}\nName: ${data.full_name}`);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
      alert('Failed to refresh profile');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-700 px-8 py-12 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-4 p-3">
              <img src="/jlg_logo_1.png" alt="JLG" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {profile?.full_name || 'User'}
            </h1>
            <p className="text-cyan-100">{profile?.email || user?.email}</p>
          </div>

          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
              {!isEditing ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium disabled:opacity-50"
                    title="Refresh profile data"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
                  >
                    Edit Profile
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        full_name: profile?.full_name || '',
                        company: profile?.company || '',
                        department: profile?.department || '',
                        job_title: profile?.job_title || '',
                      });
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-gray-900 text-lg">{profile?.full_name || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <p className="text-gray-900 text-lg">{profile?.email || user?.email}</p>
                <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="w-4 h-4" />
                  Company
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Enter your company name"
                  />
                ) : (
                  <p className="text-gray-900 text-lg">{profile?.company || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Briefcase className="w-4 h-4" />
                  Department
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Enter your department"
                  />
                ) : (
                  <p className="text-gray-900 text-lg">{profile?.department || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Briefcase className="w-4 h-4" />
                  Job Title
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Enter your job title"
                  />
                ) : (
                  <p className="text-gray-900 text-lg">{profile?.job_title || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Shield className="w-4 h-4" />
                  Account Role
                </label>
                <div className="flex items-center gap-3">
                  {profile?.role === 'super_admin' ? (
                    <span className="px-3 py-1.5 bg-amber-100 text-amber-900 text-sm font-bold rounded-lg flex items-center gap-2 border-2 border-amber-300">
                      <Crown className="w-4 h-4" />
                      Super Administrator
                    </span>
                  ) : profile?.role === 'admin' ? (
                    <span className="px-3 py-1.5 bg-red-100 text-red-700 text-sm font-semibold rounded-lg">
                      Administrator
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-semibold rounded-lg">
                      User
                    </span>
                  )}
                  <p className="text-sm text-gray-500">
                    {profile?.role === 'super_admin'
                      ? 'Owner with full control and cannot be modified by other admins'
                      : profile?.role === 'admin'
                      ? 'Full system access with user management capabilities'
                      : 'Standard user access'}
                  </p>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  Member Since
                </label>
                <p className="text-gray-900 text-lg">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {isAdmin() && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mt-6">
            <div className={`bg-gradient-to-r ${isSuperAdmin() ? 'from-amber-600 to-amber-700' : 'from-red-600 to-red-700'} px-8 py-6`}>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                {isSuperAdmin() ? <Crown className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
                {isSuperAdmin() ? 'Super Admin Tools' : 'Admin Tools'}
              </h2>
            </div>
            <div className="p-8">
              <p className="text-gray-600 mb-4">
                {isSuperAdmin()
                  ? 'As the Super Administrator (Owner), you have full control over the system:'
                  : 'As an administrator, you have access to additional features:'}
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className={`w-2 h-2 ${isSuperAdmin() ? 'bg-amber-600' : 'bg-red-600'} rounded-full`}></div>
                  View all user simulations
                </li>
                <li className="flex items-center gap-2">
                  <div className={`w-2 h-2 ${isSuperAdmin() ? 'bg-amber-600' : 'bg-red-600'} rounded-full`}></div>
                  Delete any simulation
                </li>
                <li className="flex items-center gap-2">
                  <div className={`w-2 h-2 ${isSuperAdmin() ? 'bg-amber-600' : 'bg-red-600'} rounded-full`}></div>
                  {isSuperAdmin()
                    ? 'Full user management - assign any role including Admin and Super Admin'
                    : 'Manage user roles - assign Admin to regular users'}
                </li>
                {isSuperAdmin() && (
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                    Protected account - your Super Admin role cannot be changed by other admins
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
