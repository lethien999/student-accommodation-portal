const { UserActivityLog, User } = require('../models');
const { Op } = require('sequelize');

// Lấy danh sách activity logs với phân trang và lọc
const getActivityLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      userId, 
      action, 
      module, 
      startDate, 
      endDate,
      status,
      search 
    } = req.query;

    const where = {};

    // Lọc theo user
    if (userId) {
      where.userId = userId;
    }

    // Lọc theo action
    if (action) {
      where.action = action;
    }

    // Lọc theo module
    if (module) {
      where.module = module;
    }

    // Lọc theo status
    if (status) {
      where.status = status;
    }

    // Lọc theo khoảng thời gian
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.createdAt[Op.lte] = new Date(endDate);
      }
    }

    // Tìm kiếm trong details
    if (search) {
      where.details = {
        [Op.like]: `%${search}%`
      };
    }

    const logs = await UserActivityLog.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      logs: logs.rows,
      total: logs.count,
      page: parseInt(page),
      totalPages: Math.ceil(logs.count / limit)
    });
  } catch (error) {
    console.error('Lỗi khi lấy activity logs:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Lấy activity logs của một user cụ thể
const getUserActivityLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, action, module, startDate, endDate } = req.query;

    const where = { userId };

    // Lọc theo action
    if (action) {
      where.action = action;
    }

    // Lọc theo module
    if (module) {
      where.module = module;
    }

    // Lọc theo khoảng thời gian
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.createdAt[Op.lte] = new Date(endDate);
      }
    }

    const logs = await UserActivityLog.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      logs: logs.rows,
      total: logs.count,
      page: parseInt(page),
      totalPages: Math.ceil(logs.count / limit)
    });
  } catch (error) {
    console.error('Lỗi khi lấy activity logs của user:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Lấy thống kê activity logs
const getActivityStats = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.createdAt[Op.lte] = new Date(endDate);
      }
    }

    // Thống kê theo action
    const actionStats = await UserActivityLog.findAll({
      where,
      attributes: [
        'action',
        [UserActivityLog.sequelize.fn('COUNT', UserActivityLog.sequelize.col('id')), 'count']
      ],
      group: ['action'],
      order: [[UserActivityLog.sequelize.fn('COUNT', UserActivityLog.sequelize.col('id')), 'DESC']]
    });

    // Thống kê theo module
    const moduleStats = await UserActivityLog.findAll({
      where,
      attributes: [
        'module',
        [UserActivityLog.sequelize.fn('COUNT', UserActivityLog.sequelize.col('id')), 'count']
      ],
      group: ['module'],
      order: [[UserActivityLog.sequelize.fn('COUNT', UserActivityLog.sequelize.col('id')), 'DESC']]
    });

    // Thống kê theo status
    const statusStats = await UserActivityLog.findAll({
      where,
      attributes: [
        'status',
        [UserActivityLog.sequelize.fn('COUNT', UserActivityLog.sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    // Thống kê theo thời gian
    let timeGroupClause;
    if (groupBy === 'month') {
      timeGroupClause = [UserActivityLog.sequelize.fn('DATE_FORMAT', UserActivityLog.sequelize.col('createdAt'), '%Y-%m'), 'period'];
    } else if (groupBy === 'week') {
      timeGroupClause = [UserActivityLog.sequelize.fn('YEARWEEK', UserActivityLog.sequelize.col('createdAt')), 'period'];
    } else {
      timeGroupClause = [UserActivityLog.sequelize.fn('DATE', UserActivityLog.sequelize.col('createdAt')), 'period'];
    }

    const timeStats = await UserActivityLog.findAll({
      where,
      attributes: [
        timeGroupClause,
        [UserActivityLog.sequelize.fn('COUNT', UserActivityLog.sequelize.col('id')), 'count']
      ],
      group: [timeGroupClause],
      order: [[timeGroupClause, 'ASC']]
    });

    // Top users theo hoạt động
    const topUsers = await UserActivityLog.findAll({
      where,
      attributes: [
        'userId',
        [UserActivityLog.sequelize.fn('COUNT', UserActivityLog.sequelize.col('id')), 'count']
      ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'email']
        }
      ],
      group: ['userId'],
      order: [[UserActivityLog.sequelize.fn('COUNT', UserActivityLog.sequelize.col('id')), 'DESC']],
      limit: 10
    });

    res.json({
      actionStats,
      moduleStats,
      statusStats,
      timeStats,
      topUsers
    });
  } catch (error) {
    console.error('Lỗi khi lấy thống kê activity:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Xóa activity logs cũ
const cleanupOldLogs = async (req, res) => {
  try {
    const { days = 90 } = req.query;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const deletedCount = await UserActivityLog.destroy({
      where: {
        createdAt: {
          [Op.lt]: cutoffDate
        }
      }
    });

    res.json({ 
      message: `Đã xóa ${deletedCount} logs cũ hơn ${days} ngày`,
      deletedCount 
    });
  } catch (error) {
    console.error('Lỗi khi cleanup logs:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Export activity logs
const exportActivityLogs = async (req, res) => {
  try {
    const { format = 'json', startDate, endDate, userId, action, module } = req.query;

    const where = {};

    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (module) where.module = module;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const logs = await UserActivityLog.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    if (format === 'csv') {
      // Tạo CSV
      const csvHeader = 'ID,User,Action,Module,Resource ID,Resource Type,Status,IP Address,User Agent,Created At\n';
      const csvRows = logs.map(log => 
        `${log.id},"${log.user?.username || 'N/A'}","${log.action}","${log.module}","${log.resourceId || ''}","${log.resourceType || ''}","${log.status}","${log.ipAddress || ''}","${log.userAgent || ''}","${log.createdAt}"`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=activity_logs.csv');
      res.send(csvHeader + csvRows);
    } else {
      // JSON format
      res.json(logs);
    }
  } catch (error) {
    console.error('Lỗi khi export logs:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Lấy danh sách các actions có sẵn
const getAvailableActions = async (req, res) => {
  try {
    const actions = await UserActivityLog.findAll({
      attributes: [[UserActivityLog.sequelize.fn('DISTINCT', UserActivityLog.sequelize.col('action')), 'action']],
      raw: true
    });

    res.json(actions.map(item => item.action));
  } catch (error) {
    console.error('Lỗi khi lấy danh sách actions:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Lấy danh sách các modules có sẵn
const getAvailableModules = async (req, res) => {
  try {
    const modules = await UserActivityLog.findAll({
      attributes: [[UserActivityLog.sequelize.fn('DISTINCT', UserActivityLog.sequelize.col('module')), 'module']],
      raw: true
    });

    res.json(modules.map(item => item.module));
  } catch (error) {
    console.error('Lỗi khi lấy danh sách modules:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

module.exports = {
  getActivityLogs,
  getUserActivityLogs,
  getActivityStats,
  cleanupOldLogs,
  exportActivityLogs,
  getAvailableActions,
  getAvailableModules
}; 