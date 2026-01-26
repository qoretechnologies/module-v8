import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SENDGRID_APP_NAME, SendGridError } from '../constants';
import { createSendGridClient } from '../helpers/constants';
import { SendGridListResponseType } from '../response-types/list';

const action = 'create_list';

const options = {
  name: {
    type: 'string',
    required: true,
  },
} satisfies TQoreOptions;

const responseType = SendGridListResponseType;

const createSendGridList = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SENDGRID_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, name } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['name'],
      connectionFields: ['token'],
      ErrorClass: SendGridError,
    });

    const client = createSendGridClient(token);

    try {
      const [response] = await client.request({
        url: '/v3/contactdb/lists',
        method: 'POST',
        body: { name },
      });

      return response.body;
    } catch (error) {
      throw new SendGridError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default createSendGridList;
