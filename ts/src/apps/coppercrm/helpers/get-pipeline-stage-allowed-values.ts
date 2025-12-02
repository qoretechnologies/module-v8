import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CopperCrmError } from '../constants';
import { fetchCopperCrmAllowedValues } from './constants';

type CopperCrmPipelineStage = {
  id: number;
  name: string;
  win_probability?: number;
};

const mapPipelineStageToAllowedValue = (
  stage: CopperCrmPipelineStage
): IQoreAllowedValue<number> => {
  return {
    value: stage.id,
    display_name: stage.name,
  };
};

export const getCopperCrmPipelineStageAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context) => {
  try {
    const { token, pipeline_id } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['pipeline_id'],
      ErrorClass: CopperCrmError,
    });

    return await fetchCopperCrmAllowedValues({
      token,
      
      method: 'GET',
      mapItemToAllowedValue: mapPipelineStageToAllowedValue,
      path: `pipeline_stages/pipeline/${pipeline_id}`,
    });
  } catch (error) {
    if (error instanceof CopperCrmError) {
      throw error;
    }

    throw new CopperCrmError(`Failed to fetch CopperCRM pipeline stage allowed values: ${error}`);
  }
};
