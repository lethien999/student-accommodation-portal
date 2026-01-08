import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import accommodationService from '../services/accommodationService';
import SearchBox from '../components/SearchBox';

const Home = () => {
  const [hotAccommodations, setHotAccommodations] = useState([]);
  const [newAccommodations, setNewAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Hot (Top Views) - Assuming 'views' sorting is supported or just random for now if not
        // Current backend supports sortBy.
        const hotRes = await accommodationService.getAll({
          limit: 4,
          sortBy: 'views',
          sortOrder: 'DESC'
        });

        // Fetch New (Latest)
        const newRes = await accommodationService.getAll({
          limit: 8,
          sortBy: 'createdAt',
          sortOrder: 'DESC'
        });

        setHotAccommodations(hotRes.accommodations || []);
        setNewAccommodations(newRes.accommodations || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const AccommodationCard = ({ item }) => (
    <Link
      to={`/accommodations/${item.id}`}
      className="bg-white border rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group block h-full flex flex-col"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={item.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=80'}
          alt={item.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <span className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
          {item.type || 'Phòng trọ'}
        </span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-2 group-hover:text-blue-600">
          {item.name}
        </h3>
        <div className="flex items-center text-gray-500 text-sm mb-2">
          <span>{item.address}</span>
        </div>
        <div className="flex items-center justify-between mt-auto">
          <span className="font-bold text-red-600 text-lg">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}/tháng
          </span>
          <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
        </div>
      </div>
    </Link>
  );

  const locations = [
    { name: 'Quận 7', img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80' },
    { name: 'Bình Thạnh', img: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&q=80' },
    { name: 'Quận 10', img: 'https://plus.unsplash.com/premium_photo-1661964177687-57388c2a5d92?w=400&q=80' },
    { name: 'Thủ Đức', img: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?w=400&q=80' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* 1. HERO & SEARCH */}
      <div className="bg-gradient-to-b from-blue-700 to-blue-500 text-white pb-16 pt-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">Kênh thông tin Phòng trọ số 1 Việt Nam</h1>
          <p className="text-center text-blue-100 mb-8">Hơn 50.000+ tin đăng chính chủ đang chờ bạn</p>
          <SearchBox />
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 pb-12 space-y-12">

        {/* 2. POPULAR LOCATIONS */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 mt-12">Khu vực nổi bật</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {locations.map(loc => (
              <Link
                key={loc.name}
                to={`/accommodations?search=${loc.name}`}
                className="relative rounded-lg overflow-hidden h-40 group shadow-md"
              >
                <img src={loc.img} alt={loc.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                  <span className="text-white font-bold text-xl shadow-sm">{loc.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. HOT LISTINGS */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-red-600">Tin nổi bật</h2>
            <Link to="/accommodations?sort=views" className="text-blue-600 hover:underline">Xem tất cả</Link>
          </div>
          {loading ? <p>Đang tải...</p> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {hotAccommodations.map(item => <AccommodationCard key={item.id} item={item} />)}
            </div>
          )}
        </section>

        {/* 4. NEW LISTINGS */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-blue-700">Tin mới đăng</h2>
            <Link to="/accommodations?sort=createdAt" className="text-blue-600 hover:underline">Xem tất cả</Link>
          </div>
          {loading ? <p>Đang tải...</p> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {newAccommodations.map(item => <AccommodationCard key={item.id} item={item} />)}
            </div>
          )}
        </section>

        {/* 5. WHY CHOOSE US (Features re-styled) */}
        <section className="bg-white p-8 rounded-xl shadow-sm border">
          <h2 className="text-center font-bold text-2xl mb-8">Tại sao chọn chúng tôi?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🏠</div>
              <h3 className="font-bold text-lg">Thông tin chính xác</h3>
              <p className="text-gray-500 mt-2">Dữ liệu được kiểm duyệt chặt chẽ, đảm bảo đúng thực tế.</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🔍</div>
              <h3 className="font-bold text-lg">Tìm kiếm dễ dàng</h3>
              <p className="text-gray-500 mt-2">Công cụ lọc thông minh, giúp bạn tìm phòng ưng ý nhanh nhất.</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🛡️</div>
              <h3 className="font-bold text-lg">An toàn & Uy tín</h3>
              <p className="text-gray-500 mt-2">Kết nối trực tiếp với chủ nhà, không qua trung gian.</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Home;
