import { supabase } from '@/integrations/supabase/client';

export interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export async function generateSitemapUrls(): Promise<SitemapUrl[]> {
  const baseUrl = 'https://vybbi.com';
  const today = new Date().toISOString().split('T')[0];

  const urls: SitemapUrl[] = [
    // Home page - highest priority
    { loc: baseUrl, lastmod: today, changefreq: 'daily', priority: 1.0 },

    // Main public pages - high priority
    { loc: `${baseUrl}/artists`, lastmod: today, changefreq: 'daily', priority: 0.9 },
    { loc: `${baseUrl}/lieux`, lastmod: today, changefreq: 'daily', priority: 0.9 },
    { loc: `${baseUrl}/top-artistes`, lastmod: today, changefreq: 'daily', priority: 0.8 },
    { loc: `${baseUrl}/nos-artistes`, lastmod: today, changefreq: 'weekly', priority: 0.8 },

    // Service pages - high priority for SEO
    { loc: `${baseUrl}/pour-artistes`, lastmod: today, changefreq: 'monthly', priority: 0.9 },
    { loc: `${baseUrl}/pour-agents-managers`, lastmod: today, changefreq: 'monthly', priority: 0.9 },
    { loc: `${baseUrl}/pour-lieux-evenements`, lastmod: today, changefreq: 'monthly', priority: 0.9 },

    // Blog & Content
    { loc: `${baseUrl}/blog`, lastmod: today, changefreq: 'daily', priority: 0.8 },
    { loc: `${baseUrl}/webtv`, lastmod: today, changefreq: 'weekly', priority: 0.7 },
    { loc: `${baseUrl}/radio`, lastmod: today, changefreq: 'weekly', priority: 0.7 },

    // Company & Info pages
    { loc: `${baseUrl}/a-propos`, lastmod: today, changefreq: 'monthly', priority: 0.7 },
    { loc: `${baseUrl}/technologie`, lastmod: today, changefreq: 'monthly', priority: 0.6 },
    { loc: `${baseUrl}/fondateurs`, lastmod: today, changefreq: 'monthly', priority: 0.6 },
    { loc: `${baseUrl}/fonctionnalites`, lastmod: today, changefreq: 'monthly', priority: 0.7 },
    { loc: `${baseUrl}/tarifs`, lastmod: today, changefreq: 'monthly', priority: 0.8 },

    // Support & Legal
    { loc: `${baseUrl}/centre-aide`, lastmod: today, changefreq: 'weekly', priority: 0.6 },
    { loc: `${baseUrl}/contact`, lastmod: today, changefreq: 'monthly', priority: 0.7 },
    { loc: `${baseUrl}/confidentialite`, lastmod: today, changefreq: 'yearly', priority: 0.3 },
    { loc: `${baseUrl}/conditions`, lastmod: today, changefreq: 'yearly', priority: 0.3 },
    { loc: `${baseUrl}/cookies`, lastmod: today, changefreq: 'yearly', priority: 0.3 },

    // Business pages
    { loc: `${baseUrl}/partenariats`, lastmod: today, changefreq: 'monthly', priority: 0.6 },
    { loc: `${baseUrl}/parrainage`, lastmod: today, changefreq: 'monthly', priority: 0.6 },
    { loc: `${baseUrl}/influenceurs`, lastmod: today, changefreq: 'weekly', priority: 0.7 },
    { loc: `${baseUrl}/promotion`, lastmod: today, changefreq: 'weekly', priority: 0.6 },

    // Token & Features
    { loc: `${baseUrl}/token`, lastmod: today, changefreq: 'weekly', priority: 0.7 },
    { loc: `${baseUrl}/vybbi-tokens`, lastmod: today, changefreq: 'weekly', priority: 0.6 },

    // Search & Discovery
    { loc: `${baseUrl}/recherche-avancee`, lastmod: today, changefreq: 'monthly', priority: 0.6 },
  ];

  try {
    // Fetch dynamic content from database
    const [artistProfiles, venueProfiles, partnerProfiles, blogPosts] = await Promise.all([
      // Artist profiles
      supabase
        .from('profiles')
        .select('slug, updated_at')
        .eq('profile_type', 'artist')
        .eq('is_public', true)
        .not('slug', 'is', null),

      // Venue profiles
      supabase
        .from('profiles')
        .select('slug, updated_at')
        .eq('profile_type', 'lieu')
        .eq('is_public', true)
        .not('slug', 'is', null),

      // Partner profiles (agents & managers)
      supabase
        .from('profiles')
        .select('slug, updated_at, profile_type')
        .in('profile_type', ['agent', 'manager'])
        .eq('is_public', true)
        .not('slug', 'is', null),

      // Blog posts
      supabase
        .from('blog_posts')
        .select('slug, updated_at')
        .eq('status', 'published')
        .not('slug', 'is', null),
    ]);

    // Add artist profiles
    if (artistProfiles.data) {
      artistProfiles.data.forEach(profile => {
        urls.push({
          loc: `${baseUrl}/artists/${profile.slug}`,
          lastmod: new Date(profile.updated_at).toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: 0.7
        });
      });
    }

    // Add venue profiles
    if (venueProfiles.data) {
      venueProfiles.data.forEach(profile => {
        urls.push({
          loc: `${baseUrl}/lieux/${profile.slug}`,
          lastmod: new Date(profile.updated_at).toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: 0.7
        });
      });
    }

    // Add partner profiles
    if (partnerProfiles.data) {
      partnerProfiles.data.forEach(profile => {
        const prefix = profile.profile_type === 'agent' ? 'agents' : 'managers';
        urls.push({
          loc: `${baseUrl}/${prefix}/${profile.slug}`,
          lastmod: new Date(profile.updated_at).toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: 0.6
        });
      });
    }

    // Add blog posts
    if (blogPosts.data) {
      blogPosts.data.forEach(post => {
        urls.push({
          loc: `${baseUrl}/blog/${post.slug}`,
          lastmod: new Date(post.updated_at).toISOString().split('T')[0],
          changefreq: 'monthly',
          priority: 0.6
        });
      });
    }
  } catch (error) {
    console.error('Error fetching dynamic content for sitemap:', error);
  }

  return urls.sort((a, b) => b.priority - a.priority);
}

export function generateSitemapXml(urls: SitemapUrl[]): string {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return xml;
}