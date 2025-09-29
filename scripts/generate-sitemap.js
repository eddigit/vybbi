#!/usr/bin/env node

/**
 * Script pour générer automatiquement le sitemap.xml
 * Utilise le générateur de sitemap existant pour créer un sitemap à jour
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configuration pour l'environnement Node.js
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// URLs statiques de base avec leurs priorités et fréquences
const staticUrls = [
  { loc: 'https://vybbi.com', priority: '1.0', changefreq: 'daily' },
  { loc: 'https://vybbi.com/artists', priority: '0.9', changefreq: 'daily' },
  { loc: 'https://vybbi.com/lieux', priority: '0.9', changefreq: 'daily' },
  { loc: 'https://vybbi.com/pour-artistes', priority: '0.9', changefreq: 'monthly' },
  { loc: 'https://vybbi.com/pour-agents-managers', priority: '0.9', changefreq: 'monthly' },
  { loc: 'https://vybbi.com/pour-lieux-evenements', priority: '0.9', changefreq: 'monthly' },
  { loc: 'https://vybbi.com/top-artistes', priority: '0.8', changefreq: 'daily' },
  { loc: 'https://vybbi.com/nos-artistes', priority: '0.8', changefreq: 'weekly' },
  { loc: 'https://vybbi.com/blog', priority: '0.8', changefreq: 'daily' },
  { loc: 'https://vybbi.com/tarifs', priority: '0.8', changefreq: 'monthly' },
  { loc: 'https://vybbi.com/webtv', priority: '0.7', changefreq: 'weekly' },
  { loc: 'https://vybbi.com/radio', priority: '0.7', changefreq: 'weekly' },
  { loc: 'https://vybbi.com/a-propos', priority: '0.7', changefreq: 'monthly' },
  { loc: 'https://vybbi.com/fonctionnalites', priority: '0.7', changefreq: 'monthly' },
  { loc: 'https://vybbi.com/contact', priority: '0.7', changefreq: 'monthly' },
  { loc: 'https://vybbi.com/influenceurs', priority: '0.7', changefreq: 'weekly' },
  { loc: 'https://vybbi.com/token', priority: '0.7', changefreq: 'weekly' },
  { loc: 'https://vybbi.com/centre-aide', priority: '0.6', changefreq: 'weekly' },
  { loc: 'https://vybbi.com/technologie', priority: '0.6', changefreq: 'monthly' },
  { loc: 'https://vybbi.com/fondateurs', priority: '0.6', changefreq: 'monthly' },
  { loc: 'https://vybbi.com/partenariats', priority: '0.6', changefreq: 'monthly' },
  { loc: 'https://vybbi.com/parrainage', priority: '0.6', changefreq: 'monthly' },
  { loc: 'https://vybbi.com/promotion', priority: '0.6', changefreq: 'weekly' },
  { loc: 'https://vybbi.com/vybbi-tokens', priority: '0.6', changefreq: 'weekly' },
  { loc: 'https://vybbi.com/recherche-avancee', priority: '0.6', changefreq: 'monthly' },
  { loc: 'https://vybbi.com/confidentialite', priority: '0.3', changefreq: 'yearly' },
  { loc: 'https://vybbi.com/conditions', priority: '0.3', changefreq: 'yearly' },
  { loc: 'https://vybbi.com/cookies', priority: '0.3', changefreq: 'yearly' }
];

/**
 * Génère le XML du sitemap
 */
function generateSitemapXml(urls) {
  const currentDate = new Date().toISOString().split('T')[0];
  
  const urlsXml = urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;
}

/**
 * Script principal
 */
function main() {
  try {
    console.log('🚀 Génération du sitemap.xml...');
    
    // Générer le XML du sitemap
    const sitemapXml = generateSitemapXml(staticUrls);
    
    // Écrire le fichier sitemap.xml
    const sitemapPath = join(__dirname, '../public/sitemap.xml');
    writeFileSync(sitemapPath, sitemapXml, 'utf8');
    
    console.log('✅ Sitemap généré avec succès:', sitemapPath);
    console.log(`📊 ${staticUrls.length} URLs ajoutées au sitemap`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération du sitemap:', error);
    process.exit(1);
  }
}

// Exécuter le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateSitemapXml, staticUrls };