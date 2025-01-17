import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';

export const getAsanaSectionIdAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token },
    opts: { project },
  } = context;

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
