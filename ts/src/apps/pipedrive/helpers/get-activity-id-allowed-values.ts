import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchPipedriveAllowedValues } from './client';

type TPipedriveActivityData = {
  id: string;
  subject: string;
  done: boolean;
};

const mapPipedriveActivity = (activity: TPipedriveActivityData): IQoreAllowedValue<string> => ({
  display_name: activity.subject,
  value: activity.id,
  desc: `Done: ${activity.done}`,
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
