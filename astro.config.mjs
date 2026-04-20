import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Crontinel Docs',
      description: 'Documentation for Crontinel — background job and cron monitoring',
      social: {
        github: 'https://github.com/crontinel/crontinel',
      },
      editLink: {
        baseUrl: 'https://github.com/crontinel/docs/edit/main/src/content/docs/',
      },
      customCss: ['./src/styles/custom.css'],
      sidebar: [
        { label: 'Getting Started', items: [
          { label: 'Introduction', link: '/introduction/' },
          { label: 'Quick Start', link: '/quick-start/' },
          { label: 'Installation', link: '/installation/' },
        ]},
        { label: 'SDKs & Packages', items: [
          { label: 'Overview', link: '/sdks/' },
          { label: 'Node.js / TypeScript', link: '/sdks/node/' },
          { label: 'Python', link: '/sdks/python/' },
          { label: 'Go', link: '/sdks/go/' },
          { label: 'Rust', link: '/sdks/rust/' },
          { label: 'PHP', link: '/sdks/php/' },
          { label: 'Ruby', link: '/sdks/ruby/' },
          { label: 'Ruby on Rails', link: '/sdks/rails/' },
          { label: 'CLI / Docker', link: '/sdks/cli/' },
        ]},
        { label: 'Monitors', items: [
          { label: 'Horizon Monitor', link: '/monitors/horizon/' },
          { label: 'Queue Monitor', link: '/monitors/queues/' },
          { label: 'Cron Monitor', link: '/monitors/cron/' },
        ]},
        { label: 'Alerts', items: [
          { label: 'Alert Channels', link: '/alerts/channels/' },
          { label: 'CLI Health Check', link: '/alerts/cli/' },
        ]},
        { label: 'MCP Integration', items: [
          { label: 'Overview', link: '/mcp/overview/' },
          { label: 'Claude Code Setup', link: '/mcp/claude-code/' },
          { label: 'Available Tools', link: '/mcp/tools/' },
        ]},
        { label: 'Reference', items: [
          { label: 'Configuration', link: '/reference/configuration/' },
          { label: 'REST API', link: '/reference/api/' },
          { label: 'Security', link: '/security/' },
          { label: 'Self-Hosting', link: '/self-hosting/' },
          { label: 'Status Page', link: '/status-page/' },
          { label: 'Upgrading', link: '/upgrading/' },
          { label: 'Troubleshooting', link: '/troubleshooting/' },
          { label: 'FAQ', link: '/faq/' },
        ]},
      ],
    }),
  ],
  site: 'https://docs.crontinel.com',
});
