const { UserPreference, User, UserActivityLog } = require('../models');
const { Op } = require('sequelize');

// Lấy tất cả tùy chọn của người dùng
const getUserPreferences = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    const preferences = await UserPreference.findAll({
      where: { userId },
      order: [['category', 'ASC'], ['key', 'ASC']]
    });

    // Nhóm tùy chọn theo category
    const groupedPreferences = preferences.reduce((acc, preference) => {
      if (!acc[preference.category]) {
        acc[preference.category] = [];
      }
      acc[preference.category].push(preference);
      return acc;
    }, {});

    res.json(groupedPreferences);
  } catch (error) {
    console.error('Lỗi khi lấy tùy chọn người dùng:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Lấy tùy chọn theo category
const getPreferencesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const userId = req.params.userId || req.user.id;

    const preferences = await UserPreference.findAll({
      where: { userId, category },
      order: [['key', 'ASC']]
    });

    res.json(preferences);
  } catch (error) {
    console.error('Lỗi khi lấy tùy chọn theo category:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Lấy giá trị tùy chọn cụ thể
const getPreference = async (req, res) => {
  try {
    const { category, key } = req.params;
    const userId = req.params.userId || req.user.id;

    const preference = await UserPreference.findOne({
      where: { userId, category, key }
    });

    if (!preference) {
      return res.status(404).json({ error: 'Tùy chọn không tồn tại' });
    }

    res.json(preference);
  } catch (error) {
    console.error('Lỗi khi lấy tùy chọn:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Tạo hoặc cập nhật tùy chọn
const setPreference = async (req, res) => {
  try {
    const { category, key, value, description } = req.body;
    const userId = req.params.userId || req.user.id;

    if (!category || !key) {
      return res.status(400).json({ error: 'Category và key là bắt buộc' });
    }

    // Tìm tùy chọn hiện tại
    let preference = await UserPreference.findOne({
      where: { userId, category, key }
    });

    if (preference) {
      // Cập nhật tùy chọn hiện tại
      await preference.update({ value, description });
    } else {
      // Tạo tùy chọn mới
      preference = await UserPreference.create({
        userId,
        category,
        key,
        value,
        description,
        isSystem: false
      });
    }

    // Log hoạt động
    await UserActivityLog.create({
      userId: req.user.id,
      action: preference ? 'update' : 'create',
      module: 'user_preference',
      resourceId: preference.id,
      resourceType: 'UserPreference',
      details: { category, key, value },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json(preference);
  } catch (error) {
    console.error('Lỗi khi cập nhật tùy chọn:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Cập nhật nhiều tùy chọn cùng lúc
const setMultiplePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;
    const userId = req.params.userId || req.user.id;

    if (!Array.isArray(preferences)) {
      return res.status(400).json({ error: 'Preferences phải là một mảng' });
    }

    const results = [];

    for (const pref of preferences) {
      const { category, key, value, description } = pref;

      if (!category || !key) {
        results.push({ category, key, success: false, error: 'Category và key là bắt buộc' });
        continue;
      }

      try {
        let preference = await UserPreference.findOne({
          where: { userId, category, key }
        });

        if (preference) {
          await preference.update({ value, description });
        } else {
          preference = await UserPreference.create({
            userId,
            category,
            key,
            value,
            description,
            isSystem: false
          });
        }

        results.push({ category, key, success: true, preference });

        // Log hoạt động
        await UserActivityLog.create({
          userId: req.user.id,
          action: preference ? 'update' : 'create',
          module: 'user_preference',
          resourceId: preference.id,
          resourceType: 'UserPreference',
          details: { category, key, value },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });
      } catch (error) {
        results.push({ category, key, success: false, error: error.message });
      }
    }

    res.json({ results });
  } catch (error) {
    console.error('Lỗi khi cập nhật nhiều tùy chọn:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Xóa tùy chọn
const deletePreference = async (req, res) => {
  try {
    const { category, key } = req.params;
    const userId = req.params.userId || req.user.id;

    const preference = await UserPreference.findOne({
      where: { userId, category, key }
    });

    if (!preference) {
      return res.status(404).json({ error: 'Tùy chọn không tồn tại' });
    }

    // Không cho phép xóa tùy chọn hệ thống
    if (preference.isSystem) {
      return res.status(403).json({ error: 'Không thể xóa tùy chọn hệ thống' });
    }

    // Log hoạt động trước khi xóa
    await UserActivityLog.create({
      userId: req.user.id,
      action: 'delete',
      module: 'user_preference',
      resourceId: preference.id,
      resourceType: 'UserPreference',
      details: { category, key },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await preference.destroy();
    res.json({ message: 'Xóa tùy chọn thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa tùy chọn:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Reset tùy chọn về mặc định
const resetPreferences = async (req, res) => {
  try {
    const { category } = req.params;
    const userId = req.params.userId || req.user.id;

    const whereClause = { userId };
    if (category) {
      whereClause.category = category;
    }

    // Xóa tất cả tùy chọn không phải hệ thống
    const deletedCount = await UserPreference.destroy({
      where: {
        ...whereClause,
        isSystem: false
      }
    });

    // Log hoạt động
    await UserActivityLog.create({
      userId: req.user.id,
      action: 'reset',
      module: 'user_preference',
      resourceId: userId,
      resourceType: 'User',
      details: { category, deletedCount },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ 
      message: `Đã reset ${deletedCount} tùy chọn về mặc định`,
      deletedCount 
    });
  } catch (error) {
    console.error('Lỗi khi reset tùy chọn:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Lấy danh sách tùy chọn mặc định
const getDefaultPreferences = async (req, res) => {
  try {
    const defaultPreferences = [
      // Thông báo
      {
        category: 'notification',
        key: 'email_notifications',
        value: true,
        description: 'Nhận thông báo qua email'
      },
      {
        category: 'notification',
        key: 'push_notifications',
        value: true,
        description: 'Nhận thông báo đẩy'
      },
      {
        category: 'notification',
        key: 'accommodation_alerts',
        value: true,
        description: 'Thông báo về nhà trọ mới'
      },
      {
        category: 'notification',
        key: 'message_notifications',
        value: true,
        description: 'Thông báo tin nhắn mới'
      },
      {
        category: 'notification',
        key: 'review_notifications',
        value: true,
        description: 'Thông báo đánh giá mới'
      },

      // Quyền riêng tư
      {
        category: 'privacy',
        key: 'profile_visibility',
        value: 'public',
        description: 'Hiển thị thông tin cá nhân'
      },
      {
        category: 'privacy',
        key: 'show_contact_info',
        value: true,
        description: 'Hiển thị thông tin liên hệ'
      },
      {
        category: 'privacy',
        key: 'show_reviews',
        value: true,
        description: 'Hiển thị đánh giá của tôi'
      },

      // Hiển thị
      {
        category: 'display',
        key: 'theme',
        value: 'light',
        description: 'Giao diện (light/dark)'
      },
      {
        category: 'display',
        key: 'language',
        value: 'vi',
        description: 'Ngôn ngữ hiển thị'
      },
      {
        category: 'display',
        key: 'items_per_page',
        value: 10,
        description: 'Số lượng mục trên trang'
      },

      // Tìm kiếm
      {
        category: 'search',
        key: 'default_radius',
        value: 5,
        description: 'Bán kính tìm kiếm mặc định (km)'
      },
      {
        category: 'search',
        key: 'price_range',
        value: { min: 0, max: 10000000 },
        description: 'Khoảng giá mặc định'
      },
      {
        category: 'search',
        key: 'save_search_history',
        value: true,
        description: 'Lưu lịch sử tìm kiếm'
      },

      // Bảo mật
      {
        category: 'security',
        key: 'two_factor_enabled',
        value: false,
        description: 'Bật xác thực 2 yếu tố'
      },
      {
        category: 'security',
        key: 'session_timeout',
        value: 24,
        description: 'Thời gian timeout phiên đăng nhập (giờ)'
      }
    ];

    // Nhóm theo category
    const groupedDefaults = defaultPreferences.reduce((acc, pref) => {
      if (!acc[pref.category]) {
        acc[pref.category] = [];
      }
      acc[pref.category].push(pref);
      return acc;
    }, {});

    res.json(groupedDefaults);
  } catch (error) {
    console.error('Lỗi khi lấy tùy chọn mặc định:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

module.exports = {
  getUserPreferences,
  getPreferencesByCategory,
  getPreference,
  setPreference,
  setMultiplePreferences,
  deletePreference,
  resetPreferences,
  getDefaultPreferences
}; 