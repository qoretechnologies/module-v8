import { IQoreAppActionOption, TQoreTypeObject } from '../../../global/models/qore';

export const eventRepositoryType = {
  type: 'hash',
  fields: {
    id: {
      type: 'int',
    },
    name: {
      type: 'softstring',
    },
    full_name: {
      type: 'softstring',
    },
    owner: {
      type: {
        type: 'hash',
        fields: {
          login: {
            type: 'softstring',
          },
          id: {
            type: 'int',
          },
          avatar_url: {
            type: 'softstring',
          },
          html_url: {
            type: 'softstring',
          },
        },
      },
    },
    private: {
      type: 'boolean',
    },
    html_url: {
      type: 'softstring',
    },
    description: {
      type: 'softstring',
    },
    fork: {
      type: 'boolean',
    },
    created_at: {
      type: 'softdate',
    },
    updated_at: {
      type: 'softdate',
    },
    pushed_at: {
      type: 'softdate',
    },
    size: {
      type: 'int',
    },
    stargazers_count: {
      type: 'int',
    },
    watchers_count: {
      type: 'int',
    },
    language: {
      type: 'softstring',
    },
    has_issues: {
      type: 'boolean',
    },
    has_downloads: {
      type: 'boolean',
    },
    has_wiki: {
      type: 'boolean',
    },
    has_pages: {
      type: 'boolean',
    },
    forks_count: {
      type: 'int',
    },
    mirror_url: {
      type: 'softstring',
    },
    archived: {
      type: 'boolean',
    },
    disabled: {
      type: 'boolean',
    },
    open_issues_count: {
      type: 'int',
    },
    license: {
      type: 'softstring',
    },
    forks: {
      type: 'int',
    },
    open_issues: {
      type: 'int',
    },
    watchers: {
      type: 'int',
    },
    default_branch: {
      type: 'softstring',
    },
  },
} satisfies TQoreTypeObject;

export const eventSenderType = {
  type: 'hash',
  fields: {
    login: {
      type: 'softstring',
    },
    id: {
      type: 'int',
    },
    avatar_url: {
      type: 'softstring',
    },
    html_url: {
      type: 'softstring',
    },
  },
} satisfies TQoreTypeObject;

export const commonEventFieldsType = {
  action: {
    type: 'softstring',
  },
  repository: {
    type: eventRepositoryType,
  },
  sender: {
    type: eventSenderType,
  },
} satisfies Record<string, IQoreAppActionOption>;
