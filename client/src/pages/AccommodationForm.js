import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import accommodationService from '../services/accommodationService';

const AccommodationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    price: '',
    description: '',
    images: [],
    latitude: '',
    longitude: '',
    amenities: [],
    rules: '',
    status: 'available'
  });
  const [imageUrls, setImageUrls] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newAmenity, setNewAmenity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      fetchAccommodation();
    }
  }, [id]);

  const fetchAccommodation = async () => {
    try {
      const accommodation = await accommodationService.getById(id);
      setFormData({
        name: accommodation.name || '',
        address: accommodation.address || '',
        price: accommodation.price || '',
        description: accommodation.description || '',
        images: accommodation.images || [],
        latitude: accommodation.latitude || '',
        longitude: accommodation.longitude || '',
        amenities: accommodation.amenities || [],
        rules: accommodation.rules || '',
        status: accommodation.status || 'available'
      });
      setImageUrls(accommodation.images || []);
    } catch (err) {
      setError(err.message || 'Không thể tải thông tin nhà trọ');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError('');
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setFormData({
        ...formData,
        images: [...imageUrls, newImageUrl.trim()]
      });
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newImages);
    setFormData({
      ...formData,
      images: newImages
    });
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim()) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, newAmenity.trim()]
      });
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (index) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((_, i) => i !== index)
    });
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          alert('Không thể lấy vị trí: ' + error.message);
        }
      );
    } else {
      alert('Trình duyệt không hỗ trợ lấy vị trí');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        images: imageUrls
      };

      if (isEditMode) {
        await accommodationService.update(id, submitData);
      } else {
        await accommodationService.create(submitData);
      }

      navigate('/accommodations');
    } catch (err) {
      setError(err.message || 'Không thể lưu nhà trọ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">
          {isEditMode ? 'Chỉnh sửa nhà trọ' : 'Đăng tin nhà trọ mới'}
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          {/* Basic Information */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Thông tin cơ bản</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên nhà trọ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá thuê/tháng (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="available">Còn trống</option>
                    <option value="unavailable">Đã cho thuê</option>
                    <option value="pending">Đang chờ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Hình ảnh</h2>
            <div className="space-y-4">
              <div className="flex">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Nhập URL hình ảnh"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
                >
                  Thêm
                </button>
              </div>
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x200?text=Invalid+Image';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Vị trí</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vĩ độ
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kinh độ
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleGetLocation}
              className="mt-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Lấy vị trí hiện tại
            </button>
          </div>

          {/* Amenities */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Tiện ích</h2>
            <div className="space-y-4">
              <div className="flex">
                <input
                  type="text"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  placeholder="Nhập tiện ích (VD: Wifi, Điều hòa, ...)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAmenity();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddAmenity}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
                >
                  Thêm
                </button>
              </div>
              {formData.amenities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                    >
                      {amenity}
                      <button
                        type="button"
                        onClick={() => handleRemoveAmenity(index)}
                        className="ml-2 text-indigo-600 hover:text-indigo-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Rules */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Nội quy</h2>
            <textarea
              name="rules"
              value={formData.rules}
              onChange={handleChange}
              rows="4"
              placeholder="Nhập nội quy nhà trọ..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/accommodations')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : isEditMode ? 'Cập nhật' : 'Đăng tin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccommodationForm;

