import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { BROWSE_AI_CONN_OPTIONS } from '../constants';
import { browseAiApiClient } from './constants';
type BrowseAiItem = {
  id: string;
  name: string;
};

const mapBrowseAiItemToAllowedValue = (item: BrowseAiItem): IQoreAllowedValue<string> => {
  return {
    value: item.id,
    display_name: item.name,
  };
};

export const getBrowseAiRobotIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof BROWSE_AI_CONN_OPTIONS,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
  });

  const items = await browseAiApiClient<BrowseAiItem[]>({
    token,
    path: 'robots',
    object: 'robots.items',
  });

  return items.map(mapBrowseAiItemToAllowedValue);
};
