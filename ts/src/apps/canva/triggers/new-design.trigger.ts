import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { CANVA_APP_NAME, CanvaError } from '../constants';
import { canvaApiClient } from '../helpers/constants';

const trigger = 'new_design';

const options = {
  query: { type: 'string', required: false },
  ownership: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'any', display_name: 'Any' },
      { value: 'owned', display_name: 'Owned' },
      { value: 'shared', display_name: 'Shared' },
    ],
  },
} satisfies TQoreOptions;

const newDesign = QoreAppCreator.createLocalizedTrigger<typeof options>({
  app: CANVA_APP_NAME,
  action: trigger,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: CanvaError,
    });

    const { ownership, query } = context?.opts || {};

    const getItems = () => {
      return fetchLatestDesigns({
        token,
        ownership,
        query,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: `canva_${trigger}`,
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: CanvaError,
    });

    const { ownership, query } = context?.opts || {};

    const designs = await fetchLatestDesigns({
      token,
      ownership,
      query,
    });

    return designs?.length ? designs[0] : null;
  },
  event_info: {
    desc: 'Canva New Design Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        title: { type: 'string' },
        owner: {
          type: {
            type: 'hash',
            fields: {
              user_id: { type: 'string' },
              team_id: { type: 'string' },
            },
          },
        },
        thumbnail: {
          type: {
            type: 'hash',
            fields: {
              width: { type: 'integer' },
              height: { type: 'integer' },
              url: { type: 'string' },
            },
          },
        },
        urls: {
          type: {
            type: 'hash',
            fields: {
              edit_url: { type: 'string' },
              view_url: { type: 'string' },
            },
          },
        },
        created_at: { type: 'integer' },
        updated_at: { type: 'integer' },
        page_count: { type: 'integer' },
      },
    },
  },
});

const fetchLatestDesigns = async (options: {
  token: string;
  ownership?: string;
  query?: string;
}): Promise<Array<Record<string, any>>> => {
  const { token, ownership, query } = options;

  try {
    const designs = await canvaApiClient<{ items: Record<string, any>[] }>({
      path: `designs`,
      method: 'GET',
      params: {
        ...(ownership && { ownership }),
        ...(query && { query }),
      },
      token,
    });

    return designs.items || [];
  } catch (error) {
    throw new CanvaError(`Failed to fetch latest designs: ${error.message || error}`);
  }
};

export default newDesign;
