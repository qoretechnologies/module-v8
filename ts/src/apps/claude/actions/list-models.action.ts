import { ModelInfo } from '@anthropic-ai/sdk/resources/models';
import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { CLAUDE_APP_NAME, ClaudeError } from '../constants';
import { createClaudeClient } from '../helpers/constants';

const action = 'list_models';

const listModels = QoreAppCreator.createLocalizedAction({
  app: CLAUDE_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: ClaudeError,
    });

    const client = createClaudeClient(token);

    try {
      let hasMore = true;
      let models: ModelInfo[] = [];

      while (hasMore) {
        const response = await client.models.list();
        models = models.concat(response.data);
        hasMore = response.has_more;
      }

      return models;
    } catch (error) {
      throw new ClaudeError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        type: { type: 'string' },
        id: { type: 'string' },
        display_name: { type: 'string' },
        created_at: { type: 'string' },
      },
    },
  },
});

export default listModels;
