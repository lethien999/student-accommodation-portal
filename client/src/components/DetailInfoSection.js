import React from 'react';

const DetailInfoSection = ({ detailInfo }) => {
    // detailInfo: { general: { ... }, features: { ... } }
    if (!detailInfo) return null;
    const { general, features } = detailInfo;

    const generalLabels = {
        floor: 'Vị trí',
        capacity: 'Số người ở',
        bikeLimit: 'Số lượng xe',
        parking: 'Nhà xe',
        dryingArea: 'Sân phơi',
        area: 'Diện tích',
    };

    const featureLabels = {
        hasAttic: 'Gác',
        hasWindow: 'Cửa sổ',
        hasBalcony: 'Ban công',
        hasFridge: 'Tủ lạnh',
        hasAC: 'Máy lạnh',
        hasBed: 'Giường',
        hasMattress: 'Nệm',
        hasWardrobe: 'Tủ quần áo',
        isOwnerLive: 'Chung chủ',
        hasElevator: 'Thang máy',
        hasHotWater: 'Nước nóng',
        allowPet: 'Thú cưng',
        hasWashingMachine: 'Máy giặt',
        hasKitchen: 'Bếp'
    };

    return (
        <div className="mb-6">
            <h3 className="font-bold text-xl text-gray-800 mb-4 border-l-4 border-indigo-600 pl-3">Thông tin chi tiết</h3>

            {/* General Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8 mb-6 text-gray-700">
                {general && Object.entries(general).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-500">{generalLabels[key] || key}:</span>
                        <span className="font-medium text-blue-600">{value}</span>
                    </div>
                ))}
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                {features && Object.entries(features).map(([key, value]) => {
                    // Only specific keys if needed, or all boolean keys
                    if (featureLabels[key]) {
                        return (
                            <div key={key} className="flex items-center justify-between">
                                <span className="text-gray-600">{featureLabels[key]}:</span>
                                {value ? (
                                    <span className="text-green-500 font-bold">✓</span>
                                ) : (
                                    <span className="text-red-400 font-bold">✕</span>
                                )}
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    );
};

export default DetailInfoSection;
