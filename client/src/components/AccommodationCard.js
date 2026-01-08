import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaStar, FaHeart, FaRegHeart, FaCheckCircle } from 'react-icons/fa';
import savedService from '../services/savedService';
import { useAuth } from '../context/AuthContext';

const AccommodationCard = ({ item }) => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isSaved, setIsSaved] = useState(!!item.isSaved);

    // Format averageRating safely
    const rating = item.averageRating ? parseFloat(item.averageRating).toFixed(1) : null;
    const reviewCount = item.reviewCount || 0;

    const handleToggleSave = async (e) => {
        e.preventDefault(); // Prevent navigation
        if (!isAuthenticated) {
            if (window.confirm('Bạn cần đăng nhập để lưu tin.')) {
                navigate('/login');
            }
            return;
        }

        try {
            await savedService.toggleSave(item.id);
            setIsSaved(!isSaved);
        } catch (error) {
            console.error('Error toggling save', error);
        }
    };

    return (
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

                {/* Save Button */}
                <button
                    onClick={handleToggleSave}
                    className="absolute top-2 left-2 p-2 rounded-full bg-white bg-opacity-90 shadow-sm hover:bg-opacity-100 transition-all z-10"
                    title={isSaved ? "Bỏ lưu" : "Lưu tin"}
                >
                    {isSaved ? (
                        <FaHeart className="text-red-500 text-lg" />
                    ) : (
                        <FaRegHeart className="text-gray-500 text-lg hover:text-red-500" />
                    )}
                </button>

                {/* Rating Badge Overlay */}
                {rating && (
                    <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded-full shadow-sm flex items-center gap-1 text-xs font-bold text-gray-800">
                        <FaStar className="text-yellow-500" />
                        <span>{rating}</span>
                        <span className="text-gray-500 font-normal">({reviewCount})</span>
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                    {item.name}
                    {item.isVerified && (
                        <FaCheckCircle className="text-blue-500 text-base" title="Tin đã xác thực" />
                    )}
                </h3>

                <div className="flex items-center text-gray-500 text-sm mb-2">
                    <span className="truncate">{item.address}</span>
                </div>

                <div className="flex items-center justify-between mt-auto">
                    <span className="font-bold text-red-600 text-lg">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                        <span className="text-sm text-gray-500 font-normal">/tháng</span>
                    </span>
                    <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
            </div>
        </Link>
    );
};

export default AccommodationCard;
