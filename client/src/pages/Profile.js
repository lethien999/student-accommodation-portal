import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import accommodationService from '../services/accommodationService';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    fullName: '',
    avatar: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (user) {
      fetchMyAccommodations();
    }
  }, [user]);

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
    } catch (err) {
      setError(err.message || 'Không thể tải thông tin profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyAccommodations = async () => {
    if (!user) return;
    try {
      const response = await accommodationService.getAll({ limit: 100 });
      // Filter accommodations by current user (this should be done on backend)
      const myAccommodations = response.accommodations.filter(
        acc => acc.ownerId === user.id
      );
      setAccommodations(myAccommodations);
    } catch (err) {
      console.error('Error fetching accommodations:', err);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await authService.updateProfile(formData);
      setUser(response.user);
      setEditMode(false);
      alert('Cập nhật profile thành công!');
    } catch (err) {
      setError(err.message || 'Không thể cập nhật profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    try {
      await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      alert('Đổi mật khẩu thành công!');
    } catch (err) {
      setError(err.message || 'Không thể đổi mật khẩu');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Hồ sơ của tôi</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Thông tin cá nhân
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'password'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Đổi mật khẩu
              </button>
              <button
                onClick={() => setActiveTab('accommodations')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'accommodations'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Nhà trọ của tôi ({accommodations.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                {!editMode ? (
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-2xl font-semibold mb-2">{user?.username}</h2>
                        <p className="text-gray-600">{user?.email}</p>
                        {user?.fullName && <p className="text-gray-600">{user.fullName}</p>}
                        {user?.phone && <p className="text-gray-600">{user.phone}</p>}
                        <p className="text-sm text-gray-500 mt-2">
                          Vai trò: {user?.role === 'landlord' ? 'Chủ nhà' : 'Người dùng'}
                        </p>
                      </div>
                      <button
                        onClick={() => setEditMode(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        Chỉnh sửa
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateProfile}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tên đăng nhập
                        </label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleProfileChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleProfileChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Họ và tên
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleProfileChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleProfileChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Avatar URL
                        </label>
                        <input
                          type="url"
                          name="avatar"
                          value={formData.avatar}
                          onChange={handleProfileChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="flex justify-end space-x-4">
                        <button
                          type="button"
                          onClick={() => setEditMode(false)}
                          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                          Lưu
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <form onSubmit={handleChangePassword} className="max-w-md">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu hiện tại
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu mới
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Xác nhận mật khẩu mới
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Đổi mật khẩu
                  </button>
                </div>
              </form>
            )}

            {/* Accommodations Tab */}
            {activeTab === 'accommodations' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Nhà trọ của tôi</h2>
                  <Link
                    to="/accommodations/new"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Đăng tin mới
                  </Link>
                </div>
                {accommodations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {accommodations.map((accommodation) => (
                      <div key={accommodation.id} className="bg-gray-50 rounded-lg shadow-md overflow-hidden">
                        {accommodation.images && accommodation.images.length > 0 ? (
                          <img
                            src={accommodation.images[0]}
                            alt={accommodation.name}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">Không có hình ảnh</span>
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="text-lg font-semibold mb-2">{accommodation.name}</h3>
                          <p className="text-gray-600 text-sm mb-2">{accommodation.address}</p>
                          <p className="text-indigo-600 font-bold mb-2">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(accommodation.price)}/tháng
                          </p>
                          <div className="flex space-x-2">
                            <Link
                              to={`/accommodations/${accommodation.id}`}
                              className="flex-1 text-center px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                            >
                              Xem
                            </Link>
                            <Link
                              to={`/accommodations/edit/${accommodation.id}`}
                              className="flex-1 text-center px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                            >
                              Sửa
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-4">Bạn chưa đăng tin nhà trọ nào</p>
                    <Link
                      to="/accommodations/new"
                      className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Đăng tin ngay
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

