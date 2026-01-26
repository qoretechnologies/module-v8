import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { frontClient } from '../client';
import { FRONT_APP_NAME, FrontError } from '../constants';
import { formatFrontResponse } from '../helpers/format-response';
import { getFrontConversationAllowedValues } from '../helpers/get-conversation-allowed-values';
import { FrontCommentResponseType } from '../response-types/comment';

const action = 'new_comment';

const options = {
  conversationId: {
    type: 'string',
    required: true,
    get_allowed_values: getFrontConversationAllowedValues,
  },
} satisfies TQoreOptions;

const NewComment = QoreAppCreator.createLocalizedTrigger({
  app: FRONT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token, conversationId } = getQoreContextRequiredValues({
      context,
      optionFields: ['conversationId'],
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    const getItems = () => {
      return fetchLatestRecords({ token, conversationId });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: `front_${action}`,
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, conversationId } = getQoreContextRequiredValues({
      context,
      optionFields: ['conversationId'],
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    const records = await fetchLatestRecords({ token, conversationId });

    return records?.length > 0 ? records[0] : null;
  },
  event_info: {
    desc: 'Front New Comment Trigger Event Info',
    type: FrontCommentResponseType,
  },
});

export default NewComment;

type TFetchRowsOptions = {
  token: string;
  conversationId: string;
};

const fetchLatestRecords = async (options: TFetchRowsOptions): Promise<Record<string, any>[]> => {
  const { token, conversationId } = options;
  const limit = 20;

  try {
    const comments = await frontClient.fetchPaginated<Record<string, any>>({
      path: `conversations/${conversationId}/comments`,
      token,
      maxResults: limit,
    });

    const sortedComments = formatFrontResponse(comments).sort((a, b) => {
      return (b.posted_at || 0) - (a.posted_at || 0);
    });

    return sortedComments;
  } catch (error) {
    throw new FrontError(`Failed to fetch latest comments: ${error.message || error}`);
  }
};
