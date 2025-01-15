import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { JIRA_CONN_OPTIONS } from '../constants';

export const getJiraProjectIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof JIRA_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token, cloud_id },
  } = context;

  const projectIds: IQoreAllowedValue[] = [];

  const { data: fetchedProjects } = await QorusRequest.get<any>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        expand: 'description',
      },
      path: `/ex/jira/${cloud_id}/rest/api/3/project`,
    },
    { url: `https://api.atlassian.com`, endpointId: 'Jira' }
  );

  projectIds.push(
    ...fetchedProjects.map(
      (project: any): IQoreAllowedValue => ({
        value: project.id,
        display_name: `[${project.key}] ${project.name}`,
        ...(project?.avatarUrls?.['48x48'] && { image: project.avatarUrls['48x48'] }),
        ...(project?.description && { desc: project.description }),
      })
    )
  );

  return projectIds;
};
