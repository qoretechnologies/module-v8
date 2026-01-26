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

      const data = response.body.data;

      return omit(
        {
          ...data,
          name: data.attributes.name,
          optInProcess: data.attributes.optInProcess,
          created: data.attributes.created || null,
          updated: data.attributes.updated || null,
        },
        ['relationships', 'links', 'attributes']
      );
    } catch (error) {
      throw new KlaviyoError(`Failed to create list: ${getKlaviyoErrorMessage(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      type: { type: 'string' },
      id: { type: 'string' },
      name: { type: 'string' },
      created: { type: 'string' },
      updated: { type: 'string' },
      optInProcess: { type: 'string' },
    },
  },
});

export default createList;
