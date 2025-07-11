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
  cursor: {
    required: false,
    type: 'string',
  },

  filter: {
    type: {
      type: 'hash',
      fields: {
        name: {
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
            { value: 'name', display_name: 'Name' },
            { value: 'id', display_name: 'Id' },
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

const listSegments = QoreAppCreator.createLocalizedAction<typeof options>({
  app: KLAVIYO_APP_NAME,
  action: 'list_segments',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: KlaviyoError,
    });

    const apis = getKlaviyoApis(token);

    const filter = obj?.filter;
    const filterString = buildKlaviyoFilterString(filter);
    const sort = obj?.sort;
    const pageCursor = obj?.cursor;

    try {
      // @ts-expect-error apis.listsApi.getLists has strict type definitions for sort params
      const response = await apis.segmentsApi.getSegments({
        ...(pageCursor && { pageCursor }),
        ...(filterString && { filter: filterString }),
        ...(sort && { sort: `${sort?.direction === 'desc' ? '-' : ''}${sort?.field}` }),
      });

      return {
        data: response.body.data.map((item) => omit(item, ['relationships', 'links'])),
        next: response.body?.links?.next || null,
      };
    } catch (error) {
      throw new KlaviyoError(`Failed to list segments: ${getKlaviyoErrorMessage(error)}`);
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
                    name: { type: 'string' },
                    definition: {
                      type: {
                        type: 'hash',
                        fields: {
                          conditionGroups: {
                            type: {
                              type: 'list',
                              element_type: {
                                type: 'hash',
                                fields: {
                                  conditions: {
                                    type: {
                                      type: 'list',
                                      element_type: {
                                        type: 'hash',
                                        fields: {
                                          type: { type: 'string' },
                                          groupIds: {
                                            type: {
                                              type: 'list',
                                              element_type: 'string',
                                            },
                                          },
                                          timeframeFilter: {
                                            type: {
                                              type: 'hash',
                                              fields: {
                                                type: { type: 'string' },
                                                operator: { type: 'string' },
                                                date: { type: 'string' },
                                              },
                                            },
                                          },
                                          metricId: { type: 'string' },
                                          measurement: { type: 'string' },
                                          measurementFilter: {
                                            type: {
                                              type: 'hash',
                                              fields: {
                                                type: { type: 'string' },
                                                operator: { type: 'string' },
                                                value: { type: 'number' },
                                              },
                                            },
                                          },
                                          metricFilters: {
                                            type: {
                                              type: 'list',
                                              element_type: {
                                                type: 'hash',
                                                fields: {
                                                  property: { type: 'string' },
                                                  filter: {
                                                    type: {
                                                      type: 'hash',
                                                      fields: {
                                                        type: { type: 'string' },
                                                        operator: { type: 'string' },
                                                        value: { type: 'string' },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                          consent: {
                                            type: {
                                              type: 'hash',
                                              fields: {
                                                channel: { type: 'string' },
                                                consentStatus: {
                                                  type: {
                                                    type: 'hash',
                                                    fields: {
                                                      subscription: { type: 'string' },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                          countryCode: { type: 'string' },
                                          postalCode: { type: 'string' },
                                          unit: { type: 'string' },
                                          filter: {
                                            type: {
                                              type: 'hash',
                                              fields: {
                                                type: { type: 'string' },
                                                operator: { type: 'string' },
                                                value: { type: 'number' },
                                              },
                                            },
                                          },
                                          property: { type: 'string' },
                                          inRegion: { type: 'boolean' },
                                          region: { type: 'string' },
                                          dimension: { type: 'string' },
                                          predictedChannel: { type: 'string' },
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
                    },
                    created: { type: 'string' },
                    updated: { type: 'string' },
                    isActive: { type: 'boolean' },
                    isProcessing: { type: 'boolean' },
                    isStarred: { type: 'boolean' },
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

export default listSegments;
