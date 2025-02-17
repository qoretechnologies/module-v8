import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { JIRA_CONN_OPTIONS } from '../constants';

export const getJiraProjectTemplateKeyAllowedValues: TQoreGetAllowedValuesFunction<
  typeof JIRA_CONN_OPTIONS
> = (context): IQoreAllowedValue[] => {
  const projectTypeKey = context?.opts?.projectTypeKey;

  if (!projectTypeKey) {
    throw new Error(
      'The projectTypeKey is required to get Jira project template key allowed values'
    );
  }

  switch (projectTypeKey) {
    case 'software': {
      return [
        {
          value:
            'com.atlassian.jira-core-project-templates:jira-core-simplified-content-management',
          display_name: 'Content Management',
          desc: 'Manage the creation, review, and publication of content.',
        },
        {
          value: 'com.atlassian.jira-core-project-templates:jira-core-simplified-document-approval',
          display_name: 'Document Approval',
          desc: 'Streamline the process of reviewing and approving documents.',
        },
        {
          value: 'com.atlassian.jira-core-project-templates:jira-core-simplified-lead-tracking',
          display_name: 'Lead Tracking',
          desc: 'Track and manage potential sales leads through your pipeline.',
        },
        {
          value: 'com.atlassian.jira-core-project-templates:jira-core-simplified-process-control',
          display_name: 'Process Control',
          desc: 'Monitor and control processes to ensure quality and efficiency.',
        },
        {
          value: 'com.atlassian.jira-core-project-templates:jira-core-simplified-procurement',
          display_name: 'Procurement',
          desc: 'Manage procurement requests and approvals within your organization.',
        },
        {
          value:
            'com.atlassian.jira-core-project-templates:jira-core-simplified-project-management',
          display_name: 'Project Management',
          desc: 'Plan, track, and manage projects from start to finish.',
        },
        {
          value: 'com.atlassian.jira-core-project-templates:jira-core-simplified-recruitment',
          display_name: 'Recruitment',
          desc: 'Oversee the recruitment process, from job posting to hiring.',
        },
        {
          value: 'com.atlassian.jira-core-project-templates:jira-core-simplified-task-tracking',
          display_name: 'Task Tracking',
          desc: 'Organize and monitor tasks to ensure timely completion.',
        },
      ];
    }
    case 'service_desk': {
      return [
        {
          value: 'com.atlassian.servicedesk:simplified-it-service-management',
          display_name: 'IT Service Management',
          desc: 'Manage IT services, incidents, and requests efficiently.',
        },
        {
          value: 'com.atlassian.servicedesk:simplified-general-service-desk-it',
          display_name: 'General IT Service Desk',
          desc: 'A general-purpose IT service desk template for handling requests.',
        },
        {
          value: 'com.atlassian.servicedesk:simplified-general-service-desk-business',
          display_name: 'General Business Service Desk',
          desc: 'Provide support for general business-related inquiries and issues.',
        },
        {
          value: 'com.atlassian.servicedesk:simplified-external-service-desk',
          display_name: 'External Service Desk',
          desc: 'Support external customers with queries and requests.',
        },
        {
          value: 'com.atlassian.servicedesk:simplified-hr-service-desk',
          display_name: 'HR Service Desk',
          desc: 'Manage human resources requests, such as onboarding or payroll.',
        },
        {
          value: 'com.atlassian.servicedesk:simplified-facilities-service-desk',
          display_name: 'Facilities Service Desk',
          desc: 'Track and resolve facility-related issues and requests.',
        },
        {
          value: 'com.atlassian.servicedesk:simplified-legal-service-desk',
          display_name: 'Legal Service Desk',
          desc: 'Handle legal document reviews, contracts, and compliance requests.',
        },
        {
          value: 'com.atlassian.servicedesk:simplified-analytics-service-desk',
          display_name: 'Analytics Service Desk',
          desc: 'Provide analytics or data-related support and services.',
        },
        {
          value: 'com.atlassian.servicedesk:simplified-marketing-service-desk',
          display_name: 'Marketing Service Desk',
          desc: 'Manage marketing project requests and feedback.',
        },
        {
          value: 'com.atlassian.servicedesk:simplified-design-service-desk',
          display_name: 'Design Service Desk',
          desc: 'Support design requests and track project progress.',
        },
        {
          value: 'com.atlassian.servicedesk:simplified-sales-service-desk',
          display_name: 'Sales Service Desk',
          desc: 'Handle sales queries, leads, and customer follow-ups.',
        },
        {
          value: 'com.atlassian.servicedesk:simplified-blank-project-business',
          display_name: 'Blank Business Project',
          desc: 'A blank slate for building a custom business project.',
        },
        {
          value: 'com.atlassian.servicedesk:simplified-blank-project-it',
          display_name: 'Blank IT Project',
          desc: 'A blank slate for building a custom IT service desk project.',
        },
        {
          value: 'com.atlassian.servicedesk:simplified-finance-service-desk',
          display_name: 'Finance Service Desk',
          desc: 'Track and manage financial inquiries and support requests.',
        },
        {
          value: 'com.atlassian.servicedesk:next-gen-it-service-desk',
          display_name: 'Next-Gen IT Service Desk',
          desc: 'Modern IT service desk template with streamlined workflows.',
        },
        {
          value: 'com.atlassian.servicedesk:next-gen-hr-service-desk',
          display_name: 'Next-Gen HR Service Desk',
          desc: 'Simplified HR service desk for handling employee requests.',
        },
        {
          value: 'com.atlassian.servicedesk:next-gen-legal-service-desk',
          display_name: 'Next-Gen Legal Service Desk',
          desc: 'Manage legal inquiries with a modernized service desk.',
        },
        {
          value: 'com.atlassian.servicedesk:next-gen-marketing-service-desk',
          display_name: 'Next-Gen Marketing Service Desk',
          desc: 'Support marketing teams with a modern service desk solution.',
        },
        {
          value: 'com.atlassian.servicedesk:next-gen-facilities-service-desk',
          display_name: 'Next-Gen Facilities Service Desk',
          desc: 'Streamline facility-related requests and operations.',
        },
        {
          value: 'com.atlassian.servicedesk:next-gen-general-it-service-desk',
          display_name: 'Next-Gen General IT Service Desk',
          desc: 'A modern IT service desk for handling diverse support needs.',
        },
        {
          value: 'com.atlassian.servicedesk:next-gen-general-business-service-desk',
          display_name: 'Next-Gen General Business Service Desk',
          desc: 'Support general business needs with a streamlined service desk.',
        },
        {
          value: 'com.atlassian.servicedesk:next-gen-analytics-service-desk',
          display_name: 'Next-Gen Analytics Service Desk',
          desc: 'Handle data-related queries with a next-gen service desk.',
        },
        {
          value: 'com.atlassian.servicedesk:next-gen-finance-service-desk',
          display_name: 'Next-Gen Finance Service Desk',
          desc: 'Track and manage finance-related inquiries effectively.',
        },
        {
          value: 'com.atlassian.servicedesk:next-gen-design-service-desk',
          display_name: 'Next-Gen Design Service Desk',
          desc: 'Support design tasks with a modernized service desk.',
        },
        {
          value: 'com.atlassian.servicedesk:next-gen-sales-service-desk',
          display_name: 'Next-Gen Sales Service Desk',
          desc: 'Manage sales queries and leads with a streamlined workflow.',
        },
      ];
    }
    case 'business': {
      return [
        {
          value: 'com.pyxis.greenhopper.jira:gh-simplified-agility-kanban',
          display_name: 'Agility Kanban',
          desc: 'A simplified Kanban project template for agile teams.',
        },
        {
          value: 'com.pyxis.greenhopper.jira:gh-simplified-agility-scrum',
          display_name: 'Agility Scrum',
          desc: 'A simplified Scrum project template for agile teams.',
        },
        {
          value: 'com.pyxis.greenhopper.jira:gh-simplified-basic',
          display_name: 'Basic Software Development',
          desc: 'A basic project template for software development.',
        },
        {
          value: 'com.pyxis.greenhopper.jira:gh-simplified-kanban-classic',
          display_name: 'Kanban Classic',
          desc: 'A classic Kanban project template with traditional workflows.',
        },
        {
          value: 'com.pyxis.greenhopper.jira:gh-simplified-scrum-classic',
          display_name: 'Scrum Classic',
          desc: 'A classic Scrum project template with traditional workflows.',
        },
      ];
    }
    default: {
      return [];
    }
  }
};
