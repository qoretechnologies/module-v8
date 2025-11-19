import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { PipedriveError } from '../constants';
import { fetchPipedriveAllowedValues } from './client';

type TPipedriveStageData = {
  id: string;
  name: string;
  deal_probability?: number;
  days_to_rotten?: number;
};

const mapPipedriveStage = (stage: TPipedriveStageData): IQoreAllowedValue<string> => ({
  display_name: stage.name,
  value: stage.id,
  desc: `Probability: ${stage.deal_probability || 'Unknown'}\n Days to Rotten: ${stage.days_to_rotten || 'Unknown'}`,
});

export const getPipedriveStageIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: PipedriveError,
  });

  const pipelines = await fetchPipedriveAllowedValues<TPipedriveStageData>({
    token,
    mapItemToAllowedValue: mapPipedriveStage,
    path: '/api/v2/stages',
  });

  return pipelines;
};
