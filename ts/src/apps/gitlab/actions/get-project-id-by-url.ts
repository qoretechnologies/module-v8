import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { GITLAB_APP_NAME, GitLabError } from '../constants';
import { createGitlabClient } from '../helpers/constants';

const action = 'get_project_id_by_url';

const options = {
  project_url: {
    type: 'string',
    required: true,
  },
} satisfies TQoreOptions;

const getProjectIdByUrl = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GITLAB_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, url, project_url } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'url'],
      optionFields: ['project_url'],
      ErrorClass: GitLabError,
    });

    const client = createGitlabClient({ url, token });

    try {
      const projectPathWithNamespace = decodeURIComponent(new URL(project_url).pathname.slice(1));
      const encodedPath = encodeURIComponent(projectPathWithNamespace);

      const project = await client.Projects.show(projectPathWithNamespace);

      if (!project?.id) {
        throw new GitLabError(`Project not found for URL: ${project_url}`);
      }

      return {
        id: project.id,
        encoded_path_with_namespace: encodedPath,
        path_with_namespace: projectPathWithNamespace,
      };
    } catch (error) {
      throw new GitLabError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'number' },
      encoded_path_with_namespace: { type: 'string' },
      path_with_namespace: { type: 'string' },
    },
  },
});

export default getProjectIdByUrl;
