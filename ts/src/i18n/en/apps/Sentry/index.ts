/* eslint-disable max-len */
const SentryAppEn = {
  displayName: 'Sentry',
  groups: ['DevOps & Cloud Infrastructure'],
  shortDesc:
    'Monitor and fix errors, track performance issues, and maintain application health with the developer-first debugging platform.',
  longDesc:
    'The Sentry integration enables comprehensive error monitoring and performance tracking for your applications. Access projects, issues, events, and teams to quickly identify, triage, and resolve problems. With real-time alerts and detailed debugging context including stack traces, breadcrumbs, and user impact metrics, Sentry helps your team maintain code quality and deliver seamless user experiences.',
  connectionMessage: {
    title: 'Connect to Sentry',
    content: `To connect to Sentry, you will need an **Auth Token** and your **Organization Slug**.

## Getting Your Auth Token

### Option 1: User Auth Token (Recommended for personal use)
1. Log in to [Sentry](https://sentry.io/)
2. Go to **Settings** → **Account** → **API** → **Auth Tokens**
3. Click **Create New Token**
4. Select the required scopes:
   - \`project:read\` - Read project information
   - \`project:write\` - Modify projects
   - \`org:read\` - Read organization data
   - \`event:read\` - Read events
   - \`member:read\` - Read team members
5. Click **Create Token** and copy it immediately

Direct link: [sentry.io/settings/account/api/auth-tokens/](https://sentry.io/settings/account/api/auth-tokens/)

### Option 2: Internal Integration Token (Recommended for production)
1. Go to **Settings** → **Developer Settings** → **Custom Integrations**
2. Click **Create New Integration** → **Internal Integration**
3. Configure the name and required permissions
4. After saving, copy the generated token

## Finding Your Organization Slug

Your organization slug is in your Sentry URL:
- If your Sentry URL is \`https://your-org.sentry.io/\`, your slug is \`your-org\`
- For sentry.io hosted accounts: \`https://sentry.io/organizations/your-org/\` → slug is \`your-org\`

## Connection Details

### Auth Token
Your Sentry authentication token. Starts with \`sntrys_\` for newer tokens or may have different prefixes for legacy tokens.

### Organization Slug
The URL-friendly identifier for your organization (found in your Sentry URL).

**Note:** Auth tokens inherit permissions based on your user role and the scopes you selected. For production integrations, use Internal Integration tokens which can be scoped to specific permissions and managed at the organization level.`,
  },

  triggers: {
    new_project_issue: {
      displayName: 'New Project Issue',
      shortDesc: 'Triggers when a new issue is detected in a specific project',
      longDesc:
        'Monitors a specific Sentry project and triggers when a new issue (grouped error or problem) is detected. Issues represent single bugs or problems in your application, with events grouped by fingerprint. Use optional query filters and time periods to focus on specific types of issues.',
      options: {
        projectId: {
          displayName: 'Project ID',
          shortDesc: 'The project to monitor for new issues',
          longDesc:
            'Select the Sentry project you want to monitor. Projects represent individual applications or services within your organization.',
        },
        query: {
          displayName: 'Query Filter',
          shortDesc: 'Optional search query to filter issues',
          longDesc:
            'Use Sentry query syntax to filter which issues trigger this event. For example, filter by browser, device, tags, or whether errors are unhandled.',
        },
        statsPeriod: {
          displayName: 'Statistics Period',
          shortDesc: 'Time period for issue statistics',
          longDesc:
            'The time range for collecting issue statistics. Affects metrics like event counts and user impact within the selected period.',
        },
      },
    },
    new_organization_issue: {
      displayName: 'New Organization Issue',
      shortDesc: 'Triggers when a new issue is detected across the entire organization',
      longDesc:
        'Monitors all projects within your Sentry organization and triggers when a new issue is detected in any project. This provides organization-wide visibility into problems across all applications and services. Use query filters to focus on specific issue types or characteristics.',
      options: {
        query: {
          displayName: 'Query Filter',
          shortDesc: 'Optional search query to filter issues',
          longDesc:
            'Use Sentry query syntax to filter which issues trigger this event across all projects. Filter by properties like platform, environment, release, or custom tags.',
        },
        statsPeriod: {
          displayName: 'Statistics Period',
          shortDesc: 'Time period for issue statistics',
          longDesc:
            'The time range for collecting issue statistics across all projects. Determines the time window for metrics like frequency and user impact.',
        },
      },
    },
  },

  actions: {
    list_projects: {
      displayName: 'List Projects',
      shortDesc: 'Retrieve all projects in your organization',
      longDesc:
        'Fetches a paginated list of all projects within your Sentry organization. Each project represents an individual application or service being monitored. Returns project details including name, platform, creation date, team membership, and configuration.',
      options: {
        cursor: {
          displayName: 'Cursor',
          shortDesc: 'Pagination cursor for retrieving additional results',
          longDesc:
            'Use the cursor from a previous response to fetch the next or previous page of results. Leave empty to start from the beginning.',
        },
      },
    },
    get_project: {
      displayName: 'Get Project Details',
      shortDesc: 'Retrieve detailed information about a specific project',
      longDesc:
        'Fetches comprehensive details about a specific Sentry project, including configuration options, team assignments, integrations, features, symbol sources, and project statistics. Use this to understand project settings and capabilities.',
      options: {
        projectId: {
          displayName: 'Project ID',
          shortDesc: 'The project to retrieve',
          longDesc:
            'Select or enter the slug identifier of the project you want to retrieve details for.',
        },
      },
    },
    list_project_events: {
      displayName: 'List Project Events',
      shortDesc: 'Retrieve events from a specific project',
      longDesc:
        'Fetches a paginated list of events (individual error or transaction occurrences) from a specific project. Events are the raw data sent to Sentry and are grouped into issues. Use the full parameter to retrieve complete event payloads including context, breadcrumbs, and metadata.',
      options: {
        projectId: {
          displayName: 'Project ID',
          shortDesc: 'The project to retrieve events from',
          longDesc: 'Select the project whose events you want to list.',
        },
        full: {
          displayName: 'Full Details',
          shortDesc: 'Whether to return complete event data',
          longDesc:
            'When enabled, returns the full event payload including all context, breadcrumbs, stack traces, and metadata. When disabled, returns summary information only.',
        },
        cursor: {
          displayName: 'Cursor',
          shortDesc: 'Pagination cursor for retrieving additional results',
          longDesc: 'Use the cursor from a previous response to navigate through pages of events.',
        },
      },
    },
    get_event: {
      displayName: 'Get Event Details',
      shortDesc: 'Retrieve detailed information about a specific event',
      longDesc:
        'Fetches complete details about a specific event, including the full stack trace, breadcrumbs (trail of events leading to the error), user context, device information, tags, SDK details, and all captured metadata. Essential for debugging and understanding the exact conditions when an error occurred.',
      options: {
        projectId: {
          displayName: 'Project ID',
          shortDesc: 'The project containing the event',
          longDesc: 'Select the project that the event belongs to.',
        },
        eventId: {
          displayName: 'Event ID',
          shortDesc: 'The unique identifier of the event',
          longDesc:
            'Enter the event ID (hexadecimal string) you want to retrieve. Event IDs can be found in issue details or event listings.',
        },
      },
    },
    list_project_issues: {
      displayName: 'List Project Issues',
      shortDesc: 'Retrieve issues from a specific project',
      longDesc:
        'Fetches a paginated list of issues (grouped errors or problems) from a specific project. Issues represent single bugs affecting your application, with multiple event occurrences grouped by fingerprint. Filter by query to find specific types of issues, and use statistics period to see relevant metrics.',
      options: {
        projectId: {
          displayName: 'Project ID',
          shortDesc: 'The project to retrieve issues from',
          longDesc: 'Select the project whose issues you want to list.',
        },
        query: {
          displayName: 'Query Filter',
          shortDesc: 'Search query to filter issues',
          longDesc:
            'Use Sentry query syntax to filter issues by properties like status, assignee, tags, platform, or time range. Example: "is:unresolved assigned:me"',
        },
        statsPeriod: {
          displayName: 'Statistics Period',
          shortDesc: 'Time period for issue statistics',
          longDesc:
            'The time range for calculating issue statistics such as event count, frequency, and user impact.',
        },
        shortIdLookup: {
          displayName: 'Short ID Lookup',
          shortDesc: 'Whether to look up issues by their short ID',
          longDesc:
            'When enabled, allows searching for issues using their short IDs (e.g., PROJECT-123) instead of full issue IDs.',
        },
        cursor: {
          displayName: 'Cursor',
          shortDesc: 'Pagination cursor for retrieving additional results',
          longDesc: 'Use the cursor from a previous response to navigate through pages of issues.',
        },
      },
    },
    list_organization_issues: {
      displayName: 'List Organization Issues',
      shortDesc: 'Retrieve issues across the entire organization',
      longDesc:
        'Fetches a paginated list of issues from all projects within your organization. This provides organization-wide visibility into problems across all applications and services. Use query filters to narrow down results by project, platform, status, or other criteria.',
      options: {
        query: {
          displayName: 'Query Filter',
          shortDesc: 'Search query to filter issues',
          longDesc:
            'Use Sentry query syntax to filter issues across all projects. Filter by project, platform, environment, status, tags, or any other issue property.',
        },
        statsPeriod: {
          displayName: 'Statistics Period',
          shortDesc: 'Time period for issue statistics',
          longDesc:
            'The time range for calculating issue statistics and metrics across the organization.',
        },
        shortIdLookup: {
          displayName: 'Short ID Lookup',
          shortDesc: 'Whether to look up issues by their short ID',
          longDesc:
            'When enabled, allows searching for issues using their short IDs across all projects.',
        },
        cursor: {
          displayName: 'Cursor',
          shortDesc: 'Pagination cursor for retrieving additional results',
          longDesc:
            'Use the cursor from a previous response to retrieve additional pages of organization-wide issues.',
        },
      },
    },
    get_issue: {
      displayName: 'Get Issue Details',
      shortDesc: 'Retrieve detailed information about a specific issue',
      longDesc:
        'Fetches comprehensive details about a specific issue, including its status, metadata, assignment, statistics (event count, user impact, frequency), participants, activity history, linked integrations, and the latest event details. Essential for understanding the full context and history of a problem.',
      options: {
        issueId: {
          displayName: 'Issue ID',
          shortDesc: 'The unique identifier of the issue',
          longDesc:
            'Enter the issue ID you want to retrieve. Issue IDs are numeric values that can be found in the Sentry UI or from list operations.',
        },
      },
    },
    update_issue: {
      displayName: 'Update Issue',
      shortDesc: 'Update the status or properties of an issue',
      longDesc:
        "Modifies an issue's status (resolved, unresolved, ignored), assignment, bookmarked state, subscription status, or visibility. Use this to triage issues, assign them to team members, resolve bugs, or mark issues as ignored. Status changes can trigger alerts and affect issue grouping.",
      options: {
        projectId: {
          displayName: 'Project ID',
          shortDesc: 'The project containing the issue (optional)',
          longDesc:
            'Optionally specify the project for context. While issues can be updated by ID alone, providing the project can be helpful for organization.',
        },
        issueId: {
          displayName: 'Issue ID',
          shortDesc: 'The unique identifier of the issue to update',
          longDesc:
            'Enter the issue ID you want to update. You can find issue IDs in the Sentry UI or from list/search operations.',
        },
        status: {
          displayName: 'Status',
          shortDesc: 'The new status for the issue',
          longDesc:
            'Change the issue status to control its lifecycle. "Resolved" marks it as fixed, "Unresolved" reopens it, "Ignored" archives it temporarily, and "Resolved in Next Release" indicates it will be fixed in an upcoming deployment.',
        },
        assignedTo: {
          displayName: 'Assigned To',
          shortDesc: 'User or team to assign the issue to',
          longDesc:
            'Assign the issue to a specific user or team for ownership and accountability. Enter a team slug (e.g., "team:backend") or user ID.',
        },
        hasSeen: {
          displayName: 'Has Seen',
          shortDesc: 'Mark whether the issue has been viewed',
          longDesc:
            'Mark the issue as seen (reviewed) or unseen. This helps track which issues have been triaged by your team.',
        },
        isBookmarked: {
          displayName: 'Is Bookmarked',
          shortDesc: 'Bookmark status for the issue',
          longDesc:
            'Bookmark the issue for easy access and filtering. Bookmarked issues appear in your personal issue list.',
        },
        isSubscribed: {
          displayName: 'Is Subscribed',
          shortDesc: 'Subscription status for notifications',
          longDesc:
            "Subscribe to or unsubscribe from notifications about this issue. When subscribed, you'll receive alerts when the issue changes or escalates.",
        },
        isPublic: {
          displayName: 'Is Public',
          shortDesc: 'Whether the issue should be publicly accessible',
          longDesc:
            'Control whether the issue is publicly visible via a share link. Public issues can be viewed by anyone with the link, even without Sentry access.',
        },
      },
    },
    list_teams: {
      displayName: 'List Teams',
      shortDesc: 'Retrieve all teams in your organization',
      longDesc:
        'Fetches a paginated list of all teams within your Sentry organization. Teams represent groups of developers working together on projects. Returns team details including member count, access permissions, role assignments, linked projects, and external team integrations.',
      options: {
        cursor: {
          displayName: 'Cursor',
          shortDesc: 'Pagination cursor for retrieving additional results',
          longDesc: 'Use the cursor from a previous response to navigate through pages of teams.',
        },
      },
    },
    get_team: {
      displayName: 'Get Team Details',
      shortDesc: 'Retrieve detailed information about a specific team',
      longDesc:
        'Fetches comprehensive details about a specific team, including its members, assigned projects, access permissions, role settings, external integrations (like Slack channels), and organization-level role. Use this to understand team structure and project ownership.',
      options: {
        teamId: {
          displayName: 'Team ID',
          shortDesc: 'The team slug to retrieve',
          longDesc:
            'Enter the team slug (URL-friendly identifier) of the team you want to retrieve details for.',
        },
      },
    },
  },
};

export default SentryAppEn;
