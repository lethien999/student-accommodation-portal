import React from 'react';

const CostEstimateSection = ({ services }) => {
    // services: [{ name: 'Điện', price: '6,000', unit: '/kWh' }, ...]
    if (!services || services.length === 0) return null;

    return (
        <div className="mb-8">
            <h3 className="font-bold text-xl text-gray-800 mb-4 border-l-4 border-indigo-600 pl-3">Chi phí dự kiến</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 border border-gray-200 rounded-lg overflow-hidden">
                {services.map((service, idx) => (
                    <div key={idx} className="border-r border-b border-gray-100 p-4 text-center last:border-r-0">
                        <p className="font-bold text-gray-800 mb-1">{service.name}</p>
                        <p className="text-blue-600 font-bold text-lg">{service.price}</p>
                        <p className="text-sm text-gray-500">{service.unit}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CostEstimateSection;
