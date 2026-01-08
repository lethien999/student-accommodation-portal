import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SavedService from '../services/savedService';
import AccommodationCard from '../components/AccommodationCard';

const SavedAccommodations = () => {
    const [accommodations, setAccommodations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSaved = async () => {
            try {
                const data = await SavedService.getSavedList();
                // data.accommodations contains the list
                // Map to include isSaved=true for the card to show red heart
                const items = (data.accommodations || []).map(item => ({
                    ...item,
                    isSaved: true
                }));
                setAccommodations(items);
            } catch (err) {
                setError(err.message || 'Failed to fetch saved accommodations');
            } finally {
                setLoading(false);
            }
        };

        fetchSaved();
    }, []);

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="text-red-500">❤️</span> Tin đã lưu
            </h1>

            {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}

            {accommodations.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl">
                    <p className="text-gray-500 text-lg mb-4">Bạn chưa lưu tin đăng nào.</p>
                    <Link to="/" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                        Khám phá phòng trọ ngay
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {accommodations.map((item) => (
                        <AccommodationCard key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SavedAccommodations;
