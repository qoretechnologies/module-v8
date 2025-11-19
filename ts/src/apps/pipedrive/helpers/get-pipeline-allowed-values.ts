import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchPipedriveAllowedValues } from './client';

type TPipedrivePipelineData = {
  id: string;
  name: string;
};

const mapPipedrivePipeline = (pipeline: TPipedrivePipelineData): IQoreAllowedValue<string> => ({
  display_name: pipeline.name,
  value: pipeline.id,
});

export const getPipedrivePipelineIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('The token is required to get Pipedrive pipeline allowed values');
  }

  const pipelines = await fetchPipedriveAllowedValues<TPipedrivePipelineData>({
    token,
    mapItemToAllowedValue: mapPipedrivePipeline,
    path: '/pipelines',
  });

  return pipelines;
};
