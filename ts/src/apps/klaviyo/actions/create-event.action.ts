import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { KLAVIYO_APP_NAME, KlaviyoError } from '../constants';
import { getKlaviyoApis, getKlaviyoErrorMessage } from '../helpers/constants';
import { getKlaviyoProfileIdAllowedValues } from '../helpers/get-profile-allowed-values';
import { getKlaviyoMetricAllowedValues } from '../helpers/get-metric-allowed-values';

const options = {
  email: {
    type: 'string',
    required_groups: ['create_event'],
  },
  metric: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getKlaviyoMetricAllowedValues,
  },
  profile: {
    type: 'string',
    required_groups: ['create_event'],
    get_allowed_values: getKlaviyoProfileIdAllowedValues,
  },
  time: {
    type: 'date',
    required: false,
    preselected: true,
  },
  value: {
    type: 'number',
    required: false,
  },
  customId: {
    type: 'string',
    required: false,
  },
  customProperties: {
    type: 'hash',
  },
} satisfies TQoreOptions;

const createEvent = QoreAppCreator.createLocalizedAction<typeof options>({
  app: KLAVIYO_APP_NAME,
  action: 'create_event',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, metric } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['metric'],
      ErrorClass: KlaviyoError,
    });

    const apis = getKlaviyoApis(token);

    const time = obj?.time;
    const value = obj?.value;
    const customId = obj?.customId;
    const customProperties = obj?.customProperties || {};
    const profile = obj?.profile;
    const email = obj?.email;

    try {
      await apis.eventsApi.createEvent({
        data: {
          type: 'event',
          attributes: {
            ...(customId && { uniqueId: customId }),
            ...(time && { time }),
            ...(value && { value }),
            properties: customProperties,
            metric: {
              data: {
                type: 'metric',
                attributes: {
                  name: metric,
                },
              },
            },
            profile: {
              data: {
                type: 'profile',
                ...(profile && { id: profile }),
                attributes: {
                  ...(email && { email }),
                },
              },
            },
          },
        },
      });
    } catch (error) {
      throw new KlaviyoError(`Failed to create event: ${getKlaviyoErrorMessage(error)}`);
    }
  },
});

export default createEvent;
