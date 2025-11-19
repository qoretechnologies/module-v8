import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchPipedriveAllowedValues } from './client';

type TPipedriveProjectData = {
  id: string;
  title: string;
  description: string;
  status: string;
  start_date: string;
};

const mapPipedriveProject = (project: TPipedriveProjectData): IQoreAllowedValue<string> => ({
  display_name: project.title,
  value: project.id,
  desc:
    `Status: ${project.status}\n\n` +
    `Description: ${project.description}\n\n` +
    `Start date: ${project.start_date}`,
});

export const getPipedriveProjectIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('The token is required to get Pipedrive project allowed values');
  }

  const projects = await fetchPipedriveAllowedValues<TPipedriveProjectData>({
    token,
    mapItemToAllowedValue: mapPipedriveProject,
    path: 'v1/projects',
  });

  return projects;
};
