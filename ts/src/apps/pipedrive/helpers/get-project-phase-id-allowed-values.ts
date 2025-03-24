import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchPipedriveAllowedValues } from './constants';

type TPipedriveProjectPhaseData = {
  id: string;
  name: string;
};

const mapPipedriveProjectPhase = (
  phase: TPipedriveProjectPhaseData
): IQoreAllowedValue<string> => ({
  display_name: phase.name,
  value: phase.id,
});

export const getPipedriveProjectPhaseIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const board_id = context?.opts?.board_id;

  const missing_values: string[] = [];

  if (!token) {
    missing_values.push('token');
  }

  if (!board_id) {
    missing_values.push('board_id');
  }

  if (missing_values.length > 0) {
    throw new Error(
      `The following values are required to get Pipedrive project phase allowed values: ${missing_values.join(', ')}`
    );
  }

  const projectPhases = await fetchPipedriveAllowedValues<TPipedriveProjectPhaseData>({
    token: token!,
    mapItemToAllowedValue: mapPipedriveProjectPhase,
    path: '/projects/phases',
    params: {
      board_id,
    },
  });

  return projectPhases;
};
