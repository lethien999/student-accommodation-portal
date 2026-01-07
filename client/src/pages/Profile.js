import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import accommodationService from '../services/accommodationService';
import dashboardService from '../services/dashboardService';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  // Dashboard Data
  const [stats, setStats] = useState(null);
  const [accommodations, setAccommodations] = useState([]);

  // Profile Edits
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '', email: '', phone: '', fullName: '', avatar: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Fetch My Accommodations if needed
      if (activeTab === 'accommodations' || activeTab === 'properties') {
        try {
          const response = await accommodationService.getAll({ limit: 100 });
          // Filter client side for now (until we have '/my-accommodations' endpoint)
          setAccommodations(response.accommodations.filter(acc => acc.ownerId === user.id));
        } catch (e) { console.error(e); }
      }

      // Fetch Stats if Dashboard
      if (activeTab === 'dashboard') {
        try {
          let res;
          if (user.role === 'admin') res = await dashboardService.getAdminStats();
          else if (user.role === 'landlord') res = await dashboardService.getLandlordStats();
          else if (user.role === 'sale') res = await dashboardService.getSaleStats();

          if (res?.success) setStats(res.data);
        } catch (e) { console.error(e); }
      }
    };
    fetchData();
  }, [activeTab, user]);

  const fetchProfile = async () => {
    try {
      const response = await authService.getProfile();
      setUser(response.user);
      setFormData({
        username: response.user.username || '',
        email: response.user.email || '',
        phone: response.user.phone || '',
        fullName: response.user.fullName || '',
        avatar: response.user.avatar || ''
      });

      // Set default tab based on role? Or keep profile?
      // User requested dashboard experience. If admin configures it, maybe default to dashboard?
      // Let's keep profile as default for now, can be changed.
      if (response.user.role !== 'user') setActiveTab('dashboard'); // Auto-switch for admins

    } catch (err) {
      setError(err.message || 'Không thể tải thông tin profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await authService.updateProfile(formData);
      setUser(res.user);
      setEditMode(false);
      alert('Cập nhật thành công');
    } catch (e) { alert(e.message); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) return alert('Mật khẩu không khớp');
    try {
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Đổi mật khẩu thành công');
    } catch (e) { alert(e.message); }
  };

  if (loading) return <div className="flex justify-center p-10">Đang tải...</div>;
  if (!user) return null;

  // Build Tabs
  const tabs = [];
  if (user.role !== 'user') {
    tabs.push({ id: 'dashboard', label: 'Tổng quan' });
  }

  tabs.push({ id: 'profile', label: 'Thông tin cá nhân' });
  tabs.push({ id: 'password', label: 'Đổi mật khẩu' });

  if (user.role === 'landlord' || user.role === 'admin') {
    tabs.push({ id: 'properties', label: 'Quản lý nhà trọ' });
  }
  if (user.role === 'admin') {
    tabs.push({ id: 'users', label: 'Quản lý người dùng' });
  }
  if (user.role === 'sale') {
    tabs.push({ id: 'leads', label: 'Khách hàng' });
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 text-indigo-700">
          {user.role === 'admin' ? 'Quản trị hệ thống' : user.role === 'landlord' ? 'Kênh chủ nhà' : 'Hồ sơ của tôi'}
        </h1>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Tabs Header */}
          <div className="border-b bg-gray-50 flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                    ? 'bg-white text-indigo-600 border-t-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-800'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 min-h-[400px]">
            {/* --- DASHBOARD VIEW --- */}
            {activeTab === 'dashboard' && stats && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">Thống kê hoạt động</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {stats.overview && Object.entries(stats.overview).map(([key, val]) => (
                    <div key={key} className="bg-indigo-50 p-6 rounded-lg text-center">
                      <p className="text-gray-500 uppercase text-xs tracking-wider mb-2">{key.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="text-4xl font-extrabold text-indigo-600">{val}</p>
                    </div>
                  ))}
                </div>
                {stats.rolesStats && (
                  <div className="mt-6 border-t pt-6">
                    <h3 className="font-bold mb-4">Phân bố người dùng</h3>
                    <div className="flex gap-4 flex-wrap">
                      {stats.rolesStats.map((r, idx) => (
                        <div key={idx} className="bg-gray-100 px-4 py-2 rounded">
                          {r.role}: <b>{r.count}</b>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* --- PROPERTIES VIEW --- */}
            {activeTab === 'properties' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Danh sách tin đăng</h2>
                  <Link to="/accommodations/new" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">+ Đăng mới</Link>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {accommodations.length === 0 ? <p>Chưa có bài đăng nào.</p> : accommodations.map(acc => (
                    <div key={acc.id} className="border p-4 rounded-lg flex justify-between items-center hover:bg-gray-50">
                      <div>
                        <h3 className="font-bold text-lg">{acc.name}</h3>
                        <p className="text-gray-500">{acc.address} - <span className="font-semibold text-green-600">{acc.price} VND</span></p>
                        <span className={`text-xs px-2 py-1 rounded mt-1 inline-block ${acc.status === 'approved' ? 'bg-green-200' : 'bg-yellow-200'}`}>{acc.status}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Link to={`/accommodations/edit/${acc.id}`} className="bg-blue-100 text-blue-700 px-3 py-1 rounded">Sửa</Link>
                        <Link to={`/accommodations/${acc.id}`} className="bg-gray-100 text-gray-700 px-3 py-1 rounded">Xem</Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- PROFILE VIEW --- */}
            {activeTab === 'profile' && (
              <div className="max-w-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-2xl font-bold text-indigo-600">
                    {user.username[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{user.fullName || user.username}</h2>
                    <span className="bg-gray-200 px-2 py-0.5 rounded text-sm text-gray-700 uppercase">{user.role}</span>
                  </div>
                  <button onClick={() => setEditMode(!editMode)} className="ml-auto text-indigo-600 hover:underline">
                    {editMode ? 'Hủy chỉnh sửa' : 'Chỉnh sửa thông tin'}
                  </button>
                </div>

                {editMode ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <input className="block w-full border p-3 rounded" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} placeholder="Họ và tên" />
                    <input className="block w-full border p-3 rounded" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Số điện thoại" />
                    <input className="block w-full border p-3 rounded" value={formData.avatar} onChange={(e) => setFormData({ ...formData, avatar: e.target.value })} placeholder="Link Avatar" />
                    <button className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700" type="submit">Lưu thay đổi</button>
                  </form>
                ) : (
                  <div className="space-y-4 text-gray-700">
                    <div className="flex border-b py-2"><span className="w-32 font-medium">Email:</span> {user.email}</div>
                    <div className="flex border-b py-2"><span className="w-32 font-medium">SĐT:</span> {user.phone || 'Chưa cập nhật'}</div>
                    <div className="flex border-b py-2"><span className="w-32 font-medium">Username:</span> {user.username}</div>
                  </div>
                )}
              </div>
            )}

            {/* --- PASSWORD VIEW --- */}
            {activeTab === 'password' && (
              <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
                <h3 className="text-lg font-bold">Đổi mật khẩu</h3>
                <input className="block w-full border p-3 rounded" type="password" name="currentPassword" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value })} placeholder="Mật khẩu hiện tại" />
                <input className="block w-full border p-3 rounded" type="password" name="newPassword" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value })} placeholder="Mật khẩu mới (min 6 ký tự)" />
                <input className="block w-full border p-3 rounded" type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value })} placeholder="Xác nhận mật khẩu" />
                <button className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700">Xác nhận đổi</button>
              </form>
            )}

            {/* --- OTHER TABS placeholders --- */}
            {(activeTab === 'users' || activeTab === 'leads') && (
              <div className="text-center py-10 text-gray-500">
                <p className="text-xl">Chức năng quản lý nâng cao (Phase 3)</p>
                <p>Đang phát triển...</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
