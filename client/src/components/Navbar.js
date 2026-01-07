import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Navbar - Navigation component
 * Sử dụng useAuth hook theo DIP - không phụ thuộc trực tiếp vào authService
 */
const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-indigo-600">
            Nhà Trọ Sinh Viên
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-indigo-600 transition duration-200"
            >
              Trang chủ
            </Link>
            <Link
              to="/accommodations"
              className="text-gray-700 hover:text-indigo-600 transition duration-200"
            >
              Danh sách nhà trọ
            </Link>
            <Link
              to="/map"
              className="text-gray-700 hover:text-indigo-600 transition duration-200"
            >
              Bản đồ
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/accommodations/new"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
                >
                  Đăng tin
                </Link>
                <Link
                  to={
                    user?.role === 'admin' ? '/admin' :
                      user?.role === 'landlord' ? '/landlord' :
                        user?.role === 'sale' ? '/sale' :
                          '/profile'
                  }
                  className="text-gray-700 hover:text-indigo-600 transition duration-200 font-medium"
                >
                  {user?.username || 'Tài khoản'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-indigo-600 transition duration-200"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-indigo-600 transition duration-200"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

