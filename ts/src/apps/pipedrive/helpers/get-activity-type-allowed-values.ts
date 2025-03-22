import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchPipedriveAllowedValues } from './constants';

type TPipedriveActivityTypeData = {
  id: string;
  name: string;
  icon_key?: string;
  is_custom_flag?: boolean;
  color?: string;
};

const mapPipedriveActivityType = (
  activityType: TPipedriveActivityTypeData
): IQoreAllowedValue<string> => ({
  display_name: activityType.name,
  value: activityType.id,
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
    path: '/activityTypes',
  });

  return activityTypes;
};
