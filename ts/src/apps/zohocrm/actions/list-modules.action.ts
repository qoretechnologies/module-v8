import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ZOHO_CRM_APP_NAME, ZohoCrmError } from '../constants';
import { zohoCrmApiClient } from '../helpers/constants';
import { extractZohoCrmErrorMessage } from '../helpers/extract-error';

const action = 'list_modules';

const options = {
  status: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    element_allowed_values: [
      { value: 'user_hidden', display_name: 'User Hidden' },
      { value: 'system_hidden', display_name: 'System Hidden' },
      { value: 'scheduled_for_deletion', display_name: 'Scheduled for Deletion' },
      { value: 'visible', display_name: 'Visible' },
    ],
  },
} satisfies TQoreOptions;

const ListModules = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ZOHO_CRM_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, url } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['url', 'token'],
      ErrorClass: ZohoCrmError,
    });

    const { status } = obj || {};

    try {
      const response = await zohoCrmApiClient<Array<Record<string, any>>>({
        path: `settings/modules`,
        method: 'GET',
        token,
        url,
        object: 'modules',
        params: {
          ...(status && { status: status.join(',') }),
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
        has_more_profiles: { type: 'boolean' },
        access_type: { type: 'string' },
        private_profile: { type: 'any' },
        global_search_supported: { type: 'boolean' },
        deletable: { type: 'boolean' },
        description: { type: 'any' },
        creatable: { type: 'boolean' },
        recycle_bin_on_delete: { type: 'boolean' },
        modified_time: { type: 'any' },
        plural_label: { type: 'string' },
        presence_sub_menu: { type: 'boolean' },
        actual_plural_label: { type: 'string' },
        lookupable: { type: 'boolean' },
        id: { type: 'string' },
        isBlueprintSupported: { type: 'boolean' },
        visibility: { type: 'integer' },
        convertable: { type: 'boolean' },
        sub_menu_available: { type: 'boolean' },
        editable: { type: 'boolean' },
        actual_singular_label: { type: 'string' },
        profiles: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                name: { type: 'string' },
                id: { type: 'string' },
              },
            },
          },
        },
        show_as_tab: { type: 'boolean' },
        web_link: { type: 'any' },
        sequence_number: { type: 'integer' },
        singular_label: { type: 'string' },
        viewable: { type: 'boolean' },
        api_supported: { type: 'boolean' },
        api_name: { type: 'string' },
        quick_create: { type: 'boolean' },
        modified_by: { type: 'any' },
        generated_type: { type: 'string' },
        feeds_required: { type: 'boolean' },
        public_fields_configured: { type: 'boolean' },
        arguments: {
          type: {
            type: 'list',
            element_type: 'any',
          },
        },
        module_name: { type: 'string' },
        profile_count: { type: 'integer' },
        business_card_field_limit: { type: 'integer' },
        parent_module: {
          type: {
            type: 'hash',
            fields: {},
          },
        },
        status: { type: 'string' },
      },
    },
  },
});

export default ListModules;
