import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { KLAVIYO_APP_NAME, KlaviyoError } from '../constants';
import { getKlaviyoApis, getKlaviyoErrorMessage } from '../helpers/constants';

const options = {
  name: {
    type: 'string',
    required: true,
  },
} satisfies TQoreOptions;

const createList = QoreAppCreator.createLocalizedAction<typeof options>({
  app: KLAVIYO_APP_NAME,
  action: 'create_list',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, name } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['name'],
      ErrorClass: KlaviyoError,
    });

    const apis = getKlaviyoApis(token);

    try {
      const response = await apis.listsApi.createList({
        data: {
          type: 'list',
          attributes: {
            name,
          },
        },
      });

      return omit(response.body.data, ['relationships', 'links']);
    } catch (error) {
      throw new KlaviyoError(`Failed to create list: ${getKlaviyoErrorMessage(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      type: { type: 'string' },
      id: { type: 'string' },
      attributes: {
        type: {
          type: 'hash',
          fields: {
            name: { type: 'string' },
            created: { type: 'string' },
            updated: { type: 'string' },
            opt_in_process: { type: 'string' },
          },
        },
      },
    },
  },
});

export default createList;
