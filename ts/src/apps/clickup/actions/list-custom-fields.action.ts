import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CLICKUP_APP_NAME, ClickUpError } from '../constants';
import { fetchClickUpData } from '../helpers/constants';
import { getClickUpWorkspaceIdAllowedValues } from '../helpers/get-workspace-id-allowed-values';

const options = {
  workspace: {
    type: 'string',
    required: true,
    preselected: true,
    get_allowed_values: getClickUpWorkspaceIdAllowedValues,
  },
} satisfies TQoreOptions;

const listCustomFields = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CLICKUP_APP_NAME,
  action: 'list_custom_fields',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, workspace } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['workspace'],
      ErrorClass: ClickUpError,
    });

    try {
      return await fetchClickUpData({
        token,
        version: 'v2',
        path: `team/${workspace}/field`,
      });
    } catch (error) {
      throw new ClickUpError(`Failed to list custom fields: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      fields: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string' },
              type_config: { type: 'hash' },
              date_created: { type: 'string' },
              hide_from_guests: { type: 'boolean' },
              required: { type: 'boolean' },
            },
          },
        },
      },
      next_cursor: { type: 'string' },
    },
  },
});

export default listCustomFields;
