import { GetPageResponse } from '@notionhq/client';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { NOTION_APP_NAME, NotionError } from '../constants';
import { createNotionClient } from '../helpers/constants';
import { getNotionPageAllowedValues } from '../helpers/get-page-allowed-values';

const action = 'updated_page';

const options = {
  page: {
    type: 'string',
    required: true,
    get_allowed_values: getNotionPageAllowedValues,
  },
} satisfies TQoreOptions;

const UpdatedPage = QoreAppCreator.createLocalizedTrigger({
  app: NOTION_APP_NAME,
  action,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token, page } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['page'],
      ErrorClass: NotionError,
    });

    const getItems = () => {
      return fetchPage({
        token,
        page,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: `notion_${action}`,
      uniqueField: 'last_edited_time',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, page } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['page'],
      ErrorClass: NotionError,
    });

    const items = await fetchPage({
      token,
      page,
    });

    return items?.length ? items[0] : null;
  },
  event_info: {
    desc: `Notion ${humanizeNameTitle(action)} Trigger Event Info`,
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        title: { type: 'string' },
        archived: { type: 'bool' },
        in_trash: { type: 'bool' },
        is_locked: { type: 'bool' },
        created_time: { type: 'string' },
        last_edited_time: { type: 'string' },
        url: { type: 'string' },
        public_url: { type: 'string' },
        properties: { type: 'hash' },
        parent: {
          type: {
            type: 'hash',
            fields: {
              type: { type: 'string' },
              data_source_id: { type: 'string' },
              database_id: { type: 'string' },
            },
          },
        },
        icon: {
          type: {
            type: 'hash',
            fields: {
              type: { type: 'string' },
              emoji: { type: 'string' },
              file: {
                type: {
                  type: 'hash',
                  fields: {
                    url: { type: 'string' },
                    expiry_time: { type: 'string' },
                  },
                },
              },
              custom_emoji: {
                type: {
                  type: 'hash',
                  fields: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    url: { type: 'string' },
                  },
                },
              },
              external: {
                type: {
                  type: 'hash',
                  fields: {
                    url: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        cover: {
          type: {
            type: 'hash',
            fields: {
              type: { type: 'string' },
              external: {
                type: {
                  type: 'hash',
                  fields: {
                    url: { type: 'string' },
                  },
                },
              },
              file: {
                type: {
                  type: 'hash',
                  fields: {
                    url: { type: 'string' },
                    expiry_time: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});

const fetchPage = async (options: { token: string; page: string }): Promise<GetPageResponse[]> => {
  const { token, page } = options;

  try {
    const client = createNotionClient(token);

    const response = await client.pages.retrieve({
      page_id: page,
    });

    return [response] as GetPageResponse[];
  } catch (error) {
    throw new NotionError(`Failed to fetch latest page: ${error.message || error}`);
  }
};

export default UpdatedPage;
