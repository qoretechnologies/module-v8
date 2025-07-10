import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { KLAVIYO_APP_NAME, KlaviyoError } from '../constants';
import {
  buildKlaviyoFilterString,
  getKlaviyoApis,
  getKlaviyoErrorMessage,
} from '../helpers/constants';

const options = {
  cursor: {
    required: false,
    type: 'string',
  },

  filter: {
    type: {
      type: 'hash',
      fields: {
        name: {
          required: false,
          type: {
            type: 'list',
            element_type: 'string',
          },
        },
        id: {
          required: false,
          type: {
            type: 'list',
            element_type: 'string',
          },
        },
      },
    },
  },
  sort: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          default_value: 'created',
          allowed_values: [
            { value: 'created', display_name: 'Created' },
            { value: 'updated', display_name: 'Updated' },
            { value: 'name', display_name: 'Name' },
            { value: 'id', display_name: 'Id' },
          ],
        },
        direction: {
          type: 'string',
          default_value: 'desc',
          allowed_values: [
            { value: 'asc', display_name: 'Ascending' },
            { value: 'desc', display_name: 'Descending' },
          ],
        },
      },
    },
  },
} satisfies TQoreOptions;

const listLists = QoreAppCreator.createLocalizedAction<typeof options>({
  app: KLAVIYO_APP_NAME,
  action: 'list_lists',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: KlaviyoError,
    });

    const apis = getKlaviyoApis(token);

    const filter = obj?.filter;
    const filterString = buildKlaviyoFilterString(filter);
    const sort = obj?.sort;
    const pageCursor = obj?.cursor;

    try {
      // @ts-expect-error apis.listsApi.getLists has strict type definitions for sort params
      const response = await apis.listsApi.getLists({
        ...(pageCursor && { pageCursor }),
        ...(filterString && { filter: filterString }),
        ...(sort && { sort: `${sort?.direction === 'desc' ? '-' : ''}${sort?.field}` }),
      });

      return {
        data: response.body.data.map((item) => omit(item, ['relationships', 'links'])),
        next: response.body?.links?.next || null,
      };
    } catch (error) {
      throw new KlaviyoError(`Failed to list lists: ${getKlaviyoErrorMessage(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      data: {
        type: {
          type: 'list',
          element_type: {
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
                    optInProcess: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      next: { type: 'string' },
    },
  },
});

export default listLists;
