import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const BookingModal = ({ accommodation, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [viewingDate, setViewingDate] = useState('');
    const [numOfPeople, setNumOfPeople] = useState(1);
    const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validation
        if (numOfPeople < 1) {
            setError('Số lượng người phải lớn hơn 0');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const data = {
                accommodationId: accommodation.id,
                checkInDate: viewingDate, // Map Viewing Date to checkInDate
                type: 'viewing',
                numOfPeople,
                phoneNumber,
                note
            };

            await axios.post(
                `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/bookings`,
                data,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Gửi yêu cầu thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Đặt lịch xem phòng</h2>
                    <button onClick={onClose} className="text-gray-600 hover:text-gray-900">&times;</button>
                </div>

                <div className="mb-4 bg-blue-50 p-4 rounded">
                    <h3 className="font-bold text-blue-800">{accommodation.name}</h3>
                    <p className="text-blue-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(accommodation.price)} / tháng</p>
                </div>

                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày muốn xem phòng</label>
                        <input
                            type="date"
                            required
                            min={new Date().toISOString().split('T')[0]}
                            value={viewingDate}
                            onChange={(e) => setViewingDate(e.target.value)}
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng người</label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={numOfPeople}
                                onChange={(e) => setNumOfPeople(parseInt(e.target.value))}
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">SĐT liên hệ</label>
                            <input
                                type="text"
                                required
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lời nhắn</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full border p-2 rounded h-24"
                            placeholder="VD: Tôi muốn xem phòng vào buổi chiều..."
                        />
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-1/2 border border-gray-300 py-2 rounded text-gray-700 hover:bg-gray-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-1/2 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:bg-indigo-400"
                        >
                            {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingModal;
