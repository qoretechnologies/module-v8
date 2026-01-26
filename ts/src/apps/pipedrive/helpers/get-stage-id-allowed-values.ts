import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchPipedriveAllowedValues } from './client';

type TPipedriveStageData = {
  id: string;
  name: string;
  pipeline_id: string;
  pipeline_name?: string;
  order_nr: number;
  deal_probability?: number;
  rotten_flag?: boolean;
  rotten_days?: number;
};

const mapPipedriveStage = (stage: TPipedriveStageData): IQoreAllowedValue<string> => ({
  display_name: stage.name,
  value: stage.id,
  desc:
    `Pipeline: ${stage.pipeline_name || stage.pipeline_id}\n\n` +
    `Order: ${stage.order_nr}\n\n` +
    `${stage.deal_probability !== undefined ? `Probability: ${stage.deal_probability}%\n\n` : ''}` +
    `${stage.rotten_flag ? `Deal becomes rotten after ${stage.rotten_days} days` : ''}`,
});

export const getPipedriveStageIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('The token is required to get Pipedrive stage allowed values');
  }

  const stages = await fetchPipedriveAllowedValues<TPipedriveStageData>({
    token,
    mapItemToAllowedValue: mapPipedriveStage,
    path: '/stages',
  });

  return stages;
};
