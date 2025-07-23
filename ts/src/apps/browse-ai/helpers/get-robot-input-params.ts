import { TQoreAnyType, TQoreOptions, TQoreType } from '@qoretechnologies/ts-toolkit';
import { BrowseAiError } from '../constants';
import { browseAiApiClient } from './constants';

type TBrowseAiInputParameter = {
  type: string;
  name: string;
  label: string;
  required: boolean;
  encrypted: boolean;
  defaultValue: string;
};

type TBrowseAiInputParametersOptions = {
  token: string;
  robotId: string;
};

export const BrowseAiToQoreTypeMap: Record<string, TQoreType> = {
  select: {
    type: 'list',
    element_type: 'string',
  },
  url: {
    type: 'string',
  },
  number: {
    type: 'number',
  },
} as const;

export const getRobotInputParams = async (
  options: TBrowseAiInputParametersOptions
): Promise<TBrowseAiInputParameter[]> => {
  const { token, robotId } = options;

  return await browseAiApiClient({
    token,
    path: `robots/${robotId}`,
    object: 'robot.inputParameters',
  });
};

export const mapBrowseAiInputParameterToQoreOptions = async (
  options: TBrowseAiInputParametersOptions
): Promise<TQoreOptions> => {
  try {
    const inputParams = await getRobotInputParams(options);

    const mappedOptions: TQoreOptions = {};

    inputParams.forEach((param) => {
      const qoreType = (BrowseAiToQoreTypeMap[param.type] || 'string') as TQoreAnyType;

      mappedOptions[param.name] = {
        display_name: param.label,
        type: qoreType,
        required: param.required,
        ...(param.defaultValue &&
          !param.encrypted && {
            default_value: param.defaultValue,
          }),
      };
    });

    return mappedOptions;
  } catch (error) {
    throw new BrowseAiError(`Failed to map Browse AI input parameters: ${error}`);
  }
};
