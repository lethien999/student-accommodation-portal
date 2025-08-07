const { NotificationTemplate, User, sequelize } = require('../models');

// Get all templates with pagination and filters
const getTemplates = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, isActive } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (type) whereClause.type = type;
    if (isActive !== undefined) whereClause.isActive = isActive === 'true';

    const templates = await NotificationTemplate.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'fullName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      templates: templates.rows,
      total: templates.count,
      totalPages: Math.ceil(templates.count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ message: 'Lỗi khi tải danh sách template' });
  }
};

// Get template by ID
const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await NotificationTemplate.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'fullName', 'email']
        }
      ]
    });

    if (!template) {
      return res.status(404).json({ message: 'Không tìm thấy template' });
    }

    res.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ message: 'Lỗi khi tải template' });
  }
};

// Create new template
const createTemplate = async (req, res) => {
  try {
    const templateData = {
      ...req.body,
      createdBy: req.user.id
    };

    const template = await NotificationTemplate.create(templateData);
    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ message: 'Lỗi khi tạo template' });
  }
};

// Update template
const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await NotificationTemplate.findByPk(id);

    if (!template) {
      return res.status(404).json({ message: 'Không tìm thấy template' });
    }

    await template.update(req.body);
    res.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật template' });
  }
};

// Delete template
const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await NotificationTemplate.findByPk(id);

    if (!template) {
      return res.status(404).json({ message: 'Không tìm thấy template' });
    }

    await template.destroy();
    res.json({ message: 'Xóa template thành công' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ message: 'Lỗi khi xóa template' });
  }
};

// Toggle template active status
const toggleTemplateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await NotificationTemplate.findByPk(id);

    if (!template) {
      return res.status(404).json({ message: 'Không tìm thấy template' });
    }

    await template.update({ isActive: !template.isActive });
    res.json(template);
  } catch (error) {
    console.error('Error toggling template status:', error);
    res.status(500).json({ message: 'Lỗi khi thay đổi trạng thái template' });
  }
};

// Get template statistics
const getTemplateStats = async (req, res) => {
  try {
    const stats = await NotificationTemplate.findAll({
      attributes: [
        'type',
        'isActive',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['type', 'isActive']
    });

    const totalUsage = await NotificationTemplate.sum('usageCount') || 0;

    res.json({
      stats,
      totalUsage
    });
  } catch (error) {
    console.error('Error fetching template stats:', error);
    res.status(500).json({ message: 'Lỗi khi tải thống kê template' });
  }
};

module.exports = {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  toggleTemplateStatus,
  getTemplateStats
}; 