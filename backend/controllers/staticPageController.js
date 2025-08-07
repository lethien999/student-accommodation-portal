const { StaticPage } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await StaticPage.findAndCountAll({
      limit: parseInt(limit),
      offset
    });
    res.json({
      staticPages: rows,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const page = await StaticPage.findByPk(req.params.id);
    if (!page) return res.status(404).json({ error: 'Not found' });
    res.json(page);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, slug, content, status } = req.body;
    const page = await StaticPage.create({ title, slug, content, status });
    res.status(201).json(page);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { title, slug, content, status } = req.body;
    const page = await StaticPage.findByPk(req.params.id);
    if (!page) return res.status(404).json({ error: 'Not found' });
    await page.update({ title, slug, content, status });
    res.json(page);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const page = await StaticPage.findByPk(req.params.id);
    if (!page) return res.status(404).json({ error: 'Not found' });
    await page.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 