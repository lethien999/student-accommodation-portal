const { UserActivityLog } = require('../models');

// Middleware để tự động log hoạt động
const activityLogger = (action, module, options = {}) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    const originalJson = res.json;
    
    // Override res.send để capture response
    res.send = function(data) {
      logActivity(req, res, action, module, options, data);
      return originalSend.call(this, data);
    };
    
    res.json = function(data) {
      logActivity(req, res, action, module, options, data);
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Hàm log hoạt động
const logActivity = async (req, res, action, module, options, responseData) => {
  try {
    if (!req.user) {
      return; // Không log nếu không có user
    }

    // Xác định resource ID từ params hoặc body
    let resourceId = null;
    let resourceType = null;
    
    if (options.resourceIdFrom) {
      if (options.resourceIdFrom === 'params') {
        resourceId = req.params[options.resourceIdField || 'id'];
      } else if (options.resourceIdFrom === 'body') {
        resourceId = req.body[options.resourceIdField || 'id'];
      }
    }
    
    if (options.resourceType) {
      resourceType = options.resourceType;
    }

    // Xác định status dựa trên response
    let status = 'success';
    if (res.statusCode >= 400) {
      status = 'failed';
    }

    // Tạo details object
    const details = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode
    };

    // Thêm thông tin từ options
    if (options.includeBody) {
      details.requestBody = req.body;
    }
    
    if (options.includeParams) {
      details.params = req.params;
    }
    
    if (options.includeQuery) {
      details.query = req.query;
    }

    // Thêm response data nếu cần
    if (options.includeResponse && responseData) {
      try {
        const response = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
        details.response = response;
      } catch (e) {
        details.response = responseData;
      }
    }

    // Tạo activity log
    await UserActivityLog.create({
      userId: req.user.id,
      action,
      module,
      resourceId,
      resourceType,
      details,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      status
    });

  } catch (error) {
    console.error('Lỗi khi log activity:', error);
    // Không throw error để không ảnh hưởng đến request chính
  }
};

// Helper function để log activity thủ công
const logActivityManually = async (req, action, module, options = {}) => {
  try {
    if (!req.user) {
      return;
    }

    await UserActivityLog.create({
      userId: req.user.id,
      action,
      module,
      resourceId: options.resourceId,
      resourceType: options.resourceType,
      details: options.details || {},
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      status: options.status || 'success'
    });
  } catch (error) {
    console.error('Lỗi khi log activity thủ công:', error);
  }
};

// Middleware để log tất cả requests (optional)
const logAllRequests = async (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', async () => {
    try {
      if (!req.user) {
        return;
      }

      const duration = Date.now() - startTime;
      
      await UserActivityLog.create({
        userId: req.user.id,
        action: req.method.toLowerCase(),
        module: 'api',
        details: {
          path: req.path,
          method: req.method,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          userAgent: req.get('User-Agent')
        },
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        status: res.statusCode >= 400 ? 'failed' : 'success'
      });
    } catch (error) {
      console.error('Lỗi khi log request:', error);
    }
  });
  
  next();
};

module.exports = {
  activityLogger,
  logActivityManually,
  logAllRequests
}; 