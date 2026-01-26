import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { FIGMA_APP_NAME, FigmaError } from '../constants';
import { figmaApiClient } from '../helpers/constants';
import { getFigmaProjectAllowedValues } from '../helpers/get-project-allowed-values';
import { getFigmaProjectFilesAllowedValues } from '../helpers/get-project-files-allowed-values';

const trigger = 'new_file_comment';

const options = {
  team: {
    type: 'string',
    required: false,
    preselected: true,
    on_change: ['refetch'],
  },
  project: {
    type: 'string',
    required: false,
    preselected: true,
    get_allowed_values: getFigmaProjectAllowedValues,
    allowed_values_creatable: true,
    on_change: ['refetch'],
    depends_on: ['team'],
  },
  key: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getFigmaProjectFilesAllowedValues,
  },
} satisfies TQoreOptions;

const newFileComment = QoreAppCreator.createLocalizedTrigger<typeof options>({
  app: FIGMA_APP_NAME,
  action: trigger,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token, key } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: FigmaError,
    });

    const getItems = () => {
      return fetchLatestItems({
        token,
        key,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: `figma_${trigger}`,
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, key } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['key'],
      ErrorClass: FigmaError,
    });

    const items = await fetchLatestItems({
      token,
      key,
    });

    return items?.length ? items[0] : null;
  },
  event_info: {
    desc: 'Figma New File Comment Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        uuid: { type: 'string' },
        file_key: { type: 'string' },
        parent_id: { type: 'string' },
        user: {
          type: {
            type: 'hash',
            fields: {
              handle: { type: 'string' },
              img_url: { type: 'string' },
              id: { type: 'string' },
            },
          },
        },
        created_at: { type: 'string' },
        resolved_at: { type: 'string' },
        message: { type: 'string' },
        reactions: {
          type: {
            type: 'list',
            element_type: 'hash',
          },
        },
        client_meta: {
          type: {
            type: 'hash',
            fields: {
              x: { type: 'number' },
              y: { type: 'number' },
            },
          },
        },
        order_id: { type: 'string' },
      },
    },
  },
});

const fetchLatestItems = async (options: {
  token: string;
  key: string;
}): Promise<Array<Record<string, any>>> => {
  const { token, key } = options;

  try {
    const comments = await figmaApiClient<Array<Record<string, any>>>({
      path: `files/${key}/comments`,
      method: 'GET',
      object: 'comments',
      token,
    });

    return comments || [];
  } catch (error) {
    throw new FigmaError(`Failed to fetch latest comments: ${error.message || error}`);
  }
};

export default newFileComment;
