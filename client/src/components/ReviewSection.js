import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import reviewService from '../services/reviewService';
import StarRating from './StarRating';
import { Link } from 'react-router-dom';

const ReviewSection = ({ accommodationId }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ average: 0, count: 0 });

    // Form State
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const calculateStats = (reviewList) => {
        if (reviewList.length === 0) {
            setStats({ average: 0, count: 0 });
            return;
        }
        const total = reviewList.reduce((sum, r) => sum + r.rating, 0);
        const average = (total / reviewList.length).toFixed(1);
        setStats({ average: parseFloat(average), count: reviewList.length });
    };

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await reviewService.getByAccommodation(accommodationId);
                if (res.success) {
                    setReviews(res.reviews);
                    calculateStats(res.reviews);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, [accommodationId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const newReview = await reviewService.create({
                accommodationId,
                rating,
                comment
            });

            // Add to list and recalc stats
            const updatedReviews = [newReview.review, ...reviews];
            setReviews(updatedReviews);
            calculateStats(updatedReviews);

            // Reset form
            setComment('');
            setRating(5);
        } catch (err) {
            setError(err.message || 'Lỗi khi gửi đánh giá');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    if (loading) return <div className="text-center py-4 text-gray-500">Đang tải đánh giá...</div>;

    return (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border border-gray-100" id="reviews">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Đánh giá ({stats.count})</h3>
                    <div className="flex items-center mt-1">
                        <span className="text-3xl font-bold text-yellow-500 mr-2">{stats.average > 0 ? stats.average : '0.0'}</span>
                        <StarRating rating={Math.round(stats.average)} readonly size={24} />
                    </div>
                </div>
            </div>

            {/* Review List */}
            <div className="space-y-6 mb-8">
                {reviews.length === 0 ? (
                    <p className="text-gray-500 italic text-center py-4 bg-gray-50 rounded">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                            <div className="flex items-start">
                                <img
                                    src={review.user?.avatar || `https://ui-avatars.com/api/?name=${review.user?.username || 'User'}&background=random`}
                                    alt="Avatar"
                                    className="w-10 h-10 rounded-full mr-4 object-cover"
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="font-semibold text-gray-800">{review.user?.fullName || review.user?.username || 'Người dùng ẩn danh'}</h4>
                                        <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
                                    </div>
                                    <div className="mb-2">
                                        <StarRating rating={review.rating} readonly size={14} />
                                    </div>
                                    <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Write Review Form */}
            {user ? (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-4">Viết đánh giá của bạn</h4>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-600 mb-2">Đánh giá chung</label>
                            <StarRating rating={rating} setRating={setRating} size={28} />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-600 mb-2">Nhận xét</label>
                            <textarea
                                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                rows="3"
                                placeholder="Chia sẻ trải nghiệm của bạn về nơi này..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                required
                            ></textarea>
                        </div>

                        {error && <div className="text-red-500 text-sm mb-3">{error}</div>}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-primary text-white px-6 py-2 rounded font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="text-center py-6 bg-gray-50 rounded border border-dashed border-gray-300">
                    <p className="text-gray-600 mb-2">Bạn cần đăng nhập để viết đánh giá.</p>
                    <Link to="/login" className="text-primary font-medium hover:underline">Đăng nhập ngay</Link>
                </div>
            )}
        </div>
    );
};

export default ReviewSection;
