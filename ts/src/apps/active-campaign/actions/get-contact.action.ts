import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_APP_NAME, ActiveCampaignError } from '../constants';
import { activeCampaignApiClient } from '../helpers/constants';
import { getActiveCampaignContactAllowedValues } from '../helpers/get-contact-id-allowed-values';

const action = 'get_contact';

const options = {
  id: {
    type: 'string',
    required: true,
    get_allowed_values: getActiveCampaignContactAllowedValues,
  },
} satisfies TQoreOptions;

const getContact = QoreAppCreator.createLocalizedAction<typeof options>({
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
      const response = await activeCampaignApiClient({
        token,
        url: instance_url,
        method: 'GET',
        path: `contacts/${id}`,
      });

      return response;
    } catch (error) {
      throw new ActiveCampaignError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      contactAutomations: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              contact: { type: 'string' },
              seriesid: { type: 'string' },
              startid: { type: 'string' },
              status: { type: 'string' },
              adddate: { type: 'string' },
              remdate: { type: 'string' },
              timespan: { type: 'string' },
              lastblock: { type: 'string' },
              lastdate: { type: 'string' },
              completedElements: { type: 'string' },
              totalElements: { type: 'string' },
              completed: { type: 'number' },
              completeValue: { type: 'number' },
              links: {
                type: {
                  type: 'hash',
                  fields: {
                    automation: { type: 'string' },
                    contact: { type: 'string' },
                    contactGoals: { type: 'string' },
                  },
                },
              },
              id: { type: 'string' },
              automation: { type: 'string' },
            },
          },
        },
      },
      contactLists: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              contact: { type: 'string' },
              list: { type: 'string' },
              form: { type: 'string' },
              seriesid: { type: 'string' },
              sdate: { type: 'string' },
              udate: { type: 'string' },
              status: { type: 'string' },
              responder: { type: 'string' },
              sync: { type: 'string' },
              unsubreason: { type: 'string' },
              campaign: { type: 'string' },
              message: { type: 'string' },
              first_name: { type: 'string' },
              last_name: { type: 'string' },
              ip4Sub: { type: 'string' },
              sourceid: { type: 'string' },
              autosyncLog: { type: 'string' },
              ip4_last: { type: 'string' },
              ip4Unsub: { type: 'string' },
              unsubscribeAutomation: { type: 'string' },
              links: {
                type: {
                  type: 'hash',
                  fields: {
                    automation: { type: 'string' },
                    list: { type: 'string' },
                    contact: { type: 'string' },
                    form: { type: 'string' },
                    autosyncLog: { type: 'string' },
                    campaign: { type: 'string' },
                    unsubscribeAutomation: { type: 'string' },
                    message: { type: 'string' },
                  },
                },
              },
              id: { type: 'string' },
              automation: { type: 'string' },
            },
          },
        },
      },
      deals: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              owner: { type: 'string' },
              contact: { type: 'string' },
              organization: { type: 'string' },
              group: { type: 'string' },
              title: { type: 'string' },
              nexttaskid: { type: 'string' },
              currency: { type: 'string' },
              status: { type: 'string' },
              links: {
                type: {
                  type: 'hash',
                  fields: {
                    activities: { type: 'string' },
                    contact: { type: 'string' },
                    contactDeals: { type: 'string' },
                    group: { type: 'string' },
                    nextTask: { type: 'string' },
                    notes: { type: 'string' },
                    organization: { type: 'string' },
                    owner: { type: 'string' },
                    scoreValues: { type: 'string' },
                    stage: { type: 'string' },
                    tasks: { type: 'string' },
                  },
                },
              },
              id: { type: 'string' },
              nextTask: { type: 'string' },
            },
          },
        },
      },
      fieldValues: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              contact: { type: 'string' },
              field: { type: 'string' },
              value: { type: 'string' },
              cdate: { type: 'string' },
              udate: { type: 'string' },
              links: {
                type: {
                  type: 'hash',
                  fields: {
                    owner: { type: 'string' },
                    field: { type: 'string' },
                  },
                },
              },
              id: { type: 'string' },
              owner: { type: 'string' },
            },
          },
        },
      },
      geoAddresses: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              ip4: { type: 'string' },
              country2: { type: 'string' },
              country: { type: 'string' },
              state: { type: 'string' },
              city: { type: 'string' },
              zip: { type: 'string' },
              area: { type: 'string' },
              lat: { type: 'string' },
              lon: { type: 'string' },
              tz: { type: 'string' },
              tstamp: { type: 'string' },
              links: {
                type: {
                  type: 'list',
                  element_type: { type: 'hash' },
                },
              },
              id: { type: 'string' },
            },
          },
        },
      },
      geoIps: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              contact: { type: 'string' },
              campaignid: { type: 'string' },
              messageid: { type: 'string' },
              geoaddrid: { type: 'string' },
              ip4: { type: 'string' },
              tstamp: { type: 'string' },
              geoAddress: { type: 'string' },
              links: {
                type: {
                  type: 'hash',
                  fields: {
                    geoAddress: { type: 'string' },
                  },
                },
              },
              id: { type: 'string' },
            },
          },
        },
      },
      contact: {
        type: {
          type: 'hash',
          fields: {
            cdate: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            orgid: { type: 'string' },
            segmentio_id: { type: 'string' },
            bounced_hard: { type: 'string' },
            bounced_soft: { type: 'string' },
            bounced_date: { type: 'string' },
            ip: { type: 'string' },
            ua: { type: 'string' },
            hash: { type: 'string' },
            socialdata_lastcheck: { type: 'string' },
            email_local: { type: 'string' },
            email_domain: { type: 'string' },
            sentcnt: { type: 'string' },
            rating_tstamp: { type: 'string' },
            gravatar: { type: 'string' },
            deleted: { type: 'string' },
            adate: { type: 'string' },
            udate: { type: 'string' },
            edate: { type: 'string' },
            contactAutomations: {
              type: {
                type: 'list',
                element_type: 'string',
              },
            },
            contactLists: {
              type: {
                type: 'list',
                element_type: 'string',
              },
            },
            fieldValues: {
              type: {
                type: 'list',
                element_type: 'string',
              },
            },
            geoIps: {
              type: {
                type: 'list',
                element_type: 'string',
              },
            },
            deals: {
              type: {
                type: 'list',
                element_type: 'string',
              },
            },
            accountContacts: {
              type: {
                type: 'list',
                element_type: 'string',
              },
            },
            links: {
              type: {
                type: 'hash',
                fields: {
                  bounceLogs: { type: 'string' },
                  contactAutomations: { type: 'string' },
                  contactData: { type: 'string' },
                  contactGoals: { type: 'string' },
                  contactLists: { type: 'string' },
                  contactLogs: { type: 'string' },
                  contactTags: { type: 'string' },
                  contactDeals: { type: 'string' },
                  deals: { type: 'string' },
                  fieldValues: { type: 'string' },
                  geoIps: { type: 'string' },
                  notes: { type: 'string' },
                  organization: { type: 'string' },
                  plusAppend: { type: 'string' },
                  trackingLogs: { type: 'string' },
                  scoreValues: { type: 'string' },
                },
              },
            },
            id: { type: 'string' },
            organization: { type: 'string' },
          },
        },
      },
    },
  },
});

export default getContact;
