import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ZOHO_CRM_APP_NAME, ZohoCrmError } from '../constants';
import { zohoCrmApiClient } from '../helpers/constants';
import { extractZohoCrmErrorMessage } from '../helpers/extract-error';

const action = 'list_users';

const options = {
  per_page: {
    type: 'integer',
    required: false,
    preselected: true,
    default_value: 20,
  },
  page: {
    type: 'integer',
    required: false,
  },
  type: {
    type: 'string',
    required: false,
    allowed_values: [
      {
        value: 'AllUsers',
        display_name: 'All Users',
        short_desc: 'Retrieves all users (both active and inactive).',
      },
      {
        value: 'ActiveUsers',
        display_name: 'Active Users',
        short_desc: 'Retrieves only active users.',
      },
      {
        value: 'DeactiveUsers',
        display_name: 'Deactive Users',
        short_desc: 'Retrieves users who have been deactivated.',
      },
      {
        value: 'ConfirmedUsers',
        display_name: 'Confirmed Users',
        short_desc: 'Retrieves users who have confirmed their accounts.',
      },
      {
        value: 'NotConfirmedUsers',
        display_name: 'Not Confirmed Users',
        short_desc: 'Retrieves users who have not confirmed their accounts.',
      },
      {
        value: 'DeletedUsers',
        display_name: 'Deleted Users',
        short_desc: 'Retrieves users who have been deleted.',
      },
      {
        value: 'ActiveConfirmedUsers',
        display_name: 'Active Confirmed Users',
        short_desc: 'Retrieves users who are both active and confirmed.',
      },
      {
        value: 'AdminUsers',
        display_name: 'Admin Users',
        short_desc: 'Retrieves users with Administrator privileges.',
      },
      {
        value: 'ActiveConfirmedAdmins',
        display_name: 'Active Confirmed Admins',
        short_desc: 'Retrieves active and confirmed administrators.',
      },
      {
        value: 'CurrentUser',
        display_name: 'Current User',
        short_desc: 'Retrieves the currently logged-in CRM user.',
      },
    ],
  },
} satisfies TQoreOptions;

type TListUsersResponse = Array<{
  id: string;
  [key: string]: any;
}>;

const ListUsers = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const per_page = String(Math.min(200, obj?.per_page || 20));
    const page = String(obj?.page || 1);

    try {
      const response = await zohoCrmApiClient<TListUsersResponse>({
        path: `users`,
        method: 'GET',
        token,
        url,
        object: 'users',
        params: {
          per_page,
          page,
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
        country: { type: 'string' },
        name_format__s: { type: 'string' },
        language: { type: 'string' },
        microsoft: { type: 'boolean' },
        $shift_effective_from: { type: 'any' },
        id: { type: 'string' },
        state: { type: 'string' },
        fax: { type: 'any' },
        country_locale: { type: 'string' },
        sandboxDeveloper: { type: 'boolean' },
        zip: { type: 'any' },
        decimal_separator: { type: 'string' },
        created_time: { type: 'string' },
        time_format: { type: 'string' },
        offset: { type: 'integer' },
        profile: {
          type: {
            type: 'hash',
            fields: {
              name: { type: 'string' },
              id: { type: 'string' },
            },
          },
        },
        created_by: {
          type: {
            type: 'hash',
            fields: {
              name: { type: 'string' },
              id: { type: 'string' },
            },
          },
        },
        zuid: { type: 'string' },
        full_name: { type: 'string' },
        phone: { type: 'string' },
        dob: { type: 'string' },
        sort_order_preference__s: { type: 'string' },
        status: { type: 'string' },
        type__s: { type: 'string' },
        role: {
          type: {
            type: 'hash',
            fields: {
              name: { type: 'string' },
              id: { type: 'string' },
            },
          },
        },
        customize_info: {
          type: {
            type: 'hash',
            fields: {
              notes_desc: { type: 'any' },
              show_right_panel: { type: 'any' },
              bc_view: { type: 'any' },
              show_home: { type: 'boolean' },
              show_detail_view: { type: 'boolean' },
              show_left_panel: { type: 'boolean' },
              unpin_recent_item: { type: 'any' },
            },
          },
        },
        city: { type: 'any' },
        signature: { type: 'any' },
        locale: { type: 'string' },
        personal_account: { type: 'boolean' },
        Isonline: { type: 'boolean' },
        default_tab_group: { type: 'string' },
        Modified_By: {
          type: {
            type: 'hash',
            fields: {
              name: { type: 'string' },
              id: { type: 'string' },
            },
          },
        },
        street: { type: 'any' },
        $current_shift: { type: 'any' },
        alias: { type: 'any' },
        theme: {
          type: {
            type: 'hash',
            fields: {
              normal_tab: {
                type: {
                  type: 'hash',
                  fields: {
                    font_color: { type: 'string' },
                    background: { type: 'string' },
                  },
                },
              },
              selected_tab: {
                type: {
                  type: 'hash',
                  fields: {
                    font_color: { type: 'string' },
                    background: { type: 'string' },
                  },
                },
              },
              new_background: { type: 'any' },
              background: { type: 'string' },
              screen: { type: 'string' },
              type: { type: 'string' },
            },
          },
        },
        first_name: { type: 'string' },
        email: { type: 'string' },
        status_reason__s: { type: 'any' },
        website: { type: 'any' },
        Modified_Time: { type: 'string' },
        $next_shift: { type: 'any' },
        mobile: { type: 'any' },
        last_name: { type: 'string' },
        time_zone: { type: 'string' },
        number_separator: { type: 'string' },
        confirm: { type: 'boolean' },
        date_format: { type: 'string' },
      },
    },
  },
});

export default ListUsers;
