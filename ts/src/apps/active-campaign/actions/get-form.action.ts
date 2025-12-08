import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_APP_NAME, ActiveCampaignError } from '../constants';
import { activeCampaignApiClient } from '../helpers/constants';
import { getActiveCampaignFormAllowedValues } from '../helpers/get-form-id-allowed-values';

const action = 'get_form';

const options = {
  id: {
    type: 'string',
    required: true,
    get_allowed_values: getActiveCampaignFormAllowedValues,
  },
} satisfies TQoreOptions;

const getForm = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ACTIVE_CAMPAIGN_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, instance_url, id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'instance_url'],
      optionFields: ['id'],
      ErrorClass: ActiveCampaignError,
    });

    try {
      const response = await activeCampaignApiClient<{
        form: Record<string, any>;
      }>({
        token,
        url: instance_url,
        method: 'GET',
        path: `forms/${id}`,
      });

      return response.form;
    } catch (error) {
      throw new ActiveCampaignError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
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
                    fromname: { type: 'string' },
                    fromemail: { type: 'string' },
                    subject: { type: 'string' },
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
            dark: { type: 'bool' },
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
            ac_branding: { type: 'bool' },
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
            customcss: { type: 'string' },
          },
        },
      },
      options: {
        type: {
          type: 'hash',
          fields: {
            blanks_overwrite: { type: 'bool' },
            confaction: { type: 'string' },
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
              required_options: { type: 'hash' },
              html: { type: 'string' },
              default_text: { type: 'string' },
              required: { type: 'bool' },
              id: { type: 'string' },
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
});

export default getForm;
