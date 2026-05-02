/** Stable IDs for demo seeded entities — demo-layer only, not real UUIDs. */

export const DEMO_IDS = {
  user: 'demo-user-alex-chen',
  org: 'demo-org-acme-product-team',
  projects: {
    websiteRedesign: 'demo-project-website-redesign',
    mobileLaunch: 'demo-project-mobile-launch',
    designSystem: 'demo-project-design-system',
    apiPlatform: 'demo-project-api-platform',
    growthQ2: 'demo-project-growth-q2',
    internalOps: 'demo-project-internal-ops',
  },
  teammates: {
    sam: 'demo-user-sam-rivera',
    jordan: 'demo-user-jordan-lee',
    priya: 'demo-user-priya-shah',
    marcus: 'demo-user-marcus-wright',
    elena: 'demo-user-elena-volkov',
    riley: 'demo-user-riley-nguyen',
  },
} as const;
