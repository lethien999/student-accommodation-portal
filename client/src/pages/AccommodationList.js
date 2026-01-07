import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import accommodationService from '../services/accommodationService';

const AccommodationList = () => {
  const [searchParams] = useSearchParams();
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    minPrice: '',
    maxPrice: '',
    status: 'available',
    page: 1,
    limit: 12
  });
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    count: 0
  });

  useEffect(() => {
    fetchAccommodations();
  }, [filters]);

  const fetchAccommodations = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        ...filters,
        page: filters.page,
        limit: filters.limit
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const response = await accommodationService.getAll(params);
      setAccommodations(response.accommodations || []);
      setPagination({
        totalPages: response.totalPages || 1,
        currentPage: response.currentPage || 1,
        count: response.count || 0
      });
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách nhà trọ');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
      page: 1 // Reset to first page when filter changes
    });
  };

  const handlePageChange = (newPage) => {
    setFilters({
      ...filters,
      page: newPage
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Danh sách nhà trọ</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Bộ lọc</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm
              </label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Tên, địa chỉ..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá tối thiểu (VNĐ)
              </label>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá tối đa (VNĐ)
              </label>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="Không giới hạn"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="available">Còn trống</option>
                <option value="unavailable">Đã cho thuê</option>
                <option value="">Tất cả</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        ) : accommodations.length > 0 ? (
          <>
            <div className="mb-4 text-gray-600">
              Tìm thấy {pagination.count} nhà trọ
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accommodations.map((accommodation) => (
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
                    <p className="text-gray-600 mb-2 text-sm">{accommodation.address}</p>
                    <p className="text-indigo-600 font-bold text-lg mb-2">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(accommodation.price)}/tháng
                    </p>
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      accommodation.status === 'available' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {accommodation.status === 'available' ? 'Còn trống' : 'Đã cho thuê'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Trước
                </button>
                {[...Array(pagination.totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === pagination.totalPages ||
                    (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 border rounded-md ${
                          page === pagination.currentPage
                            ? 'bg-indigo-600 text-white'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === pagination.currentPage - 2 ||
                    page === pagination.currentPage + 2
                  ) {
                    return <span key={page} className="px-2">...</span>;
                  }
                  return null;
                })}
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-xl mb-4">Không tìm thấy nhà trọ nào</p>
            <p>Thử thay đổi bộ lọc để tìm kiếm</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccommodationList;

