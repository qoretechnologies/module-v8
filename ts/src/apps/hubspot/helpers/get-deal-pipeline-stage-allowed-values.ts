import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getHubspotPipelineStageAllowedValues } from './constants';

type THubspotDealPipelineStage = {
  label: string;
  id: string;
  metadata: {
    probability: number;
    isClosed: boolean;
  };
};

const mapHubspotTicketPipelineStage = (
  stage: THubspotDealPipelineStage
): IQoreAllowedValue<string> => ({
  display_name: stage.label,
  value: stage.id,
  desc: `Probability: ${stage.metadata.probability}\n\nIs closed: ${stage.metadata.isClosed}`,
});

export const getHubspotDealPipelineStageAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const pipeline = context?.opts?.pipeline;

  const missingValues: string[] = [];

  if (!token) missingValues.push('token');
  if (!pipeline) missingValues.push('pipeline');

  if (missingValues.length) {
    console.error(
      `The following values are required to get Hubspot ticket stage allowed values: ${missingValues.join(', ')}`
    );

    return [];
  }

  return await getHubspotPipelineStageAllowedValues(
    token!,
    'deals',
    pipeline,
    mapHubspotTicketPipelineStage
  );
};
