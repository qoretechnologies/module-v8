import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchPipedriveAllowedValues } from './constants';

type TPipedriveActivityData = {
  id: string;
  subject: string;
  note: string;
  owner_name: string;
};

const mapPipedriveActivity = (activity: TPipedriveActivityData): IQoreAllowedValue<string> => ({
  display_name: activity.subject,
  value: activity.id,
  desc: `Note: ${activity.note}\n\nOwner: ${activity.owner_name}`,
});

export const getPipedriveActivityIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('The token is required to get Pipedrive activity allowed values');
  }

  const activities = await fetchPipedriveAllowedValues<TPipedriveActivityData>({
    token,
    mapItemToAllowedValue: mapPipedriveActivity,
    path: '/activities',
  });

  return activities;
};
