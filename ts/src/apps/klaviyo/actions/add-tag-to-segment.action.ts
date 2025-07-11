import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { KLAVIYO_APP_NAME, KlaviyoError } from '../constants';
import { getKlaviyoApis, getKlaviyoErrorMessage } from '../helpers/constants';
import { getKlaviyoSegmentIdAllowedValues } from '../helpers/get-segment-allowed-values';
import { getKlaviyoTagIdAllowedValues } from '../helpers/get-tag-id-allowed-values';

const options = {
  tag: {
    type: 'string',
    required: true,
    get_allowed_values: getKlaviyoTagIdAllowedValues,
  },
  segment: {
    type: 'string',
    required: true,
    get_allowed_values: getKlaviyoSegmentIdAllowedValues,
  },
} satisfies TQoreOptions;

const addTagToSegment = QoreAppCreator.createLocalizedAction<typeof options>({
  app: KLAVIYO_APP_NAME,
  action: 'add_tag_to_segment',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, tag, segment } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['tag', 'segment'],
      ErrorClass: KlaviyoError,
    });

    const apis = getKlaviyoApis(token);

    try {
      await apis.tagsApi.tagSegments(tag, {
        data: [
          {
            id: segment,
            type: 'segment',
          },
        ],
      });
    } catch (error) {
      throw new KlaviyoError(`Failed to add a tag to segment: ${getKlaviyoErrorMessage(error)}`);
    }
  },
});

export default addTagToSegment;
