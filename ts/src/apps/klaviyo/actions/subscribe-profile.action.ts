import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { KLAVIYO_APP_NAME, KlaviyoError } from '../constants';
import { getKlaviyoApis, getKlaviyoErrorMessage } from '../helpers/constants';
import { getKlaviyoListIdAllowedValues } from '../helpers/get-list-allowed-values';
import { getKlaviyoProfileIdAllowedValues } from '../helpers/get-profile-allowed-values';

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
  profileId: {
    type: 'string',
    preselected: true,
    required_groups: ['subscription'],
    get_allowed_values: getKlaviyoProfileIdAllowedValues,
  },
  email: {
    type: 'string',
    preselected: true,
    required_groups: ['subscription'],
  },
  phoneNumber: {
    type: 'string',
    required_groups: ['subscription'],
    required: false,
  },
  consentToSubscribeToChannel: {
    type: 'string',
    required: true,
    on_change: ['refetch'],
    allowed_values: [
      { value: 'email', display_name: 'Email' },
      { value: 'sms', display_name: 'SMS' },
      { value: 'both', display_name: 'Email & SMS' },
    ],
    get_dependent_options: (context) => {
      const consentToSubscribeToChannel = context?.opts?.consentToSubscribeToChannel;

      if (consentToSubscribeToChannel === 'sms' || consentToSubscribeToChannel === 'both') {
        return smsSubscriptionTypeOptions;
      }

      return {};
    },
  },
  list: {
    type: 'string',
    required: false,
    get_allowed_values: getKlaviyoListIdAllowedValues,
  },
} satisfies TQoreOptions;

const subscribeProfile = QoreAppCreator.createLocalizedAction<
  typeof options & Partial<typeof smsSubscriptionTypeOptions>
>({
  app: KLAVIYO_APP_NAME,
  action: 'subscribe_profile',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, consentToSubscribeToChannel } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['consentToSubscribeToChannel'],
      ErrorClass: KlaviyoError,
    });

    const apis = getKlaviyoApis(token);

    let email: string | null | undefined;
    let phoneNumber: string | null | undefined;
    const profileId = obj?.profileId;

    if (profileId) {
      const profileResponse = await apis.profilesApi.getProfile(profileId);
      const profileData = profileResponse.body.data;

      if (consentToSubscribeToChannel === 'email' || consentToSubscribeToChannel === 'both') {
        email = obj?.email || profileData.attributes?.email;
        if (!email) throw new KlaviyoError('Email is required to subscribe to email channel');
      }

      if (consentToSubscribeToChannel === 'sms' || consentToSubscribeToChannel === 'both') {
        phoneNumber = obj?.phoneNumber || profileData.attributes?.phoneNumber;
        if (!phoneNumber)
          throw new KlaviyoError('Phone number is required to subscribe to sms channel');
      }
    } else {
      email = obj?.email;
      phoneNumber = obj?.phoneNumber;
    }

    const smsSubscriptionType = obj?.smsSubscriptionType;
    const list = obj?.list;

    try {
      await apis.profilesApi.bulkSubscribeProfiles({
        data: {
          type: 'profile-subscription-bulk-create-job',
          ...(list && {
            relationships: {
              list: {
                data: {
                  type: 'list',
                  id: list,
                },
              },
            },
          }),
          attributes: {
            profiles: {
              data: [
                {
                  type: 'profile',
                  ...(profileId && { id: profileId }),
                  attributes: {
                    ...(email && { email }),
                    ...(phoneNumber && { phoneNumber }),
                    subscriptions: {
                      ...((consentToSubscribeToChannel === 'email' ||
                        consentToSubscribeToChannel === 'both') && {
                        email: {
                          marketing: {
                            consent: 'SUBSCRIBED',
                          },
                        },
                      }),
                      ...((consentToSubscribeToChannel === 'sms' ||
                        consentToSubscribeToChannel === 'both') && {
                        sms: {
                          ...((smsSubscriptionType === 'transactional' ||
                            smsSubscriptionType === 'both') && {
                            transactional: { consent: 'SUBSCRIBED' },
                          }),
                          ...((smsSubscriptionType === 'marketing' ||
                            smsSubscriptionType === 'both') && {
                            marketing: { consent: 'SUBSCRIBED' },
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
      throw new KlaviyoError(`Failed to subscribe a profile: ${getKlaviyoErrorMessage(error)}`);
    }
  },
});

export default subscribeProfile;
