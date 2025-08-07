const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');
const Accommodation = require('../models/Accommodation');

const generateSitemap = async () => {
  const links = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/login', changefreq: 'monthly', priority: 0.8 },
    { url: '/register', changefreq: 'monthly', priority: 0.8 },
    { url: '/accommodations', changefreq: 'daily', priority: 0.9 },
    { url: '/search', changefreq: 'daily', priority: 0.8 },
    { url: '/map', changefreq: 'weekly', priority: 0.7 },
    // Add more static pages here
  ];

  try {
    // Fetch dynamic content (e.g., accommodations)
    const accommodations = await Accommodation.findAll({ attributes: ['id', 'updatedAt'] });
    accommodations.forEach(acc => {
      links.push({
        url: `/accommodations/${acc.id}`,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: acc.updatedAt.toISOString(),
      });
    });

    const stream = new SitemapStream({ hostname: process.env.FRONTEND_URL });

    const readable = Readable.from(links);
    readable.pipe(stream);

    const sitemap = await streamToPromise(stream);
    return sitemap.toString();
  } catch (error) {
    console.error('Error generating sitemap:', error);
    throw error;
  }
};

module.exports = generateSitemap; 