import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { KLAVIYO_APP_NAME, KlaviyoError } from '../constants';
import { getKlaviyoApis, getKlaviyoErrorMessage } from '../helpers/constants';
import { getKlaviyoListIdAllowedValues } from '../helpers/get-list-allowed-values';
import { getKlaviyoProfileIdAllowedValues } from '../helpers/get-profile-allowed-values';

const options = {
  profile: {
    type: 'string',
    required: true,
    get_allowed_values: getKlaviyoProfileIdAllowedValues,
  },
  list: {
    type: 'string',
    required: true,
    get_allowed_values: getKlaviyoListIdAllowedValues,
  },
} satisfies TQoreOptions;

const addProfileToList = QoreAppCreator.createLocalizedAction<typeof options>({
  app: KLAVIYO_APP_NAME,
  action: 'add_profile_to_list',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, profile, list } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['profile', 'list'],
      ErrorClass: KlaviyoError,
    });

    const apis = getKlaviyoApis(token);

    try {
      await apis.listsApi.addProfilesToList(list, {
        data: [
          {
            id: profile,
            type: 'profile',
          },
        ],
      });
    } catch (error) {
      throw new KlaviyoError(`Failed to add a profile to list: ${getKlaviyoErrorMessage(error)}`);
    }
  },
});

export default addProfileToList;
