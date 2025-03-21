import { TQoreGetDefaultValueFunction } from '@qoretechnologies/ts-toolkit';
import { SERENITY_CONN_OPTIONS } from '../constants';
import { Debugger } from '../../../utils/Debugger';
import { getSerenityAgentParamsAllowedValues } from './get-agent-params-allowed-values';

type TSerenityAgentExecutionParamsDefaultValue = Array<{ key: string; value: string }>;

export const getSerenityExecuteAgentParamsDefaultValue: TQoreGetDefaultValueFunction<
  typeof SERENITY_CONN_OPTIONS,
  TSerenityAgentExecutionParamsDefaultValue
> = async (context): Promise<TSerenityAgentExecutionParamsDefaultValue> => {
  const token = context?.conn_opts?.token;
  const agentCode = context?.opts?.agentCode;

  const missingValues: string[] = [];

  if (!token) missingValues.push('token');
  if (!agentCode) missingValues.push('agentCode');

  if (missingValues.length > 0) {
    throw new Error(
      `The following values are required: [ ${missingValues.join(', ')} ] to get the agent params default values`
    );
  }

  try {
    const paramsAllowedValues = await getSerenityAgentParamsAllowedValues(context);

    return paramsAllowedValues.map((param) => ({
      key: param.value,
      value: '',
    }));
  } catch (error) {
    Debugger.log('Failed to get Serenity agent params default values', error);

    return [];
  }
};
