import React, { useState, useEffect } from 'react';
import reviewService from '../services/reviewService';
import authService from '../services/authService';

const ReviewSection = ({ accommodationId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const user = authService.getCurrentUser();
      setIsAuthenticated(!!user);
    };

    checkAuth();
    fetchReviews();
  }, [accommodationId]);

  const fetchReviews = async () => {
    try {
      const data = await reviewService.getByAccommodation(accommodationId);
      setReviews(data);
    } catch (err) {
      setError(err.message || 'Không thể tải đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingReview) {
        await reviewService.update(editingReview.id, {
          ...newReview,
          accommodationId
        });
      } else {
        await reviewService.create({
          ...newReview,
          accommodationId
        });
      }
      setNewReview({ rating: 5, comment: '' });
      setEditingReview(null);
      fetchReviews();
    } catch (err) {
      setError(err.message || 'Không thể lưu đánh giá');
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setNewReview({
      rating: review.rating,
      comment: review.comment
    });
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm('Bạn có chắc muốn xóa đánh giá này?')) {
      try {
        await reviewService.delete(reviewId);
        fetchReviews();
      } catch (err) {
        setError(err.message || 'Không thể xóa đánh giá');
      }
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (loading) {
    return <div className="text-center py-4">Đang tải đánh giá...</div>;
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Đánh giá</h2>
        <div className="flex items-center">
          <span className="text-3xl font-bold text-indigo-600">{calculateAverageRating()}</span>
          <span className="text-gray-500 ml-2">/ 5 ({reviews.length} đánh giá)</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="mb-8 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingReview ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}
          </h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá</label>
            <select
              value={newReview.rating}
              onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>
                  {rating} sao
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Nhận xét</label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              rows="3"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end space-x-3">
            {editingReview && (
              <button
                type="button"
                onClick={() => {
                  setEditingReview(null);
                  setNewReview({ rating: 5, comment: '' });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {editingReview ? 'Cập nhật' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-5 w-5 ${
                          i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-2 text-gray-700">{review.comment}</p>
              </div>

              {isAuthenticated && review.userId === authService.getCurrentUser()?.id && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(review)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Xóa
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Chưa có đánh giá nào cho nhà trọ này.
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection; 