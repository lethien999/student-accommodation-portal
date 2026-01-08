import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import accommodationService from '../services/accommodationService';
import dashboardService from '../services/dashboardService';
import bookingService from '../services/bookingService'; // Phase 3

const Profile = () => {
  const { user, updateUser } = useAuth(); // Use user from context
  const [activeTab, setActiveTab] = useState('profile');

  // Dashboard Data
  const [stats, setStats] = useState(null);
  const [accommodations, setAccommodations] = useState([]);

  // Booking Data (Phase 3)
  const [myBookings, setMyBookings] = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);

  // Profile Edits
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '', email: '', phone: '', fullName: '', avatar: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });

  // Init Form Data when user changes, and set active tab
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        fullName: user.fullName || '',
        avatar: user.avatar || ''
      });
      if (activeTab === 'profile' && user.role !== 'user') {
        setActiveTab('dashboard');
      }
    }
  }, [user, activeTab]); // Run when user context updates

  // Fetch Data based on Tab
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // 1. My Accommodations
      if (activeTab === 'properties') {
        try {
          // ... (keep existing logic)
          const response = await accommodationService.getAll({ limit: 100 });
          setAccommodations(response.accommodations.filter(acc => acc.ownerId === user.id));
        } catch (e) { console.error(e); }
      }

      // 2. Dashboard Stats
      if (activeTab === 'dashboard') {
        try {
          let res;
          if (user.role === 'admin') res = await dashboardService.getAdminStats();
          else if (user.role === 'landlord') res = await dashboardService.getLandlordStats();
          else if (user.role === 'sale') res = await dashboardService.getSaleStats();

          if (res?.success) setStats(res.data);
        } catch (e) { console.error(e); }
      }

      // 3. My Bookings (Viewing History)
      if (activeTab === 'bookings') {
        try {
          const res = await bookingService.getMyBookings();
          setMyBookings(res.bookings);
        } catch (e) { console.error(e); }
      }

      // 4. Booking Requests (Landlord View)
      if (activeTab === 'requests') {
        try {
          const res = await bookingService.getLandlordRequests();
          setBookingRequests(res.bookings);
        } catch (e) { console.error(e); }
      }
    };
    fetchData();
  }, [activeTab, user]);

  // Handle Updates
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await authService.updateProfile(formData);
      updateUser(res.user); // Update Context
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

  const handleBookingStatus = async (bookingId, status) => {
    if (!window.confirm(`Bạn có chắc chắn muốn ${status === 'confirmed' ? 'XÁC NHẬN lịch hẹn' : 'TỪ CHỐI'} này?`)) return;
    try {
      await bookingService.updateStatus(bookingId, status);
      const res = await bookingService.getLandlordRequests();
      setBookingRequests(res.bookings);
      alert('Cập nhật thành công!');
    } catch (e) { alert(e.response?.data?.message || 'Lỗi cập nhật'); }
  };

  if (loading) return <div className="flex justify-center p-10">Đang tải...</div>;
  if (!user) return null;

  const tabs = [];
  if (user.role !== 'user') tabs.push({ id: 'dashboard', label: 'Tổng quan' });

  tabs.push({ id: 'profile', label: 'Thông tin cá nhân' });
  tabs.push({ id: 'bookings', label: 'Lịch hẹn xem phòng' }); // Renamed

  if (user.role === 'landlord' || user.role === 'admin') {
    tabs.push({ id: 'properties', label: 'Quản lý nhà trọ' });
    tabs.push({ id: 'requests', label: 'Yêu cầu xem phòng' }); // Renamed
  }

  tabs.push({ id: 'password', label: 'Đổi mật khẩu' });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 text-indigo-700">
          {user.role === 'admin' ? 'Quản trị hệ thống' : user.role === 'landlord' ? 'Kênh chủ nhà' : 'Hồ sơ của tôi'}
        </h1>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
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
              </div>
            )}

            {/* --- PROPERTIES VIEW --- */}
            {activeTab === 'properties' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Danh sách tin đăng</h2>
                  <Link to="/accommodations/new" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">+ Đăng mới</Link>
                </div>
                <div className="space-y-4">
                  {accommodations.map(acc => (
                    <div key={acc.id} className="border p-4 rounded-lg flex justify-between items-center bg-white hover:bg-gray-50">
                      <div>
                        <h3 className="font-bold text-lg">{acc.name}</h3>
                        <p className="text-gray-500">{acc.address} - <span className="font-semibold text-green-600">{acc.price} VND</span></p>
                        <span className={`text-xs px-2 py-1 rounded mt-1 inline-block ${acc.status === 'approved' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>{acc.status || 'Active'}</span>
                      </div>
                      <div>
                        <Link to={`/accommodations/edit/${acc.id}`} className="text-indigo-600 hover:underline mr-4">Sửa</Link>
                        <Link to={`/accommodations/${acc.id}`} className="text-gray-600 hover:underline">Xem</Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- REQUESTS VIEW (Student) --- */}
            {activeTab === 'bookings' && (
              <div>
                <h2 className="text-xl font-bold mb-6">Lịch hẹn xem phòng đã đặt</h2>
                {myBookings.length === 0 ? <p className="text-gray-500">Bạn chưa đặt lịch xem phòng nào.</p> : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phòng</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày xem</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số người</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SĐT Liên hệ</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {myBookings.map(bk => (
                          <tr key={bk.id}>
                            <td className="px-6 py-4 font-medium">{bk.accommodation?.name}</td>
                            <td className="px-6 py-4">{bk.checkInDate}</td>
                            <td className="px-6 py-4">{bk.numOfPeople || 1}</td>
                            <td className="px-6 py-4">{bk.phoneNumber || 'N/A'}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                                ${bk.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                  bk.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'}`}>
                                {bk.status === 'confirmed' ? 'Đã xác nhận' : bk.status === 'pending' ? 'Chờ xác nhận' : 'Đã hủy'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* --- REQUESTS VIEW (Landlord) --- */}
            {activeTab === 'requests' && (
              <div>
                <h2 className="text-xl font-bold mb-6">Yêu cầu xem phòng từ khách</h2>
                {bookingRequests.length === 0 ? <p className="text-gray-500">Chưa có yêu cầu nào.</p> : (
                  <div className="space-y-4">
                    {bookingRequests.map(req => (
                      <div key={req.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg text-indigo-700">{req.accommodation?.name}</h3>
                            <div className="mt-2 text-gray-700">
                              <p><span className="font-semibold">Khách:</span> {req.user?.fullName || req.user?.username}</p>
                              <p><span className="font-semibold">SĐT:</span> <a href={`tel:${req.phoneNumber || req.user?.phone}`} className="text-blue-600 hover:underline">{req.phoneNumber || req.user?.phone || 'N/A'}</a></p>
                              <p><span className="font-semibold">Ngày muốn xem:</span> {req.checkInDate}</p>
                              <p><span className="font-semibold">Số người:</span> {req.numOfPeople || 1}</p>
                              {req.note && <p className="text-sm bg-gray-50 p-2 rounded mt-2 italic">"{req.note}"</p>}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase 
                                                            ${req.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'}`}>
                              {req.status === 'confirmed' ? 'Đã lên lịch' : req.status === 'pending' ? 'Mới' : req.status}
                            </span>

                            {req.status === 'pending' && (
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => handleBookingStatus(req.id, 'confirmed')}
                                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium"
                                >Xác nhận lịch</button>
                                <button
                                  onClick={() => handleBookingStatus(req.id, 'rejected')}
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium"
                                >Từ chối</button>
                              </div>
                            )}
                            {req.status === 'confirmed' && (
                              <a href={`tel:${req.phoneNumber || req.user?.phone}`} className="text-blue-600 text-sm hover:underline mt-1">Gọi ngay</a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* --- PROFILE & PASSWORD VIEW --- */}
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
                  </div>
                )}
              </div>
            )}
            {activeTab === 'password' && (
              <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
                <h3 className="text-lg font-bold">Đổi mật khẩu</h3>
                <input className="block w-full border p-3 rounded" type="password" name="currentPassword" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value })} placeholder="Mật khẩu hiện tại" />
                <input className="block w-full border p-3 rounded" type="password" name="newPassword" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value })} placeholder="Mật khẩu mới (min 6 ký tự)" />
                <input className="block w-full border p-3 rounded" type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value })} placeholder="Xác nhận mật khẩu" />
                <button className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700">Xác nhận đổi</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
