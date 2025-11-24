import { CommitCommentSchema } from '@gitbeaker/rest';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { GITLAB_APP_NAME, GitLabError } from '../constants';
import { createGitlabClient } from '../helpers/constants';
import { getGitlabCommitAllowedValues } from '../helpers/get-commit-allowed-values';
import { getGitlabProjectAllowedValues } from '../helpers/get-project-allowed-values';

const options = {
  project: {
    type: 'number',
    required: true,
    preselected: true,
    allowed_values_creatable: true,
    get_allowed_values: getGitlabProjectAllowedValues,
    on_change: ['refetch'],
  },
  commit: {
    type: 'string',
    required: true,
    get_allowed_values: getGitlabCommitAllowedValues,
    depends_on: ['project'],
  },
} satisfies TQoreOptions;

const action = 'new_commit_comment';

const NewCommitComment = QoreAppCreator.createLocalizedTrigger({
  app: GITLAB_APP_NAME,
  action,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token, url, project, commit } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'url'],
      optionFields: ['project', 'commit'],
      ErrorClass: GitLabError,
    });

    const getItems = () => {
      return fetchLatestCommits({
        token,
        url,
        project,
        commit,
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
    const { token, url, project, commit } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'url'],
      optionFields: ['project', 'commit'],
      ErrorClass: GitLabError,
    });

    const rows = await fetchLatestCommits({
      token,
      url,
      project,
      commit,
    });

    return rows?.length > 0 ? rows[0] : null;
  },
  event_info: {
    desc: 'Gitlab new commit comment event',
    type: {
      type: 'hash',
      fields: {
        author: {
          type: {
            type: 'hash',
            fields: {
              avatar_path: { type: 'string' },
              avatar_url: { type: 'string' },
              custom_attributes: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      key: { type: 'string' },
                      value: { type: 'string' },
                    },
                  },
                },
              },
              id: { type: 'integer' },
              locked: { type: 'boolean' },
              name: { type: 'string' },
              public_email: { type: 'string' },
              state: { type: 'string' },
              username: { type: 'string' },
              web_url: { type: 'string' },
            },
          },
        },
        created_at: { type: 'string' },
        line: { type: 'integer' },
        line_type: { type: 'string' },
        note: { type: 'string' },
        path: { type: 'string' },
      },
    },
  },
});

type TFetchCommitsOptions = {
  token: string;
  url: string;
  project: number;
  commit: string;
};

const fetchLatestCommits = async (
  options: TFetchCommitsOptions
): Promise<CommitCommentSchema[]> => {
  const { token, project, commit, url } = options;

  const client = createGitlabClient({ token, url });

  try {
    const comments = await client.Commits.allComments(project, commit, {
      showExpanded: true,
    });

    return comments.data as CommitCommentSchema[];
  } catch (error) {
    throw new GitLabError(`Failed to fetch latest commit comments: ${error?.message || error}`);
  }
};

export default NewCommitComment;
