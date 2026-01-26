import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { FIRESTORE_APP_NAME, FirestoreError, getFirestoreErrorMessage } from '../constants';
import { QorusRequest } from '@qoretechnologies/ts-toolkit';

const options = {
  name: {
    required: false,
    type: 'string',
  },
  page_size: {
    required: false,
    type: 'integer',
    default_value: 100,
  },
  next_page_token: {
    required: false,
    type: 'string',
  },
} satisfies TQoreOptions;

const listProjects = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FIRESTORE_APP_NAME,
  action: 'list_projects',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: FirestoreError,
    });

    const name = obj?.name;
    const page_size = obj?.page_size || 100;
    const next_page_token = obj?.next_page_token;

    try {
      const params: Record<string, string> = {
        pageSize: page_size.toString(),
        pageToken: next_page_token || '',
      };

      if (name) {
        params.filter = `name:${name}`;
      }

      const response = await QorusRequest.get<{
        data: {
          projects: Array<{
            projectId: string;
            projectNumber: string;
            name: string;
            lifecycleState: string;
            createTime?: string;
            parent?: {
              type: string;
              id: string;
            };
            labels?: Record<string, string>;
          }>;
          nextPageToken?: string;
        };
      }>(
        {
          path: '/v1/projects',
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        {
          url: 'https://cloudresourcemanager.googleapis.com',
          endpointId: FIRESTORE_APP_NAME,
        }
      );

      const projects = response?.data?.projects || [];

      const projectDetails = projects.map((project) => ({
        project_id: project.projectId,
        project_number: project.projectNumber,
        name: project.name,
        lifecycle_state: project.lifecycleState,
        create_time: project.createTime,
        parent: project.parent
          ? {
              type: project.parent.type,
              id: project.parent.id,
            }
          : undefined,
        labels: project.labels || {},
      }));

      return {
        count: projectDetails.length,
        next_page_token: response?.data?.nextPageToken,
        has_more: !!response?.data?.nextPageToken,
        projects: projectDetails,
      };
    } catch (error) {
      throw new FirestoreError(`Failed to list projects: ${getFirestoreErrorMessage(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      count: { type: 'integer' },
      next_page_token: { type: 'string' },
      has_more: { type: 'bool' },
      projects: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              project_id: { type: 'string' },
              project_number: { type: 'string' },
              name: { type: 'string' },
              lifecycle_state: { type: 'string' },
              create_time: { type: 'string' },
              parent: {
                type: {
                  type: 'hash',
                  fields: {
                    type: { type: 'string' },
                    id: { type: 'string' },
                  },
                },
              },
              labels: { type: 'hash' },
            },
          },
        },
      },
    },
  },
});

export default listProjects;
