import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import accommodationService from '../services/accommodationService';
import authService from '../services/authService';
import ReviewSection from '../components/ReviewSection';
import BookingModal from '../components/BookingModal';

const AccommodationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [accommodation, setAccommodation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showRoomsModal, setShowRoomsModal] = useState(false); // New Modal state

  useEffect(() => {
    const fetchAccommodation = async () => {
      try {
        const data = await accommodationService.getById(id);
        setAccommodation(data);
        const user = authService.getCurrentUser();
        setIsOwner(user?.id === data.ownerId);
      } catch (err) {
        setError(err.message || 'Failed to fetch accommodation');
      } finally {
        setLoading(false);
      }
    };
    fetchAccommodation();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this accommodation?')) {
      try {
        await accommodationService.delete(id);
        navigate('/accommodations');
      } catch (err) {
        setError(err.message || 'Failed to delete accommodation');
      }
    }
  };

  const RoomsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-indigo-600">📋</span> Danh sách phòng
          </h3>
          <button onClick={() => setShowRoomsModal(false)} className="text-gray-500 hover:text-red-500 text-2xl">&times;</button>
        </div>

        {!accommodation.rooms || accommodation.rooms.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Chưa có thông tin danh sách phòng chi tiết.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {accommodation.rooms.map((room, idx) => (
              <div key={idx} className={`border rounded-lg p-4 text-center transition-all ${room.status === 'available' ? 'bg-green-50 border-green-200 hover:shadow-md cursor-pointer' : 'bg-gray-100 border-gray-200 opacity-70'}`}>
                <p className="font-bold text-lg text-gray-800">{room.name}</p>
                <p className="text-sm text-gray-600">{room.area} m²</p>
                <p className={`font-bold mt-2 ${room.status === 'available' ? 'text-green-600' : 'text-gray-500'}`}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(room.price)}
                </p>
                <span className={`inline-block px-2 py-0.5 rounded text-xs mt-2 ${room.status === 'available' ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                  {room.status === 'available' ? 'Còn trống' : 'Đã thuê'}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button onClick={() => setShowRoomsModal(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded font-medium hover:bg-gray-300">Đóng</button>
        </div>
      </div>
    </div>
  );

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!accommodation) return <div className="p-10 text-center">Not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 relative">
      {showBookingModal && (
        <BookingModal
          accommodation={accommodation}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => { setShowBookingModal(false); alert('Đã gửi yêu cầu xem phòng!'); }}
        />
      )}

      {showRoomsModal && <RoomsModal />}

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN: Images & Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
            {/* Images Carousel (Modern) */}
            <div className="relative group">
              {accommodation.images && accommodation.images.length > 0 ? (
                <img src={accommodation.images[0]} alt={accommodation.name} className="w-full h-[450px] object-cover" />
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center">No Image</div>
              )}
              <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm font-medium">
                {accommodation.images?.length || 0} Ảnh
              </div>
            </div>

            <div className="p-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">{accommodation.name}</h1>
                  <div className="flex items-center text-gray-500">
                    <span className="mr-2">📍</span>
                    <span>{accommodation.address}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-extrabold text-red-600">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(accommodation.price)}
                    <span className="text-sm text-gray-500 font-normal">/tháng</span>
                  </p>
                  <p className="text-sm text-gray-500">Cập nhật: {new Date(accommodation.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Features Icons */}
              <div className="flex gap-6 border-y py-4 my-6 text-gray-700">
                <div className="flex items-center gap-2"><span className="text-xl">📐</span> <span>25 m²</span></div>
                <div className="flex items-center gap-2"><span className="text-xl">🛏️</span> <span>Chưa rõ</span></div>
                <div className="flex items-center gap-2"><span className="text-xl">🚿</span> <span>Khép kín</span></div>
              </div>

              <div className="mb-8">
                <h3 className="font-bold text-xl text-gray-800 mb-4 border-l-4 border-indigo-600 pl-3">Thông tin mô tả</h3>
                <p className="text-gray-600 whitespace-pre-line leading-relaxed text-lg">{accommodation.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="font-bold text-xl text-gray-800 mb-4 border-l-4 border-indigo-600 pl-3">Tiện ích</h3>
                <div className="flex flex-wrap gap-3">
                  {accommodation.amenities.map((item, idx) => (
                    <span key={idx} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full font-medium shadow-sm border border-indigo-100">{item}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <ReviewSection accommodationId={id} />
        </div>

        {/* RIGHT COLUMN: Contact & Booking */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-xl rounded-2xl p-6 sticky top-24 border border-indigo-50">
            {/* Available Rooms Button - NEW */}
            <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
              <p className="text-blue-800 font-medium mb-2">Bạn muốn kiểm tra phòng trống?</p>
              <button
                onClick={() => setShowRoomsModal(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded shadow transition-colors flex items-center justify-center gap-2"
              >
                <span>📋</span> Xem danh sách phòng trống
              </button>
              {(accommodation.rooms && accommodation.rooms.length > 0) && (
                <p className="text-xs text-blue-500 mt-2">Còn {accommodation.rooms.filter(r => r.status === 'available').length} phòng trống</p>
              )}
            </div>

            {/* Landlord Info */}
            <div className="flex items-center gap-4 mb-6 border-b pb-6">
              <div className="w-14 h-14 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow">
                {accommodation.owner?.avatar ? <img src={accommodation.owner.avatar} className="w-full h-full object-cover" /> : <span className="flex w-full h-full items-center justify-center text-xl font-bold text-gray-500">{accommodation.owner?.username[0].toUpperCase()}</span>}
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Chủ nhà</p>
                <h4 className="font-bold text-lg text-gray-800">{accommodation.owner?.fullName || accommodation.owner?.username}</h4>
                <div className="text-green-600 text-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span> Đang hoạt động
                </div>
              </div>
            </div>

            {isOwner ? (
              <div className="space-y-3">
                <Link to={`/accommodations/edit/${id}`} className="block w-full text-center bg-gray-100 py-3 rounded-lg font-bold hover:bg-gray-200 text-gray-700">✏️ Chỉnh sửa tin</Link>
                <button onClick={handleDelete} className="block w-full text-center bg-red-50 text-red-600 py-3 rounded-lg font-bold hover:bg-red-100">🗑️ Xóa tin</button>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="block w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-lg font-bold hover:shadow-lg hover:from-green-600 hover:to-green-700 shadow transition-all text-lg transform hover:-translate-y-0.5"
                >
                  ĐẶT LỊCH XEM PHÒNG
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`tel:${accommodation.owner?.phone}`}
                    className="flex flex-col items-center justify-center gap-1 bg-cyan-50 text-cyan-800 py-3 rounded-lg font-bold border border-cyan-100 hover:bg-cyan-100 transition-colors"
                  >
                    <span className="text-xl">📞</span>
                    <span className="text-sm">Gọi điện</span>
                  </a>
                  <a
                    href={`https://zalo.me/${accommodation.owner?.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-1 bg-blue-50 text-blue-800 py-3 rounded-lg font-bold border border-blue-100 hover:bg-blue-100 transition-colors"
                  >
                    <span className="text-xl text-blue-600 font-extrabold" style={{ fontFamily: 'sans-serif' }}>Z</span>
                    <span className="text-sm">Chat Zalo</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 bg-orange-50 p-4 rounded-xl border border-orange-100">
            <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2">⚠️ Lưu ý an toàn</h4>
            <ul className="text-sm text-orange-700 space-y-1 pl-4 list-disc">
              <li>Không đặt cọc nếu chưa xem nhà.</li>
              <li>Kiểm tra kỹ hợp đồng thuê.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AccommodationDetail;