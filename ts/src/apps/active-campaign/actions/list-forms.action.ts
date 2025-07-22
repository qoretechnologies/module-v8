import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_APP_NAME, ActiveCampaignError } from '../constants';
import { activeCampaignApiClient } from '../helpers/constants';

const action = 'list_forms';

const options = {
  limit: {
    type: 'number',
    required: false,
    default_value: 20,
  },
  offset: {
    type: 'number',
    required: false,
  },
} satisfies TQoreOptions;

const listForms = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ACTIVE_CAMPAIGN_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, instance_url } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'instance_url'],
      ErrorClass: ActiveCampaignError,
    });

    const { limit = 20, offset = 0 } = obj || {};

    try {
      const response = await activeCampaignApiClient({
        token,
        url: instance_url,
        method: 'GET',
        params: {
          limit: limit.toString(),
          offset: offset.toString(),
        },
        path: `forms`,
      });

      return response;
    } catch (error) {
      throw new ActiveCampaignError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      forms: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              name: { type: 'string' },
              action: { type: 'string' },
              actiondata: {
                type: {
                  type: 'hash',
                  fields: {
                    actions: {
                      type: {
                        type: 'list',
                        element_type: {
                          type: 'hash',
                          fields: {
                            type: { type: 'string' },
                            email: { type: 'string' },
                            list: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
              submit: { type: 'string' },
              submitdata: {
                type: {
                  type: 'hash',
                  fields: {
                    url: { type: 'string' },
                  },
                },
              },
              url: { type: 'string' },
              layout: { type: 'string' },
              title: { type: 'string' },
              body: { type: 'string' },
              button: { type: 'string' },
              thanks: { type: 'string' },
              style: {
                type: {
                  type: 'hash',
                  fields: {
                    background: { type: 'string' },
                    dark: { type: 'boolean' },
                    fontcolor: { type: 'string' },
                    layout: { type: 'string' },
                    border: {
                      type: {
                        type: 'hash',
                        fields: {
                          width: { type: 'number' },
                          style: { type: 'string' },
                          color: { type: 'string' },
                          radius: { type: 'number' },
                        },
                      },
                    },
                    width: { type: 'number' },
                    ac_branding: { type: 'boolean' },
                    button: {
                      type: {
                        type: 'hash',
                        fields: {
                          padding: { type: 'number' },
                          background: { type: 'string' },
                          fontcolor: { type: 'string' },
                          border: {
                            type: {
                              type: 'hash',
                              fields: {
                                radius: { type: 'number' },
                                color: { type: 'string' },
                                style: { type: 'string' },
                                width: { type: 'number' },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              options: {
                type: {
                  type: 'hash',
                  fields: {
                    blanks_overwrite: { type: 'boolean' },
                    confaction: { type: 'string' },
                    sendoptin: { type: 'boolean' },
                    optin_id: { type: 'number' },
                    optin_created: { type: 'boolean' },
                    confform: { type: 'string' },
                  },
                },
              },
              cfields: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      type: { type: 'string' },
                      header: { type: 'string' },
                      class: { type: 'string' },
                      html: { type: 'string' },
                      default_text: { type: 'string' },
                      required: { type: 'boolean' },
                    },
                  },
                },
              },
              parentformid: { type: 'string' },
              userid: { type: 'string' },
              addressid: { type: 'string' },
              cdate: { type: 'string' },
              udate: { type: 'string' },
              entries: { type: 'string' },
              aid: { type: 'string' },
              defaultscreenshot: { type: 'string' },
              recent: {
                type: {
                  type: 'list',
                  element_type: { type: 'hash' },
                },
              },
              contacts: { type: 'number' },
              deals: { type: 'number' },
              links: {
                type: {
                  type: 'hash',
                  fields: {
                    address: { type: 'string' },
                  },
                },
              },
              id: { type: 'string' },
              address: { type: 'string' },
            },
          },
        },
      },
      meta: {
        type: {
          type: 'hash',
          fields: {
            total: { type: 'string' },
          },
        },
      },
    },
  },
});

export default listForms;
