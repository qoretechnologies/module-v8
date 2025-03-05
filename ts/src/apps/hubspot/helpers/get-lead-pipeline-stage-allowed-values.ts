import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getHubspotPipelineStageAllowedValues } from './constants';

type THubspotLeadPipelineStage = {
  label: string;
  id: string;
};

const mapHubspotLeadPipelineStage = (
  stage: THubspotLeadPipelineStage
): IQoreAllowedValue<string> => ({
  display_name: stage.label,
  value: stage.id,
  desc: `Lead: ${stage.label} - ${stage.id}`,
});

export const getHubspotLeadPipelineStageAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const hs_pipeline = context?.opts?.hs_pipeline;

  const missingValues: string[] = [];

  if (!token) missingValues.push('token');
  if (!hs_pipeline) missingValues.push('hs_pipeline');

  if (missingValues.length) {
    throw new Error(
      `The following values are required to get Hubspot lead stage allowed values: ${missingValues.join(', ')}`
    );
  }

  return await getHubspotPipelineStageAllowedValues(
    token!,
    'leads',
    hs_pipeline,
    mapHubspotLeadPipelineStage
  );
};
