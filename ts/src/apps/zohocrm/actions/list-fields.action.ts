import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ZOHO_CRM_APP_NAME, ZohoCrmError } from '../constants';
import { zohoCrmApiClient } from '../helpers/constants';
import { extractZohoCrmErrorMessage } from '../helpers/extract-error';
import { getZohoCRMModuleApiNameAllowedValues } from '../helpers/get-module-allowed-values';

const action = 'list_fields';

const options = {
  module: {
    type: 'string',
    required: true,
    get_allowed_values: getZohoCRMModuleApiNameAllowedValues,
  },
} satisfies TQoreOptions;

const ListFields = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ZOHO_CRM_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, module, url } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['url', 'token'],
      optionFields: ['module'],
      ErrorClass: ZohoCrmError,
    });

    try {
      const response = await zohoCrmApiClient<Array<Record<string, any>>>({
        path: `settings/fields`,
        method: 'GET',
        token,
        params: { module },
        url,
        object: 'fields',
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
        associated_module: {
          type: {
            type: 'hash',
            fields: {
              module: { type: 'string' },
              id: { type: 'string' },
            },
          },
        },
        webhook: { type: 'bool' },
        operation_type: {
          type: {
            type: 'hash',
            fields: {
              web_update: { type: 'bool' },
              api_create: { type: 'bool' },
              web_create: { type: 'bool' },
              api_update: { type: 'bool' },
            },
          },
        },
        colour_code_enabled_by_system: { type: 'bool' },
        field_label: { type: 'string' },
        tooltip: { type: 'string' },
        textarea: {
          type: {
            type: 'hash',
            fields: {
              type: { type: 'string' },
            },
          },
        },
        type: { type: 'string' },
        field_read_only: { type: 'bool' },
        customizable_properties: {
          type: {
            type: 'list',
            element_type: 'string',
          },
        },
        display_label: { type: 'string' },
        read_only: { type: 'bool' },
        businesscard_supported: { type: 'bool' },
        multi_module_lookup: {
          type: {
            type: 'hash',
            fields: {},
          },
        },
        id: { type: 'string' },
        created_time: { type: 'string' },
        filterable: { type: 'bool' },
        visible: { type: 'bool' },
        profiles: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                permission_type: { type: 'string' },
                name: { type: 'string' },
                id: { type: 'string' },
              },
            },
          },
        },
        view_type: {
          type: {
            type: 'hash',
            fields: {
              view: { type: 'bool' },
              edit: { type: 'bool' },
              quick_create: { type: 'bool' },
              create: { type: 'bool' },
            },
          },
        },
        separator: { type: 'bool' },
        searchable: { type: 'bool' },
        history_tracking_enabled: { type: 'bool' },
        api_name: { type: 'string' },
        unique: {
          type: {
            type: 'hash',
            fields: {
              case_sensitive: { type: 'bool' },
            },
          },
        },
        enable_colour_code: { type: 'bool' },
        pick_list_values: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                display_value: { type: 'string' },
                sequence_number: { type: 'integer' },
                reference_value: { type: 'string' },
                colour_code: { type: 'string' },
                actual_value: { type: 'string' },
                id: { type: 'string' },
                type: { type: 'string' },
              },
            },
          },
        },
        system_mandatory: { type: 'bool' },
        virtual_field: { type: 'bool' },
        json_type: { type: 'string' },
        created_source: { type: 'string' },
        display_type: { type: 'integer' },
        ui_type: { type: 'integer' },
        modified_time: { type: 'string' },
        quick_sequence_number: { type: 'string' },
        email_parser: {
          type: {
            type: 'hash',
            fields: {
              fields_update_supported: { type: 'bool' },
              record_operations_supported: { type: 'bool' },
            },
          },
        },
        currency: {
          type: {
            type: 'hash',
            fields: {
              rounding_option: { type: 'string' },
              precision: { type: 'integer' },
            },
          },
        },
        custom_field: { type: 'bool' },
        lookup: {
          type: {
            type: 'hash',
            fields: {
              display_label: { type: 'string' },
              revalidate_filter_during_edit: { type: 'bool' },
              api_name: { type: 'string' },
              module: {
                type: {
                  type: 'hash',
                  fields: {
                    api_name: { type: 'string' },
                    crypt: { type: 'bool' },
                    id: { type: 'string' },
                  },
                },
              },
              id: { type: 'string' },
              query_details: {
                type: {
                  type: 'hash',
                },
              },
            },
          },
        },
        hipaa_compliance: {
          type: {
            type: 'hash',
            fields: {
              restricted_in_export: { type: 'bool' },
              restricted: { type: 'bool' },
            },
          },
        },
        convert_mapping: {
          type: {
            type: 'hash',
            fields: {
              Contacts: { type: 'string' },
              Deals: { type: 'string' },
              Accounts: { type: 'string' },
            },
          },
        },
        rollup_summary: {
          type: {
            type: 'hash',
            fields: {},
          },
        },
        length: { type: 'integer' },
        display_field: { type: 'bool' },
        pick_list_values_sorted_lexically: { type: 'bool' },
        sortable: { type: 'bool' },
        layout_associations: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                api_name: { type: 'string' },
                name: { type: 'string' },
                id: { type: 'string' },
              },
            },
          },
        },
        global_picklist: {
          type: {
            type: 'hash',
            fields: {
              api_name: { type: 'string' },
              id: { type: 'string' },
            },
          },
        },
        history_tracking: {
          type: {
            type: 'hash',
            fields: {
              related_list_name: { type: 'string' },
              module: {
                type: {
                  type: 'hash',
                  fields: {
                    api_name: { type: 'string' },
                    id: { type: 'string' },
                  },
                },
              },
              duration_configured_field: {
                type: {
                  type: 'hash',
                  fields: {
                    api_name: { type: 'string' },
                    id: { type: 'string' },
                  },
                },
              },
              duration_configuration: { type: 'string' },
              followed_fields: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      api_name: { type: 'string' },
                      id: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
        data_type: { type: 'string' },
        formula: {
          type: {
            type: 'hash',
            fields: {},
          },
        },
        hipaa_compliance_enabled: { type: 'bool' },
        decimal_place: { type: 'integer' },
        mass_update: { type: 'bool' },
        blueprint_supported: { type: 'bool' },
        multiselectlookup: {
          type: {
            type: 'hash',
            fields: {
              linking_details: {
                type: {
                  type: 'hash',
                  fields: {
                    module: {
                      type: {
                        type: 'hash',
                        fields: {
                          visibility: { type: 'integer' },
                          plural_label: { type: 'string' },
                          api_name: { type: 'string' },
                          id: { type: 'string' },
                        },
                      },
                    },
                    lookup_field: {
                      type: {
                        type: 'hash',
                        fields: {
                          api_name: { type: 'string' },
                          field_label: { type: 'string' },
                          id: { type: 'string' },
                        },
                      },
                    },
                    connected_lookup_field: {
                      type: {
                        type: 'hash',
                        fields: {
                          api_name: { type: 'string' },
                          field_label: { type: 'string' },
                          id: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
              connected_details: {
                type: {
                  type: 'hash',
                  fields: {
                    field: {
                      type: {
                        type: 'hash',
                        fields: {
                          api_name: { type: 'string' },
                          field_label: { type: 'string' },
                          id: { type: 'string' },
                        },
                      },
                    },
                    module: {
                      type: {
                        type: 'hash',
                        fields: {
                          plural_label: { type: 'string' },
                          api_name: { type: 'string' },
                          id: { type: 'string' },
                        },
                      },
                    },
                    layouts: {
                      type: {
                        type: 'list',
                        element_type: {
                          type: 'hash',
                          fields: {
                            api_name: { type: 'string' },
                            id: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
              related_list: {
                type: {
                  type: 'hash',
                  fields: {
                    display_label: { type: 'string' },
                    api_name: { type: 'string' },
                    id: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        auto_number: {
          type: {
            type: 'hash',
          },
        },
      },
    },
  },
});

export default ListFields;
