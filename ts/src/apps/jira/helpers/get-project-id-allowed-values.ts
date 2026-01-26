import {
  IQoreAllowedValue,
  QorusRequest,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { JIRA_CONN_OPTIONS } from '../conn-options';

export const getJiraProjectIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof JIRA_CONN_OPTIONS,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const cloud_id = context?.conn_opts?.cloud_id;

  if (!token || !cloud_id) {
    throw new Error('The token and cloud_id are required to get Jira project allowed values');
  }

  const projectIds: IQoreAllowedValue<string>[] = [];

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
      (project: any): IQoreAllowedValue<string> => ({
        value: project.id,
        display_name: `[${project.key}] ${project.name}`,
        ...(project.avatarUrls?.['48x48'] && { image: project.avatarUrls['48x48'] }),
        ...(project.description && { desc: project.description }),
      })
    )
  );

  return projectIds;
};
