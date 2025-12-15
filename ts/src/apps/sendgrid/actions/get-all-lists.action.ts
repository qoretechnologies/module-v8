import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SENDGRID_APP_NAME, SendGridError } from '../constants';
import { createSendGridClient } from '../helpers/constants';
import { SendGridListResponseType } from '../response-types/list';

const action = 'get_all_lists';

const options = {} satisfies TQoreOptions;

const responseType = {
  type: 'list',
  element_type: SendGridListResponseType,
} satisfies TQoreResponseType;

interface ISendGridList {
  id: number;
  name: string;
  recipient_count: number;
}

const getAllSendGridLists = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SENDGRID_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (_obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: SendGridError,
    });

    const client = createSendGridClient(token);

    try {
      const [response] = await client.request({
        url: '/v3/contactdb/lists',
        method: 'GET',
      });

      const data = response.body as { lists: ISendGridList[] };
      return data.lists || [];
    } catch (error: any) {
      throw new SendGridError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default getAllSendGridLists;
