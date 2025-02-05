import {
  IQoreAllowedValue,
  QorusRequest,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';

export const getAsanaSectionIdAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('Token is required to get section id allowed values');
  }

  const project = context?.opts?.project;

  if (!project) {
    throw new Error('Project is required to get section id allowed values');
  }

  const sections: IQoreAllowedValue[] = [];

  const { data } = await QorusRequest.get<any>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: `/api/1.0/projects/${project}/sections`,
    },
    { url: `https://app.asana.com`, endpointId: 'Asana' }
  );

  const { data: fetchedSections } = data;

  sections.push(
    ...fetchedSections.map(
      (section: any): IQoreAllowedValue => ({
        value: section.gid,
        display_name: section.name,
        short_desc: section.gid,
      })
    )
  );

  return sections;
};
