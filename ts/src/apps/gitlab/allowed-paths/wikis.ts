import { TAllowedPaths, TQoreAppActionOption } from '@qoretechnologies/ts-toolkit';
import { GITLAB_CONN_OPTIONS } from '../constants';
import { getGitlabProjectAllowedValues } from '../helpers/get-project-allowed-values';
import { getGitlabProjectWikiSlugAllowedValues } from '../helpers/get-wiki-slug-allowed-values';

const commonProjectOptions = {
  id: {
    type: 'integer',
    get_allowed_values: getGitlabProjectAllowedValues,
    on_change: ['refetch'],
    allowed_values_creatable: true,
  },
} satisfies Record<string, TQoreAppActionOption<typeof GITLAB_CONN_OPTIONS>>;

export const GITLAB_WIKIS_ALLOWED_PATHS = {
  '/api/v4/projects/{id}/wikis': {
    GET: {
      override_options: {
        ...commonProjectOptions,
      },
    },
    POST: {
      override_options: {
        ...commonProjectOptions,
      },
    },
  },
  '/api/v4/projects/{id}/wikis/{slug}': {
    GET: {
      override_options: {
        ...commonProjectOptions,
        slug: {
          depends_on: ['id'],
          get_allowed_values: getGitlabProjectWikiSlugAllowedValues,
        },
      },
    },
    PUT: {
      override_options: {
        ...commonProjectOptions,
        slug: {
          depends_on: ['id'],
          get_allowed_values: getGitlabProjectWikiSlugAllowedValues,
        },
      },
    },
    DELETE: {
      override_options: {
        ...commonProjectOptions,
        slug: {
          depends_on: ['id'],
          get_allowed_values: getGitlabProjectWikiSlugAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths<typeof GITLAB_CONN_OPTIONS>;
