import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchPipedriveAllowedValues } from './constants';

type TPipedriveProjectTemplateData = {
  id: string;
  title: string;
  description: string;
};

const mapPipedriveProjectTemplate = (
  template: TPipedriveProjectTemplateData
): IQoreAllowedValue<string> => ({
  display_name: template.title,
  desc: template.description,
  value: template.id,
});

export const getPipedriveProjectTemplateIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('The token is required to get Pipedrive project template allowed values');
  }

  const projectTemplates = await fetchPipedriveAllowedValues<TPipedriveProjectTemplateData>({
    token,
    mapItemToAllowedValue: mapPipedriveProjectTemplate,
    path: '/projectTemplates',
  });

  return projectTemplates;
};
