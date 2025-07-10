import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { KLAVIYO_APP_NAME, KlaviyoError } from '../constants';
import { getKlaviyoApis, getKlaviyoErrorMessage } from '../helpers/constants';
import { getKlaviyoListIdAllowedValues } from '../helpers/get-list-allowed-values';
import { getKlaviyoTagIdAllowedValues } from '../helpers/get-tag-id-allowed-values';

const options = {
  tag: {
    type: 'string',
    required: true,
    get_allowed_values: getKlaviyoTagIdAllowedValues,
  },
  list: {
    type: 'string',
    required: true,
    get_allowed_values: getKlaviyoListIdAllowedValues,
  },
} satisfies TQoreOptions;

const addTagToList = QoreAppCreator.createLocalizedAction<typeof options>({
  app: KLAVIYO_APP_NAME,
  action: 'add_tag_to_list',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, tag, list } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['tag', 'list'],
      ErrorClass: KlaviyoError,
    });

    const apis = getKlaviyoApis(token);

    try {
      await apis.tagsApi.tagLists(tag, {
        data: [
          {
            id: list,
            type: 'list',
          },
        ],
      });
    } catch (error) {
      throw new KlaviyoError(`Failed to add a tag to list: ${getKlaviyoErrorMessage(error)}`);
    }
  },
});

export default addTagToList;
