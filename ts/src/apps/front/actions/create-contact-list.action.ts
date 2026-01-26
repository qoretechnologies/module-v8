import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { frontClient } from '../client';
import { FRONT_APP_NAME, FrontError } from '../constants';
import { formatFrontResponse } from '../helpers/format-response';
import { FrontContactListResponseType } from '../response-types/contact-list';

const action = 'create_contact_list';

const options = {
  name: {
    type: 'string',
    required: true,
    preselected: true,
  },
  description: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const responseType = FrontContactListResponseType;

const createFrontContactList = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FRONT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, name } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['name'],
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    const { description } = obj || {};

    try {
      const body: Record<string, any> = {
        name,
        ...(description && { description }),
      };

      const contactList = await frontClient.post<Record<string, any>>('contact_lists', body, {
        token,
      });

      return formatFrontResponse(contactList);
    } catch (error) {
      throw new FrontError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default createFrontContactList;
