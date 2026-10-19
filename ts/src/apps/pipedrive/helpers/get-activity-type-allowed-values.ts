import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchPipedriveAllowedValues } from './client';

export type TPipedriveActivityTypeData = {
  id: string;
  name: string;
  // the value an activity's `type` field carries (`call`, `meeting`, ...); the activities API
  // takes this key, not the numeric id (`POST /api/v2/activities` rejects an id with
  // "Validation failed: type: Please provide a valid type")
  key_string: string;
  icon_key?: string;
  is_custom_flag?: boolean;
  color?: string;
};

export const mapPipedriveActivityType = (
  activityType: TPipedriveActivityTypeData
): IQoreAllowedValue<string> => ({
  display_name: activityType.name,
  value: activityType.key_string,
  short_desc: `${activityType.is_custom_flag ? 'Custom activity' : 'Standard activity'}`,
});

export const getPipedriveActivityTypeAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('The token is required to get Pipedrive activity type allowed values');
  }

  const activityTypes = await fetchPipedriveAllowedValues<TPipedriveActivityTypeData>({
    token,
    mapItemToAllowedValue: mapPipedriveActivityType,
    path: 'v1/activityTypes',
  });

  return activityTypes;
};
