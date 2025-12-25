import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { FRONT_APP_NAME, FrontError } from '../constants';
import { frontApiClient } from '../helpers/constants';
import { formatFrontResponse } from '../helpers/format-response';
import { FrontMessageResponseType } from '../response-types/message';

const action = 'get_message';

const options = {
  messageId: {
    type: 'string',
    required: true,
  },
} satisfies TQoreOptions;

const responseType = FrontMessageResponseType;

const getFrontMessage = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FRONT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, messageId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['messageId'],
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    try {
      const message = await frontApiClient<Record<string, any>>({
        token,
        path: `messages/${messageId}`,
        method: 'GET',
      });

      return formatFrontResponse(message);
    } catch (error) {
      throw new FrontError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default getFrontMessage;
