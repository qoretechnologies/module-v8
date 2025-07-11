import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { KLAVIYO_APP_NAME, KlaviyoError } from '../constants';
import {
  buildKlaviyoFilterString,
  getKlaviyoApis,
  getKlaviyoErrorMessage,
} from '../helpers/constants';

const options = {
  additionalFields: {
    required: false,
    type: {
      type: 'list',
      element_type: 'string',
    },
    element_allowed_values: [
      { value: 'subscriptions', display_name: 'Subscriptions' },
      { value: 'predictive_analytics', display_name: 'Predictive Analytics' },
    ],
  },
  cursor: {
    required: false,
    type: 'string',
  },
  pageSize: {
    required: false,
    type: 'integer',
    default_value: 20,
  },
  filter: {
    type: {
      type: 'hash',
      fields: {
        email: {
          required: false,
          type: {
            type: 'list',
            element_type: 'string',
          },
        },
        phone_number: {
          required: false,
          type: {
            type: 'list',
            element_type: 'string',
          },
        },
        external_id: {
          required: false,
          type: {
            type: 'list',
            element_type: 'string',
          },
        },
        id: {
          required: false,
          type: {
            type: 'list',
            element_type: 'string',
          },
        },
      },
    },
  },
  sort: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          default_value: 'created',
          allowed_values: [
            { value: 'created', display_name: 'Created' },
            { value: 'updated', display_name: 'Updated' },
            { value: 'email', display_name: 'Email' },
            { value: 'id', display_name: 'Id' },
            {
              value: 'subscriptions.email.marketing.suppression.timestamp',
              display_name: 'Email Suppression Timestamp',
            },
            {
              value: 'subscriptions.email.marketing.list_suppressions.timestamp',
              display_name: 'Email List Suppression Timestamp',
            },
          ],
        },
        direction: {
          type: 'string',
          default_value: 'desc',
          allowed_values: [
            { value: 'asc', display_name: 'Ascending' },
            { value: 'desc', display_name: 'Descending' },
          ],
        },
      },
    },
  },
} satisfies TQoreOptions;

const listProfiles = QoreAppCreator.createLocalizedAction<typeof options>({
  app: KLAVIYO_APP_NAME,
  action: 'list_profiles',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: KlaviyoError,
    });

    const apis = getKlaviyoApis(token);

    const pageSize = obj?.pageSize || 20;
    const filter = obj?.filter;
    const filterString = buildKlaviyoFilterString(filter);
    const sort = obj?.sort;
    const pageCursor = obj?.cursor;
    const additionalFieldsProfile = obj?.additionalFields as
      | ('subscriptions' | 'predictive_analytics')[]
      | undefined;

    try {
      // @ts-expect-error - allowed fields for sort and filtering are correct
      const response = await apis.profilesApi.getProfiles({
        ...(additionalFieldsProfile && { additionalFieldsProfile }),
        ...(pageCursor && { pageCursor }),
        ...(sort && { sort: `${sort?.direction === 'desc' ? '-' : ''}${sort?.field}` }),
        ...(filterString && { filter: filterString }),
        pageSize,
      });

      return {
        data: response.body.data.map((item) => omit(item, ['relationships', 'links'])),
        next: response.body?.links?.next || null,
      };
    } catch (error) {
      throw new KlaviyoError(`Failed to list profiles: ${getKlaviyoErrorMessage(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      data: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              type: { type: 'string' },
              id: { type: 'string' },
              attributes: {
                type: {
                  type: 'hash',
                  fields: {
                    email: { type: 'string' },
                    phoneNumber: { type: 'string' },
                    externalId: { type: 'string' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    organization: { type: 'string' },
                    locale: { type: 'string' },
                    title: { type: 'string' },
                    image: { type: 'string' },
                    created: { type: 'string' },
                    updated: { type: 'string' },
                    lastEventDate: { type: 'string' },
                    location: {
                      type: {
                        type: 'hash',
                        fields: {
                          address1: { type: 'string' },
                          address2: { type: 'string' },
                          city: { type: 'string' },
                          country: { type: 'string' },
                          latitude: { type: 'string' },
                          longitude: { type: 'string' },
                          region: { type: 'string' },
                          zip: { type: 'string' },
                          timezone: { type: 'string' },
                          ip: { type: 'string' },
                        },
                      },
                    },
                    properties: { type: 'hash' },
                    subscriptions: {
                      type: {
                        type: 'hash',
                        fields: {
                          email: {
                            type: {
                              type: 'hash',
                              fields: {
                                marketing: {
                                  type: {
                                    type: 'hash',
                                    fields: {
                                      canReceiveEmailMarketing: { type: 'boolean' },
                                      consent: { type: 'string' },
                                      consentTimestamp: { type: 'string' },
                                      lastUpdated: { type: 'string' },
                                      method: { type: 'string' },
                                      methodDetail: { type: 'string' },
                                      customMethodDetail: { type: 'string' },
                                      doubleOptin: { type: 'boolean' },
                                      suppression: {
                                        type: {
                                          type: 'list',
                                          element_type: {
                                            type: 'hash',
                                            fields: {
                                              reason: { type: 'string' },
                                              timestamp: { type: 'string' },
                                            },
                                          },
                                        },
                                      },
                                      listSuppressions: {
                                        type: {
                                          type: 'list',
                                          element_type: {
                                            type: 'hash',
                                            fields: {
                                              listId: { type: 'string' },
                                              reason: { type: 'string' },
                                              timestamp: { type: 'string' },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                          sms: {
                            type: {
                              type: 'hash',
                              fields: {
                                marketing: {
                                  type: {
                                    type: 'hash',
                                    fields: {
                                      canReceiveSmsMarketing: { type: 'boolean' },
                                      consent: { type: 'string' },
                                      consentTimestamp: { type: 'string' },
                                      method: { type: 'string' },
                                      methodDetail: { type: 'string' },
                                      lastUpdated: { type: 'string' },
                                    },
                                  },
                                },
                                transactional: {
                                  type: {
                                    type: 'hash',
                                    fields: {
                                      canReceiveSmsTransactional: { type: 'boolean' },
                                      consent: { type: 'string' },
                                      consentTimestamp: { type: 'string' },
                                      method: { type: 'string' },
                                      methodDetail: { type: 'string' },
                                      lastUpdated: { type: 'string' },
                                    },
                                  },
                                },
                              },
                            },
                          },
                          mobilePush: {
                            type: {
                              type: 'hash',
                              fields: {
                                marketing: {
                                  type: {
                                    type: 'hash',
                                    fields: {
                                      canReceivePushMarketing: { type: 'boolean' },
                                      consent: { type: 'string' },
                                      consentTimestamp: { type: 'string' },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                    predictiveAnalytics: {
                      type: {
                        type: 'hash',
                        fields: {
                          historicClv: { type: 'number' },
                          predictedClv: { type: 'number' },
                          totalClv: { type: 'number' },
                          historicNumberOfOrders: { type: 'number' },
                          predictedNumberOfOrders: { type: 'number' },
                          averageDaysBetweenOrders: { type: 'number' },
                          averageOrderValue: { type: 'number' },
                          churnProbability: { type: 'number' },
                          expectedDateOfNextOrder: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      next: { type: 'string' },
    },
  },
});

export default listProfiles;
