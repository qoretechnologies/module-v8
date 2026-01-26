import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CopperCrmError } from '../constants';
import { fetchCopperCrmAllowedValues } from './constants';

type CopperCrmPipeline = {
  id: number;
  name: string;
  stages?: Array<{
    id: number;
    name: string;
    win_probability?: number;
  }>;
};

const mapPipelineToAllowedValue = (pipeline: CopperCrmPipeline): IQoreAllowedValue<number> => {
  const descParts = [];

  if (pipeline.stages && pipeline.stages.length > 0) {
    descParts.push(`Stages: ${pipeline.stages.length}`);
    const stageNames = pipeline.stages.map((s) => s.name).join(', ');
    descParts.push(`Pipeline: ${stageNames}`);
  }

  return {
    value: pipeline.id,
    display_name: pipeline.name,
    ...(descParts.length > 0 && { desc: descParts.join('\n') }),
  };
};

export const getCopperCrmPipelineAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context) => {
  try {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: CopperCrmError,
    });

    return await fetchCopperCrmAllowedValues({
      token,
      method: 'GET',
      mapItemToAllowedValue: mapPipelineToAllowedValue,
      path: 'pipelines',
    });
  } catch (error) {
    if (error instanceof CopperCrmError) {
      throw error;
    }

    throw new CopperCrmError(`Failed to fetch CopperCRM pipeline allowed values: ${error}`);
  }
};
