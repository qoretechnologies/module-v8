import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { KLAVIYO_APP_NAME, KlaviyoError } from '../constants';
import { getKlaviyoApis, getKlaviyoErrorMessage } from '../helpers/constants';

const smsSubscriptionTypeOptions = {
  smsSubscriptionType: {
    type: 'string',
    required: true,
    allowed_values: [
      { value: 'marketing', display_name: 'Marketing' },
      { value: 'transactional', display_name: 'Transactional' },
      { value: 'both', display_name: 'Marketing & Transactional' },
    ],
  },
} satisfies TQoreOptions;

const options = {
  email: {
    type: 'string',
    preselected: true,
    required_groups: ['unsubscribe'],
  },
  phoneNumber: {
    type: 'string',
    preselected: true,
    required_groups: ['unsubscribe'],
    get_dependent_options: (context) => {
      const phoneNumber = context?.opts?.phoneNumber;
      if (phoneNumber) {
        return smsSubscriptionTypeOptions;
      }

      return {};
    },
  },
} satisfies TQoreOptions;

const unsubscribeProfile = QoreAppCreator.createLocalizedAction<
  typeof options & Partial<typeof smsSubscriptionTypeOptions>
>({
  app: KLAVIYO_APP_NAME,
  action: 'unsubscribe_profile',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: KlaviyoError,
    });

    const apis = getKlaviyoApis(token);

    const smsSubscriptionType = obj?.smsSubscriptionType;
    const email = obj?.email;
    const phoneNumber = obj?.phoneNumber;

    try {
      await apis.profilesApi.bulkUnsubscribeProfiles({
        data: {
          type: 'profile-subscription-bulk-delete-job',
          attributes: {
            profiles: {
              data: [
                {
                  type: 'profile',
                  attributes: {
                    ...(email && { email }),
                    ...(phoneNumber && { phoneNumber }),
                    subscriptions: {
                      ...(email && {
                        email: {
                          marketing: {
                            consent: 'UNSUBSCRIBED',
                          },
                        },
                      }),
                      ...(phoneNumber && {
                        sms: {
                          ...((smsSubscriptionType === 'marketing' ||
                            smsSubscriptionType === 'both') && {
                            marketing: {
                              consent: 'UNSUBSCRIBED',
                            },
                          }),
                          ...((smsSubscriptionType === 'transactional' ||
                            smsSubscriptionType === 'both') && {
                            transactional: {
                              consent: 'UNSUBSCRIBED',
                            },
                          }),
                        },
                      }),
                    },
                  },
                },
              ],
            },
          },
        },
      });
    } catch (error) {
      throw new KlaviyoError(`Failed to unsubscribe a profile: ${getKlaviyoErrorMessage(error)}`);
    }
  },
});

export default unsubscribeProfile;
