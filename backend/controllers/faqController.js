const { FAQ } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await FAQ.findAndCountAll({
      order: [['order', 'ASC']],
      limit: parseInt(limit),
      offset
    });
    res.json({
      faqs: rows,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.search = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const { count, rows } = await FAQ.findAndCountAll({
      where: {
        [Op.or]: [
          { question: { [Op.like]: `%${q}%` } },
          { answer: { [Op.like]: `%${q}%` } }
        ]
      },
      order: [['order', 'ASC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      faqs: rows,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      searchQuery: q
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await FAQ.findAndCountAll({
      where: { category },
      order: [['order', 'ASC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      faqs: rows,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      category
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const faq = await FAQ.findByPk(req.params.id);
    if (!faq) return res.status(404).json({ error: 'Not found' });
    res.json(faq);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { question, answer, order, status, category } = req.body;
    const faq = await FAQ.create({ question, answer, order, status, category });
    res.status(201).json(faq);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { question, answer, order, status, category } = req.body;
    const faq = await FAQ.findByPk(req.params.id);
    if (!faq) return res.status(404).json({ error: 'Not found' });
    await faq.update({ question, answer, order, status, category });
    res.json(faq);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const faq = await FAQ.findByPk(req.params.id);
    if (!faq) return res.status(404).json({ error: 'Not found' });
    await faq.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 