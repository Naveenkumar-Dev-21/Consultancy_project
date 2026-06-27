import Product from '../models/Product.js';

export const generateSitemap = async (req, res) => {
    try {
        const products = await Product.find({});
        
        // Base URL would typically be configured via env variables. 
        // We use the known production domain for the sitemap URLs.
        const baseUrl = 'https://aadhirankidscollections.com';
        
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
        
        // Static routes
        const staticRoutes = ['/', '/contact', '/about'];
        staticRoutes.forEach(route => {
            xml += `  <url>\n    <loc>${baseUrl}${route}</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
        });
        
        // Dynamic product routes
        products.forEach(product => {
            xml += `  <url>\n    <loc>${baseUrl}/product/${product._id}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
        });
        
        xml += '</urlset>';
        
        res.header('Content-Type', 'application/xml');
        res.status(200).send(xml);
    } catch (error) {
        console.error('Error generating sitemap:', error);
        res.status(500).send('Error generating sitemap');
    }
};
