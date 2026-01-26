import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SURVEY_MONKEY_APP_NAME, SurveyMonkeyError } from '../constants';
import { surveyMonkeyClient } from '../helpers/constants';
import { SurveyMonkeyContactResponseType } from '../response-types';

const action = 'list_contacts';

const options = {
  page: {
    type: 'integer',
    required: false,
    default_value: 1,
  },
  per_page: {
    type: 'integer',
    required: false,
    default_value: 100,
  },
  limit: {
    type: 'integer',
    required: false,
    default_value: 500,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'list',
  element_type: SurveyMonkeyContactResponseType,
} satisfies TQoreResponseType;

const listSurveyMonkeyContacts = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SURVEY_MONKEY_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: SurveyMonkeyError,
    });

    const { page, per_page, limit } = obj || {};

    try {
      const contacts = await surveyMonkeyClient.fetchPaginated({
        token,
        path: 'contacts',
        itemsPath: 'data',
        maxResults: limit || 500,
        params: {
          ...(page && { page }),
          ...(per_page && { per_page }),
        },
      });

      return contacts;
    } catch (error: any) {
      throw new SurveyMonkeyError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default listSurveyMonkeyContacts;
