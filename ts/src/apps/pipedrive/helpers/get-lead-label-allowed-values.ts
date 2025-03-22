import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchPipedriveAllowedValues } from './constants';

type TPipedriveLeadLabelData = {
  id: string;
  name: string;
};

const mapPipedriveLeadLabel = (label: TPipedriveLeadLabelData): IQoreAllowedValue<string> => ({
  display_name: label.name,
  value: label.id,
});

export const getPipedriveLeadLabelIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('The token is required to get Pipedrive lead label allowed values');
  }

  const leadLabels = await fetchPipedriveAllowedValues<TPipedriveLeadLabelData>({
    token,
    mapItemToAllowedValue: mapPipedriveLeadLabel,
    path: '/leadLabels',
  });

  return leadLabels;
};
