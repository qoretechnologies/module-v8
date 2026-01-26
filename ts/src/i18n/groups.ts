/**
 * Centralized registry for app-level groups.
 *
 * App-level groups are high-level categories that describe what type of app it is.
 * This registry ensures consistency and prevents duplicate/inconsistent group names.
 *
 * To add a new app group:
 * 1. Add it to the APP_GROUPS array below
 * 2. The type will be automatically updated
 *
 * Note: Action/trigger-level groups (like 'Messages', 'Users', etc.) are intentionally
 * NOT centralized here - they are app-specific and defined in each app's locale file.
 */

export const APP_GROUPS = [
  // AI & Machine Learning
  'AI & Language Models',

  // Cloud & Infrastructure
  'Cloud Storage & File Management',
  'Databases & Backend Services',
  'DevOps & Cloud Infrastructure',

  // Communication
  'Email & Email Marketing',
  'Messaging & Real-time Communication',
  'Notifications & Alerts',
  'Video Conferencing & Meetings',

  // CRM & Sales
  'CRM & Sales Management',

  // Customer Support
  'Customer Support & Helpdesk',

  // Data & Analytics
  'Analytics & Reporting',

  // Design & Creative
  'Design & Creative Tools',

  // Documents & Productivity
  'Documents & Documentation',
  'Document Signing & Contracts',
  'Spreadsheets & Data Tables',

  // E-commerce & Payments
  'E-commerce Platforms',
  'Payment Processing',

  // Finance & Accounting
  'Accounting & ERP',

  // Forms & Surveys
  'Forms, Surveys & Scheduling',

  // HR & People
  'HR & People Management',

  // Marketing
  'Marketing Automation',

  // Project & Task Management
  'Project & Task Management',

  // Social Media
  'Social Media Management',

  // Suites
  'Google Workspace Suite',

  // Version Control
  'Version Control & Code Repositories',

  // Web & Automation
  'Web Scraping & Automation',

  // Other
  'Weather',
] as const;

export type TAppGroup = (typeof APP_GROUPS)[number];

/**
 * Type for app-level groups array
 * @example groups: ['Communication', 'Team Communication & Chat'] satisfies TAppGroups
 */
export type TAppGroups = TAppGroup[];

/**
 * Runtime validation helper
 */
export const isValidAppGroup = (group: string): group is TAppGroup => {
  return APP_GROUPS.includes(group as TAppGroup);
};
