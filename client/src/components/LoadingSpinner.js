import React from 'react';

const LoadingSpinner = ({ 
  size = 'medium', 
  text = 'Loading...', 
  fullScreen = false,
  color = 'blue' 
}) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-10 w-10',
    large: 'h-16 w-16'
  };

  const colorClasses = {
    blue: 'border-blue-600',
    green: 'border-green-600',
    red: 'border-red-600',
    gray: 'border-gray-600'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`animate-spin rounded-full border-4 border-t-transparent ${sizeClasses[size]} ${colorClasses[color]}`}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className="mt-3 text-gray-600 text-sm font-medium">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {spinner}
    </div>
  );
};

// Skeleton loader for cards
export const CardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-300" />
    <div className="p-4 space-y-3">
      <div className="h-6 bg-gray-300 rounded w-3/4" />
      <div className="h-4 bg-gray-300 rounded w-1/2" />
      <div className="h-4 bg-gray-300 rounded w-full" />
      <div className="flex justify-between items-center pt-2">
        <div className="h-6 bg-gray-300 rounded w-1/4" />
        <div className="h-8 bg-gray-300 rounded w-1/4" />
      </div>
    </div>
  </div>
);

// Skeleton loader for list items
export const ListItemSkeleton = () => (
  <div className="bg-white p-4 rounded-lg shadow animate-pulse">
    <div className="flex space-x-4">
      <div className="h-16 w-16 bg-gray-300 rounded" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-300 rounded w-3/4" />
        <div className="h-4 bg-gray-300 rounded w-1/2" />
      </div>
    </div>
  </div>
);

// Skeleton loader for profile
export const ProfileSkeleton = () => (
  <div className="max-w-2xl mx-auto p-6 animate-pulse">
    <div className="flex items-center space-x-4 mb-6">
      <div className="h-20 w-20 bg-gray-300 rounded-full" />
      <div className="space-y-2">
        <div className="h-6 bg-gray-300 rounded w-40" />
        <div className="h-4 bg-gray-300 rounded w-32" />
      </div>
    </div>
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-300 rounded" />
      ))}
    </div>
  </div>
);

export default LoadingSpinner;
