import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ModelInfo } from '@anthropic-ai/sdk/resources/models';
import { CLAUDE_CONN_OPTIONS } from '../constants';
import { createClaudeClient } from './constants';

const mapClaudeItemToAllowedValue = (item: ModelInfo): IQoreAllowedValue<string> => {
  return {
    value: item.id,
    display_name: item.display_name,
  };
};

export const getClaudeModelAllowedValues: TQoreGetAllowedValuesFunction<
  typeof CLAUDE_CONN_OPTIONS,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
  });

  const client = createClaudeClient(token);
  let hasMore = true;
  let models: ModelInfo[] = [];

  while (hasMore) {
    const response = await client.models.list();
    models = models.concat(response.data);
    hasMore = response.has_more;
  }

  return models.map(mapClaudeItemToAllowedValue);
};
