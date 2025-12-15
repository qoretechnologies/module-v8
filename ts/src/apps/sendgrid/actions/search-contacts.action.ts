import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SENDGRID_APP_NAME, SendGridError } from '../constants';
import { createSendGridClient } from '../helpers/constants';
import { SendGridContactResponseType } from '../response-types/contact';

const action = 'search_contacts';

const options = {
  fieldName: {
    type: 'string',
    required: true,
  },
  value: {
    type: 'string',
    required: true,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'list',
  element_type: SendGridContactResponseType,
} satisfies TQoreResponseType;

interface ISendGridContact {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at?: string;
  updated_at?: string;
  custom_fields?: any[];
}

const searchSendGridContacts = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SENDGRID_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, fieldName, value } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['fieldName', 'value'],
      connectionFields: ['token'],
      ErrorClass: SendGridError,
    });

    const client = createSendGridClient(token);

    try {
      const [response] = await client.request({
        url: '/v3/contactdb/recipients/search',
        method: 'GET',
        qs: { [fieldName]: value },
      });

      const data = response.body as { recipients: ISendGridContact[] };
      return data.recipients || [];
    } catch (error) {
      throw new SendGridError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default searchSendGridContacts;
