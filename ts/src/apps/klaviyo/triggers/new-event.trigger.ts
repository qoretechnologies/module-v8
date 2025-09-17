import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { KLAVIYO_APP_NAME, KlaviyoError } from '../constants';
import {
  buildKlaviyoFilterString,
  getKlaviyoApis,
  getKlaviyoErrorMessage,
} from '../helpers/constants';
import { getKlaviyoMetricIdAllowedValues } from '../helpers/get-metric-allowed-values';
import { MetricResponseObjectResource, ProfileResponseObjectResource } from 'klaviyo-api';

const options = {
  metric: {
    type: 'string',
    required: true,
    get_allowed_values: getKlaviyoMetricIdAllowedValues,
  },
} satisfies TQoreOptions;

const KlaviyoNewEventTrigger = QoreAppCreator.createLocalizedTrigger({
  app: KLAVIYO_APP_NAME,
  action: 'new_event',
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token, metric } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['metric'],
      ErrorClass: KlaviyoError,
    });

    const getItems = () => {
      return fetchLatestEvents({ token, metric });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'klaviyo_new_event',
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, metric } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['metric'],
      ErrorClass: KlaviyoError,
    });

    const events = await fetchLatestEvents({ token, metric });

    return events?.length > 0 ? events[0] : null;
  },
  event_info: {
    desc: 'Klaviyo New Event Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        type: { type: 'string' },
        id: { type: 'string' },
        metric: {
          type: {
            type: 'hash',
            fields: {
              type: { type: 'string' },
              id: { type: 'string' },

              name: { type: 'string' },
              created: { type: 'string' },
              updated: { type: 'string' },
              integration: {
                type: {
                  type: 'hash',
                  fields: {
                    object: { type: 'string' },
                    id: { type: 'string' },
                    key: { type: 'string' },
                    name: { type: 'string' },
                    category: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        profile: {
          type: {
            type: 'hash',

            fields: {
              type: { type: 'string' },
              id: { type: 'string' },

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

        timestamp: { type: 'string' },
        datetime: { type: 'string' },
        uuid: { type: 'string' },
        eventProperties: { type: 'hash' },
      },
    },
  },
});

export default KlaviyoNewEventTrigger;

const fetchLatestEvents = async (options: { token: string; metric: string }) => {
  const { token, metric } = options;

  try {
    const { eventsApi } = getKlaviyoApis(token);

    const filterString = buildKlaviyoFilterString(
      {
        metric_id: metric,
      },
      {
        metric_id: 'equals',
      }
    );

    const response = await eventsApi.getEvents({
      filter: filterString as string,
      include: ['metric', 'profile'],
      sort: '-datetime',
    });

    return response.body.data.map((item) => {
      const metricId = item.relationships?.metric?.data?.id;
      const profileId = item.relationships?.profile?.data?.id;

      const metric = omit(
        response.body.included?.find(
          (includedItem) => includedItem.type === 'metric' && includedItem.id === metricId
        ),
        ['links']
      ) as MetricResponseObjectResource;

      const profile = omit(
        response.body.included?.find(
          (includedItem) => includedItem.type === 'profile' && includedItem.id === profileId
        ),
        ['links']
      ) as ProfileResponseObjectResource;

      return {
        ...omit({ ...item, ...item.attributes }, ['relationships', 'links', 'attributes']),
        ...(metric && { metric: omit({ ...metric, ...metric.attributes }, 'attributes') }),
        ...(profile && { profile: omit({ ...profile, ...profile.attributes }, 'attributes') }),
      };
    });
  } catch (error) {
    throw new KlaviyoError(`Failed to fetch latest events: ${getKlaviyoErrorMessage(error)}`);
  }
};
