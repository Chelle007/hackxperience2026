/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://hackxperience2026.vercel.app",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  changefreq: "weekly",
  priority: 0.8,
  outDir: "public",
  transform: async (config, path) => ({
    loc: path,
    changefreq: "weekly",
    priority: path === "/" ? 1.0 : 0.8,
  }),
  additionalPaths: async () => [
    { loc: "/", changefreq: "weekly", priority: 1.0 },
    { loc: "/guide", changefreq: "weekly", priority: 0.9 },
    { loc: "/projects", changefreq: "weekly", priority: 0.8 },
  ],
};
