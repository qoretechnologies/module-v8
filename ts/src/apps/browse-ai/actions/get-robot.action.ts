import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { BROWSE_AI_APP_NAME, BrowseAiError } from '../constants';
import { browseAiApiClient } from '../helpers/constants';
import { getBrowseAiRobotIdAllowedValues } from '../helpers/get-robot-id-allowed-values';

const action = 'get_robot';

const options = {
  id: {
    type: 'string',
    required: true,
    get_allowed_values: getBrowseAiRobotIdAllowedValues,
  },
} satisfies TQoreOptions;

const getRobot = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BROWSE_AI_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (obj, _opts, context) => {
    const { token, id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['id'],
      ErrorClass: BrowseAiError,
    });

    try {
      const response = await browseAiApiClient({
        token,
        method: 'GET',
        path: `robots/${id}`,
        object: 'robot',
      });

      return response;
    } catch (error) {
      throw new BrowseAiError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      name: { type: 'string' },
      createdAt: { type: 'number' },
      inputParameters: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              name: { type: 'string' },
              type: { type: 'string' },
              label: { type: 'string' },
              required: { type: 'boolean' },
              encrypted: { type: 'boolean' },
              defaultValue: { type: 'string' },
              value: { type: 'string' },
            },
          },
        },
      },
    },
  },
});

export default getRobot;
