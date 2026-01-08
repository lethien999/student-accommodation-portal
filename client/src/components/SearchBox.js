import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBox = () => {
    const navigate = useNavigate();
    const [district, setDistrict] = useState('');
    const [keyword, setKeyword] = useState('');
    const [type, setType] = useState(''); // Note: Currently mapped to keyword as no Type column
    const [priceRange, setPriceRange] = useState('');
    const [amenity, setAmenity] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();

        const params = new URLSearchParams();

        // Combine text search: Keyword + District + Type + Amenity
        // Ideally backend handles these separately, but for now we combine for 'rich' text search if fields missing
        // Actually, Address matches District.

        let finalSearch = keyword;
        if (district) finalSearch += ` ${district}`;
        if (type) finalSearch += ` ${type}`;
        if (amenity) finalSearch += ` ${amenity}`;

        if (finalSearch.trim()) params.append('search', finalSearch.trim());

        // Price Logic
        if (priceRange) {
            const [min, max] = priceRange.split('-');
            if (min) params.append('minPrice', min);
            if (max) params.append('maxPrice', max);
        }

        navigate(`/accommodations?${params.toString()}`);
    };

    const districts = [
        'Quận 1', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8', 'Quận 10', 'Quận 11', 'Quận 12',
        'Bình Thạnh', 'Bình Tân', 'Tân Bình', 'Tân Phú', 'Gò Vấp', 'Phú Nhuận', 'Thủ Đức'
    ];

    return (
        <div className="bg-blue-500 p-4 rounded-lg shadow-lg max-w-5xl mx-auto">
            <form onSubmit={handleSearch}>
                {/* Top Row */}
                <div className="flex flex-col md:flex-row bg-white rounded-lg overflow-hidden mb-4 p-1 gap-2 shadow-sm">
                    <div className="flex items-center px-3 border-r border-gray-200 md:min-w-[180px]">
                        <span className="text-red-500 mr-2">📍</span>
                        <select className="bg-transparent outline-none w-full font-medium text-gray-700 cursor-pointer" disabled>
                            <option>Tp. Hồ Chí Minh</option>
                        </select>
                    </div>
                    <div className="flex items-center px-3 border-r border-gray-200 md:min-w-[180px]">
                        <select
                            className="bg-transparent outline-none w-full text-gray-700 cursor-pointer hover:text-blue-600"
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                        >
                            <option value="">Quận/Huyện</option>
                            {districts.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <input
                        className="flex-1 px-3 py-3 outline-none text-gray-700"
                        placeholder="Nhập nội dung tìm kiếm (tên đường, địa điểm...)"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-8 py-3 rounded font-bold hover:bg-blue-700 transition flex items-center gap-2 whitespace-nowrap"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        Tìm kiếm
                    </button>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                        className="bg-white p-3 rounded outline-none text-gray-600 shadow-sm focus:ring-2 focus:ring-blue-300"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value="">Loại phòng</option>
                        <option value="Phòng trọ">Phòng trọ</option>
                        <option value="Căn hộ mini">Căn hộ mini</option>
                        <option value="Nhà nguyên căn">Nhà nguyên căn</option>
                        <option value="Homestay">Homestay</option>
                    </select>

                    <select
                        className="bg-white p-3 rounded outline-none text-gray-600 shadow-sm focus:ring-2 focus:ring-blue-300"
                        value={priceRange}
                        onChange={(e) => setPriceRange(e.target.value)}
                    >
                        <option value="">Khoảng giá</option>
                        <option value="0-2000000">Dưới 2 triệu</option>
                        <option value="2000000-4000000">2 triệu - 4 triệu</option>
                        <option value="4000000-7000000">4 triệu - 7 triệu</option>
                        <option value="7000000-15000000">7 triệu - 15 triệu</option>
                        <option value="15000000-100000000">Trên 15 triệu</option>
                    </select>

                    <input
                        className="bg-white p-3 rounded outline-none text-gray-600 shadow-sm focus:ring-2 focus:ring-blue-300"
                        placeholder="Tiện ích (Wifi, Máy lạnh, Ban công...)"
                        value={amenity}
                        onChange={(e) => setAmenity(e.target.value)}
                    />
                </div>
            </form>
        </div>
    );
};

export default SearchBox;
