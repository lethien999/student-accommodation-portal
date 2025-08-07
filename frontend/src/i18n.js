import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  vi: {
    translation: {
      // Thêm các key-value dịch tiếng Việt ở đây
      'Welcome': 'Chào mừng',
      'Login': 'Đăng nhập',
      'Register': 'Đăng ký',
      'Logout': 'Đăng xuất',
      'Home': 'Trang chủ',
      'Search': 'Tìm kiếm',
      'Accommodation': 'Nhà trọ',
      'Price': 'Giá',
      'Address': 'Địa chỉ',
      'Description': 'Mô tả',
      'Owner': 'Chủ nhà',
      'Review': 'Đánh giá',
      'Submit': 'Gửi',
      'Cancel': 'Hủy',
      'Edit Accommodation': 'Chỉnh sửa thông tin nhà trọ',
      'Add New Accommodation': 'Đăng nhà trọ mới',
      'Title': 'Tiêu đề',
      'Price (VND/month)': 'Giá thuê (VNĐ/tháng)',
      'Room Type': 'Loại phòng',
      'Detailed Address': 'Địa chỉ chi tiết (số nhà, tên đường...)',
      'Please enter house number, street name, ward/commune...': 'Vui lòng điền số nhà, tên đường, phường/xã...',
      'Amenities': 'Tiện nghi',
      'Images (max 5)': 'Hình ảnh (tối đa 5 ảnh)',
      'Upload Images': 'Tải ảnh lên',
      'Update': 'Cập nhật',
      'Search for a general location, then edit the detailed address below.': 'Tìm kiếm vị trí chung, sau đó chỉnh sửa địa chỉ chi tiết ở ô bên dưới.',
      'New password does not match.': 'Mật khẩu mới không khớp.',
      'New password must be at least 6 characters.': 'Mật khẩu mới phải có ít nhất 6 ký tự.',
      'Password changed successfully! Please log in again.': 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.',
      'Password change failed.': 'Đổi mật khẩu thất bại.',
      'Find Accommodation': 'Tìm nhà trọ',
      'Search by address, district, city...': 'Tìm theo địa chỉ, quận, thành phố...',
      'Advanced Filters': 'Bộ lọc nâng cao',
      'Price Range (VND/month)': 'Khoảng giá (VND/tháng)',
      'From': 'Từ',
      'To': 'Đến',
      'Type': 'Loại hình',
      'All': 'Tất cả',
      'Room': 'Phòng trọ',
      'Apartment': 'Căn hộ',
      'House': 'Nhà nguyên căn',
      'Reset Filters': 'Xóa bộ lọc',
      'Apply': 'Áp dụng',
      'Found {{count}} results': 'Tìm thấy {{count}} kết quả',
      'Newest': 'Mới nhất',
      'Price Ascending': 'Giá tăng dần',
      'Price Descending': 'Giá giảm dần',
      'Highest Rated': 'Đánh giá cao nhất',
      'No accommodations found matching your criteria.': 'Không tìm thấy nhà trọ phù hợp với tiêu chí của bạn.',
      'Failed to load accommodation list.': 'Lỗi khi tải danh sách nhà trọ.',
      // ... Thêm các key khác khi cần
    }
  },
  en: {
    translation: {
      'Welcome': 'Welcome',
      'Login': 'Login',
      'Register': 'Register',
      'Logout': 'Logout',
      'Home': 'Home',
      'Search': 'Search',
      'Accommodation': 'Accommodation',
      'Price': 'Price',
      'Address': 'Address',
      'Description': 'Description',
      'Owner': 'Owner',
      'Review': 'Review',
      'Submit': 'Submit',
      'Cancel': 'Cancel',
      'Edit Accommodation': 'Edit Accommodation',
      'Add New Accommodation': 'Add New Accommodation',
      'Title': 'Title',
      'Price (VND/month)': 'Price (VND/month)',
      'Room Type': 'Room Type',
      'Detailed Address': 'Detailed Address',
      'Please enter house number, street name, ward/commune...': 'Please enter house number, street name, ward/commune...',
      'Amenities': 'Amenities',
      'Images (max 5)': 'Images (max 5)',
      'Upload Images': 'Upload Images',
      'Update': 'Update',
      'Search for a general location, then edit the detailed address below.': 'Search for a general location, then edit the detailed address below.',
      'New password does not match.': 'New password does not match.',
      'New password must be at least 6 characters.': 'New password must be at least 6 characters.',
      'Password changed successfully! Please log in again.': 'Password changed successfully! Please log in again.',
      'Password change failed.': 'Password change failed.',
      'Find Accommodation': 'Find Accommodation',
      'Search by address, district, city...': 'Search by address, district, city...',
      'Advanced Filters': 'Advanced Filters',
      'Price Range (VND/month)': 'Price Range (VND/month)',
      'From': 'From',
      'To': 'To',
      'Type': 'Type',
      'All': 'All',
      'Room': 'Room',
      'Apartment': 'Apartment',
      'House': 'House',
      'Reset Filters': 'Reset Filters',
      'Apply': 'Apply',
      'Found {{count}} results': 'Found {{count}} results',
      'Newest': 'Newest',
      'Price Ascending': 'Price Ascending',
      'Price Descending': 'Price Descending',
      'Highest Rated': 'Highest Rated',
      'No accommodations found matching your criteria.': 'No accommodations found matching your criteria.',
      'Failed to load accommodation list.': 'Failed to load accommodation list.',
      // ... Add more keys as needed
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 