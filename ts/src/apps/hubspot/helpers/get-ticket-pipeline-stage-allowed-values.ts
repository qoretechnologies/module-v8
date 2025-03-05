import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getHubspotPipelineStageAllowedValues } from './constants';

type THubspotTicketPipelineStage = {
  label: string;
  id: string;
  metadata: {
    ticketState: string;
    isClosed: boolean;
  };
};

const mapHubspotTicketPipelineStage = (
  stage: THubspotTicketPipelineStage
): IQoreAllowedValue<string> => ({
  display_name: stage.label,
  value: stage.id,
  desc: `Ticket state: ${stage.metadata.ticketState}\n\nIs closed: ${stage.metadata.isClosed}`,
});

export const getHubspotTicketPipelineStageAllowedValues: TQoreGetAllowedValuesFunction<
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
      `The following values are required to get Hubspot ticket stage allowed values: ${missingValues.join(', ')}`
    );
  }

  return await getHubspotPipelineStageAllowedValues(
    token!,
    'tickets',
    hs_pipeline,
    mapHubspotTicketPipelineStage
  );
};
