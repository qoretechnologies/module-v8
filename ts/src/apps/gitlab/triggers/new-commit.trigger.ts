import { CommitSchema } from '@gitbeaker/rest';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { GITLAB_APP_NAME, GitLabError } from '../constants';
import { createGitlabClient } from '../helpers/constants';
import { getGitlabProjectAllowedValues } from '../helpers/get-project-allowed-values';

const options = {
  project: {
    type: 'number',
    required: true,
    preselected: true,
    allowed_values_creatable: true,
    get_allowed_values: getGitlabProjectAllowedValues,
  },
  withStats: {
    type: 'bool',
    required: false,
    default_value: false,
  },
  path: {
    type: 'string',
    required: false,
  },
  author: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const action = 'new_commit';

const NewCommit = QoreAppCreator.createLocalizedTrigger({
  app: GITLAB_APP_NAME,
  action,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token, url, project } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'url'],
      optionFields: ['project'],
      ErrorClass: GitLabError,
    });

    const { withStats, path, author } = context.opts || {};

    const getItems = () => {
      return fetchLatestCommits({
        token,
        url,
        project,
        withStats,
        path,
        author,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: `gitlab_${action}`,
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, url, project } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'url'],
      optionFields: ['project'],
      ErrorClass: GitLabError,
    });

    const { withStats, path, author } = context.opts || {};

    const rows = await fetchLatestCommits({
      token,
      url,
      project,
      withStats,
      path,
      author,
    });

    return rows?.length > 0 ? rows[0] : null;
  },
  event_info: {
    desc: 'Gitlab new commit event',
    type: {
      type: 'hash',
      fields: {
        author_email: { type: 'string' },
        author_name: { type: 'string' },
        authored_date: { type: 'string' },
        committed_date: { type: 'string' },
        committer_email: { type: 'string' },
        committer_name: { type: 'string' },
        created_at: { type: 'string' },
        extended_trailers: {
          type: {
            type: 'hash',
            fields: {
              'Signed-off-by': {
                type: {
                  type: 'list',
                  element_type: 'string',
                },
              },
            },
          },
        },
        id: { type: 'string' },
        message: { type: 'string' },
        parent_ids: { type: 'string' },
        short_id: { type: 'string' },
        title: { type: 'string' },
        trailers: {
          type: {
            type: 'hash',
            fields: {
              'Merged-By': { type: 'string' },
            },
          },
        },
        web_url: { type: 'string' },
      },
    },
  },
});

type TFetchCommitsOptions = {
  token: string;
  url: string;
  project: number;
  path?: string;
  author?: string;
  withStats?: boolean;
};

const fetchLatestCommits = async (options: TFetchCommitsOptions): Promise<CommitSchema[]> => {
  const { token, project: projectId, path, author, withStats, url } = options;
  const limit = 20;

  const client = createGitlabClient({ token, url });

  try {
    const commits = await client.Commits.all(projectId, {
      perPage: limit,
      maxPages: 1,
      ...(path && { path }),
      ...(author && { author }),
      ...(withStats !== undefined && { withStats }),
    });

    return commits;
  } catch (error) {
    throw new GitLabError(`Failed to fetch latest commits: ${error?.message || error}`);
  }
};

export default NewCommit;
