import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { KLAVIYO_APP_NAME, KlaviyoError } from '../constants';
import { getKlaviyoApis, getKlaviyoErrorMessage } from '../helpers/constants';
import { getKlaviyoCampaignIdAllowedValues } from '../helpers/get-campaign-allowed-values';

const options = {
  id: {
    type: 'string',
    required: true,
    get_allowed_values: getKlaviyoCampaignIdAllowedValues,
  },
} satisfies TQoreOptions;

const sendCampaign = QoreAppCreator.createLocalizedAction<typeof options>({
  app: KLAVIYO_APP_NAME,
  action: 'send_campaign',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['id'],
      ErrorClass: KlaviyoError,
    });

    const apis = getKlaviyoApis(token);

    try {
      const response = await apis.campaignsApi.sendCampaign({
        data: {
          id,
          type: 'campaign-send-job',
        },
      });

      const data = response.body.data;

      return omit({ ...data, ...data.attributes }, ['relationships', 'links', 'attributes']);
    } catch (error) {
      throw new KlaviyoError(`Failed to send campaign: ${getKlaviyoErrorMessage(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      type: { type: 'string' },
      id: { type: 'string' },
      status: { type: 'string' },
    },
  },
});

export default sendCampaign;
