import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { CANVA_APP_NAME, CanvaError } from '../constants';
import { canvaApiClient } from '../helpers/constants';
import { getCanvaDesignAllowedValues } from '../helpers/get-design-allowed-values';

const trigger = 'new_thread_reply';

const options = {
  design: {
    type: 'string',
    required: true,
    get_allowed_values: getCanvaDesignAllowedValues,
  },
  thread: {
    type: 'string',
    required: true,
  },
} satisfies TQoreOptions;

const newThreadReply = QoreAppCreator.createLocalizedTrigger<typeof options>({
  app: CANVA_APP_NAME,
  action: trigger,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token, design, thread } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['design', 'thread'],
      ErrorClass: CanvaError,
    });

    const getItems = () => {
      return fetchLatestThreadReplies({
        token,
        design,
        thread,
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
    const { token, design, thread } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['design', 'thread'],
      ErrorClass: CanvaError,
    });

    const replies = await fetchLatestThreadReplies({
      token,
      design,
      thread,
    });

    return replies?.length ? replies[0] : null;
  },
  event_info: {
    desc: 'Canva New Thread Reply Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        design_id: { type: 'string' },
        thread_id: { type: 'string' },
        author: {
          type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              display_name: { type: 'string' },
            },
          },
        },
        content: {
          type: {
            type: 'hash',
            fields: {
              plaintext: { type: 'string' },
              markdown: { type: 'string' },
            },
          },
        },
        mentions: {
          type: {
            type: 'hash',
          },
        },
        created_at: { type: 'integer' },
        updated_at: { type: 'integer' },
      },
    },
  },
});

const fetchLatestThreadReplies = async (options: {
  token: string;
  design: string;
  thread: string;
}): Promise<Array<Record<string, any>>> => {
  const { token, design, thread } = options;

  try {
    const replies = await canvaApiClient<{ items: Record<string, any>[] }>({
      path: `designs/${design}/comments/${thread}/replies`,
      method: 'GET',
      token,
    });

    return replies.items || [];
  } catch (error) {
    throw new CanvaError(`Failed to fetch latest replies: ${error.message || error}`);
  }
};

export default newThreadReply;
