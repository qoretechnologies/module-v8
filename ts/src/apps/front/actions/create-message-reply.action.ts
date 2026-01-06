import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { frontClient } from '../client';
import { FRONT_APP_NAME, FrontError } from '../constants';
import { formatFrontResponse } from '../helpers/format-response';
import { getFrontConversationAllowedValues } from '../helpers/get-conversation-allowed-values';
import { FrontMessageResponseType } from '../response-types/message';

const action = 'create_message_reply';

const options = {
  conversationId: {
    type: 'string',
    required: true,
    get_allowed_values: getFrontConversationAllowedValues,
  },
  body: {
    type: 'string',
    required: true,
  },
  subject: {
    type: 'string',
    required: false,
  },
  to: {
    type: { type: 'list', element_type: 'string' },
    required: false,
  },
  cc: {
    type: { type: 'list', element_type: 'string' },
    required: false,
  },
  bcc: {
    type: { type: 'list', element_type: 'string' },
    required: false,
  },
  isDraft: {
    type: 'bool',
    required: false,
    default_value: false,
  },
} satisfies TQoreOptions;

const responseType = FrontMessageResponseType satisfies TQoreResponseType;

const createFrontMessageReply = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FRONT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, conversationId, body } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['conversationId', 'body'],
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    const { subject, to, cc, bcc, isDraft } = obj || {};

    try {
      const requestBody: Record<string, any> = {
        body,
      };

      if (subject !== undefined) requestBody.subject = subject;
      if (to !== undefined && to.length > 0) requestBody.to = to;
      if (cc !== undefined && cc.length > 0) requestBody.cc = cc;
      if (bcc !== undefined && bcc.length > 0) requestBody.bcc = bcc;
      if (isDraft !== undefined) requestBody.options = { ...requestBody.options, draft: isDraft };

      const message = await frontClient.post<Record<string, any>>(
        `conversations/${conversationId}/messages`,
        requestBody,
        { token }
      );

      return formatFrontResponse(message);
    } catch (error) {
      throw new FrontError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default createFrontMessageReply;
