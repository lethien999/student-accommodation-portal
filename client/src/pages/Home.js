import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import accommodationService from '../services/accommodationService';

const Home = () => {
  const [featuredAccommodations, setFeaturedAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await accommodationService.getAll({
          limit: 6,
          sortBy: 'createdAt',
          sortOrder: 'DESC'
        });
        setFeaturedAccommodations(response.accommodations || []);
      } catch (error) {
        console.error('Error fetching accommodations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/accommodations?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">
              Tìm Nhà Trọ Phù Hợp Cho Sinh Viên
            </h1>
            <p className="text-xl mb-8">
              Hàng ngàn lựa chọn nhà trọ chất lượng với giá cả phải chăng
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm theo tên, địa chỉ..."
                  className="flex-1 px-6 py-4 rounded-l-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <button
                  type="submit"
                  className="bg-indigo-700 hover:bg-indigo-800 px-8 py-4 rounded-r-lg font-semibold transition duration-200"
                >
                  Tìm kiếm
                </button>
              </div>
            </form>

            <div className="mt-8 flex justify-center space-x-4">
              <Link
                to="/accommodations"
                className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-200"
              >
                Xem tất cả nhà trọ
              </Link>
              <Link
                to="/map"
                className="bg-indigo-700 hover:bg-indigo-800 px-6 py-3 rounded-lg font-semibold transition duration-200"
              >
                Xem trên bản đồ
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Tìm kiếm dễ dàng</h3>
            <p className="text-gray-600">Tìm nhà trọ phù hợp với nhu cầu của bạn một cách nhanh chóng</p>
          </div>
          <div className="text-center">
            <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Đáng tin cậy</h3>
            <p className="text-gray-600">Thông tin nhà trọ được xác thực và đánh giá bởi người dùng</p>
          </div>
          <div className="text-center">
            <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Xem trên bản đồ</h3>
            <p className="text-gray-600">Xem vị trí nhà trọ trên bản đồ và tìm đường đi</p>
          </div>
        </div>
      </div>

      {/* Featured Accommodations */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Nhà trọ nổi bật</h2>
          
          {loading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : featuredAccommodations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredAccommodations.map((accommodation) => (
                <Link
                  key={accommodation.id}
                  to={`/accommodations/${accommodation.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200"
                >
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
                    <h3 className="text-xl font-semibold mb-2">{accommodation.name}</h3>
                    <p className="text-gray-600 mb-2">{accommodation.address}</p>
                    <p className="text-indigo-600 font-bold text-lg">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(accommodation.price)}/tháng
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Chưa có nhà trọ nào
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              to="/accommodations"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200"
            >
              Xem tất cả nhà trọ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

