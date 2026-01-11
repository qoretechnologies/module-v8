import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { MAUTIC_CONN_OPTIONS } from '../constants';
import { mauticClient } from '../client';
import { TMauticSegment } from '../response-types';

const mapMauticSegmentToAllowedValue = (item: TMauticSegment): IQoreAllowedValue<number> => {
  return {
    value: item.id,
    display_name: item.name,
    desc: item.description || `Segment ID: ${item.id}`,
  };
};

export const getMauticSegmentsAllowedValues: TQoreGetAllowedValuesFunction<
  typeof MAUTIC_CONN_OPTIONS,
  number
> = async (context) => {
  const { instance_url, username, password } = getQoreContextRequiredValues({
    context,
    connectionFields: ['instance_url', 'username', 'password'],
  });

  return await mauticClient.fetchAllowedValues<TMauticSegment>({
    path: 'segments',
    connectionOptions: { instance_url, username, password },
    itemsPath: 'lists',
    mapItemToAllowedValue: mapMauticSegmentToAllowedValue,
  });
};
