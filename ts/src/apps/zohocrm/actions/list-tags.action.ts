import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ZOHO_CRM_APP_NAME, ZohoCrmError } from '../constants';
import { zohoCrmApiClient } from '../helpers/constants';
import { extractZohoCrmErrorMessage } from '../helpers/extract-error';
import { getZohoCRMModuleApiNameAllowedValues } from '../helpers/get-module-allowed-values';

const action = 'list_tags';

const options = {
  module: {
    type: 'string',
    required: true,
    get_allowed_values: getZohoCRMModuleApiNameAllowedValues,
  },
  my_tags: {
    type: 'boolean',
    required: false,
  },
} satisfies TQoreOptions;

type TListTagsResponse = Array<{
  id: string;
  [key: string]: any;
}>;

const ListTags = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ZOHO_CRM_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, url, module } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['url', 'token'],
      optionFields: ['module'],
      ErrorClass: ZohoCrmError,
    });

    const my_tags = String(obj?.my_tags ?? false);

    try {
      const response = await zohoCrmApiClient<TListTagsResponse>({
        path: `settings/tags`,
        method: 'GET',
        token,
        url,
        object: 'tags',
        params: {
          module,
          my_tags,
        },
      });

      return response;
    } catch (error) {
      if (error instanceof ZohoCrmError) {
        throw error;
      }

      throw new ZohoCrmError(
        `Failed to ${humanizeNameTitle(action)}: ${extractZohoCrmErrorMessage(error)}`
      );
    }
  },
  response_type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        created_time: { type: 'string' },
        modified_time: { type: 'string' },
        name: { type: 'string' },
        modified_by: {
          type: {
            type: 'hash',
            fields: {
              name: { type: 'string' },
              id: { type: 'string' },
            },
          },
        },
        id: { type: 'string' },
        created_by: {
          type: {
            type: 'hash',
            fields: {
              name: { type: 'string' },
              id: { type: 'string' },
            },
          },
        },
        color_code: { type: 'string' },
      },
    },
  },
});

export default ListTags;
