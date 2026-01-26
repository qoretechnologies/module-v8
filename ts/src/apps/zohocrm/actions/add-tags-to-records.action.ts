import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ZOHO_CRM_APP_NAME, ZohoCrmError } from '../constants';
import { zohoCrmApiClient } from '../helpers/constants';
import { extractZohoCrmErrorMessage } from '../helpers/extract-error';
import { getZohoCRMModuleApiNameAllowedValues } from '../helpers/get-module-allowed-values';
import { getZohoCrmRecordIdAllowedValues } from '../helpers/get-record-id-allowed-values';
import { getZohoCRMTagsAllowedValues } from '../helpers/get-tag-allowed-values';

const action = 'add_tags_to_records';

const options = {
  module: {
    type: 'string',
    required: true,
    get_allowed_values: getZohoCRMModuleApiNameAllowedValues,
    on_change: ['refetch'],
  },
  tags: {
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          id: {
            type: 'string',
            get_allowed_values: getZohoCRMTagsAllowedValues,
            preselected: true,
            required_groups: ['tags'],
          },
          name: { type: 'string', preselected: true, required_groups: ['tags'] },
          color_code: { type: 'string' },
        },
      },
    },
    required: true,
  },
  records: {
    type: {
      type: 'list',
      element_type: { type: 'string' },
    },
    element_allowed_values_creatable: true,
    get_element_allowed_values: getZohoCrmRecordIdAllowedValues,
    depends_on: ['module'],
    required: true,
  },
  over_write: {
    type: 'bool',
    required: false,
  },
} satisfies TQoreOptions;

type TAddTagsResponse = {
  success_count: string;
  locked_count: string;
};

const AddTagsToRecords = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ZOHO_CRM_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, url, module, tags, records } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['url', 'token'],
      optionFields: ['module', 'tags', 'records'],
      ErrorClass: ZohoCrmError,
    });

    const over_write = String(obj?.over_write ?? false);

    try {
      const response = await zohoCrmApiClient<TAddTagsResponse>({
        path: `${module}/actions/add_tags`,
        method: 'POST',
        token,
        url,
        body: {
          tags,
          ids: records,
          over_write,
        },
      });

      return {
        success_count: response?.success_count || '0',
        locked_count: response?.locked_count || '0',
      };
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
    type: 'hash',
    fields: {
      success_count: { type: 'string' },
      locked_count: { type: 'string' },
    },
  },
});

export default AddTagsToRecords;
