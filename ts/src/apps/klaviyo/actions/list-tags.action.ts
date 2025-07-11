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
          type: 'string',
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

const listTags = QoreAppCreator.createLocalizedAction<typeof options>({
  app: KLAVIYO_APP_NAME,
  action: 'list_tags',
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
    const filterString = buildKlaviyoFilterString(filter, {
      name: 'contains',
    });
    const sort = obj?.sort;
    const pageCursor = obj?.cursor;

    try {
      // @ts-expect-error apis.tagsApi.getTags has strict type definitions for sort params
      const response = await apis.tagsApi.getTags({
        ...(pageCursor && { pageCursor }),
        ...(filterString && { filter: filterString }),
        ...(sort && { sort: `${sort?.direction === 'desc' ? '-' : ''}${sort?.field}` }),
      });

      return {
        data: response.body.data.map((item) => omit(item, ['relationships', 'links'])),
        next: response.body?.links?.next || null,
      };
    } catch (error) {
      throw new KlaviyoError(`Failed to list tags: ${getKlaviyoErrorMessage(error)}`);
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

export default listTags;
